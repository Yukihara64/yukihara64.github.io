export default async () => {
  const STEAM_KEY = Netlify.env.get("STEAM_API_KEY");
  const STEAM_ID  = "76561198439644295";
  const TARKOV_APPID = 1517290;
  const TARKOV_NAME  = "Escape from Tarkov";

  const buildGame = (appid, name, extra = {}) => ({
    appid, name,
    playtime_2weeks:  extra.playtime_2weeks  ?? 0,
    playtime_forever: extra.playtime_forever ?? 0,
    img: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
    url: `https://store.steampowered.com/app/${appid}`,
  });

  const [summaryRes, recentRes, ownedRes] = await Promise.all([
    fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_KEY}&steamids=${STEAM_ID}`),
    fetch(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&count=10&format=json`),
    fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`),
  ]);

  const player      = (await summaryRes.json())?.response?.players?.[0];
  const recentGames = (await recentRes.json())?.response?.games ?? [];
  const ownedGames  = (await ownedRes.json())?.response?.games  ?? [];

  if (player?.gameid) {
    return Response.json({ game: buildGame(player.gameid, player.gameextrainfo ?? "In a game"), source: "live", debug: { gameid: player.gameid, personastate: player.personastate } });
  }

  const tarkovRecent = recentGames.find(g => g.appid === TARKOV_APPID);
  if (tarkovRecent) return Response.json({ game: buildGame(TARKOV_APPID, TARKOV_NAME, tarkovRecent), source: "recent", debug: { gameid: null } });

  if (recentGames.length > 0) {
    const g = recentGames[0];
    return Response.json({ game: buildGame(g.appid, g.name, g), source: "recent", debug: { gameid: null } });
  }

  const tarkovOwned = ownedGames.find(g => g.appid === TARKOV_APPID);
  if (tarkovOwned?.playtime_forever > 0) return Response.json({ game: buildGame(TARKOV_APPID, TARKOV_NAME, tarkovOwned), source: "alltime", debug: { gameid: null } });

  ownedGames.sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0));
  return Response.json({ game: buildGame(ownedGames[0].appid, ownedGames[0].name, ownedGames[0]), source: "alltime", debug: { gameid: null } });
};

export const config = { path: "/api/steam" };
