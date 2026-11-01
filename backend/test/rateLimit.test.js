const { test } = require("node:test");
const assert = require("node:assert/strict");

const load = (env = {}) => {
  const path = require.resolve("../middleware/rateLimit");
  delete require.cache[path];
  const saved = { RENDER: process.env.RENDER, TRUST_CF_CONNECTING_IP: process.env.TRUST_CF_CONNECTING_IP };
  delete process.env.RENDER;
  delete process.env.TRUST_CF_CONNECTING_IP;
  Object.assign(process.env, env);
  const mod = require(path);
  for (const [k, v] of Object.entries(saved)) (v === undefined ? delete process.env[k] : (process.env[k] = v));
  return mod;
};

const fakeReq = (ip, headers = {}) => ({ ip, get: (h) => headers[h.toLowerCase()] });
const fakeRes = () => {
  const res = { statusCode: 200, headers: {}, body: null };
  res.set = (k, v) => ((res.headers[k] = v), res);
  res.status = (c) => ((res.statusCode = c), res);
  res.json = (b) => ((res.body = b), res);
  return res;
};

test("allows `max` requests per window, then answers 429 with Retry-After", () => {
  const limiter = load()({ windowMs: 60_000, max: 2, message: "slow down" });
  let passed = 0;
  for (let i = 0; i < 2; i++) limiter(fakeReq("1.1.1.1"), fakeRes(), () => passed++);
  const res = fakeRes();
  limiter(fakeReq("1.1.1.1"), res, () => passed++);
  assert.equal(passed, 2);
  assert.equal(res.statusCode, 429);
  assert.equal(res.body.message, "slow down");
  assert.ok(Number(res.headers["Retry-After"]) > 0);
});

test("different visitors have separate limits", () => {
  const limiter = load()({ windowMs: 60_000, max: 1, message: "x" });
  let passed = 0;
  limiter(fakeReq("1.1.1.1"), fakeRes(), () => passed++);
  limiter(fakeReq("2.2.2.2"), fakeRes(), () => passed++);
  assert.equal(passed, 2);
});

test("CF-Connecting-IP is only trusted on Render (behind Cloudflare)", () => {
  const req = fakeReq("172.68.0.1", { "cf-connecting-ip": "203.0.113.7" });
  assert.equal(load().clientKey(req), "172.68.0.1", "ignored off Render: the header could be spoofed");
  assert.equal(load({ RENDER: "true" }).clientKey(req), "203.0.113.7", "used on Render");
  assert.equal(load({ RENDER: "true" }).clientKey(fakeReq("10.0.0.1")), "10.0.0.1", "falls back to req.ip");
});

test("on Render, CF-Connecting-IP counts only on a request from Cloudflare, or from inside Render", () => {
  const { clientKey } = load({ RENDER: "true" });
  const header = { "cf-connecting-ip": "203.0.113.7" };
  for (const hop of ["172.68.0.1", "::ffff:172.68.0.1", "2606:4700::6810:84e5", "10.12.0.4"]) assert.equal(clientKey(fakeReq(hop, header)), "203.0.113.7", hop);
  for (const elsewhere of ["198.51.100.20", "::ffff:198.51.100.20", "not an address"]) {
    assert.equal(clientKey(fakeReq(elsewhere, header)), elsewhere, `${elsewhere}: the header could be made up`);
  }
  assert.equal(clientKey(fakeReq("2001:db8::1", header)), "2001:db8:0:0::/64", "an IPv6 address from elsewhere: its own, by its /64");
});

test("an IPv6 visitor counts by their /64, so taking a new address from it for each request doesn't reset their limits", () => {
  const { clientKey } = load({ RENDER: "true" });
  const viaCf = (visitor) => clientKey(fakeReq("2606:4700::6810:84e5", { "cf-connecting-ip": visitor }));
  const home = viaCf("2001:db8:1:2::1");
  assert.equal(home, "2001:db8:1:2::/64");
  for (const same of ["2001:db8:1:2::ffff", "2001:0db8:0001:0002:abcd:ef01:2345:6789", "2001:DB8:1:2:0:0:0:7", "2001:db8:1:2::1.2.3.4"]) assert.equal(viaCf(same), home, same);
  for (const other of ["2001:db8:1:3::1", "2001:db8::1", "::1"]) assert.notEqual(viaCf(other), home, other);
  assert.equal(viaCf("203.0.113.7"), "203.0.113.7", "IPv4 unchanged");
  assert.equal(load().clientKey(fakeReq("2001:db8:1:2::99")), "2001:db8:1:2::/64", "off Render too, from req.ip");
  assert.equal(load().clientKey(fakeReq("::ffff:203.0.113.7")), "::ffff:203.0.113.7", "IPv4 written as IPv6, unchanged");

  // Through a limiter: a second request from another address in the same /64 is the same visitor's
  const limiter = load({ RENDER: "true" })({ windowMs: 60_000, max: 1, message: "x" });
  let passed = 0;
  const res = fakeRes();
  limiter(fakeReq("2606:4700::6810:84e5", { "cf-connecting-ip": "2001:db8:1:2::1" }), fakeRes(), () => passed++);
  limiter(fakeReq("2606:4700::6810:84e5", { "cf-connecting-ip": "2001:db8:1:2::2" }), res, () => passed++);
  assert.equal(passed, 1);
  assert.equal(res.statusCode, 429);
});
