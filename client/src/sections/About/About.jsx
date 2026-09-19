import { FiArrowUpRight, FiCode, FiGitCommit, FiTarget, FiTrendingUp, FiUsers } from "react-icons/fi";
import { SiLeetcode } from "../../components/brandIcons";
import SectionHead from "../../components/SectionHead";
import CountUp from "../../components/CountUp";
import LiveSignal, { timeAgo } from "../../components/LiveSignal";
import { Reveal } from "../../lib/reveal";
import { useApi } from "../../lib/api";
import { PROFILE } from "../../data/profile";
import portrait from "../../assets/img/portrait.webp";
import "./About.css";

const Stat = ({ value, loading, label, icon: Icon, ...fmt }) => (
  <div className="stat">
    <p className="stat-num">
      {loading ? <span className="skeleton">0000</span> : value == null ? "—" : <CountUp value={value} {...fmt} />}
    </p>
    <p className="stat-label">
      <Icon className="stat-icon" aria-hidden="true" />
      {label}
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
                I'm a self-taught full-stack developer with <strong>3+ years</strong> of building and guiding real-world
                projects. I work across the <strong>MERN stack</strong>, <strong>React Native</strong>,{" "}
                <strong>Python & data science</strong>, and I love solving problems in <strong>C++ and Python</strong>.
              </Reveal>
              <Reveal as="p" delay={2}>
                As a technical mentor I've helped <strong>5,000+ students</strong> debug hard problems, ship
                production-ready apps and grow their careers. Teaching keeps my fundamentals sharp — simplifying complex
                ideas, designing scalable systems, and constantly levelling up my backend and deployment craft.
              </Reveal>
            </div>

            <Reveal className="stats-wrap" delay={1}>
              <div className="stats-head">
                <LiveSignal label="Live stats" />
                <span className="label">
                  GitHub &amp; LeetCode APIs{gh.data?.fetchedAt ? ` · synced ${timeAgo(gh.data.fetchedAt)}` : ""}
                </span>
              </div>
              <div className="stats">
              <Stat icon={FiGitCommit} label="GitHub commits" loading={ghLoading} value={gh.data?.totalCommits} />
              <Stat icon={SiLeetcode} label="LeetCode solved" loading={lcLoading} value={lcData?.totalSolved} />
              <Stat icon={FiTarget} label="Acceptance rate" loading={lcLoading} value={lcData ? Number(lcData.acceptanceRate) : null} decimals={1} suffix="%" />
              <Stat icon={FiTrendingUp} label="LeetCode global rank" loading={lcLoading} value={lcData?.ranking} prefix="#" />
              <Stat icon={FiCode} label="Years building" value={3} suffix="+" />
              <Stat icon={FiUsers} label="Students mentored" value={5} suffix="K+" />
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
