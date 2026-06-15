export async function onRequest(context) {
  const req = context.request;
  const cf = req.cf || {};

  const ip = req.headers.get("CF-Connecting-IP") || "unknown";

  // 🧠 简单风险评分逻辑（轻量版）
  let risk = "low";
  let score = 10;

  const asn = cf.asOrganization || "";

  if (!cf.country) {
    risk = "high";
    score += 40;
  }

  if (asn.toLowerCase().includes("hosting") ||
      asn.toLowerCase().includes("datacenter")) {
    risk = "medium";
    score += 25;
  }

  if (cf.country === "CN" || cf.country === "RU") {
    score += 10;
  }

  if (score > 50) risk = "high";
  else if (score > 25) risk = "medium";

  return Response.json({
    ip,
    country: cf.country || "Unknown",
    city: cf.city || "Unknown",
    region: cf.region || "Unknown",
    lat: cf.latitude || 0,
    lon: cf.longitude || 0,
    org: asn || "Unknown",

    // 🧠 新增
    risk,
    score: Math.min(score, 100)
  });
}
