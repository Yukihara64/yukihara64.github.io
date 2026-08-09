// functions/api/steam.ts
export async function onRequest(context: EventContext<any, any, any>) {
  const { env } = context;

  const STEAM_KEY     = env.STEAM_API_KEY;
  const STEAM_ID      = "76561198012828824";
  const FEATURED_ID   = Number(env.STEAM_FEATURED_APPID ?? 0);
  const FEATURED_NAME = env.STEAM_FEATURED_NAME ?? "";
  const BLOCKED       = (env.STEAM_BLOCKED_APPIDS ?? "")
                          .split(",").map(Number).filter(Boolean);

  // Tarkov old→new App ID mapping for playtime lookup
  const PLAYTIME_REMAP = { 3932890: 1517290 };

  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });

  // Fetch all data in parallel
  const [ownedRes, recentRes, summaryRes] = await Promise.all([
    fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`),
    fetch(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${STEAM_KEY}&steamid=${STEAM_ID}&format=json`),
    fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_KEY}&steamids=${STEAM_ID}`),
  ]);

  const ownedGames  = ((await ownedRes.json()) as any)?.response?.games  ?? [];
  const recentGames = ((await recentRes.json()) as any)?.response?.games ?? [];
  const player      = ((await summaryRes.json()) as any)?.response?.players?.[0];

  const ownedMap  = new Map<number, any>(ownedGames.map((g: any) => [g.appid, g]));
  const recentMap = new Map<number, any>(recentGames.map((g: any) => [g.appid, g]));

  // Get best image URL
  async function getImage(appid: number) {
    if (appid === 3932890) {
      return "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3932890/e1367f10d469137a2ced522b642a9b1ee10450da/header.jpg?t=1770712130";
    }
    const url = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) return url;
    } catch {}
    const info = ownedMap.get(appid);
    if (info?.img_logo_url) {
      return `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${info.img_logo_url}.jpg`;
    }
    return "https://via.placeholder.com/184x69?text=No+Image";
  }

  // Build game object — remaps appid for playtime lookup if needed
  async function buildGame(appid: number, name: string, extra: any = {}) {
    // Look up playtime from remapped ID if available (e.g. Tarkov 3932890 → 1517290)
    const playtimeId = PLAYTIME_REMAP[appid] ?? appid;
    const owned      = ownedMap.get(playtimeId) ?? ownedMap.get(appid);
    const recent     = recentMap.get(playtimeId) ?? recentMap.get(appid);

    const playtime_forever = owned?.playtime_forever ?? recent?.playtime_forever ?? extra.playtime_forever ?? 0;
    const playtime_2weeks  = owned?.playtime_2weeks  ?? recent?.playtime_2weeks  ?? extra.playtime_2weeks  ?? 0;

    return {
      appid, name,
      playtime_2weeks,
      playtime_forever,
      img: await getImage(appid),
      url: `https://store.steampowered.com/app/${appid}`,
    };
  }

  // 1. Live check
  if (player?.gameid && !BLOCKED.includes(Number(player.gameid))) {
    const game = await buildGame(Number(player.gameid), player.gameextrainfo ?? "In a game");
    return jsonResponse({ game, source: "live" });
  }

  // 2. Featured game
  if (FEATURED_ID) {
    const game = await buildGame(FEATURED_ID, FEATURED_NAME, ownedMap.get(FEATURED_ID) ?? {});
    return jsonResponse({ game, source: "featured" });
  }

  // 3. Fallback: most played excluding blocked
  const filtered = ownedGames
    .filter(g => !BLOCKED.includes(g.appid))
    .sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0));

  if (!filtered.length) return jsonResponse({ game: null });

  const game = await buildGame(filtered[0].appid, filtered[0].name, filtered[0]);
  return jsonResponse({ game, source: "alltime" });
}
