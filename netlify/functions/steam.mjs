// netlify/functions/steam.mjs
export default async () => {
  const STEAM_KEY     = Netlify.env.get("STEAM_API_KEY");
  const STEAM_ID      = "76561198012828824";               // ✅ Your correct Steam ID
  const FEATURED_ID   = Number(Netlify.env.get("STEAM_FEATURED_APPID") ?? 0);
  const FEATURED_NAME = Netlify.env.get("STEAM_FEATURED_NAME") ?? "";
  const BLOCKED       = (Netlify.env.get("STEAM_BLOCKED_APPIDS") ?? "")
                          .split(",").map(Number).filter(Boolean);

  // Helper for no‑cache responses
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

  // Fetch all owned games once – we'll need them for images and playtime
  const ownedRes = await fetch(
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?` +
    `key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`
  );
  const ownedData = await ownedRes.json();
  const ownedGames = ownedData?.response?.games ?? [];

  // Create a quick lookup map: appid -> game object from owned list
  const gameMap = new Map();
  ownedGames.forEach(g => gameMap.set(g.appid, g));

  // Build game object using the logo URL from owned games if available
  const buildGame = (appid, name, extra = {}) => {
    const ownedInfo = gameMap.get(appid) || {};
    // Use img_logo_url if it exists, otherwise fallback to a placeholder
    let imgUrl = 'https://via.placeholder.com/184x69?text=No+Image'; // Placeholder
    if (ownedInfo.img_logo_url) {
      imgUrl = `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${ownedInfo.img_logo_url}.jpg`;
    }
    return {
      appid, name,
      playtime_2weeks:  extra.playtime_2weeks  ?? ownedInfo.playtime_2weeks  ?? 0,
      playtime_forever: extra.playtime_forever ?? ownedInfo.playtime_forever ?? 0,
      img: imgUrl,
      url: `https://store.steampowered.com/app/${appid}`,
    };
  };

  // 1. Check live via player summary
  const summaryRes = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_KEY}&steamids=${STEAM_ID}`);
  const player     = (await summaryRes.json())?.response?.players?.[0];

  if (player?.gameid && !BLOCKED.includes(Number(player.gameid))) {
    return jsonResponse({
      game: buildGame(player.gameid, player.gameextrainfo ?? "In a game"),
      source: "live",
    });
  }

  // 2. Featured game (e.g., Tarkov)
  if (FEATURED_ID) {
    const featured = gameMap.get(FEATURED_ID) ?? {};
    return jsonResponse({
      game: buildGame(FEATURED_ID, FEATURED_NAME, featured),
      source: "featured",
    });
  }

  // 3. Fallback: most played, excluding blocked games
  const filtered = ownedGames.filter(g => !BLOCKED.includes(g.appid));
  filtered.sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0));
  const topGame = filtered[0];
  return jsonResponse({
    game: buildGame(topGame.appid, topGame.name, topGame),
    source: "alltime",
  });
};

export const config = { path: "/api/steam" };
