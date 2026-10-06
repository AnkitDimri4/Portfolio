// GitHub and LeetCode controllers, with fetch and the clock mocked.
const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

const realFetch = global.fetch;
const realNow = Date.now;
let now;
beforeEach(() => {
  now = 1_000_000;
  Date.now = () => now;
});
afterEach(() => {
  global.fetch = realFetch;
  Date.now = realNow;
});

const fresh = (mod) => {
  const path = require.resolve(mod);
  delete require.cache[path];
  return require(path);
};
const call = async (handler) => {
  let status = 200, body;
  await handler({}, { json: (b) => (body = b), status: (s) => ((status = s), { json: (b) => (body = b) }) });
  return { status, body };
};

// ---------- GitHub ----------
const githubFetch = (state) => async (url) => {
  if (url.includes("/users/")) {
    return { ok: true, status: 200, json: async () => state.repos.map((name) => ({ name, html_url: name, fork: false })) };
  }
  const repo = url.match(/repos\/[^/]+\/([^/]+)\/commits/)[1];
  if (state.failing.has(repo)) return { ok: false, status: 403, headers: { get: () => null } };
  return { ok: true, status: 200, headers: { get: () => `<x?page=${state.counts[repo]}>; rel="last"` } };
};

test("github: sums commit counts when every repo succeeds", async () => {
  const state = { repos: ["A", "B"], counts: { A: 10, B: 20 }, failing: new Set() };
  global.fetch = githubFetch(state);
  const { body } = await call(fresh("../controllers/githubController").getGithubStats);
  assert.equal(body.totalCommits, 30);
  assert.equal(body.partial, false);
});

test("github: reuses last known counts and keeps complete results over partial ones", async () => {
  const state = { repos: ["A", "B"], counts: { A: 10, B: 20 }, failing: new Set() };
  global.fetch = githubFetch(state);
  const ctrl = fresh("../controllers/githubController");
  await call(ctrl.getGithubStats);

  now += 61 * 60_000; // cache expired; B now fails but is known
  state.failing = new Set(["B"]);
  assert.equal((await call(ctrl.getGithubStats)).body.totalCommits, 30);

  now += 61 * 60_000; // a new repo that has never been counted fails
  state.repos.push("C");
  state.counts.C = 5;
  state.failing = new Set(["C"]);
  const kept = (await call(ctrl.getGithubStats)).body;
  assert.equal(kept.totalCommits, 30, "previous complete result is served");
  assert.equal(kept.partial, false);

  now += 6 * 60_000; // partial results are retried after 5 minutes
  state.failing = new Set();
  assert.equal((await call(ctrl.getGithubStats)).body.totalCommits, 35);
});

test("github: reports null instead of an undercount when nothing is known", async () => {
  global.fetch = githubFetch({ repos: ["A", "B"], counts: { A: 10 }, failing: new Set(["B"]) });
  const { body } = await call(fresh("../controllers/githubController").getGithubStats);
  assert.equal(body.totalCommits, null);
  assert.equal(body.partial, true);
});

test("github: 502 when GitHub is unreachable and nothing is cached", async () => {
  global.fetch = async () => ({ ok: false, status: 403 });
  const { status } = await call(fresh("../controllers/githubController").getGithubStats);
  assert.equal(status, 502);
});

// ---------- LeetCode ----------
const leetcodePayload = {
  data: {
    matchedUser: {
      submitStats: {
        acSubmissionNum: [
          { difficulty: "All", count: 690, submissions: 4587 },
          { difficulty: "Easy", count: 182, submissions: 900 },
          { difficulty: "Medium", count: 382, submissions: 2500 },
          { difficulty: "Hard", count: 126, submissions: 1187 },
        ],
        totalSubmissionNum: [{ difficulty: "All", count: 691, submissions: 4950 }],
      },
      profile: { ranking: 102305 },
    },
  },
};

test("leetcode: acceptance rate uses submissions, and difficulty breakdown is returned", async () => {
  global.fetch = async () => ({ ok: true, status: 200, json: async () => leetcodePayload });
  const { body } = await call(fresh("../controllers/leetcodeController").getLeetcodeStats);
  assert.equal(body.totalSolved, 690);
  assert.equal(body.acceptanceRate, "92.67"); // 4587 / 4950, not 690 / 691
  assert.deepEqual(body.solvedByDifficulty, { easy: 182, medium: 382, hard: 126 });
  assert.equal(body.ranking, 102305);
});

test("leetcode: serves stale data when LeetCode fails after a success", async () => {
  global.fetch = async () => ({ ok: true, status: 200, json: async () => leetcodePayload });
  const ctrl = fresh("../controllers/leetcodeController");
  await call(ctrl.getLeetcodeStats);
  now += 11 * 60_000;
  global.fetch = async () => ({ ok: false, status: 503 });
  const { status, body } = await call(ctrl.getLeetcodeStats);
  assert.equal(status, 200);
  assert.equal(body.totalSolved, 690);
});
