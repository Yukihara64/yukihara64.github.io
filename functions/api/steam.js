// functions/api/steam.js
/**
 * Cloudflare Pages API Endpoint for Steam Integration
 */

const STEAM_API_BASE = "https://api.steampowered.com";
const DEFAULT_STEAM_ID = "76561198012828824";

// Mapping for games whose App ID changed (e.g., Tarkov: old ID -> new ID)
const PLAYTIME_REMAP = { 3932890: 1517290 };

/**
 * Creates a standardized JSON response with CORS and no-cache headers.
 */
const createJsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });

/**
 * Safely fetches and parses JSON from the Steam API.
 */
async function fetchSteamEndpoint(endpoint, params) {
  const url = `${STEAM_API_BASE}${endpoint}?${new URLSearchParams(params)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Steam API error (${res.status}) on ${endpoint}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`Network error fetching Steam API (${endpoint}):`, err);
    return null;
  }
}

/**
 * Resolves the best image banner for a Steam app.
 */
async function resolveGameImage(appId, gameInfo) {
  if (appId === 3932890) {
    return "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3932890/e1367f10d469137a2ced522b642a9b1ee10450da/header.jpg?t=1770712130";
  }

  const cdnUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
  try {
    const headRes = await fetch(cdnUrl, { method: "HEAD" });
    if (headRes.ok) return cdnUrl;
  } catch {
    // Ignore network errors on HEAD check and fallback to community logo
  }

  if (gameInfo?.img_logo_url) {
    return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${gameInfo.img_logo_url}.jpg`;
  }

  return "https://via.placeholder.com/184x69?text=No+Image";
}

export async function onRequest(context) {
  const { env } = context;
  const apiKey = env.STEAM_API_KEY;

  if (!apiKey) {
    console.error("STEAM_API_KEY is missing in environment variables.");
    return createJsonResponse({ game: null, error: "Missing API Key" }, 500);
  }

  const featuredId = Number(env.STEAM_FEATURED_APPID ?? 0);
  const featuredName = env.STEAM_FEATURED_NAME ?? "";
  const blockedIds = new Set(
    (env.STEAM_BLOCKED_APPIDS ?? "").split(",").map(Number).filter(Boolean)
  );

  // 1. Fetch Owned Games, Recently Played, and Player Summary concurrently
  const [ownedData, recentData, summaryData] = await Promise.all([
    fetchSteamEndpoint("/IPlayerService/GetOwnedGames/v1/", {
      key: apiKey,
      steamid: DEFAULT_STEAM_ID,
      include_appinfo: "true",
      include_played_free_games: "true",
      format: "json",
    }),
    fetchSteamEndpoint("/IPlayerService/GetRecentlyPlayedGames/v1/", {
      key: apiKey,
      steamid: DEFAULT_STEAM_ID,
      format: "json",
    }),
    fetchSteamEndpoint("/ISteamUser/GetPlayerSummaries/v2/", {
      key: apiKey,
      steamids: DEFAULT_STEAM_ID,
    }),
  ]);

  const ownedGames = ownedData?.response?.games ?? [];
  const recentGames = recentData?.response?.games ?? [];
  const player = summaryData?.response?.players?.[0];

  // Create O(1) lookup maps
  const ownedMap = new Map(ownedGames.map(g => [g.appid, g]));
  const recentMap = new Map(recentGames.map(g => [g.appid, g]));

  /**
   * Normalizes and enriches game data into the final frontend schema.
   */
  async function buildGamePayload(appId, name, fallbackInfo = {}) {
    const lookupId = PLAYTIME_REMAP[appId] ?? appId;
    const owned = ownedMap.get(lookupId) ?? ownedMap.get(appId);
    const recent = recentMap.get(lookupId) ?? recentMap.get(appId);

    const playtimeForever =
      owned?.playtime_forever ?? recent?.playtime_forever ?? fallbackInfo.playtime_forever ?? 0;
    const playtime2Weeks =
      owned?.playtime_2weeks ?? recent?.playtime_2weeks ?? fallbackInfo.playtime_2weeks ?? 0;

    return {
      appid: appId,
      name,
      playtime_2weeks: playtime2Weeks,
      playtime_forever: playtimeForever,
      img: await resolveGameImage(appId, owned ?? fallbackInfo),
      url: `https://store.steampowered.com/app/${appId}`,
    };
  }

  // --- Priority Chain for Selecting Game ---

  // Priority 1: Currently Playing (Live)
  if (player?.gameid && !blockedIds.has(Number(player.gameid))) {
    const liveAppId = Number(player.gameid);
    const game = await buildGamePayload(liveAppId, player.gameextrainfo ?? "In a game");
    return createJsonResponse({ game, source: "live" });
  }

  // Priority 2: Featured Game Override
  if (featuredId && !blockedIds.has(featuredId)) {
    const game = await buildGamePayload(featuredId, featuredName, ownedMap.get(featuredId));
    return createJsonResponse({ game, source: "featured" });
  }

  // Priority 3: Recently Played (Last Played)
  const topRecent = recentGames.find(g => !blockedIds.has(g.appid));
  if (topRecent) {
    const game = await buildGamePayload(topRecent.appid, topRecent.name, topRecent);
    return createJsonResponse({ game, source: "recent" });
  }

  // Priority 4: All-Time Most Played Fallback
  const topAllTime = [...ownedGames]
    .filter(g => !blockedIds.has(g.appid))
    .sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0))[0];

  if (topAllTime) {
    const game = await buildGamePayload(topAllTime.appid, topAllTime.name, topAllTime);
    return createJsonResponse({ game, source: "alltime" });
  }

  // Nothing found (e.g. private profile or empty library)
  return createJsonResponse({ game: null });
}
