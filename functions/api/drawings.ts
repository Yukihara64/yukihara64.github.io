export async function onRequest(context: EventContext<any, any, any>) {
  const { request, env } = context;
  const method = request.method;

  // POST — save a new drawing
  if (method === "POST") {
    try {
      const body       = (await request.json()) as any;
      const image_data = (body.image_data ?? "").trim();
      const message    = (body.message ?? "").trim().slice(0, 200);
      if (!image_data) {
        return Response.json({ error: "No drawing data" }, { status: 400 });
      }
      await env.DB.prepare(
        "INSERT INTO drawings (image_data, message) VALUES (?, ?)"
      ).bind(image_data, message || null).run();
      return Response.json({ success: true });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  // GET — admin only
  if (method === "GET") {
    const auth = request.headers.get("x-admin-password");
    if (auth !== env.ADMIN_PASSWORD) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      const { results } = await env.DB.prepare(
        "SELECT * FROM drawings ORDER BY created_at DESC"
      ).all();
      return Response.json({ drawings: results });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  // DELETE — admin only
  if (method === "DELETE") {
    const auth = request.headers.get("x-admin-password");
    if (auth !== env.ADMIN_PASSWORD) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      const body = (await request.json()) as any;
      await env.DB.prepare("DELETE FROM drawings WHERE id = ?").bind(body.id).run();
      return Response.json({ success: true });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
