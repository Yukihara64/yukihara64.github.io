// netlify/functions/steam.mjs
export default async () => {
  const STEAM_KEY     = Netlify.env.get("STEAM_API_KEY");
  const STEAM_ID      = "76561198012828824";               // Your correct Steam ID
  const FEATURED_ID   = Number(Netlify.env.get("STEAM_FEATURED_APPID") ?? 0);
  const FEATURED_NAME = Netlify.env.get("STEAM_FEATURED_NAME") ?? "";
  const BLOCKED       = (Netlify.env.get("STEAM_BLOCKED_APPIDS") ?? "")
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

  // Fetch the correct image URL using Steam's IStoreBrowseService
  async function getGameImageUrl(appid) {
    try {
      const payload = {
        ids: [{ appid }],
        context: { country_code: "US" },
        data_request: { include_assets: true }
      };
      const response = await fetch(
        'https://api.steampowered.com/IStoreBrowseService/GetItems/v1/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input_json: payload })
        }
      );
      const data = await response.json();
      const item = data.response.store_items?.[0];
      if (item?.assets?.header) {
        const headerFile = item.assets.header;          // includes hash + filename
        return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/${headerFile}`;
      }
    } catch (error) {
      console.error(`getGameImageUrl error for appid ${appid}:`, error);
    }
    // Fallback: try the direct URL without hash (might work for some games)
    return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`;
  }

  // Build game object – now async because of the image fetch
  const buildGame = async (appid, name, extra = {}) => {
    const imgUrl = await getGameImageUrl(appid);
    return {
      appid, name,
      playtime_2weeks:  extra.playtime_2weeks  ?? 0,
      playtime_forever: extra.playtime_forever ?? 0,
      img: imgUrl,
      url: `https://store.steampowered.com/app/${appid}`,
    };
  };

  // 1. Check live via player summary
  const summaryRes = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_KEY}&steamids=${STEAM_ID}`);
  const player     = (await summaryRes.json())?.response?.players?.[0];

  if (player?.gameid && !BLOCKED.includes(Number(player.gameid))) {
    const game = await buildGame(player.gameid, player.gameextrainfo ?? "In a game");
    return jsonResponse({ game, source: "live" });
  }

  // 2. Always show featured game (e.g., Tarkov) with real playtime
  if (FEATURED_ID) {
    const ownedRes   = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`);
    const ownedGames = (await ownedRes.json())?.response?.games ?? [];
    const featured   = ownedGames.find(g => g.appid === FEATURED_ID);
    const game       = await buildGame(FEATURED_ID, FEATURED_NAME, featured ?? {});
    return jsonResponse({ game, source: "featured" });
  }

  // 3. Fallback: most played, excluding blocked games
  const ownedRes2 = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`);
  const owned     = (await ownedRes2.json())?.response?.games ?? [];
  const filtered  = owned.filter(g => !BLOCKED.includes(g.appid));
  filtered.sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0));
  const game = await buildGame(filtered[0].appid, filtered[0].name, filtered[0]);
  return jsonResponse({ game, source: "alltime" });
};

export const config = { path: "/api/steam" };
