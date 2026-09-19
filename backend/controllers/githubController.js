// GitHub stats proxy. Keeps the GitHub token on the server (never in the
// browser bundle) and caches results so visitors don't burn the rate limit.
const USERNAME = "AnkitDimri4";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

let cachedData = null;
let lastFetchTime = 0;
let inFlight = null;

const gh = (path) =>
  fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "ankit-dimri-portfolio",
      ...(process.env.GITHUB_TOKEN && {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      }),
    },
  });

// Number of commits authored by USERNAME on the repo's default branch,
// read from the pagination "last" link so it costs a single request.
const countCommits = async (repo) => {
  const res = await gh(
    `/repos/${USERNAME}/${repo}/commits?author=${USERNAME}&per_page=1`
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
      commits: await countCommits(r.name).catch(() => null),
    }))
  );

  return {
    status: "success",
    totalCommits: withCommits.reduce((sum, r) => sum + (r.commits || 0), 0),
    repos: withCommits,
    fetchedAt: new Date().toISOString(),
  };
};

exports.getGithubStats = async (req, res) => {
  try {
    if (cachedData && Date.now() - lastFetchTime < CACHE_DURATION) {
      return res.json(cachedData);
    }
    inFlight = inFlight || fetchStats();
    cachedData = await inFlight;
    lastFetchTime = Date.now();
    res.json(cachedData);
  } catch (error) {
    console.error("GitHub API Error:", error.message);
    // Serve stale data rather than nothing if GitHub is down / rate-limited.
    if (cachedData) return res.json(cachedData);
    res.status(502).json({ status: "error", message: "Failed to fetch GitHub stats" });
  } finally {
    inFlight = null;
  }
};
