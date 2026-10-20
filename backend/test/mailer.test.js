// Emails to me (lib/mailer.js), and the contact form's save-and-email, with fetch and the database mocked.
const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

const realFetch = global.fetch;
const KEYS = ["RESEND_API_KEY", "NOTIFY_EMAIL", "MAIL_FROM", "SENDGRID_API_KEY", "SENDGRID_SENDER_EMAIL"];
let calls;
beforeEach(() => {
  for (const key of KEYS) delete process.env[key];
  calls = [];
});
afterEach(() => {
  global.fetch = realFetch;
  for (const key of KEYS) delete process.env[key];
});

const fresh = (mod) => {
  delete require.cache[require.resolve(mod)];
  return require(mod);
};
const resend = (status = 200, body = { id: "email_1" }) => async (url, init) => {
  calls.push({ url, init });
  return { ok: status < 400, status, json: async () => body };
};

test("Resend sends my notification from its onboarding address, Reply going to the visitor", async () => {
  Object.assign(process.env, { RESEND_API_KEY: "re_test", NOTIFY_EMAIL: "me@example.com" });
  global.fetch = resend();
  const mailer = fresh("../lib/mailer");
  assert.equal(mailer.provider(), "resend");
  assert.equal(await mailer.notify({ subject: "Hi", html: "<p>Hi</p>", replyTo: "jane@company.com" }), "resend");

  const [{ url, init }] = calls;
  assert.equal(url, "https://api.resend.com/emails");
  assert.equal(init.headers.Authorization, "Bearer re_test");
  assert.deepEqual(JSON.parse(init.body), {
    from: "Ankit's portfolio <onboarding@resend.dev>",
    to: ["me@example.com"],
    subject: "Hi",
    html: "<p>Hi</p>",
    reply_to: "jane@company.com",
  });
});

test("Resend errors are reported, and MAIL_FROM changes the sender", async () => {
  Object.assign(process.env, { RESEND_API_KEY: "re_test", NOTIFY_EMAIL: "me@example.com", MAIL_FROM: "Portfolio <hi@example.com>" });
  global.fetch = resend(403, { name: "validation_error", message: "You can only send testing emails to your own email address" });
  const mailer = fresh("../lib/mailer");
  await assert.rejects(mailer.notify({ subject: "Hi", html: "x" }), /Resend: HTTP 403 You can only send testing emails/);
  assert.equal(JSON.parse(calls[0].init.body).from, "Portfolio <hi@example.com>");
});

test("Resend needs its key and my address; without both, nothing is sent", async () => {
  global.fetch = resend();
  let mailer = fresh("../lib/mailer");
  assert.equal(mailer.provider(), null);
  await assert.rejects(mailer.notify({ subject: "x", html: "x" }), /no email service/);

  // The old SendGrid settings, if Render still has them, change nothing.
  Object.assign(process.env, { RESEND_API_KEY: "re_test", SENDGRID_API_KEY: "SG.x", SENDGRID_SENDER_EMAIL: "sender@example.com" });
  mailer = fresh("../lib/mailer");
  assert.equal(mailer.provider(), null, "no NOTIFY_EMAIL: nowhere to send");
  assert.equal(calls.length, 0);

  process.env.NOTIFY_EMAIL = "me@example.com";
  mailer = fresh("../lib/mailer");
  assert.equal(mailer.provider(), "resend");
});

// ---------- the contact form ----------
const contact = (db) => {
  const dbPath = require.resolve("../config/db");
  require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: { query: db } };
  delete require.cache[require.resolve("../lib/mailer")];
  delete require.cache[require.resolve("../lib/limits")]; // the day's counts (#190) go through the same database
  return fresh("../controllers/portfolioController").sendEmailController;
};
const send = async (handler, body) => {
  const out = { status: 200, body: null };
  const res = { status: (s) => ((out.status = s), res), json: (b) => ((out.body = b), res) };
  await handler({ body, ip: "198.51.100.1", get: () => undefined }, res);
  return out;
};
const message = { name: "Jane Doe", email: "jane@company.com", msg: "Hiring for a mobile role" };

test("contact form: saved and emailed through Resend, subject with the sender's name", async () => {
  Object.assign(process.env, { RESEND_API_KEY: "re_test", NOTIFY_EMAIL: "me@example.com" });
  global.fetch = resend();
  const queries = [];
  const handler = contact(async (sql, params) => {
    queries.push({ sql, params });
    return { rows: [{ n: 1 }] }; // the day's counts: a place left in each (test/contact-caps.test.js has them full)
  });
  const { status } = await send(handler, message);
  assert.equal(status, 200);
  const saved = queries.filter((q) => /INSERT INTO contacts/.test(q.sql)).map((q) => q.params);
  assert.deepEqual(saved, [["Jane Doe", "jane@company.com", "Hiring for a mobile role"]]);
  const email = JSON.parse(calls[0].init.body);
  assert.equal(email.subject, "📩 New Portfolio Contact: Jane Doe");
  assert.equal(email.reply_to, "jane@company.com");
  assert.match(email.html, /Hiring for a mobile role/);
});

test("contact form: one channel failing still succeeds; both failing is a 500", async () => {
  const error = console.error;
  console.error = () => {};
  try {
    // no email service: saved only
    assert.equal((await send(contact(async () => {}), message)).status, 200);
    // database down, Resend up: emailed only
    Object.assign(process.env, { RESEND_API_KEY: "re_test", NOTIFY_EMAIL: "me@example.com" });
    global.fetch = resend();
    const down = async () => {
      throw new Error("db down");
    };
    assert.equal((await send(contact(down), message)).status, 200);
    // both down
    global.fetch = resend(500, {});
    assert.equal((await send(contact(down), message)).status, 500);
  } finally {
    console.error = error;
  }
});
