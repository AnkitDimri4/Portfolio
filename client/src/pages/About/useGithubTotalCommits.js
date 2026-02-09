import { useEffect, useState } from "react";

const USERNAME = "AnkitDimri4";

export const useGithubTotalCommits = () => {
  const [totalCommits, setTotalCommits] = useState(null);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        };

        // 1️ Fetch repos
        const reposRes = await fetch(
          `https://api.github.com/users/${USERNAME}/repos?per_page=100`,
          { headers }
        );
        const repos = await reposRes.json();

        let commitSum = 0;

        for (const repo of repos) {
          // Skip forks
          if (repo.fork) continue;

          let statsRes = await fetch(
            `https://api.github.com/repos/${USERNAME}/${repo.name}/stats/contributors`,
            { headers }
          );

          // 2️ If GitHub says "come back later"
          if (statsRes.status === 202) {
            await new Promise((r) => setTimeout(r, 1200));
            statsRes = await fetch(
              `https://api.github.com/repos/${USERNAME}/${repo.name}/stats/contributors`,
              { headers }
            );
          }

          const stats = await statsRes.json();

          if (!Array.isArray(stats)) continue;

          const you = stats.find(
            (c) => c.author?.login === USERNAME
          );

          if (you) commitSum += you.total;
        }

        setTotalCommits(commitSum);
      } catch (err) {
        console.error("GitHub commit fetch failed:", err);
        setTotalCommits(0);
      }
    };

    fetchCommits();
  }, []);

  return totalCommits;
};
