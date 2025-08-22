export default async function handler(req, res) {
  const key = process.env.PUSHER_KEY || "";
  const cluster = process.env.PUSHER_CLUSTER || "";
  if (!key || !cluster) return res.status(500).json({ error: "Missing PUSHER_KEY or PUSHER_CLUSTER" });
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=600");
  res.status(200).json({ key, cluster });
}
