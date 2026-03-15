// functions/api/steam.js
export async function onRequest(context) {
  const { env } = context;

  const STEAM_KEY     = env.STEAM_API_KEY;
  const STEAM_ID      = "76561198012828824";
  const FEATURED_ID   = Number(env.STEAM_FEATURED_APPID ?? 0);
  const FEATURED_NAME = env.STEAM_FEATURED_NAME ?? "";
  const BLOCKED       = (env.STEAM_BLOCKED_APPIDS ?? "")
                          .split(",").map(Number).filter(Boolean);

  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });

  // 1. Fetch owned + recently played in parallel
  const [ownedRes, recentRes, summaryRes] = await Promise.all([
    fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`),
    fetch(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&format=json`),
    fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_KEY}&steamids=${STEAM_ID}`),
  ]);

  const ownedGames  = (await ownedRes.json())?.response?.games   ?? [];
  const recentGames = (await recentRes.json())?.response?.games  ?? [];
  const player      = (await summaryRes.json())?.response?.players?.[0];

  const ownedMap  = new Map(ownedGames.map(g => [g.appid, g]));
  const recentMap = new Map(recentGames.map(g => [g.appid, g]));

  // Get best image URL for a game
  async function getImage(appid) {
    if (appid === 3932890) {
      return "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3932890/e1367f10d469137a2ced522b642a9b1ee10450da/header.jpg?t=1770712130";
    }
    const url  = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) return url;
    } catch {}
    const info = ownedMap.get(appid);
    if (info?.img_logo_url) {
      return `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${info.img_logo_url}.jpg`;
    }
    return "https://via.placeholder.com/184x69?text=No+Image";
  }

  // Build a game object
  async function buildGame(appid, name, extra = {}) {
    const owned  = ownedMap.get(appid);
    const recent = recentMap.get(appid);

    let playtime_forever, playtime_2weeks;

    if (appid === 3932890) {
      // Tarkov migrated App IDs — real playtime is stored under the old ID 1517290
      const oldTarkov  = ownedMap.get(1517290);
      playtime_forever = oldTarkov?.playtime_forever ?? extra.playtime_forever ?? 0;
      playtime_2weeks  = oldTarkov?.playtime_2weeks  ?? extra.playtime_2weeks  ?? 0;
    } else {
      playtime_forever = owned?.playtime_forever ?? recent?.playtime_forever ?? extra.playtime_forever ?? 0;
      playtime_2weeks  = owned?.playtime_2weeks  ?? recent?.playtime_2weeks  ?? extra.playtime_2weeks  ?? 0;
    }

    return {
      appid, name,
      playtime_2weeks,
      playtime_forever,
      img: await getImage(appid),
      url: `https://store.steampowered.com/app/${appid}`,
    };
  }

  // 2. Check if currently in-game (live)
  if (player?.gameid && !BLOCKED.includes(Number(player.gameid))) {
    const game = await buildGame(Number(player.gameid), player.gameextrainfo ?? "In a game");
    return jsonResponse({ game, source: "live" });
  }

  // 3. Featured game (Tarkov) with real playtime
  if (FEATURED_ID) {
    const game = await buildGame(FEATURED_ID, FEATURED_NAME, ownedMap.get(FEATURED_ID) ?? {});
    return jsonResponse({ game, source: "featured" });
  }

  // 4. Fallback: most played, excluding blocked games
  const filtered = ownedGames
    .filter(g => !BLOCKED.includes(g.appid))
    .sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0));

  if (!filtered.length) return jsonResponse({ game: null });

  const game = await buildGame(filtered[0].appid, filtered[0].name, filtered[0]);
  return jsonResponse({ game, source: "alltime" });
}
