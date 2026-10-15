// Minimal in-memory, per-IP fixed-window rate limiter (single instance only).

// On Render, traffic arrives through Cloudflare, which sets CF-Connecting-IP to the real
// visitor IP (and overwrites any value a client sends). Elsewhere it isn't trustworthy,
// so Express's req.ip is used instead.
const BEHIND_CLOUDFLARE = Boolean(process.env.RENDER) || process.env.TRUST_CF_CONNECTING_IP === "true";

const clientKey = (req) => (BEHIND_CLOUDFLARE && req.get("cf-connecting-ip")) || req.ip;

const rateLimit = ({ windowMs, max, message }) => {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (now > entry.resetAt) hits.delete(key);
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const key = clientKey(req);
    const entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (++entry.count > max) {
      res.set("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({ success: false, message });
    }
    next();
  };
};

module.exports = rateLimit;
module.exports.clientKey = clientKey;
