// functions/api/spotify.js
export async function onRequest(context) {
  const { env } = context;

  const CLIENT_ID     = env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = env.SPOTIFY_CLIENT_SECRET;
  const REFRESH_TOKEN = env.SPOTIFY_REFRESH_TOKEN;

  // Helper para respuesta JSON con cabeceras no-cache (opcional)
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

  // 1. Get access token using refresh token
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
    },
    body: new URLSearchParams({
      grant_type:    "refresh_token",
      refresh_token: REFRESH_TOKEN,
    }).toString(),
  });

  const { access_token } = await tokenRes.json();
  if (!access_token) return jsonResponse({ track: null, source: "error" });

  // 2. Check currently playing
  const nowRes  = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (nowRes.status === 200) {
    const nowData = await nowRes.json();
    if (nowData?.item && nowData.is_playing) {
      const t = nowData.item;
      return jsonResponse({
        source: "live",
        track: {
          name:      t.name,
          artist:    t.artists.map(a => a.name).join(", "),
          album:     t.album.name,
          cover:     t.album.images[0]?.url ?? null,
          url:       t.external_urls.spotify,
          progress:  nowData.progress_ms,
          duration:  t.duration_ms,
        },
      });
    }
  }

  // 3. Fallback: recently played
  const recentRes  = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const recentData = await recentRes.json();
  const item = recentData?.items?.[0]?.track;

  if (!item) return jsonResponse({ track: null, source: "none" });

  return jsonResponse({
    source: "recent",
    track: {
      name:     item.name,
      artist:   item.artists.map(a => a.name).join(", "),
      album:    item.album.name,
      cover:    item.album.images[0]?.url ?? null,
      url:      item.external_urls.spotify,
      progress: 0,
      duration: item.duration_ms,
    },
  });
}
