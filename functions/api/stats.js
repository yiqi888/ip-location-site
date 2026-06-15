export async function onRequest(context) {

const { request, env } = context;
const cf = request.cf;

const ip = request.headers.get("CF-Connecting-IP");

const data = {
  ip,
  country: cf?.country,
  city: cf?.city,
  lat: cf?.latitude,
  lon: cf?.longitude,
  time: new Date().toISOString()
};

// 写入数据库
await env.DB.prepare(
`INSERT INTO visits (ip, country, city, region, lat, lon, ua)
 VALUES (?, ?, ?, ?, ?, ?, ?)`
).bind(
data.ip,
cf?.country,
cf?.city,
cf?.region,
cf?.latitude,
cf?.longitude,
request.headers.get("User-Agent")
).run();

// SSE响应
const encoder = new TextEncoder();

return new Response(
new ReadableStream({
start(controller){

controller.enqueue(
encoder.encode(
`data: ${JSON.stringify(data)}\n\n`
)
);

setInterval(() => {
controller.enqueue(
encoder.encode(
`event: ping\ndata: {}\n\n`
);
}, 15000);

}
}),
{
headers: {
"Content-Type": "text/event-stream",
"Cache-Control": "no-cache",
Connection: "keep-alive"
}
}
);

}
