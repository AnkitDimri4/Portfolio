// Minimal in-memory, per-IP fixed-window rate limiter (single instance only).

// On Render, traffic arrives through Cloudflare, which sets CF-Connecting-IP to the real
// visitor IP (and overwrites any value a client sends). Elsewhere it isn't trustworthy,
// so Express's req.ip is used instead.
const BEHIND_CLOUDFLARE = Boolean(process.env.RENDER) || process.env.TRUST_CF_CONNECTING_IP === "true";

const clientKey = (req) => (BEHIND_CLOUDFLARE && req.get("cf-connecting-ip")) || req.ip;

/**
 * At most `max` requests per `windowMs`, per visitor, or per whatever `key(req)` returns (e.g. a
 * resume's id). Requests `skip(req)` is true for aren't counted.
 */
const rateLimit = ({ windowMs, max, message, key: keyOf = clientKey, skip }) => {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (now > entry.resetAt) hits.delete(key);
  }, windowMs).unref();

  return (req, res, next) => {
    if (skip?.(req)) return next();
    const now = Date.now();
    const key = keyOf(req);
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
