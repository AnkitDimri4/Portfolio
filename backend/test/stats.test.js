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

// After the cache runs out: the request that notices gets the old answer and starts a refresh;
// this waits for that refresh, then asks again.
const afterRefresh = async (ctrl, handler) => {
  await call(handler);
  await ctrl.refreshed();
  return call(handler);
};

test("github: reuses last known counts and keeps complete results over partial ones", async () => {
  const state = { repos: ["A", "B"], counts: { A: 10, B: 20 }, failing: new Set() };
  global.fetch = githubFetch(state);
  const ctrl = fresh("../controllers/githubController");
  await call(ctrl.getGithubStats);

  now += 61 * 60_000; // cache expired; B now fails but is known
  state.failing = new Set(["B"]);
  state.counts.A = 11;
  assert.equal((await afterRefresh(ctrl, ctrl.getGithubStats)).body.totalCommits, 31);

  now += 61 * 60_000; // a new repo that has never been counted fails
  state.repos.push("C");
  state.counts.C = 5;
  state.failing = new Set(["C"]);
  const kept = (await afterRefresh(ctrl, ctrl.getGithubStats)).body;
  assert.equal(kept.totalCommits, 31, "previous complete result is served");
  assert.equal(kept.partial, false);

  now += 6 * 60_000; // partial results are retried after 5 minutes
  state.failing = new Set();
  assert.equal((await afterRefresh(ctrl, ctrl.getGithubStats)).body.totalCommits, 36);
});

