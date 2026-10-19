import { useRef, useState } from "react";
import { FiArrowUpRight, FiGitCommit, FiGithub, FiStar } from "react-icons/fi";
import SectionHead from "../../components/SectionHead";
import LiveSignal from "../../components/LiveSignal";
import ContributionGraph from "../../components/ContributionGraph/ContributionGraph";
import SiteActivity from "../../components/SiteActivity/SiteActivity";
import { Reveal, useInView } from "../../lib/reveal";
import { useApi } from "../../lib/api";
import { PINNED_REPOS, PROFILE, PROJECTS } from "../../data/profile";
import "./Work.css";

const monthYear = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
const prettyRepo = (name) => name.replace(/[-_]+/g, " ");

/** Video is only mounted once the card nears the viewport, so demos cost nothing on first load. */
const ProjectMedia = ({ project }) => {
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
          <video key={videos[active].src} src={videos[active].src} controls playsInline preload="metadata" aria-label={`${project.title} demo: ${videos[active].label}`} />
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
              <SiteActivity title="GitHub activity on this site" lighthouse={project.lighthouse} />
            </div>
          </div>
        ) : (
          <ProjectMedia project={project} />
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
          {project.links?.map((l) => (
            <a key={l.href} className="btn btn-sm" href={l.href} target="_blank" rel="noreferrer">
              {l.label} <FiArrowUpRight size={15} />
            </a>
          ))}
          {project.github && (
            <a className="btn btn-sm" href={project.github} target="_blank" rel="noreferrer">
              <FiGithub size={15} /> Source <FiArrowUpRight size={15} />
            </a>
          )}
          {repo?.homepage && (
            <a className="btn btn-sm btn-primary" href={repo.homepage} target="_blank" rel="noreferrer">
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
        </div>
      </Reveal>
    </article>
  );
};

// Laptops and up: my own projects in one place. A row of tabs, one per project, and the picked
// project below in the same row style as the work above. Phones and tablets keep the plain list.
const ProjectTabs = ({ projects, offset, byName }) => {
  const [active, setActive] = useState(0);
  const tabs = useRef([]);

  // Arrow keys, Home and End move between the tabs (and focus the one they land on).
  const onKeyDown = (e) => {
    const last = projects.length - 1;
    const next = { ArrowRight: active === last ? 0 : active + 1, ArrowLeft: active === 0 ? last : active - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="ptabs">
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
            onClick={() => setActive(j)}
          >
            <span className="ptab-num label">{String(offset + j + 1).padStart(2, "0")}</span>
            <span className="ptab-name">{p.short}</span>
            <span className="ptab-kind label">{p.kind}</span>
          </button>
        ))}
      </div>
      {/* Every project stays in the page (for search engines); only the picked one shows. */}
      {projects.map((p, j) => (
        <div
          key={p.repo}
          id={`ppanel-${p.repo}`}
          role="tabpanel"
          aria-labelledby={`ptab-${p.repo}`}
          className="ptabs-panel"
          hidden={active !== j}
        >
          <ProjectRow project={p} index={offset + j} repo={byName[p.repo]} flip={false} />
        </div>
      ))}
    </div>
  );
};

const RepoCard = ({ repo, i }) => (
  <Reveal delay={i % 3}>
    <a className="repo" href={repo.url} target="_blank" rel="noreferrer">
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
