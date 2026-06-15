export async function onRequest(context) {
  const { request, env } = context;

  const url = new URL(request.url);

  // ➕ 添加黑名单
  if (request.method === "POST") {
    const body = await request.json();

    await env.DB.prepare(
      "INSERT OR IGNORE INTO blacklist (ip, reason) VALUES (?, ?)"
    ).bind(body.ip, body.reason || "manual block").run();

    return Response.json({ ok: true });
  }

  // 📋 查询黑名单
  const list = await env.DB.prepare(
    "SELECT * FROM blacklist ORDER BY id DESC"
  ).all();

  return Response.json(list.results);
}
