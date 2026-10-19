import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "../../lib/reveal";
import SNAPSHOT from "../../data/portfolioActivity.json";
import { SiGit, SiGithub, SiLighthouse, SiVercel } from "../brandIcons";
import "../ContributionGraph/ContributionGraph.css";
import "./SiteActivity.css";

// This site's own activity, as on my GitHub profile's Portfolio card: Lighthouse on the live site, my
// commits, its merged pull requests and its deployments (Vercel's builds, as GitHub records them), day by
// day and month by month. The profile repository's "Portfolio card" workflow counts them in the private
// Portfolio-app after each deploy (the Public copy workflow asks it to, after each merge that changes the
// site or the API), measures Lighthouse, and publishes the file below. The build keeps a copy
// (data/portfolioActivity.json), so the pre-rendered page has the numbers; when the card comes near, the
// browser swaps in the latest file.
export const LIVE_URL = "https://raw.githubusercontent.com/AnkitDimri4/AnkitDimri4/main/assets/cards/portfolio-activity.json";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
/** True when `a` has the shape this card draws, so a broken download can't break the page. */
export const isActivity = (a) =>
  Boolean(a) &&
  DATE.test(a.from) &&
  DATE.test(a.to) &&
  a.from <= a.to &&
  ["commits", "mergedPullRequests", "deployments", "productionDeploys"].every((k) => Number.isFinite(a.totals?.[k])) &&
  typeof a.days === "object" &&
  a.days !== null;

/** True when `l` has the two Lighthouse scores, 0 to 100, mobile and desktop. */
export const isLighthouse = (l) => Boolean(l) && [l.mobile, l.desktop].every((n) => Number.isInteger(n) && n >= 0 && n <= 100);

const DAY = 864e5;
const EMPTY = { commits: 0, pullRequests: 0, deployments: 0 };
// Spelled out rather than toLocaleDateString, so the pre-rendered HTML and the browser agree.
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const month = (iso) => MON[Number(iso.slice(5, 7)) - 1];
const dayLabel = (iso) => `${Number(iso.slice(8, 10))} ${month(iso)}`;
const num = (n) => n.toLocaleString("en-US");
const plural = (n, one, many = `${one}s`) => `${num(n)} ${n === 1 ? one : many}`;

// The calendar, drawn like ContributionGraph (GitHub's own): a column per week, Sunday on top.
const P = 11.5; // cell pitch
const C = 9; // cell size
const TOP = 14; // room for the month labels

/**
 * The calendar's cells, with their levels: at most the last year (53 weeks), like GitHub's own graph,
 * from the Sunday on or before its first day. The totals above stay all-time.
 */
const calendar = (a) => {
  const end = Date.parse(`${a.to}T00:00:00Z`);
  const first = Math.max(Date.parse(`${a.from}T00:00:00Z`), end - 364 * DAY);
  const start = first - new Date(first).getUTCDay() * DAY;
  const cells = [];
  for (let t = start; t <= end; t += DAY) {
    const iso = new Date(t).toISOString().slice(0, 10);
    const i = Math.round((t - start) / DAY);
    cells.push({ iso, col: Math.floor(i / 7), row: i % 7, ...EMPTY, ...a.days[iso] });
  }
  // Shaded by quartile of the days with commits, as on the profile card.
  const active = cells.map((c) => c.commits).filter(Boolean).sort((x, y) => x - y);
  const cuts = [0.25, 0.5, 0.75].map((f) => active[Math.floor(active.length * f)]);
  const level = (n) => (n === 0 ? 0 : 1 + cuts.filter((c) => n > c).length);
  const months = new Map([[0, month(cells[0].iso)]]);
  for (const c of cells) if (c.row === 0 && Number(c.iso.slice(8)) <= 7 && c.col > 0) months.set(c.col, month(c.iso));
  const cols = cells.at(-1).col + 1;
  return {
    cells: cells.map((c) => ({ ...c, level: level(c.commits) })),
    months: [...months],
    width: cols * P - (P - C),
    height: TOP + 7 * P - (P - C),
    shownFrom: new Date(first).toISOString().slice(0, 10),
  };
};

/** The last 12 months (fewer when it began later), each with its commits, merged pull requests and deployments. */
const monthly = (a) => {
  const sums = {};
  for (const [date, d] of Object.entries(a.days)) {
    const total = (sums[date.slice(0, 7)] ??= { ...EMPTY });
    for (const k of Object.keys(EMPTY)) total[k] += d[k] || 0;
  }
  const out = [];
  for (let y = Number(a.to.slice(0, 4)), m = Number(a.to.slice(5, 7)), i = 0; i < 12; i++, m === 1 ? (y--, (m = 12)) : m--) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    if (key < a.from.slice(0, 7)) break;
    out.unshift({ key, label: MON[m - 1], ...EMPTY, ...sums[key] });
  }
  return out;
};

const SERIES = [
  ["commits", "commits"],
  ["pullRequests", "PRs"],
  ["deployments", "deploys"],
];
// The month-by-month bars are drawn as wide as the calendar, at the same scale, each month an equal slot.
const GAP = 1.5; // between a month's bars
const BARS_H = 58; // the tallest bar
const LABELS = 12; // room for the months' names

