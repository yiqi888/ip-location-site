export async function onRequest(context) {

const db = context.env.DB;

// 总访问
const total = await db.prepare(
  "SELECT COUNT(*) as c FROM visits"
).first();

// 今日访问
const today = await db.prepare(
  `SELECT COUNT(*) as c FROM visits
   WHERE date(created_at) = date('now')`
).first();

// 最近10条
const recent = await db.prepare(
  `SELECT * FROM visits
   ORDER BY id DESC
   LIMIT 10`
).all();

return Response.json({
  total: total.c,
  today: today.c,
  recent: recent.results
});

}
