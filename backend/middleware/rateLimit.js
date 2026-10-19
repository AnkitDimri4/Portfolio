// Minimal in-memory, per-IP fixed-window rate limiter (single instance only).
const { BlockList, isIP } = require("node:net");

// On Render, traffic arrives through Cloudflare, which sets CF-Connecting-IP to the real
// visitor IP (and overwrites any value a client sends). Elsewhere it isn't trustworthy,
// so Express's req.ip is used instead. Even on Render, the header only counts when the request
// came from one of Cloudflare's addresses (or from inside Render's own network): a request that
// reached the server some other way could carry any value in it, so it's counted by its own address.
const BEHIND_CLOUDFLARE = Boolean(process.env.RENDER) || process.env.TRUST_CF_CONNECTING_IP === "true";

// Cloudflare's addresses (www.cloudflare.com/ips), then private ones.
const VIA_CLOUDFLARE = new BlockList();
for (const range of [
  "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22", "141.101.64.0/18", "108.162.192.0/18", "190.93.240.0/20",
  "188.114.96.0/20", "197.234.240.0/22", "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13", "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22",
  "2400:cb00::/32", "2606:4700::/32", "2803:f800::/32", "2405:b500::/32", "2405:8100::/32", "2a06:98c0::/29", "2c0f:f248::/32",
  "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "100.64.0.0/10", "127.0.0.0/8", "fc00::/7", "::1/128",
]) {
  const [net, bits] = range.split("/");
  VIA_CLOUDFLARE.addSubnet(net, Number(bits), net.includes(":") ? "ipv6" : "ipv4");
}
const viaCloudflare = (ip = "") => {
  const address = ip.startsWith("::ffff:") ? ip.slice(7) : ip; // an IPv4 address written as IPv6
  const version = isIP(address);
  return version !== 0 && VIA_CLOUDFLARE.check(address, version === 6 ? "ipv6" : "ipv4");
};

const clientKey = (req) => (BEHIND_CLOUDFLARE && viaCloudflare(req.ip) && req.get("cf-connecting-ip")) || req.ip;

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

  const limit = (req, res, next) => {
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
  // What it allows, so a test can check that every route has a limit
  limit.limits = { windowMs, max };
  return limit;
};

module.exports = rateLimit;
module.exports.clientKey = clientKey;
