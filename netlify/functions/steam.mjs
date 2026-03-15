let steamCache = {
  live: { timestamp: 0, data: null },
  fallback: { timestamp: 0, data: null },
};

const LIVE_CACHE_DURATION = 3 * 1000;     // 3 seconds for live games
const FALLBACK_CACHE_DURATION = 30 * 1000; // 30 seconds for featured/all-time

export default async () => {
  const now = Date.now();

  try {
    const STEAM_KEY     = Netlify.env.get("STEAM_API_KEY");
    const STEAM_ID      = "76561198439644295";
    const FEATURED_ID   = Number(Netlify.env.get("STEAM_FEATURED_APPID") ?? 0);
    const FEATURED_NAME = Netlify.env.get("STEAM_FEATURED_NAME") ?? "Featured Game";
    const BLOCKED       = (Netlify.env.get("STEAM_BLOCKED_APPIDS") ?? "")
                          .split(",").map(Number).filter(Boolean);

    const buildGame = (appid, name, extra = {}) => ({
      appid,
      name,
      playtime_2weeks:  extra.playtime_2weeks  ?? 0,
      playtime_forever: extra.playtime_forever ?? 0,
      img: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
      url: `https://store.steampowered.com/app/${appid}`,
    });

    // 1️⃣ Live game detection (short cache)
    if (steamCache.live.data && now - steamCache.live.timestamp < LIVE_CACHE_DURATION) {
      return Response.json({ ...steamCache.live.data, cached: true });
    }

    const summaryRes = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_KEY}&steamids=${STEAM_ID}`);
    const player     = (await summaryRes.json())?.response?.players?.[0];

    if (player?.gameid && !BLOCKED.includes(Number(player.gameid))) {
      const liveGame = { game: buildGame(player.gameid, player.gameextrainfo ?? "In a game"), source: "live" };
      steamCache.live = { timestamp: now, data: liveGame };
      return Response.json(liveGame);
    }

    // 2️⃣ Fallback detection: recent game in last 2 weeks (longer cache)
    if (steamCache.fallback.data && now - steamCache.fallback.timestamp < FALLBACK_CACHE_DURATION) {
      return Response.json({ ...steamCache.fallback.data, cached: true });
    }

    const ownedRes = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`);
    const ownedGames = (await ownedRes.json())?.response?.games ?? [];
    const filtered = ownedGames.filter(g => !BLOCKED.includes(g.appid));

    // 2a. Most recently played in 2 weeks
    let recentGame = null;
    filtered.forEach(game => {
      if (game.playtime_2weeks && (!recentGame || game.playtime_2weeks > recentGame.playtime_2weeks)) {
        recentGame = game;
      }
    });

    if (recentGame) {
      const result = { game: buildGame(recentGame.appid, recentGame.name, recentGame), source: "recent" };
      steamCache.fallback = { timestamp: now, data: result };
      return Response.json(result);
    }

    // 2b. Featured game
    if (FEATURED_ID && !BLOCKED.includes(FEATURED_ID)) {
      const featured = filtered.find(g => g.appid === FEATURED_ID);
      const result = { game: buildGame(FEATURED_ID, FEATURED_NAME, featured ?? {}), source: "featured" };
      steamCache.fallback = { timestamp: now, data: result };
      return Response.json(result);
    }

    // 2c. All-time most played
    filtered.sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0));
    if (filtered.length > 0) {
      const result = { game: buildGame(filtered[0].appid, filtered[0].name, filtered[0]), source: "alltime" };
      steamCache.fallback = { timestamp: now, data: result };
      return Response.json(result);
    }

    // 3️⃣ Nothing found
    const result = { game: null, source: "none" };
    steamCache.fallback = { timestamp: now, data: result };
    return Response.json(result);

  } catch (err) {
    console.error("Steam API fetch error:", err);
    return Response.json({ game: null, source: "error", message: err.message });
  }
};

export const config = { path: "/api/steam" };
