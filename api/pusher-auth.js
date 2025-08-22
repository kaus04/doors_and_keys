const Pusher = require("pusher");

["PUSHER_APP_ID","PUSHER_KEY","PUSHER_SECRET","PUSHER_CLUSTER"].forEach(k=>{
  if(!process.env[k]) console.warn(`[WARN] Missing env ${k}`);
});

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

function readRawBody(req){
  return new Promise((resolve,reject)=>{
    let data=""; req.on("data",(c)=>data+=c); req.on("end",()=>resolve(data)); req.on("error",reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const ct = (req.headers["content-type"]||"").toLowerCase();
  let socket_id, channel_name, name;
  try {
    if (ct.includes("application/json")) {
      const body = req.body || {};
      socket_id = body.socket_id; channel_name = body.channel_name; name = (body.name||"").toString().slice(0,30);
    } else {
      const raw = await readRawBody(req);
      const params = new URLSearchParams(raw);
      socket_id = params.get("socket_id"); channel_name = params.get("channel_name"); name = (params.get("name")||"").toString().slice(0,30);
    }
    if (!socket_id || !channel_name) return res.status(400).json({ error: "Missing socket_id or channel_name" });

    const presenceData = { user_id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, user_info: { name: name || "Guest" } };
    const auth = pusher.authorizeChannel(socket_id, channel_name, presenceData);
    res.setHeader("Content-Type","application/json");
    return res.status(200).send(auth);
  } catch (err) {
    console.error("[pusher-auth] error", err);
    return res.status(500).json({ error: "auth_failed" });
  }
};
