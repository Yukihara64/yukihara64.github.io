// functions/api/steam.js
export async function onRequest(context) {
  const { request, env } = context;

  const STEAM_KEY     = env.STEAM_API_KEY;
  const STEAM_ID      = "76561198012828824";
  const FEATURED_ID   = Number(env.STEAM_FEATURED_APPID ?? 0);
  const FEATURED_NAME = env.STEAM_FEATURED_NAME ?? "";
  const BLOCKED       = (env.STEAM_BLOCKED_APPIDS ?? "")
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

  // 1. Get owned games
  const ownedRes   = await fetch(
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?` +
    `key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`
  );
  const ownedGames = (await ownedRes.json())?.response?.games ?? [];
  const ownedMap   = new Map(ownedGames.map(g => [g.appid, g]));

  // 2. Get recently played
  const recentRes   = await fetch(
    `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?` +
    `key=${STEAM_KEY}&steamid=${STEAM_ID}&format=json`
  );
  const recentGames = (await recentRes.json())?.response?.games ?? [];
  const recentMap   = new Map(recentGames.map(g => [g.appid, g]));

  // Get best image for a given appid
  async function getGameImageUrl(appid) {
    if (appid === 3932890) {
      return 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3932890/e1367f10d469137a2ced522b642a9b1ee10450da/header.jpg?t=1770712130';
    }
    const cdnUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;
    try {
      const head = await fetch(cdnUrl, { method: 'HEAD' });
      if (head.ok) return cdnUrl;
    } catch {}
    const ownedInfo = ownedMap.get(appid);
    if (ownedInfo?.img_logo_url) {
      return `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${ownedInfo.img_logo_url}.jpg`;
    }
    return 'https://via.placeholder.com/184x69?text=No+Image';
  }

  // Build game object
  const buildGame = async (appid, name, extra = {}) => {
    const ownedInfo  = ownedMap.get(appid);
    const recentInfo = recentMap.get(appid);

    let playtime_forever, playtime_2weeks;

    if (appid === 3932890) {
      // Tarkov migrated App IDs — real playtime is stored under old ID 1517290
      const oldTarkov  = ownedMap.get(1517290);
      playtime_forever = oldTarkov?.playtime_forever ?? 865;
      playtime_2weeks  = oldTarkov?.playtime_2weeks  ?? 0;
    } else {
      playtime_forever = ownedInfo?.playtime_forever ?? recentInfo?.playtime_forever ?? extra.playtime_forever ?? 0;
      playtime_2weeks  = ownedInfo?.playtime_2weeks  ?? recentInfo?.playtime_2weeks  ?? extra.playtime_2weeks  ?? 0;
    }

    const imgUrl = await getGameImageUrl(appid);

    return {
      appid, name,
      playtime_2weeks,
      playtime_forever,
      img: imgUrl,
      url: `https://store.steampowered.com/app/${appid}`,
    };
  };

  // 3. Live check
  const summaryRes = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_KEY}&steamids=${STEAM_ID}`
  );
  const player = (await summaryRes.json())?.response?.players?.[0];

  if (player?.gameid && !BLOCKED.includes(Number(player.gameid))) {
    const game = await buildGame(Number(player.gameid), player.gameextrainfo ?? "In a game");
    return jsonResponse({ game, source: "live" });
  }

  // 4. Featured game (Tarkov)
  if (FEATURED_ID) {
    const featured = ownedMap.get(FEATURED_ID) ?? {};
    const game     = await buildGame(FEATURED_ID, FEATURED_NAME, featured);
    return jsonResponse({ game, source: "featured" });
  }

  // 5. Fallback: most played, excluding blocked
  const filtered = ownedGames.filter(g => !BLOCKED.includes(g.appid));
  filtered.sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0));
  const game = await buildGame(filtered[0].appid, filtered[0].name, filtered[0]);
  return jsonResponse({ game, source: "alltime" });
}
