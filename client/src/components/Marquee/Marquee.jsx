import { useRef } from "react";
import {
  SiCplusplus, SiExpress, SiFastapi, SiMongodb, SiNextdotjs, SiNodedotjs, SiPostgresql, SiPython, SiReact,
  SiTensorflow, SiTypescript,
} from "../brandIcons";
import { useApi } from "../../lib/api";
import { PINNED_REPOS, PROFILE, PROJECTS } from "../../data/profile";
import useVelocityMarquee from "./useVelocityMarquee";
import "./Marquee.css";

// [name, icon, colour on dark badge, colour on light badge]
const TECH = [
  ["React", SiReact, "#61DAFB", "#149ECA"],
  ["Node.js", SiNodedotjs, "#6CC24A", "#3C873A"],
  ["Next.js", SiNextdotjs, "#FFFFFF", "#000000"],
  ["MongoDB", SiMongodb, "#4DB33D", "#00684A"],
  ["PostgreSQL", SiPostgresql, "#7DA7F0", "#336791"],
  ["React Native", SiReact, "#61DAFB", "#149ECA"],
  ["TypeScript", SiTypescript, "#4A9AE8", "#3178C6"],
  ["Python", SiPython, "#FFD43B", "#3776AB"],
  ["TensorFlow", SiTensorflow, "#FF8F00", "#E55B00"],
  ["FastAPI", SiFastapi, "#05B3A4", "#009688"],
  ["Express", SiExpress, "#FFFFFF", "#000000"],
  ["C++", SiCplusplus, "#6FA8DC", "#00599C"],
];

// GitHub linguist colours for the repo feed
const LANG = { JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", "Jupyter Notebook": "#DA5B0B", Java: "#b07219", "C++": "#f34b7d", HTML: "#e34c26", CSS: "#563d7c" };
const FALLBACK = ["full-stack web", "react native apps", "ml-powered products", "rest apis", "databases", "clean architecture", "mentoring 5,000+ devs"];

const monthYear = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });

const Lane = ({ className, speed, direction, children }) => {
  const track = useRef(null);
  useVelocityMarquee(track, { speed, direction });
  return (
    <div className={`lane ${className}`}>
      <div className="lane-track" ref={track}>
        {[0, 1, 2].map((copy) => (
          <div className="lane-group" key={copy}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Two scroll-reactive lanes: the tech I use (brand-coloured badges) and a
 * terminal-style feed of real repositories from the GitHub API.
 * Decorative — the Stack and Work sections carry the same content accessibly.
 */
const Marquee = () => {
  const { data } = useApi("/api/v1/portfolio/github");
  const wanted = [...PROJECTS.map((p) => p.repo), ...PINNED_REPOS];
  const repos = (data?.repos || []).filter((r) => wanted.includes(r.name));

  return (
    <div className="ribbons" aria-hidden="true">
      <Lane className="lane--log" speed={42} direction={1}>
        <span className="log-item log-prompt">
          ~/github/{PROFILE.socials[0].handle.slice(1)} <b>❯</b> git log --stat
        </span>
        {repos.length
          ? repos.map((r) => (
              <span className="log-item" key={r.name}>
                <span className="log-dot" style={{ "--lang": LANG[r.language] || "var(--accent-2)" }} />
                <span className="log-name">{r.name}</span>
                {r.commits != null && <span>{r.commits} commits</span>}
                {r.language && <span className="log-sep">{r.language}</span>}
                <span className="log-sep">{monthYear(r.pushedAt)}</span>
              </span>
            ))
          : FALLBACK.map((w) => (
              <span className="log-item" key={w}>
                <span className="log-dot" />
                <span className="log-name">{w}</span>
              </span>
            ))}
      </Lane>

      <Lane className="lane--tech" speed={64} direction={-1}>
        {TECH.map(([name, Icon, dark, light]) => (
          <span className="tech-item" key={name} style={{ "--brand": dark, "--brand-l": light }}>
            <span className="tech-badge">
              <Icon />
            </span>
            {name}
            <span className="tech-sep">✦</span>
          </span>
        ))}
      </Lane>
    </div>
  );
};

export default Marquee;
