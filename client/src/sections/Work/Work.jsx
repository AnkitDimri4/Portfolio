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
const ProjectMedia = ({ project, player, shown = true }) => {
  const ref = useRef(null);
  const inView = useInView(ref) && shown;
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
const ProjectRow = ({ project, index, repo, flip = index % 2 === 1, shown = true }) => {
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
          <ProjectMedia project={project} player={player} shown={shown} />
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
// Every panel stays laid out in one place, the unpicked ones unseen, so the panel is as tall as the
// tallest project and nothing below moves when another is picked.
// Over a tab (or on it from the keyboard), a glass circle sits behind its words. Picked, one motion:
//   - the circle, tinted glass, grows from the tab over the tabs and the panel, the project going
//     frosting over and fading under it;
//   - the project's name lifts off the tab and flies to where its title goes, growing to its size;
//   - the new project rises in over the glass before the circle has finished, and the glass melts away.
// The flying name stays in its title's place until the end, then the title takes over in the same frame,
// so the title never blinks. Only transforms and opacity move, so the browser draws it smoothly. Asked
// for less motion, the panel simply changes.
const GROW_MS = 620; // the circle and the name
const DISSOLVE = { delay: 80, duration: 420 }; // the project going
const RISE_AT = 300; // the project coming starts to rise (ptabs-rise in Work.css)
const MELT = { delay: 560, duration: 440 }; // the glass melting away; the change ends with it
const GROW_EASE = "cubic-bezier(0.45, 0, 0.15, 1)";
const SOFT_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const ProjectTabs = ({ projects, offset, byName }) => {
  const [active, setActive] = useState(0);
  const [wipe, setWipe] = useState(null); // a change on its way, measured at the pick
  const tabs = useRef([]);
  const panels = useRef([]);
  const self = useRef(null);
  const glass = useRef(null);
  const flyer = useRef(null);
  const running = useRef([]);
  const near = useInView(self);

  // Each project's first still, fetched once the tabs come near, so a picked project's picture is
  // already there when it comes in (its video loads only once it's picked)
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
    const name = tabs.current[j]?.querySelector(".ptab-name");
    const title = panels.current[j]?.querySelector(".project-title");
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (still || !root || !list || !words || !name || !title || typeof root.animate !== "function") {
      setWipe(null);
      setActive(j);
      return;
    }
    // Everything is laid out already (the unpicked panels too), so every place is known now
    const box = root.getBoundingClientRect();
    const w = words.getBoundingClientRect();
    const top = list.offsetTop; // the glass covers from the tabs down
    const x = w.left + w.width / 2 - box.left;
    const y = w.top + w.height / 2 - box.top - top;
    const far = Math.hypot(Math.max(x, box.width - x), Math.max(y, box.height - top - y));
    const r = parseFloat(getComputedStyle(words, "::before").width) / 2 || 72; // the glass circle's own size
    // The flying words: the tab's name, drawn at the title's size and shrunk onto the tab, turning into
    // the title on the way
    const from = name.getBoundingClientRect();
    const to = title.getBoundingClientRect();
    const look = getComputedStyle(title);
    const nameLook = getComputedStyle(name);
    const size = parseFloat(look.fontSize);
    const k = parseFloat(nameLook.fontSize) / size || 0.5; // the name's size, as a share of the title's
    const line = parseFloat(look.lineHeight) || size * 1.2 || 0;
    const said = projects[j].short || projects[j].title;
    // Where the name's words sit in the title ("English Coach" in "AI English Coach"), so they turn into
    // themselves and only the rest fades in
    let shift = 0;
    const at = projects[j].title.indexOf(said);
    if (at > 0 && title.firstChild?.nodeType === Node.TEXT_NODE) {
      const before = document.createRange();
      before.setStart(title.firstChild, 0);
      before.setEnd(title.firstChild, at);
      shift = before.getBoundingClientRect?.().width || 0;
    }
    const fly = {
      name: said,
      text: projects[j].title,
      left: to.left - box.left,
      top: to.top - box.top,
      width: to.width,
      font: { fontSize: look.fontSize, lineHeight: look.lineHeight, letterSpacing: look.letterSpacing },
      nameFont: { left: shift, fontWeight: nameLook.fontWeight, letterSpacing: `${parseFloat(nameLook.letterSpacing) / k || 0}px` },
      // On the tab's name, letter for letter: the two lines' middles meet, whatever their line heights
      start: `translate(${from.left - to.left - k * shift}px, ${from.top - to.top + (from.height - k * line) / 2}px) scale(${k})`,
    };
    setWipe({ from: active, to: j, top, x, y, far, scale: r / (far || 1), fly });
    setActive(j);
  };

  useEffect(() => {
    if (!wipe) return;
    const circle = glass.current;
    const grow = { duration: GROW_MS, easing: GROW_EASE, fill: "both" };
    const melt = circle.animate({ opacity: [1, 0] }, { ...MELT, easing: SOFT_EASE, fill: "both" });
    const runs = [
      circle.animate({ transform: [`scale(${wipe.scale})`, "scale(1)"] }, grow),
      melt,
      // The project going frosts over (blurs) as it fades under the glass
      panels.current[wipe.from].animate(
        { opacity: [1, 0], filter: ["blur(0px)", "blur(12px)"], transform: ["none", "scale(0.985)"] },
        { ...DISSOLVE, easing: SOFT_EASE, fill: "both" }
      ),
      // The flying name starts on the tab's name, which fades under it as it lifts off, and comes back
      // as the glass goes
      tabs.current[wipe.to].querySelector(".ptab-name").animate(
        [{ opacity: 1 }, { opacity: 0, offset: 0.05 }, { opacity: 0, offset: 0.8 }, { opacity: 1 }],
        { duration: MELT.delay + MELT.duration }
      ),
      flyer.current.animate({ transform: [wipe.fly.start, "none"] }, grow),
    ];
    // Mid-flight, where it moves fastest, the name turns into the title: the title comes in before the
    // name goes, so the words never dim
    const [asName, asTitle] = flyer.current.children;
    const turn = { duration: GROW_MS, fill: "both" };
    runs.push(
      asName.animate([{ opacity: 1 }, { opacity: 1, offset: 0.32 }, { opacity: 0, offset: 0.52 }, { opacity: 0 }], turn),
      asTitle.animate([{ opacity: 0 }, { opacity: 0, offset: 0.22 }, { opacity: 1, offset: 0.4 }, { opacity: 1 }], turn)
    );
    running.current = runs;
    melt.onfinish = () => {
      if (running.current === runs) setWipe(null); // not if a later pick has taken over
    };
    // Once the change is over (or the next has begun), nothing it did stays held: the project that went
    // is whole again for when it's picked next
    return () => {
      for (const run of runs) run.cancel();
    };
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

  return (
    <div className={`ptabs${wipe ? " is-changing" : ""}`} ref={self} style={wipe ? { "--rise-at": `${RISE_AT}ms` } : undefined}>
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
        <div className="ptabs-glass" aria-hidden="true" style={{ top: wipe.top }}>
          <span
            ref={glass}
            className="ptabs-glass-circle"
            style={{ left: wipe.x - wipe.far, top: wipe.y - wipe.far, width: wipe.far * 2, height: wipe.far * 2, transform: `scale(${wipe.scale})` }}
          />
        </div>
      )}
      {wipe && (
        <p
          ref={flyer}
          className="ptabs-flyer"
          aria-hidden="true"
          style={{ left: wipe.fly.left, top: wipe.fly.top, width: wipe.fly.width, ...wipe.fly.font, transform: wipe.fly.start }}
        >
          <span className="ptabs-flyer-name" style={wipe.fly.nameFont}>
            {wipe.fly.name}
          </span>
          <span className="ptabs-flyer-title">{wipe.fly.text}</span>
        </p>
      )}
      {/* Every project stays in the page (for search engines) and laid out; only the picked one shows.
          During a change, the one going stays drawn under the glass, not read out, as it dissolves. */}
      <div className="ptabs-panels">
        {projects.map((p, j) => {
          const leaving = wipe?.from === j;
          const shown = active === j || leaving;
          return (
            <div
              key={p.repo}
              ref={(el) => {
                panels.current[j] = el;
              }}
              id={`ppanel-${p.repo}`}
              role="tabpanel"
              aria-labelledby={`ptab-${p.repo}`}
              aria-hidden={active !== j || undefined}
              className={`ptabs-panel${shown ? "" : " is-off"}${wipe?.to === j ? " is-arriving" : ""}`}
            >
              <ProjectRow project={p} index={offset + j} repo={byName[p.repo]} flip={false} shown={shown} />
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
