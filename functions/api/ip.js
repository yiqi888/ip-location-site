export async function onRequest(context) {

const req = context.request;
const cf = req.cf;

// IP信息
const data = {
  ip: req.headers.get("CF-Connecting-IP"),
  country: cf?.country || "未知",
  city: cf?.city || "未知",
  region: cf?.region || "未知",
  lat: cf?.latitude || null,
  lon: cf?.longitude || null,
  ua: req.headers.get("User-Agent")
};

// 写入 D1（如果绑定了）
if (context.env.DB) {
  await context.env.DB.prepare(
    `INSERT INTO visits (ip, country, city, region, lat, lon, ua)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    data.ip,
    data.country,
    data.city,
    data.region,
    data.lat,
    data.lon,
    data.ua
  ).run();
}

return Response.json(data);

}
