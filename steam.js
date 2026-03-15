exports.handler = async () => {
  const STEAM_KEY = process.env.STEAM_API_KEY;
  const STEAM_ID  = '76561198439644295'; // Yuki64

  try {
    const url = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&count=1&format=json`;
    const res  = await fetch(url);
    const data = await res.json();
    const games = data?.response?.games;

    if (!games || games.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ game: null }),
      };
    }

    const game = games[0];
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        game: {
          appid:            game.appid,
          name:             game.name,
          playtime_2weeks:  game.playtime_2weeks,
          playtime_forever: game.playtime_forever,
          img:              `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
          url:              `https://store.steampowered.com/app/${game.appid}`,
        },
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
