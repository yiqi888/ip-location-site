export async function onRequest(context) {
  const { request, env } = context;
  const cf = request.cf || {};

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";

  const data = {
    ip,
    country: cf.country || "unknown",
    city: cf.city || "unknown",
    region: cf.region || "unknown",
    lat: cf.latitude ?? 0,
    lon: cf.longitude ?? 0,
    asn: cf.asOrganization || "unknown",
    ua: request.headers.get("User-Agent") || "",
    time: new Date().toISOString()
  };

  // ✅ 写入 D1（失败不影响主流程）
  try {
    await env.DB.prepare(
      `INSERT INTO visits (ip, country, city, region, lat, lon, ua)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      data.ip,
      data.country,
      data.city,
      data.region,
      data.lat,
      data.lon,
      data.ua
    )
    .run();
  } catch (e) {
    console.log("DB write failed:", e);
  }

  return Response.json(data);
}
