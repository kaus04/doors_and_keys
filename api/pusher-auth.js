// Vercel Serverless Function (Node)
// npm package needed at deploy: pusher (server SDK)
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,         // public key (also used by client)
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,  // e.g. "mt1"
  useTLS: true,
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { socket_id, channel_name } = req.body || {};
  // Optional: client sends ?name=... as a query param (set in index.html)
  const name = (req.query?.name || req.body?.name || "").toString().slice(0, 30) || "Guest";

  // presence channels require user_id + (optional) user_info
  const presenceData = {
    user_id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    user_info: { name }
  };

  const auth = pusher.authenticate(socket_id, channel_name, presenceData);
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(auth);
}
