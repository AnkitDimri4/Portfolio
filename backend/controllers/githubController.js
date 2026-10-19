// GitHub stats proxy. Keeps the GitHub token on the server (never in the
// browser bundle) and caches results so visitors don't burn the rate limit.
// Once something is cached, a visitor always gets it at once: when it's old, the request that
// notices starts a refresh in the background, and later visitors get the new answer. After a
// failure, GitHub isn't asked again for a minute.
const USERNAME = "AnkitDimri4";
// Work that happens in a private repository is listed under its public copy, with the commits made
// in the private one (docs/runbooks/public-copy.md). Reading those takes RESUME_GITHUB_TOKEN, the
// token My resume uses, which reaches that repository; without it, the copy's own commits count.
const PRIVATE_SOURCES = { Portfolio: "Portfolio-app" };
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const PARTIAL_RETRY = 5 * 60 * 1000; // retry sooner when some counts failed (e.g. rate limit)
const FAILURE_PAUSE = 60 * 1000; // after GitHub fails, it isn't asked again for a minute

let cachedData = null;
let lastFetchTime = 0;
let failedAt = -Infinity;
let inFlight = null;
// Last successful commit count per repo, used when a later request fails.
const lastKnown = new Map();

const gh = (path, token = process.env.GITHUB_TOKEN) =>
  fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "ankit-dimri-portfolio",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    signal: AbortSignal.timeout(10_000), // never let a slow GitHub response hang the request
  });

// Number of commits authored by USERNAME on the repo's default branch,
// read from the pagination "last" link so it costs a single request.
const countCommits = async (repo, token) => {
  const res = await gh(
    `/repos/${USERNAME}/${repo}/commits?author=${USERNAME}&per_page=1`,
    token
  );
  if (res.status === 409) return 0; // empty repository
  if (!res.ok) throw new Error(`commits ${repo}: HTTP ${res.status}`);

  const match = (res.headers.get("link") || "").match(
    /[?&]page=(\d+)>; rel="last"/
  );
  if (match) return parseInt(match[1], 10);
  const body = await res.json();
  return Array.isArray(body) ? body.length : 0;
};

// A listed repository's commits: from its private source when there's a token to read it.
const countFor = (name) => {
  const source = PRIVATE_SOURCES[name];
  const token = process.env.RESUME_GITHUB_TOKEN;
  return source && token ? countCommits(source, token) : countCommits(name);
};

const fetchStats = async () => {
  const res = await gh(`/users/${USERNAME}/repos?per_page=100&sort=pushed`);
  if (!res.ok) throw new Error(`repos: HTTP ${res.status}`);
  const repos = (await res.json()).filter((r) => !r.fork);

  const withCommits = await Promise.all(
    repos.map(async (r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      homepage: r.homepage || null,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      pushedAt: r.pushed_at,
      commits: await countFor(r.name).then(
        (n) => (lastKnown.set(r.name, n), n),
        () => lastKnown.get(r.name) ?? null
      ),
    }))
  );

  // If any count is still unknown, a total would silently undercount — report null instead.
  const partial = withCommits.some((r) => r.commits == null);
  return {
    status: "success",
    totalCommits: partial ? null : withCommits.reduce((sum, r) => sum + r.commits, 0),
    partial,
    repos: withCommits,
    fetchedAt: new Date().toISOString(),
  };
};

/** Fetches the stats again and caches them; one refresh at a time, whoever asks. */
const refresh = () =>
  (inFlight ||= fetchStats()
    .then((fresh) => {
      // Prefer an older complete result over a newer partial one.
      if (!(fresh.partial && cachedData && !cachedData.partial)) cachedData = fresh;
      // Partial results are retried after a few minutes instead of being kept for an hour.
      lastFetchTime = fresh.partial ? Date.now() - CACHE_DURATION + PARTIAL_RETRY : Date.now();
      return cachedData;
    })
    .catch((error) => {
      failedAt = Date.now();
      throw error;
    })
    .finally(() => {
      inFlight = null;
    }));

const logError = (error) => console.error("GitHub API Error:", error.message);
const pausing = () => Date.now() - failedAt < FAILURE_PAUSE;
const unavailable = (res) => res.status(502).json({ status: "error", message: "Failed to fetch GitHub stats" });

exports.getGithubStats = async (req, res) => {
  // The cached answer at once (stale data rather than nothing if GitHub is down or rate-limited),
  // refreshed in the background when it's old
  if (cachedData) {
    if (Date.now() - lastFetchTime >= CACHE_DURATION && !pausing()) refresh().catch(logError);
    return res.json(cachedData);
  }
  if (pausing()) return unavailable(res);
  try {
    res.json(await refresh());
  } catch (error) {
    logError(error);
    unavailable(res);
  }
};

/** Resolves once a background refresh, if one is running, has finished (for the tests). */
exports.refreshed = () => (inFlight ?? Promise.resolve()).catch(() => {});
