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
