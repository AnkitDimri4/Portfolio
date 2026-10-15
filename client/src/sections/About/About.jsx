import { FiArrowUpRight, FiCode, FiGitCommit, FiTarget, FiTrendingUp, FiUsers } from "react-icons/fi";
import { SiLeetcode } from "../../components/brandIcons";
import SectionHead from "../../components/SectionHead";
import CountUp from "../../components/CountUp";
import LiveSignal, { timeAgo } from "../../components/LiveSignal";
import { Reveal } from "../../lib/reveal";
import { useApi } from "../../lib/api";
import { EXPERIENCE_YEARS, PROFILE, WORK_CONTRIBUTIONS, allContributions } from "../../data/profile";
import portrait from "../../assets/img/portrait.webp";
import "./About.css";

const Stat = ({ value, loading, label, icon: Icon, children, ...fmt }) => (
  <div className="stat">
    <p className="stat-num">
      {loading ? <span className="skeleton">0000</span> : value == null ? "—" : <CountUp value={value} {...fmt} />}
    </p>
    <p className="stat-label">
      <Icon className="stat-icon" aria-hidden="true" />
      {label}
    </p>
    {children}
  </div>
);

const LEVELS = ["easy", "medium", "hard"];
const num = (n) => n.toLocaleString("en-US");

/** A proportional bar plus a legend: what a stat is made of (each part's colour comes from its class). */
const Split = ({ label, parts }) => (
  <div className="split">
    <span className="split-bar" aria-hidden="true">
      {parts.map((p) => (
        <i key={p.key} className={p.className} style={{ flexGrow: p.value }} />
      ))}
    </span>
    <p className="split-legend label">
      <span className="sr-only">{label}: </span>
      {parts.map((p) => (
        <span key={p.key}>
          <i className={`split-dot ${p.className}`} aria-hidden="true" />
          {p.text}
        </span>
      ))}
    </p>
  </div>
);

// The statement lights up word by word as it scrolls through the viewport (see unfold.css).
const STATEMENT = [
  ["I build products end-to-end — from "],
  ["interfaces people enjoy", "hl"],
  [" to the APIs, databases and "],
  ["machine-learning", "serif"],
  [" services behind them."],
];

const Words = ({ segments }) => {
  let i = 0;
  return segments.map(([text, cls], s) => {
    const parts = text.split(/(\s+)/).map((part, k) =>
      /^\s+$/.test(part) || !part ? (
        part
      ) : (
        <span className="w" style={{ "--i": i++ }} key={k}>
          {part}
        </span>
      )
    );
    return cls ? (
      <span className={cls} key={s}>
        {parts}
      </span>
    ) : (
      parts
    );
  });
};

const About = () => {
  const gh = useApi("/api/v1/portfolio/github");
  const lc = useApi("/api/v1/portfolio/leetcode");
  const ghLoading = !gh.data && !gh.error;
  const lcLoading = !lc.data && !lc.error;
  const lcData = lc.data?.status === "success" ? lc.data : null;
  const publicCommits = gh.data?.totalCommits;

  return (
    <section className="section about" id="about" aria-labelledby="about-title">
      <div className="wrap">
        <SectionHead
          index={1}
          label="About"
          id="about-title"
          title={
            <>
              Engineer, builder <span className="serif">&amp; mentor.</span>
            </>
          }
        />

        <div className="grid-12 about-grid">
          <Reveal className="about-portrait">
            <figure>
              <img src={portrait} alt="Portrait of Ankit Dimri" width="760" height="950" loading="lazy" decoding="async" />
              <figcaption className="label">
                <span>Ankit Dimri</span>
                <span>{PROFILE.location}</span>
              </figcaption>
            </figure>
          </Reveal>

          <div className="about-body">
            <p className="about-statement">
              <Words segments={STATEMENT} />
            </p>

            <div className="about-copy">
              <Reveal as="p" delay={1}>
                I'm a self-taught software engineer. At <strong>FileSure</strong> I went from intern to{" "}
                <strong>Software Engineer in three months</strong>: I built the company's <strong>iOS and Android apps</strong>{" "}
                from scratch, rebuilt its company search and screening for <strong>3.8M companies</strong> on ClickHouse, and
                moved the backend from <strong>AWS to GCP</strong> behind gated Jenkins CI/CD.
              </Reveal>
              <Reveal as="p" delay={2}>
                Running production with the founder taught me the rest: releases and rollbacks, incident response,
                monitoring with Sentry and Mixpanel, and runbooks that make the next fix faster. Before that I mentored{" "}
                <strong>25,000+ students</strong> at Tutedude, which still keeps my fundamentals sharp.
              </Reveal>
            </div>

            <Reveal className="stats-wrap" delay={1}>
              <div className="stats-head">
                <LiveSignal label="Live stats" />
                <span className="label">
                  GitHub &amp; LeetCode APIs
                  {gh.data?.fetchedAt
                    ? ` · synced ${timeAgo(gh.data.fetchedAt)}`
                    : gh.slow || lc.slow
                      ? " · waking up the server…"
                      : ""}
                </span>
              </div>
              <div className="stats">
              <Stat icon={FiGitCommit} label="GitHub contributions" loading={ghLoading} value={allContributions(publicCommits)}>
                {publicCommits != null && (
                  <Split
                    label="Made up of"
                    parts={[
                      { key: "own", value: publicCommits, text: `${num(publicCommits)} personal`, className: "split-older" },
                      ...WORK_CONTRIBUTIONS.map((w) => ({ key: w.org, value: w.count, text: `${num(w.count)} ${w.org}`, className: "split-newer" })),
                    ]}
                  />
                )}
              </Stat>
              <Stat icon={SiLeetcode} label="LeetCode solved" loading={lcLoading} value={lcData?.totalSolved}>
                {lcData?.solvedByDifficulty && (
                  <Split
                    label="By difficulty"
                    parts={LEVELS.map((level) => {
                      const n = lcData.solvedByDifficulty[level];
                      return { key: level, value: n, text: `${n} ${level}`, className: `lc-${level}` };
                    })}
                  />
                )}
              </Stat>
              <Stat icon={FiTarget} label="Acceptance rate" loading={lcLoading} value={lcData ? Number(lcData.acceptanceRate) : null} decimals={1} suffix="%" />
              <Stat icon={FiTrendingUp} label="LeetCode global rank" loading={lcLoading} value={lcData?.ranking} prefix="#" />
              <Stat icon={FiCode} label="Years of experience" value={EXPERIENCE_YEARS.years} decimals={EXPERIENCE_YEARS.years % 1 ? 1 : 0} suffix="+">
                <Split
                  label="By employer"
                  parts={EXPERIENCE_YEARS.employers.map((e, i, all) => ({
                    key: e.org,
                    value: e.months,
                    text: `${e.text} ${e.org}`,
                    className: i === all.length - 1 ? "split-newer" : "split-older",
                  }))}
                />
              </Stat>
              <Stat icon={FiUsers} label="Students mentored" value={25} suffix="K+" />
              </div>
            </Reveal>

            <Reveal className="about-links" delay={2}>
              {PROFILE.socials.map(({ label, href, handle, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="about-link">
                  <Icon className="about-link-icon" aria-hidden="true" />
                  <span className="label">{label}</span>
                  <span className="about-link-handle">{handle}</span>
                  <FiArrowUpRight aria-hidden="true" />
                </a>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
