export async function onRequest(context) {
  const { request, env } = context;
  const cf = request.cf || {};

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";

  // 🔍 黑名单检查
  const blocked = await env.DB.prepare(
    "SELECT * FROM blacklist WHERE ip = ?"
  ).bind(ip).first();

  let risk = "low";
  let reason = null;

  // 🧠 基础威胁规则
  let score = 0;

  if (!cf.country) score += 40;
  if ((cf.asOrganization || "").toLowerCase().includes("hosting")) score += 30;
  if ((cf.asOrganization || "").toLowerCase().includes("vpn")) score += 30;

  if (cf.country === "RU" || cf.country === "CN") score += 10;

  if (score > 70) risk = "high";
  else if (score > 40) risk = "medium";

  // 🚨 如果在黑名单
  if (blocked) {
    risk = "blocked";
    reason = blocked.reason;
  }

  const data = {
    ip,
    country: cf.country || "Unknown",
    city: cf.city || "Unknown",
    region: cf.region || "Unknown",
    lat: cf.latitude || 0,
    lon: cf.longitude || 0,
    org: cf.asOrganization || "Unknown",
    risk,
    reason
  };

  // 💾 写入访问日志
  await env.DB.prepare(
    `INSERT INTO visits (ip, country, city, region, lat, lon, ua, risk)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    data.ip,
    data.country,
    data.city,
    data.region,
    data.lat,
    data.lon,
    request.headers.get("User-Agent") || "",
    data.risk
  ).run();

  return Response.json(data);
}
