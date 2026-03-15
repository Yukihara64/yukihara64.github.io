// netlify/functions/steam.mjs
export default async (req) => {
  const STEAM_KEY    = Netlify.env.get("STEAM_API_KEY");
  const STEAM_ID     = "76561198012828824";
  const FEATURED_ID  = Number(Netlify.env.get("STEAM_FEATURED_APPID") ?? 0);
  const FEATURED_NAME= Netlify.env.get("STEAM_FEATURED_NAME") ?? "";
  const BLOCKED      = (Netlify.env.get("STEAM_BLOCKED_APPIDS") ?? "")
                         .split(",").map(Number).filter(Boolean);

  // Parse query parameters for debug mode
  const url = new URL(req.url);
  const debug = url.searchParams.get('debug') === 'true';

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

  // Fetch player summary
  const summaryRes = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_KEY}&steamids=${STEAM_ID}`);
  const summaryData = await summaryRes.json();
  const player = summaryData?.response?.players?.[0];

  // If debug mode, return raw player data
  if (debug) {
    return jsonResponse({
      debug: true,
      player,
      gameid: player?.gameid,
      gameextrainfo: player?.gameextrainfo,
      privacy: "Check that 'gameid' exists when you're in a game"
    });
  }

  // Normal flow
  if (player?.gameid && !BLOCKED.includes(Number(player.gameid))) {
    return jsonResponse({
      game: buildGame(player.gameid, player.gameextrainfo ?? "In a game"),
      source: "live",
    });
  }

  // Featured game fallback
  if (FEATURED_ID) {
    const ownedRes = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`);
    const ownedGames = (await ownedRes.json())?.response?.games ?? [];
    const featured = ownedGames.find(g => g.appid === FEATURED_ID);
    return jsonResponse({
      game: buildGame(FEATURED_ID, FEATURED_NAME, featured ?? {}),
      source: "featured",
    });
  }

  // Most played fallback
  const ownedRes2 = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`);
  const owned = (await ownedRes2.json())?.response?.games ?? [];
  const filtered = owned.filter(g => !BLOCKED.includes(g.appid));
  filtered.sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0));
  return jsonResponse({ game: buildGame(filtered[0].appid, filtered[0].name, filtered[0]), source: "alltime" });
};

export const config = { path: "/api/steam" };
