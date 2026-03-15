export default async () => {
  const STEAM_KEY = Netlify.env.get("STEAM_API_KEY");
  const STEAM_ID  = "76561198439644295";

  const buildGame = (appid, name, extra = {}) => ({
    appid,
    name,
    playtime_2weeks:  extra.playtime_2weeks  ?? 0,
    playtime_forever: extra.playtime_forever ?? 0,
    img:  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
    url:  `https://store.steampowered.com/app/${appid}`,
  });

  // 1. Check if currently in-game via GetPlayerSummaries
  const summaryUrl  = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_KEY}&steamids=${STEAM_ID}`;
  const summaryRes  = await fetch(summaryUrl);
  const summaryData = await summaryRes.json();
  const player      = summaryData?.response?.players?.[0];

  // gameid is present when actively in a game (works for non-Steam/custom app IDs too)
  if (player?.gameid && player?.gameextrainfo) {
    return Response.json({
      game: buildGame(player.gameid, player.gameextrainfo),
      source: "live",
    });
  }

  // 2. Try recently played (last 2 weeks)
  const recentUrl  = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&count=1&format=json`;
  const recentRes  = await fetch(recentUrl);
  const recentData = await recentRes.json();
  const recentGames = recentData?.response?.games;

  if (recentGames && recentGames.length > 0) {
    const g = recentGames[0];
    return Response.json({
      game: buildGame(g.appid, g.name, g),
      source: "recent",
    });
  }

  // 3. Fallback: most played all-time from owned games
  const ownedUrl  = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`;
  const ownedRes  = await fetch(ownedUrl);
  const ownedData = await ownedRes.json();
  const owned     = ownedData?.response?.games;

  if (!owned || owned.length === 0) {
    return Response.json({ game: null });
  }

  owned.sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0));
  const top = owned[0];
  return Response.json({
    game: buildGame(top.appid, top.name, top),
    source: "alltime",
  });
};

export const config = {
  path: "/api/steam",
};
