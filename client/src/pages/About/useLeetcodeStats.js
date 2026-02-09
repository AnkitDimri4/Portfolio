import { useEffect, useState } from "react";
const USERNAME = "user4612MW";
export const useLeetcodeStats = () => {
  const [stats, setStats] = useState({
    totalSolved: null,
    acceptanceRate: null,
    ranking: null,
  });
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `https://leetcode-stats-api.herokuapp.com/${USERNAME}`
        );
        const data = await res.json();
        if (data.status !== "success") return;
        setStats({
          totalSolved: data.totalSolved,
          acceptanceRate: data.acceptanceRate,
          ranking: data.ranking,
        });
      } catch (err) {
        console.error("LeetCode fetch failed:", err);
      }
    };

    fetchStats();
  }, []);

  return stats;
};
