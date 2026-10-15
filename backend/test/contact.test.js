const { test } = require("node:test");
const assert = require("node:assert/strict");
const { escapeHtml, validateContact } = require("../lib/contact");

test("escapeHtml neutralises HTML special characters", () => {
  assert.equal(escapeHtml(`<img src=x onerror="alert('x')">&`), "&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;");
});

test("valid input is accepted and trimmed", () => {
  const r = validateContact({ name: "  Jane  ", email: " jane@example.com ", msg: " Hello " });
  assert.deepEqual(r, { ok: true, data: { name: "Jane", email: "jane@example.com", msg: "Hello" } });
});

test("missing fields are rejected", () => {
  assert.equal(validateContact({ name: "Jane", email: "", msg: "Hi" }).ok, false);
  assert.equal(validateContact({}).ok, false);
  assert.equal(validateContact(undefined).ok, false);
});

test("invalid or over-long emails are rejected", () => {
  assert.match(validateContact({ name: "a", email: "not-an-email", msg: "b" }).message, /valid email/);
  const long = `${"a".repeat(140)}@example.com`; // 152 chars > VARCHAR(150)
  assert.equal(validateContact({ name: "a", email: long, msg: "b" }).ok, false);
});

test("over-long name or message is rejected", () => {
  assert.equal(validateContact({ name: "a".repeat(101), email: "a@b.co", msg: "b" }).ok, false);
  assert.equal(validateContact({ name: "a", email: "a@b.co", msg: "b".repeat(5001) }).ok, false);
});

test("non-string values are coerced safely", () => {
  const r = validateContact({ name: 123, email: "a@b.co", msg: ["x"] });
  assert.deepEqual(r, { ok: true, data: { name: "123", email: "a@b.co", msg: "x" } });
});

test("honeypot field marks the request as spam", () => {
  assert.deepEqual(validateContact({ name: "Bot", email: "bot@x.io", msg: "buy", company: "Spam Inc" }), { ok: true, spam: true });
});
