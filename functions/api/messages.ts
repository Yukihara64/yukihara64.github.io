export async function onRequest(context: EventContext<any, any, any>) {
  const { request, env } = context;
  const method = request.method;

  // POST — save a new message
  if (method === "POST") {
    try {
      const body    = (await request.json()) as any;
      const message = (body.message ?? "").trim();
      if (!message) {
        return Response.json({ error: "Message cannot be empty" }, { status: 400 });
      }
      if (message.length > 500) {
        return Response.json({ error: "Message too long (max 500 chars)" }, { status: 400 });
      }
      await env.DB.prepare(
        "INSERT INTO messages (message) VALUES (?)"
      ).bind(message).run();
      return Response.json({ success: true });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  // GET — admin only, requires password header
  if (method === "GET") {
    const auth = request.headers.get("x-admin-password");
    if (auth !== env.ADMIN_PASSWORD) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      const { results } = await env.DB.prepare(
        "SELECT * FROM messages ORDER BY created_at DESC"
      ).all();
      return Response.json({ messages: results });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  // DELETE — admin only, delete a message by id
  if (method === "DELETE") {
    const auth = request.headers.get("x-admin-password");
    if (auth !== env.ADMIN_PASSWORD) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      const body = (await request.json()) as any;
      await env.DB.prepare("DELETE FROM messages WHERE id = ?").bind(body.id).run();
      return Response.json({ success: true });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
