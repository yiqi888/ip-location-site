export async function onRequest(context){

const req =
context.request;

const cf =
req.cf;

return Response.json({

ip:
req.headers.get(
"CF-Connecting-IP"
),

country:
cf.country ||

"未知",

city:
cf.city ||

"未知",

region:
cf.region ||

"未知",

timezone:
cf.timezone ||

"未知",

asn:
cf.asOrganization ||

"未知"

});

}
