export async function onRequest(context) {
  const env           = context.env;
  const CLIENT_ID     = env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = env.SPOTIFY_CLIENT_SECRET;

  // Dynamically use the current request's origin so it always matches
  const origin       = new URL(context.request.url).origin;
  const REDIRECT_URI = `${origin}/spotify-callback`;

  const url   = new URL(context.request.url);
  const code  = url.searchParams.get("code");
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

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
    },
    body: new URLSearchParams({
      grant_type:   "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }).toString(),
  });

  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    return new Response(`<html><body style="font-family:sans-serif;padding:2rem;background:#0d0a14;color:#f0d6f5;">
      <h2>❌ Token error</h2><pre>${JSON.stringify(tokenData, null, 2)}</pre>
      <p style="color:#a07ab0;font-size:13px;">Redirect URI used: ${REDIRECT_URI}</p>
    </body></html>`, { headers: { "Content-Type": "text/html" } });
  }

  const html = `<!DOCTYPE html>
<html>
<head><title>Spotify Auth ✅</title></head>
<body style="font-family:sans-serif;padding:2rem;background:#0d0a14;color:#f0d6f5;max-width:600px;margin:0 auto;">
  <h2 style="color:#1db954;">✅ Spotify connected!</h2>
  <p>Copy your <strong style="color:#ff69b4;">refresh token</strong> below:</p>
  <textarea readonly onclick="this.select()" style="width:100%;padding:12px;background:#1a0a2e;color:#00e5ff;border:1px solid #ff69b4;border-radius:8px;font-family:monospace;font-size:13px;margin-top:8px;resize:none;" rows="4">${tokenData.refresh_token}</textarea>
</body>
</html>`;

  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
