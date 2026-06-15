export async function onRequest(context) {
  const { request, env } = context;
  const cf = request.cf || {};

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";

  const data = {
    ip,
    country: cf.country || "unknown",
    city: cf.city || "unknown",
    region: cf.region || "unknown",
    lat: cf.latitude ?? null,
    lon: cf.longitude ?? null,
    time: new Date().toISOString()
  };

  // ✅ 写入 D1（安全绑定）
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
      request.headers.get("User-Agent") || ""
    )
    .run();
  } catch (e) {
    console.error("DB error:", e);
  }

  // ⚠️ Cloudflare Pages SSE “稳定写法”
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {

      // 立即发送一次数据
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
      );

      // 用“轻量心跳替代 setInterval”
      const interval = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`event: ping\ndata: {}\n\n`)
          );
        } catch (e) {
          clearInterval(interval);
        }
      }, 15000);

      // 保存清理函数
      controller._cleanup = () => {
        clearInterval(interval);
      };
    },

    cancel(controller) {
      if (controller?._cleanup) {
        controller._cleanup();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive"
    }
  });
}