test("github: an old answer comes back at once, and the next visitor gets the refreshed one", async () => {
  const state = { repos: ["A"], counts: { A: 10 }, failing: new Set() };
  let asked = 0;
  const fake = githubFetch(state);
  global.fetch = async (url) => (asked++, fake(url));
  const ctrl = fresh("../controllers/githubController");
  assert.equal((await call(ctrl.getGithubStats)).body.totalCommits, 10);
  assert.equal((await call(ctrl.getGithubStats)).body.totalCommits, 10);
  assert.equal(asked, 2, "the second answer came from the cache: GitHub was asked once (the repos, then A's count)");

  now += 61 * 60_000;
  state.counts.A = 12;
  assert.equal((await call(ctrl.getGithubStats)).body.totalCommits, 10, "the old answer, without waiting for GitHub");
  await ctrl.refreshed();
  assert.equal((await call(ctrl.getGithubStats)).body.totalCommits, 12);
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

// Runs `fn` with console.error quiet (the failures the tests cause on purpose).
const quietly = async (fn) => {
  const realError = console.error;
  console.error = () => {};
  try {
    return await fn();
  } finally {
    console.error = realError;
  }
};

test("github: after GitHub fails, it isn't asked again for a minute", async () => {
  let asked = 0;
  global.fetch = async () => (asked++, { ok: false, status: 503 });
  const ctrl = fresh("../controllers/githubController");
  await quietly(async () => {
    assert.equal((await call(ctrl.getGithubStats)).status, 502);
    assert.equal((await call(ctrl.getGithubStats)).status, 502);
    assert.equal(asked, 1, "the second 502 came without asking GitHub");
  });
  now += 61_000;
  global.fetch = githubFetch({ repos: ["A"], counts: { A: 3 }, failing: new Set() });
  assert.equal((await call(ctrl.getGithubStats)).body.totalCommits, 3);
});

// Sets environment variables for one test (undefined removes one), then puts them back.
const withEnv = async (vars, fn) => {
  const before = {};
  for (const [key, value] of Object.entries(vars)) {
    before[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return await fn();
  } finally {
    for (const [key, value] of Object.entries(before)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
};

// The public copy "Portfolio", whose work happens in the private "Portfolio-app"
const copyState = () => ({ repos: ["Portfolio", "B"], counts: { "Portfolio-app": 326, Portfolio: 1, B: 20 }, failing: new Set() });

test("github: the public copy shows the private repository's commits, read with the stats' own token, never the admin view's", async () => {
  const tokens = {};
  const fake = githubFetch(copyState());
  global.fetch = async (url, options) => {
    const repo = url.match(/repos\/[^/]+\/([^/]+)\/commits/)?.[1];
    if (repo) tokens[repo] = options?.headers?.Authorization;
    return fake(url);
  };
  await withEnv({ STATS_GITHUB_TOKEN: "private-read-token", RESUME_GITHUB_TOKEN: "admin-token", GITHUB_TOKEN: "stats-token" }, async () => {
    const { body } = await call(fresh("../controllers/githubController").getGithubStats);
    assert.equal(body.repos.find((r) => r.name === "Portfolio").commits, 326);
    assert.equal(body.totalCommits, 346);
    assert.equal(tokens["Portfolio-app"], "Bearer private-read-token");
    assert.equal(tokens.B, "Bearer stats-token");
    assert.ok(!Object.values(tokens).includes("Bearer admin-token"));
    assert.ok(!("Portfolio" in tokens), "the copy's own commits aren't counted as well");
  });
});

test("github: without the stats' own token, the public copy's own commits count, even with the admin view's there", async () => {
  global.fetch = githubFetch(copyState());
  await withEnv({ STATS_GITHUB_TOKEN: undefined, RESUME_GITHUB_TOKEN: "admin-token" }, async () => {
    const { body } = await call(fresh("../controllers/githubController").getGithubStats);
    assert.equal(body.totalCommits, 21);
  });
});

test("github: the private count falls back to the last known one, like any other", async () => {
  const state = copyState();
  global.fetch = githubFetch(state);
  await withEnv({ STATS_GITHUB_TOKEN: "private-read-token" }, async () => {
    const ctrl = fresh("../controllers/githubController");
    await call(ctrl.getGithubStats);
    now += 61 * 60_000; // cache expired; the token stopped working
    state.failing = new Set(["Portfolio-app"]);
    state.counts.B = 21;
    assert.equal((await afterRefresh(ctrl, ctrl.getGithubStats)).body.totalCommits, 347);
  });
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
  const realError = console.error;
  console.error = () => {}; // the background refresh's failure
  try {
    const { status, body } = await afterRefresh(ctrl, ctrl.getLeetcodeStats);
    assert.equal(status, 200);
    assert.equal(body.totalSolved, 690);
  } finally {
    console.error = realError;
  }
});

test("leetcode: after LeetCode fails, it isn't asked again for a minute, not even to refresh", async () => {
  global.fetch = async () => ({ ok: true, status: 200, json: async () => leetcodePayload });
  const ctrl = fresh("../controllers/leetcodeController");
  await call(ctrl.getLeetcodeStats);
  now += 11 * 60_000;
  let asked = 0;
  global.fetch = async () => (asked++, { ok: false, status: 503 });
  await quietly(async () => {
    await afterRefresh(ctrl, ctrl.getLeetcodeStats); // the refresh fails
    assert.equal((await call(ctrl.getLeetcodeStats)).body.totalSolved, 690);
    await ctrl.refreshed();
    assert.equal(asked, 1, "no second refresh within the minute");
  });
  now += 61_000;
  const more = structuredClone(leetcodePayload);
  more.data.matchedUser.submitStats.acSubmissionNum[0].count = 691;
  global.fetch = async () => ({ ok: true, status: 200, json: async () => more });
  assert.equal((await afterRefresh(ctrl, ctrl.getLeetcodeStats)).body.totalSolved, 691, "asked again once the minute is up");
});

test("leetcode: an old answer comes back at once, and the next visitor gets the refreshed one", async () => {
  let payload = leetcodePayload;
  global.fetch = async () => ({ ok: true, status: 200, json: async () => payload });
  const ctrl = fresh("../controllers/leetcodeController");
  await call(ctrl.getLeetcodeStats);

  now += 11 * 60_000;
  const more = structuredClone(leetcodePayload);
  more.data.matchedUser.submitStats.acSubmissionNum[0].count = 691;
  payload = more;
  assert.equal((await call(ctrl.getLeetcodeStats)).body.totalSolved, 690, "the old answer, without waiting for LeetCode");
  await ctrl.refreshed();
  assert.equal((await call(ctrl.getLeetcodeStats)).body.totalSolved, 691);
});
