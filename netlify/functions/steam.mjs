// netlify/functions/steam.mjs
export default async () => {
  const STEAM_KEY     = Netlify.env.get("STEAM_API_KEY");
  const STEAM_ID      = "76561198012828824";               // ✅ Your correct Steam ID
  const FEATURED_ID   = Number(Netlify.env.get("STEAM_FEATURED_APPID") ?? 0);
  const FEATURED_NAME = Netlify.env.get("STEAM_FEATURED_NAME") ?? "";
  const BLOCKED       = (Netlify.env.get("STEAM_BLOCKED_APPIDS") ?? "")
                          .split(",").map(Number).filter(Boolean);

  const jsonResponse = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  };

  // 1. Fetch owned games (for logos and playtime)
  const ownedRes = await fetch(
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?` +
    `key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`
  );
  const ownedData = await ownedRes.json();
  const ownedGames = ownedData?.response?.games ?? [];
  const ownedMap = new Map(ownedGames.map(g => [g.appid, g]));

  // 2. Fetch recently played games (as a fallback for playtime)
  const recentRes = await fetch(
    `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?` +
    `key=${STEAM_KEY}&steamid=${STEAM_ID}&format=json`
  );
  const recentData = await recentRes.json();
  const recentGames = recentData?.response?.games ?? [];
  const recentMap = new Map(recentGames.map(g => [g.appid, g]));

  // Helper to get the best possible image URL
  async function getGameImageUrl(appid) {
    // Special case for Escape from Tarkov
    if (appid === 3932890) {
      return 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3932890/e1367f10d469137a2ced522b642a9b1ee10450da/header.jpg?t=1770712130';
    }

    // Try fast CDN
    const cdnUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;
    try {
      const head = await fetch(cdnUrl, { method: 'HEAD' });
      if (head.ok) return cdnUrl;
    } catch {}

    // Try logo from owned games
    const ownedInfo = ownedMap.get(appid);
    if (ownedInfo?.img_logo_url) {
      return `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${ownedInfo.img_logo_url}.jpg`;
    }

    // Fallback: scrape store page for og:image
    try {
      const storeRes = await fetch(`https://store.steampowered.com/app/${appid}`);
      const html = await storeRes.text();
      const match = html.match(/<meta property="og:image" content="([^"]+)">/);
      if (match) return match[1];
    } catch {}

    // Ultimate placeholder
    return 'https://via.placeholder.com/184x69?text=No+Image';
  }

  // Build game object – playtime from owned first, then recent, then extra
  const buildGame = async (appid, name, extra = {}) => {
    const ownedInfo = ownedMap.get(appid);
    const recentInfo = recentMap.get(appid);

    // Determine playtime: owned > recent > extra > 0
    let playtime_forever = ownedInfo?.playtime_forever ?? recentInfo?.playtime_forever ?? extra.playtime_forever ?? 0;
    let playtime_2weeks = ownedInfo?.playtime_2weeks ?? recentInfo?.playtime_2weeks ?? extra.playtime_2weeks ?? 0;

    const imgUrl = await getGameImageUrl(appid);

    return {
      appid, name,
      playtime_2weeks,
      playtime_forever,
      img: imgUrl,
      url: `https://store.steampowered.com/app/${appid}`,
    };
  };

  // 3. Check live via player summaries
  const summaryRes = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_KEY}&steamids=${STEAM_ID}`);
  const player = (await summaryRes.json())?.response?.players?.[0];

  if (player?.gameid && !BLOCKED.includes(Number(player.gameid))) {
    const game = await buildGame(player.gameid, player.gameextrainfo ?? "In a game");
    return jsonResponse({ game, source: "live" });
  }

  // 4. Featured game (e.g., Tarkov)
  if (FEATURED_ID) {
    const featured = ownedMap.get(FEATURED_ID) ?? {};
    const game = await buildGame(FEATURED_ID, FEATURED_NAME, featured);
    return jsonResponse({ game, source: "featured" });
  }

  // 5. Fallback: most played game (excluding blocked)
  const filtered = ownedGames.filter(g => !BLOCKED.includes(g.appid));
  filtered.sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0));
  const topGame = filtered[0];
  const game = await buildGame(topGame.appid, topGame.name, topGame);
  return jsonResponse({ game, source: "alltime" });
};

export const config = { path: "/api/steam" };
