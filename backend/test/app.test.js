// HTTP-level tests against the real Express app on an ephemeral port.
// None of these reach the database or SendGrid (validation/honeypot return first).
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

delete process.env.CORS_ORIGIN; // exercise the default allow-list
const app = require("../app");

let server, base;
before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const post = (path, body, headers = {}) =>
  fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body });

test("health endpoint responds", async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, "ok");
});

test("security headers are set and the framework is not advertised", async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal(res.headers.get("x-frame-options"), "DENY");
  assert.equal(res.headers.get("x-powered-by"), null);
});

test("CORS allows the portfolio and its previews, not other sites", async () => {
  const origin = async (o) => (await fetch(`${base}/health`, { headers: { Origin: o } })).headers.get("access-control-allow-origin");
  assert.equal(await origin("https://portfolio-nine-orcin-33.vercel.app"), "https://portfolio-nine-orcin-33.vercel.app");
  for (const vercel of [
    "https://portfolio-ankit-dimris-projects.vercel.app", // team alias
    "https://portfolio-git-main-ankit-dimris-projects.vercel.app", // branch URL
    "https://portfolio-k3x9q2m7a-ankit-dimris-projects.vercel.app", // preview deployment
  ]) {
    assert.equal(await origin(vercel), vercel);
  }
  assert.equal(await origin("http://localhost:3000"), "http://localhost:3000");
  assert.equal(await origin("https://evil.example.com"), null);
  assert.equal(await origin("https://portfolio-ankit-dimris-projects.vercel.app.evil.com"), null);
  assert.equal(await origin("http://portfolio-nine-orcin-33.vercel.app"), null, "https only");
});

test("unknown routes return JSON 404", async () => {
  const res = await fetch(`${base}/api/v1/nope`);
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { success: false, message: "Not found" });
});

test("malformed JSON returns a clean 400 without stack traces", async () => {
  const res = await post("/api/v1/portfolio/sendEmail", '{"name": broken');
  assert.equal(res.status, 400);
  const text = await res.text();
  assert.match(text, /Invalid request body/);
  assert.doesNotMatch(text, /at JSON\.parse|node_modules|\\|\//);
});

test("bodies over 20 kB are rejected with 413", async () => {
  const res = await post("/api/v1/portfolio/sendEmail", JSON.stringify({ msg: "a".repeat(30_000) }));
  assert.equal(res.status, 413);
});

test("contact form validation errors are returned as 400 JSON", async () => {
  const res = await post("/api/v1/portfolio/sendEmail", JSON.stringify({ name: "x", email: "nope", msg: "hi" }), {
    "X-Forwarded-For": "198.51.100.1",
  });
  assert.equal(res.status, 400);
  assert.match((await res.json()).message, /valid email/);
});

test("honeypot submissions look successful but are dropped", async () => {
  const res = await post(
    "/api/v1/portfolio/sendEmail",
    JSON.stringify({ name: "Bot", email: "bot@example.com", msg: "spam", company: "Spam Inc" }),
    { "X-Forwarded-For": "198.51.100.2" }
  );
  assert.equal(res.status, 200);
  assert.equal((await res.json()).success, true);
});
