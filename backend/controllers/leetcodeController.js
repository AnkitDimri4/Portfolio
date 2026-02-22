// Simple in-memory cache
let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000;

exports.getLeetcodeStats = async (req, res) => {
  try {
    const now = Date.now();
    if (cachedData && now - lastFetchTime < CACHE_DURATION) {
      return res.json(cachedData);
    }

    const username = "user4612MW";

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                }
                totalSubmissionNum {
                  difficulty
                  count
                }
              }
              profile {
                ranking
              }
            }
          }
        `,
        variables: { username },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from LeetCode");
    }

    const data = await response.json();
    const matchedUser = data?.data?.matchedUser;

    if (!matchedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const acceptedAll =
      matchedUser.submitStats.acSubmissionNum.find(
        (item) => item.difficulty === "All"
      )?.count || 0;

    const totalAll =
      matchedUser.submitStats.totalSubmissionNum.find(
        (item) => item.difficulty === "All"
      )?.count || 1;

    const acceptanceRate = ((acceptedAll / totalAll) * 100).toFixed(2);
    const result = {
      status: "success",
      totalSolved: acceptedAll,
      acceptanceRate,
      ranking: matchedUser.profile.ranking,
    };
    cachedData = result;
    lastFetchTime = now;

    res.json(result);

  } catch (error) {
    console.error("LeetCode API Error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch LeetCode stats",
    });
  }
};