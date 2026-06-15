export async function onRequest(context) {
  const { env } = context;

  const logs = await env.DB.prepare(
    "SELECT * FROM visits ORDER BY id DESC LIMIT 100"
  ).all();

  return Response.json(logs.results);
}
