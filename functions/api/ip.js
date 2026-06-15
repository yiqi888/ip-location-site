export async function onRequest(context) {
  const req = context.request;
  const cf = req.cf || {};

  const ip =
    req.headers.get("CF-Connecting-IP") ||
    "unknown";

  return Response.json({
    ip,
    country: cf.country || "Unknown",
    city: cf.city || "Unknown",
    region: cf.region || "Unknown",
    timezone: cf.timezone || "Unknown",
    lat: cf.latitude || null,
    lon: cf.longitude || null,
    org: cf.asOrganization || "Unknown",
    userAgent: req.headers.get("User-Agent")
  });
}
