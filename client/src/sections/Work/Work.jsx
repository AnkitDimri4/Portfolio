import { useRef, useState } from "react";
import { FiArrowUpRight, FiGitCommit, FiGithub, FiStar } from "react-icons/fi";
import SectionHead from "../../components/SectionHead";
import LiveSignal from "../../components/LiveSignal";
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

const ProjectRow = ({ project, index, repo }) => {
  const extra = project.tech.length - 7;
  return (
    <article className={`project${index % 2 ? " is-flipped" : ""}`}>
      <Reveal className="project-media-wrap">
        <ProjectMedia project={project} />
      </Reveal>
      <Reveal className="project-info" delay={1}>
        <p className="project-meta label">
          <span className="project-num">{String(index + 1).padStart(2, "0")}</span>
          <span>{project.kind}</span>
        </p>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-summary">{project.summary}</p>
        <ul className="chips" aria-label="Tech used">
          {project.tech.slice(0, 7).map((t) => (
            <li className="chip" key={t}>
              {t}
            </li>
          ))}
          {extra > 0 && <li className="chip chip-more">+{extra}</li>}
        </ul>
        <div className="project-foot">
          <a className="btn btn-sm" href={project.github} target="_blank" rel="noreferrer">
            <FiGithub size={15} /> Source <FiArrowUpRight size={15} />
          </a>
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
          Production apps across web, mobile and machine learning — each one taken from idea to deployment.
        </SectionHead>

        <div className="projects">
          {PROJECTS.map((p, i) => (
            <ProjectRow key={p.repo} project={p} index={i} repo={byName[p.repo]} />
          ))}
        </div>

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
