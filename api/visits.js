// Visitor counter stored in Upstash Redis (free tier).
// GET /api/visits        -> { count }   (read only)
// POST /api/visits       -> { count }   (adds one visit, then returns the total)
// Needs env vars from Vercel's Upstash Redis integration:
//   KV_REST_API_URL + KV_REST_API_TOKEN   (or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)

const KEY = "hostinger-20-discount:visits";

module.exports = async (req, res) => {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  res.setHeader("Cache-Control", "no-store");

  if (!url || !token) {
    res.status(503).json({ error: "counter not configured" });
    return;
  }

  const command = req.method === "POST" ? "incr" : "get";
  try {
    const r = await fetch(`${url}/${command}/${encodeURIComponent(KEY)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`redis ${r.status}`);
    const { result } = await r.json();
    res.status(200).json({ count: Number(result) || 0 });
  } catch (err) {
    res.status(502).json({ error: "counter unavailable" });
  }
};
