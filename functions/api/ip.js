export async function onRequest(context) {
  try {
    const req = context.request;
    const cf = req.cf || {};

    return Response.json({
      ip: req.headers.get("CF-Connecting-IP") || "unknown",
      country: cf.country || "Unknown",
      city: cf.city || "Unknown",
      region: cf.region || "Unknown",
      lat: cf.latitude ?? 0,
      lon: cf.longitude ?? 0,
      org: cf.asOrganization || "Unknown",
      risk: "low"
    });

  } catch (e) {
    return new Response(JSON.stringify({
      error: true,
      message: e.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
