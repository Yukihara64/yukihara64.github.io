// netlify/functions/steam.mjs
export default async () => {
  const STEAM_KEY    = Netlify.env.get("STEAM_API_KEY");
  const STEAM_ID     = "76561198439644295";
  const FEATURED_ID  = Number(Netlify.env.get("STEAM_FEATURED_APPID") ?? 0);
  const FEATURED_NAME= Netlify.env.get("STEAM_FEATURED_NAME") ?? "";
  const BLOCKED      = (Netlify.env.get("STEAM_BLOCKED_APPIDS") ?? "")
                         .split(",").map(Number).filter(Boolean);

  // Helper to add no‑cache headers
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

  const buildGame = (appid, name, extra = {}) => ({
    appid, name,
    playtime_2weeks:  extra.playtime_2weeks  ?? 0,
    playtime_forever: extra.playtime_forever ?? 0,
    img: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
    url: `https://store.steampowered.com/app/${appid}`,
  });

  // 1. Check live via player summary
  const summaryRes = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_KEY}&steamids=${STEAM_ID}`);
  const player     = (await summaryRes.json())?.response?.players?.[0];

  if (player?.gameid && !BLOCKED.includes(Number(player.gameid))) {
    return jsonResponse({
      game: buildGame(player.gameid, player.gameextrainfo ?? "In a game"),
      source: "live",
    });
  }

  // 2. Always show featured game (Tarkov) with real playtime
  if (FEATURED_ID) {
    const ownedRes   = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`);
    const ownedGames = (await ownedRes.json())?.response?.games ?? [];
    const featured   = ownedGames.find(g => g.appid === FEATURED_ID);
    return jsonResponse({
      game: buildGame(FEATURED_ID, FEATURED_NAME, featured ?? {}),
      source: "featured",
    });
  }

  // 3. Fallback: most played, excluding blocked games
  const ownedRes2 = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`);
  const owned     = (await ownedRes2.json())?.response?.games ?? [];
  const filtered  = owned.filter(g => !BLOCKED.includes(g.appid));
  filtered.sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0));
  return jsonResponse({ game: buildGame(filtered[0].appid, filtered[0].name, filtered[0]), source: "alltime" });
};

export const config = { path: "/api/steam" };
