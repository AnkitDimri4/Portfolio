// LeetCode stats proxy with a small in-memory cache.
const USERNAME = "user4612MW";
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const TIMEOUT_MS = 10_000;

let cachedData = null;
let lastFetchTime = 0;
let inFlight = null;

const QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      submitStats {
        acSubmissionNum { difficulty count submissions }
        totalSubmissionNum { difficulty count submissions }
      }
      profile { ranking }
    }
  }
`;

const fetchStats = async () => {
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
      "User-Agent": "ankit-dimri-portfolio",
    },
    body: JSON.stringify({ query: QUERY, variables: { username: USERNAME } }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`LeetCode: HTTP ${response.status}`);

  const user = (await response.json())?.data?.matchedUser;
  if (!user) throw new Error("LeetCode: user not found");

  const byDifficulty = (list, d) => list.find((item) => item.difficulty === d) || { count: 0, submissions: 0 };
  const accepted = byDifficulty(user.submitStats.acSubmissionNum, "All");
  const total = byDifficulty(user.submitStats.totalSubmissionNum, "All");

  return {
    status: "success",
    totalSolved: accepted.count,
    // LeetCode's acceptance rate: accepted submissions / all submissions
    // (problems-solved / problems-attempted would read ~99.9% and doesn't match the profile).
    acceptanceRate: total.submissions ? ((accepted.submissions / total.submissions) * 100).toFixed(2) : null,
    ranking: user.profile.ranking,
    solvedByDifficulty: {
      easy: byDifficulty(user.submitStats.acSubmissionNum, "Easy").count,
      medium: byDifficulty(user.submitStats.acSubmissionNum, "Medium").count,
      hard: byDifficulty(user.submitStats.acSubmissionNum, "Hard").count,
    },
    fetchedAt: new Date().toISOString(),
  };
};

exports.getLeetcodeStats = async (req, res) => {
  try {
    if (cachedData && Date.now() - lastFetchTime < CACHE_DURATION) return res.json(cachedData);
    inFlight = inFlight || fetchStats();
    cachedData = await inFlight;
    lastFetchTime = Date.now();
    res.json(cachedData);
  } catch (error) {
    console.error("LeetCode API Error:", error.message);
    // Serve stale data rather than nothing if LeetCode is slow or down.
    if (cachedData) return res.json(cachedData);
    res.status(502).json({ status: "error", message: "Failed to fetch LeetCode stats" });
  } finally {
    inFlight = null;
  }
};
