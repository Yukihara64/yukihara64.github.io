export default async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return new Response(`<html><body style="font-family:sans-serif;padding:2rem;background:#0d0a14;color:#f0d6f5;">
      <h2>❌ Authorization denied</h2><p>${error}</p>
    </body></html>`, { headers: { "Content-Type": "text/html" } });
  }

  if (!code) {
    return new Response(`<html><body style="font-family:sans-serif;padding:2rem;background:#0d0a14;color:#f0d6f5;">
      <h2>⚠️ No code found</h2><p>Try the authorization URL again.</p>
    </body></html>`, { headers: { "Content-Type": "text/html" } });
  }

  const CLIENT_ID     = Netlify.env.get("SPOTIFY_CLIENT_ID");
  const CLIENT_SECRET = Netlify.env.get("SPOTIFY_CLIENT_SECRET");
  const REDIRECT_URI  = "https://yuki64.netlify.app/spotify-callback";

  const body = new URLSearchParams({
    grant_type:   "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  });

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
    },
    body: body.toString(),
  });

  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    return new Response(`<html><body style="font-family:sans-serif;padding:2rem;background:#0d0a14;color:#f0d6f5;">
      <h2>❌ Token error</h2><pre>${JSON.stringify(tokenData, null, 2)}</pre>
    </body></html>`, { headers: { "Content-Type": "text/html" } });
  }

  const html = `<!DOCTYPE html>
<html>
<head><title>Spotify Auth ✅</title></head>
<body style="font-family:sans-serif;padding:2rem;background:#0d0a14;color:#f0d6f5;max-width:600px;margin:0 auto;">
  <h2 style="color:#1db954;">✅ Spotify connected!</h2>
  <p>Copy your <strong style="color:#ff69b4;">refresh token</strong> below and send it to Claude:</p>
  <textarea readonly onclick="this.select()" style="width:100%;padding:12px;background:#1a0a2e;color:#00e5ff;border:1px solid #ff69b4;border-radius:8px;font-family:monospace;font-size:13px;margin-top:8px;resize:none;" rows="4">${tokenData.refresh_token}</textarea>
  <p style="color:#a07ab0;font-size:13px;margin-top:16px;">⚠️ Keep this token private — treat it like a password.</p>
</body>
</html>`;

  return new Response(html, { headers: { "Content-Type": "text/html" } });
};

export const config = {
  path: "/spotify-callback",
};
