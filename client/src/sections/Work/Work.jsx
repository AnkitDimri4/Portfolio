import { useEffect, useRef, useState } from "react";
import { FiArrowUpRight, FiGitCommit, FiGitPullRequest, FiGithub, FiPlay, FiStar } from "react-icons/fi";
import SectionHead from "../../components/SectionHead";
import LiveSignal from "../../components/LiveSignal";
import ContributionGraph from "../../components/ContributionGraph/ContributionGraph";
import SiteActivity from "../../components/SiteActivity/SiteActivity";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import { Reveal, useInView } from "../../lib/reveal";
import { useApi } from "../../lib/api";
import { webUrl } from "../../lib/webUrl";
import { PINNED_REPOS, PROFILE, PROJECTS } from "../../data/profile";
import "./Work.css";

// In India's time wherever it runs, so the pre-rendered page and the browser show the same month
const monthYear = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const prettyRepo = (name) => name.replace(/[-_]+/g, " ");

/** Video is only mounted once the card nears the viewport, so demos cost nothing on first load. It plays
 * in the site's own player (components/VideoPlayer): its still and length first, then its controls.
 * `player` is the row's handle on it, for its "Demo video" button. */
const ProjectMedia = ({ project, player }) => {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [active, setActive] = useState(0);
  const videos = project.videos || [];

  return (
    <div className="project-media" ref={ref}>
      <div className="project-screen">
        {project.image ? (
          <img src={project.image} alt={`${project.title} screenshot`} loading="lazy" decoding="async" />
        ) : inView ? (
          <VideoPlayer
            ref={player}
            key={videos[active].src}
            src={videos[active].src}
            poster={videos[active].poster}
            label={`${project.title} demo: ${videos[active].label}`}
            title={videos.length > 1 ? `Watch: ${videos[active].label}` : "Watch the demo"}
          />
        ) : null}
      </div>
      {videos.length > 1 && (
        <div className="media-tabs" role="tablist" aria-label={`${project.title} demos`}>
          {videos.map((v, i) => (
            <button key={v.src} role="tab" aria-selected={i === active} className={i === active ? "is-active" : ""} onClick={() => setActive(i)}>
              <span className="label">0{i + 1}</span> {v.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Rows alternate their media left and right, unless told not to (`flip`).
const ProjectRow = ({ project, index, repo, flip = index % 2 === 1 }) => {
  const player = useRef(null);
  // A link marked `play` ("Demo video") plays the video in this card, brought into view first: on a phone
  // it's above the words. Not loaded yet (the card hasn't neared the window): brought into view, to press.
  const playDemo = (e) => {
    if (player.current) player.current.start();
    else e.currentTarget.closest("article")?.querySelector(".project-media")?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  };
  // The first seven chips show; "+N" opens the rest, and "Show less" folds them back.
  const [allTech, setAllTech] = useState(false);
  const extra = project.tech.length - 7;
  const tech = allTech ? project.tech : project.tech.slice(0, 7);
  return (
    <article className={`project${flip ? " is-flipped" : ""}`}>
      <Reveal className="project-media-wrap">
        {project.work ? (
          <div className="project-media">
            <div className="project-screen project-screen--graph">
              <ContributionGraph title={`GitHub activity at ${project.work}`} />
            </div>
          </div>
        ) : project.activity ? (
          <div className="project-media">
            <div className="project-screen project-screen--graph project-screen--activity">
              <SiteActivity title="GitHub activity on this site" />
            </div>
          </div>
        ) : (
          <ProjectMedia project={project} player={player} />
        )}
      </Reveal>
      <Reveal className="project-info" delay={1}>
        <p className="project-meta label">
          <span className="project-num">{String(index + 1).padStart(2, "0")}</span>
          <span>{project.kind}</span>
        </p>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-summary">{project.summary}</p>
        <ul className="chips" aria-label="Tech used">
          {tech.map((t) => (
            <li className="chip" key={t}>
              {t}
            </li>
          ))}
          {extra > 0 && (
            <li>
              <button
                type="button"
                className="chip chip-more"
                aria-expanded={allTech}
                aria-label={allTech ? "Show fewer technologies" : `Show ${extra} more technologies`}
                onClick={() => setAllTech((open) => !open)}
              >
                {allTech ? "Show less" : `+${extra}`}
              </button>
            </li>
          )}
        </ul>
        <div className="project-foot">
          {project.links?.map((l) =>
            l.play ? (
              <button key={l.label} type="button" className="btn btn-sm" onClick={playDemo}>
                <FiPlay size={15} aria-hidden="true" /> {l.label}
              </button>
            ) : (
              <a key={l.href} className="btn btn-sm" href={l.href} target="_blank" rel="noreferrer">
                {l.label} <FiArrowUpRight size={15} />
              </a>
            )
          )}
          {project.github && (
            <a className="btn btn-sm" href={project.github} target="_blank" rel="noreferrer">
              <FiGithub size={15} /> Source <FiArrowUpRight size={15} />
            </a>
          )}
          {webUrl(repo?.homepage) && (
            <a className="btn btn-sm btn-primary" href={webUrl(repo.homepage)} target="_blank" rel="noreferrer">
              Live <FiArrowUpRight size={15} />
            </a>
          )}
          {repo && (
            <p className="project-stats label">
              {repo.commits != null && (
                <span>
                  <FiGitCommit aria-hidden="true" /> {repo.commits} commits
                </span>
              )}
              <span>
                <FiStar aria-hidden="true" /> {repo.stars}
              </span>
              <span>Updated {monthYear(repo.pushedAt)}</span>
            </p>
          )}
          {/* A project with no repository of its own (the English coach): its counts, from git */}
          {!repo && project.counts && (
            <p className="project-stats label">
              <span>
                <FiGitCommit aria-hidden="true" /> {project.counts.commits} commits
              </span>
              <span>
                <FiGitPullRequest aria-hidden="true" /> {project.counts.pullRequests} pull requests
              </span>
              <span>Updated {monthYear(project.counts.updated)}</span>
            </p>
          )}
        </div>
      </Reveal>
    </article>
  );
};

// Laptops and up: my own projects in one place. A row of tabs, one per project, and the picked
// project below in the same row style as the work above. Phones and tablets keep the plain list.
// Picking one plays out in two steps:
//   - grow: over a tab, a glass circle sits behind its words; picked, it turns solid and grows from the
//     tab across the tabs and the panel, behind the tabs' words, while the project's name flies from
//     the tab to where its title goes, growing to its size, and the panel's height eases to the new one;
//   - arrive: the circle covers it all; the new project comes in over it, its title where the name
//     landed and the rest rising after, and the circle fades away.
// Asked for less motion, the panel simply changes.
const GROW_MS = 650;
const ARRIVE_MS = 650;
const GROW_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const ARRIVE_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const ProjectTabs = ({ projects, offset, byName }) => {
  const [active, setActive] = useState(0);
  const [wipe, setWipe] = useState(null); // a change on its way: { from, to, phase, top, x, y, r, height }
  const tabs = useRef([]);
  const panels = useRef([]);
  const self = useRef(null);
  const area = useRef(null);
  const disc = useRef(null);
  const flyer = useRef(null);
  const running = useRef([]);
  const near = useInView(self);

  // Each project's first still, fetched once the tabs come near, so a picked project's picture is
  // already there when it comes in, not a moment after (its video loads only when it shows)
  const stills = projects.map((p) => p.videos?.[0]?.poster).filter(Boolean).join(" ");
  useEffect(() => {
    if (!near) return;
    for (const src of stills.split(" ")) if (src) new Image().src = src;
  }, [near, stills]);

  const pick = (j) => {
    if (j === active) return;
    const last = running.current;
    running.current = [];
    for (const run of last) run.cancel(); // a pick during a change starts the next from where things are
    const root = self.current;
    const list = root?.querySelector(".ptabs-list");
    const words = tabs.current[j]?.querySelector(".ptab-text");
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (still || !root || !list || !words || typeof root.animate !== "function") {
      setWipe(null);
      setActive(j);
      return;
    }
    const box = root.getBoundingClientRect();
    const t = words.getBoundingClientRect();
    setWipe({
      from: active,
      to: j,
      phase: "grow",
      top: list.offsetTop, // the circle covers from the tabs down
      x: t.left + t.width / 2 - box.left,
      y: t.top + t.height / 2 - box.top - list.offsetTop,
      r: parseFloat(getComputedStyle(words, "::before").width) / 2 || 72, // the glass circle's own size
      height: area.current.offsetHeight,
    });
    setActive(j);
  };

  useEffect(() => {
    if (!wipe) return;
    const done = (run, next) => {
      run.onfinish = () => {
        if (!running.current.includes(run)) return; // a later pick has taken over
        running.current = [];
        setWipe(next);
      };
    };
    const cover = disc.current;
    if (wipe.phase === "arrive") {
      const fade = cover.animate({ opacity: [1, 0] }, { duration: ARRIVE_MS, easing: ARRIVE_EASE, fill: "forwards" });
      running.current = [fade];
      done(fade, null);
      return;
    }
    const root = self.current;
    const panel = panels.current[wipe.to];
    const title = panel.querySelector(".project-title");
    const name = tabs.current[wipe.to].querySelector(".ptab-name");
    const timing = { duration: GROW_MS, easing: GROW_EASE };

    // The circle: from the glass circle's size to the far corner of all it covers
    const height = panel.offsetHeight;
    const reach = area.current.offsetTop - wipe.top + Math.max(wipe.height, height);
    const far = Math.hypot(Math.max(wipe.x, cover.offsetWidth - wipe.x), Math.max(wipe.y, reach - wipe.y));
    const grow = cover.animate({ clipPath: [`circle(${wipe.r}px at ${wipe.x}px ${wipe.y}px)`, `circle(${far}px at ${wipe.x}px ${wipe.y}px)`] }, timing);
    const ease = area.current.animate({ height: [`${wipe.height}px`, `${height}px`] }, timing);
    running.current = [grow, ease];

    // The name: set as the title, where the title is, then flown there from the tab (FLIP)
    const fly = flyer.current;
    if (title && name && fly) {
      const r = root.getBoundingClientRect();
      const to = title.getBoundingClientRect();
      const from = name.getBoundingClientRect();
      const look = getComputedStyle(title);
      Object.assign(fly.style, {
        left: `${to.left - r.left}px`,
        top: `${to.top - r.top}px`,
        width: `${to.width}px`,
        fontSize: look.fontSize,
        lineHeight: look.lineHeight,
        letterSpacing: look.letterSpacing,
      });
      const scale = parseFloat(getComputedStyle(name).fontSize) / parseFloat(look.fontSize) || 0.5;
      running.current.push(
        fly.animate(
          [
            { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${scale})`, opacity: 0 },
            { opacity: 1, offset: 0.2 },
            { transform: "none", opacity: 1 },
          ],
          { ...timing, fill: "both" }
        )
      );
    }
    done(grow, { ...wipe, phase: "arrive" });
  }, [wipe]);

  // Arrow keys, Home and End move between the tabs (and focus the one they land on).
  const onKeyDown = (e) => {
    const last = projects.length - 1;
    const next = { ArrowRight: active === last ? 0 : active + 1, ArrowLeft: active === 0 ? last : active - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    pick(next);
    tabs.current[next]?.focus();
  };

  const growing = wipe?.phase === "grow";
  return (
    <div className={`ptabs${wipe ? " is-changing" : ""}${growing ? " is-growing" : ""}`} ref={self}>
      <div className="ptabs-head">
        <h3 className="ptabs-title">My own projects</h3>
        <p className="ptabs-hint label">{projects.length} projects · pick one</p>
      </div>
      <div className="ptabs-list" role="tablist" aria-label="My own projects" onKeyDown={onKeyDown}>
        {projects.map((p, j) => (
          <button
            key={p.repo}
            ref={(el) => {
              tabs.current[j] = el;
            }}
            type="button"
            role="tab"
            id={`ptab-${p.repo}`}
            className="ptab"
            aria-selected={active === j}
            aria-controls={`ppanel-${p.repo}`}
            tabIndex={active === j ? 0 : -1}
            onClick={() => pick(j)}
          >
            <span className="ptab-text">
              <span className="ptab-num label">{String(offset + j + 1).padStart(2, "0")}</span>
              <span className="ptab-name">{p.short}</span>
              <span className="ptab-kind label">{p.kind}</span>
            </span>
          </button>
        ))}
      </div>
      {wipe && (
        <div
          ref={disc}
          className="ptabs-disc"
          aria-hidden="true"
          style={{ top: wipe.top, clipPath: growing ? `circle(${wipe.r}px at ${wipe.x}px ${wipe.y}px)` : undefined }}
        />
      )}
      {growing && (
        <p ref={flyer} className="ptabs-flyer" aria-hidden="true">
          {projects[wipe.to].title}
        </p>
      )}
      {/* Every project stays in the page (for search engines); only the picked one shows. While the circle
          grows, the one going stays drawn under it (hidden from screen readers) and the one coming is
          laid out unseen, so its title's place and its height are known. */}
      <div ref={area} className={`ptabs-panels${wipe ? " is-wiping" : ""}`}>
        {projects.map((p, j) => {
          const leaving = growing && wipe.from === j;
          const coming = wipe?.to === j;
          return (
            <div
              key={p.repo}
              ref={(el) => {
                panels.current[j] = el;
              }}
              id={`ppanel-${p.repo}`}
              role="tabpanel"
              aria-labelledby={`ptab-${p.repo}`}
              aria-hidden={leaving || undefined}
              className={`ptabs-panel${coming ? (growing ? " is-waiting" : " is-arriving") : ""}`}
              hidden={active !== j && !leaving}
            >
              <ProjectRow project={p} index={offset + j} repo={byName[p.repo]} flip={false} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RepoCard = ({ repo, i }) => (
  <Reveal delay={i % 3}>
    <a className="repo" href={webUrl(repo.url)} target="_blank" rel="noreferrer">
    <div className="repo-top label">
      <span>{repo.language || "Repository"}</span>
      <FiArrowUpRight aria-hidden="true" />
    </div>
    <h4 className="repo-name">{prettyRepo(repo.name)}</h4>
    <p className="repo-desc">{repo.description || "No description yet."}</p>
    <p className="repo-foot label">
      <span>
        <FiStar aria-hidden="true" /> {repo.stars}
      </span>
      {repo.commits != null && (
        <span>
          <FiGitCommit aria-hidden="true" /> {repo.commits}
        </span>
      )}
      <span>{monthYear(repo.pushedAt)}</span>
    </p>
    </a>
  </Reveal>
);

const Work = () => {
  const { data, error } = useApi("/api/v1/portfolio/github");
  const repos = data?.repos || [];
  const byName = Object.fromEntries(repos.map((r) => [r.name, r]));
  const featured = new Set(PROJECTS.map((p) => p.repo));
  // First, full rows: my work (FileSure), then this site with its activity. The rest are "My own projects".
  const top = PROJECTS.filter((p) => p.work || p.activity);
  const own = PROJECTS.filter((p) => !p.work && !p.activity);
  const offset = top.length;
  const more = [
    ...PINNED_REPOS.map((n) => byName[n]).filter(Boolean),
    ...repos.filter((r) => !featured.has(r.name) && !PINNED_REPOS.includes(r.name)),
  ].slice(0, 6);

  return (
    <section className="section work" id="work" aria-labelledby="work-title">
      <div className="wrap">
        <SectionHead
          index={2}
          label="Selected work"
          id="work-title"
          title={
            <>
              Things I've <span className="serif">built</span> &amp; shipped.
            </>
          }
        >
          My work at FileSure, then production apps across web, mobile and machine learning — each one taken from idea to deployment.
        </SectionHead>

        <div className="projects">
          {top.map((p, i) => (
            <ProjectRow key={p.title} project={p} index={i} repo={p.repo && byName[p.repo]} />
          ))}
        </div>

        {/* Phones and tablets: my own projects as rows, as before. Laptops and up: tabs, in one place. */}
        <div className="projects projects--list">
          {own.map((p, j) => (
            <ProjectRow key={p.repo} project={p} index={offset + j} repo={byName[p.repo]} />
          ))}
        </div>
        <ProjectTabs projects={own} offset={offset} byName={byName} />

        <div className="more">
          <div className="more-head">
            <h3 className="more-title">
              More on GitHub {data && <LiveSignal label="Live" />}
            </h3>
            <a className="btn btn-sm" href={PROFILE.socials[0].href} target="_blank" rel="noreferrer">
              All repositories <FiArrowUpRight size={15} />
            </a>
          </div>

          {error ? (
            <p className="more-error">
              Live repository data is unavailable right now —{" "}
              <a href={PROFILE.socials[0].href} target="_blank" rel="noreferrer">
                browse them on GitHub
              </a>
              .
            </p>
          ) : (
            <div className="repos">
              {data
                ? more.map((r, i) => <RepoCard key={r.name} repo={r} i={i} />)
                : Array.from({ length: 6 }, (_, i) => <div className="repo repo-skeleton skeleton" key={i} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Work;
