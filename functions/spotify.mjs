export default async () => {
  const CLIENT_ID     = Netlify.env.get("SPOTIFY_CLIENT_ID");
  const CLIENT_SECRET = Netlify.env.get("SPOTIFY_CLIENT_SECRET");
  const REFRESH_TOKEN = Netlify.env.get("SPOTIFY_REFRESH_TOKEN");

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
  if (!access_token) return Response.json({ track: null, source: "error" });

  // 2. Check currently playing
  const nowRes  = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (nowRes.status === 200) {
    const nowData = await nowRes.json();
    if (nowData?.item && nowData.is_playing) {
      const t = nowData.item;
      return Response.json({
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

  if (!item) return Response.json({ track: null, source: "none" });

  return Response.json({
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
};

export const config = {
  path: "/api/spotify",
};
