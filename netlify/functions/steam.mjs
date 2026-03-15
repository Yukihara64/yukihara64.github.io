let steamCache = {
  timestamp: 0,
  data: null,
};

const CACHE_DURATION = 10 * 1000; // 10 seconds

export default async () => {
  const now = Date.now();
  if (steamCache.data && now - steamCache.timestamp < CACHE_DURATION) {
    return Response.json({ ...steamCache.data, cached: true });
  }

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

    // 1️⃣ Try live game
    const summaryRes = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_KEY}&steamids=${STEAM_ID}`);
    const player     = (await summaryRes.json())?.response?.players?.[0];

    if (player) {
      console.log("Player summary:", player);
      if (player.gameid && !BLOCKED.includes(Number(player.gameid))) {
        const result = { game: buildGame(player.gameid, player.gameextrainfo ?? "In a game"), source: "live" };
        steamCache = { timestamp: now, data: result };
        return Response.json(result);
      }
    }

    // 2️⃣ Featured game fallback
    if (FEATURED_ID) {
      const ownedRes   = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`);
      const ownedGames = (await ownedRes.json())?.response?.games ?? [];
      console.log("Owned games:", ownedGames.length);

      const featured = ownedGames.find(g => g.appid === FEATURED_ID);
      if (!BLOCKED.includes(FEATURED_ID)) {
        const result = { game: buildGame(FEATURED_ID, FEATURED_NAME, featured ?? {}), source: "featured" };
        steamCache = { timestamp: now, data: result };
        return Response.json(result);
      }
    }

    // 3️⃣ Fallback: most played
    const ownedRes2 = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`);
    const owned     = (await ownedRes2.json())?.response?.games ?? [];
    const filtered  = owned.filter(g => !BLOCKED.includes(g.appid));
    filtered.sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0));

    if (filtered.length === 0) {
      const result = { game: null, source: "none" };
      steamCache = { timestamp: now, data: result };
      return Response.json(result);
    }

    const result = { game: buildGame(filtered[0].appid, filtered[0].name, filtered[0]), source: "alltime" };
    steamCache = { timestamp: now, data: result };
    return Response.json(result);

  } catch (err) {
    console.error("Steam API fetch error:", err);
    return Response.json({ game: null, source: "error", message: err.message });
  }
};

export const config = { path: "/api/steam" };