const SiteActivity = ({ title }) => {
  const ref = useRef(null);
  const near = useInView(ref, "800px 0px");
  const [activity, setActivity] = useState(SNAPSHOT);

  useEffect(() => {
    if (!near) return;
    const controller = new AbortController();
    fetch(LIVE_URL, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((latest) => {
        if (isActivity(latest) && latest.to >= SNAPSHOT.to) setActivity(latest);
      })
      .catch(() => {}); // offline or blocked: the copy from the build stays
    return () => controller.abort();
  }, [near]);

  const { cells, months, width, height, shownFrom } = useMemo(() => calendar(activity), [activity]);
  const byMonth = useMemo(() => monthly(activity), [activity]);
  const { totals, from, to } = activity;
  // The latest file's scores; the build's copy has them too, should the latest file not
  const lighthouse = [activity.lighthouse, SNAPSHOT.lighthouse].find(isLighthouse);
  const top = Math.max(1, ...byMonth.flatMap((m) => SERIES.map(([k]) => m[k])));
  const slot = width / byMonth.length;
  const bar = Math.min(9, (slot * 0.72 - 2 * GAP) / 3);
  const inset = (slot - (3 * bar + 2 * GAP)) / 2;

  return (
    <figure className="sa" ref={ref}>
      {title && <figcaption className="sa-title label">{title}</figcaption>}

      {/* Each number with its maker's logo, as on the profile card */}
      <dl className="sa-stats">
        {lighthouse && (
          <div className="sa-stat">
            <dt>Lighthouse, mobile · desktop</dt>
            <dd>
              <SiLighthouse className="sa-icon sa-icon-lighthouse" aria-hidden="true" />
              {`${lighthouse.mobile} · ${lighthouse.desktop}`}
            </dd>
          </div>
        )}
        <div className="sa-stat">
          <dt>commits</dt>
          <dd>
            <SiGit className="sa-icon sa-icon-git" aria-hidden="true" />
            {num(totals.commits)}
          </dd>
        </div>
        <div className="sa-stat">
          <dt>pull requests merged</dt>
          <dd>
            <SiGithub className="sa-icon sa-icon-github" aria-hidden="true" />
            {num(totals.mergedPullRequests)}
          </dd>
        </div>
        <div className="sa-stat">
          <dt>deployments, {num(totals.productionDeploys)} to production</dt>
          <dd>
            <SiVercel className="sa-icon sa-icon-vercel" aria-hidden="true" />
            {num(totals.deployments)}
          </dd>
        </div>
      </dl>

      <div className="sa-graphs">
        <div className="sa-graph">
          <p className="sa-graph-title label">Day by day</p>
          <svg
            className="sa-svg"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`Commits day by day from ${dayLabel(shownFrom)} ${shownFrom.slice(0, 4)} to ${dayLabel(to)} ${to.slice(0, 4)}, with each day the site was deployed marked`}
          >
            {months.map(([col, label]) => (
              <text key={col} x={col * P} y="9">
                {label}
              </text>
            ))}
            {cells.map((c) => {
              const x = c.col * P;
              const y = TOP + c.row * P;
              const busy = c.commits || c.pullRequests || c.deployments;
              return (
                <Fragment key={c.iso}>
                  <rect className={`cg-l${c.level}`} x={x} y={y} width={C} height={C} rx="2">
                    <title>
                      {busy
                        ? `${dayLabel(c.iso)}: ${plural(c.commits, "commit")} · ${plural(c.pullRequests, "pull request")} · ${plural(c.deployments, "deployment")}`
                        : `${dayLabel(c.iso)}: no activity`}
                    </title>
                  </rect>
                  {c.deployments > 0 && <path className="sa-deploy" d={`M${x + C / 2} ${y + 1.8}L${x + C - 1.6} ${y + C - 1.8}H${x + 1.6}Z`} />}
                </Fragment>
              );
            })}
          </svg>
          <p className="sa-legend label" aria-hidden="true">
            <span className="sa-scale">
              Less {[0, 1, 2, 3, 4].map((l) => <i key={l} className={`cg-l${l}`} />)} More
            </span>
            <span>
              <b className="sa-tri">▲</b> deployed
            </span>
          </p>
        </div>

        <div className="sa-graph">
          <p className="sa-graph-title label">Month by month</p>
          <svg
            className="sa-svg sa-bars"
            viewBox={`0 0 ${width} ${BARS_H + LABELS}`}
            role="img"
            aria-label={byMonth
              .filter((m) => m.commits || m.pullRequests || m.deployments)
              .map((m) => `${m.label}: ${plural(m.commits, "commit")}, ${plural(m.pullRequests, "pull request")}, ${plural(m.deployments, "deployment")}`)
              .join("; ")}
          >
            {byMonth.map((m, i) => (
              <g key={m.key}>
                {SERIES.map(([k], j) => {
                  const h = m[k] ? Math.max(1.5, (m[k] / top) * BARS_H) : 0;
                  return h ? <rect key={k} className={`sa-bar sa-bar-${k}`} x={i * slot + inset + j * (bar + GAP)} y={BARS_H - h} width={bar} height={h} rx="1.5" /> : null;
                })}
                <text x={i * slot + slot / 2} y={BARS_H + LABELS - 2} textAnchor="middle">
                  {m.label}
                </text>
              </g>
            ))}
          </svg>
          <p className="sa-legend label" aria-hidden="true">
            {SERIES.map(([k, label]) => (
              <span key={k}>
                <i className={`sa-bar-${k}`} /> {label}
              </span>
            ))}
          </p>
        </div>
      </div>

      <p className="sa-dates label">
        Since {month(from)} {from.slice(0, 4)} · private repository · updated after every deploy
      </p>
    </figure>
  );
};

export default SiteActivity;
