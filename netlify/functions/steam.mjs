export default async () => {
  const STEAM_KEY = Netlify.env.get("STEAM_API_KEY");
  const STEAM_ID  = "76561198439644295";

  // Tarkov's actual Steam App ID (EFT)
  const TARKOV_APPID = 1517290;
  const TARKOV_NAME  = "Escape from Tarkov";

  const buildGame = (appid, name, extra = {}) => ({
    appid,
    name,
    playtime_2weeks:  extra.playtime_2weeks  ?? 0,
    playtime_forever: extra.playtime_forever ?? 0,
    img:  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
    url:  `https://store.steampowered.com/app/${appid}`,
  });

  // 1. Check if currently in-game via GetPlayerSummaries
  const [summaryRes, recentRes, ownedRes] = await Promise.all([
    fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_KEY}&steamids=${STEAM_ID}`),
    fetch(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&count=10&format=json`),
    fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`),
  ]);

  const summaryData = await summaryRes.json();
  const recentData  = await recentRes.json();
  const ownedData   = await ownedRes.json();

  const player      = summaryData?.response?.players?.[0];
  const recentGames = recentData?.response?.games ?? [];
  const ownedGames  = ownedData?.response?.games  ?? [];

  // Check live (works for standard Steam games)
  if (player?.gameid) {
    return Response.json({
      game: buildGame(player.gameid, player.gameextrainfo ?? "In a game"),
      source: "live",
    });
  }

  // Check if Tarkov is in recently played (it uses BSG launcher so may appear here)
  const tarkovRecent = recentGames.find(g => g.appid === TARKOV_APPID);
  if (tarkovRecent) {
    return Response.json({
      game: buildGame(TARKOV_APPID, TARKOV_NAME, tarkovRecent),
      source: "recent",
    });
  }

  // Check recently played for any other game
  if (recentGames.length > 0) {
    const g = recentGames[0];
    return Response.json({
      game: buildGame(g.appid, g.name, g),
      source: "recent",
    });
  }

  // Check if Tarkov is in owned games with playtime
  const tarkovOwned = ownedGames.find(g => g.appid === TARKOV_APPID);
  if (tarkovOwned && tarkovOwned.playtime_forever > 0) {
    return Response.json({
      game: buildGame(TARKOV_APPID, TARKOV_NAME, tarkovOwned),
      source: "alltime",
    });
  }

  // Final fallback: most played game overall
  if (ownedGames.length > 0) {
    ownedGames.sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0));
    const top = ownedGames[0];
    return Response.json({
      game: buildGame(top.appid, top.name, top),
      source: "alltime",
    });
  }

  return Response.json({ game: null });
};

export const config = {
  path: "/api/steam",
};
