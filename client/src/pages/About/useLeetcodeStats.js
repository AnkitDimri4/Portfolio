import { useEffect, useState } from "react";

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
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/portfolio/leetcode`
        );

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();

        if (data.status !== "success") return;

        setStats({
          totalSolved: data.totalSolved ?? 0,
          acceptanceRate: data.acceptanceRate ?? 0,
          ranking: data.ranking ?? 0,
        });

      } catch (err) {
        console.error("LeetCode fetch failed:", err);
      }
    };

    fetchStats();
  }, []);

  return stats;
};
