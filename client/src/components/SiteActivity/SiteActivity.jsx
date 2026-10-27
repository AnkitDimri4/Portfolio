import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "../../lib/reveal";
import SNAPSHOT from "../../data/portfolioActivity.json";
import WORK from "../../data/workActivity.json";
import { SiGit, SiGithub, SiLighthouse, SiVercel } from "../brandIcons";
import { DATE, LIVE_URL, isActivity, isLighthouse } from "./activityFile";
import "../ContributionGraph/ContributionGraph.css";
import "./SiteActivity.css";

// This site's own activity, as on my GitHub profile's Portfolio card: Lighthouse on the live site, my
// commits, its merged pull requests and its deployments (Vercel's builds, as GitHub records them), day by
// day and month by month. The profile repository's "Portfolio card" workflow counts them in the private
// Portfolio-app after each deploy (the Public copy workflow asks it to, after each merge that changes the
// site or the API), measures Lighthouse, and publishes the file at LIVE_URL. The build draws that file as
// it is then (scripts/activity.js; the repository's copy, data/portfolioActivity.json, when GitHub can't
// be reached), so the pre-rendered page has the numbers; when the card comes near, the browser swaps in
// the latest file. Its calendar fills the card's width with a column a week, so a file with more weeks
// makes every square smaller and the card shorter: drawn from the same weeks, the card keeps its height,
// and the nav's links to the sections below it land where they should.

const DAY = 864e5;
const EMPTY = { commits: 0, pullRequests: 0, deployments: 0 };
// Spelled out rather than toLocaleDateString, so the pre-rendered HTML and the browser agree.
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const month = (iso) => MON[Number(iso.slice(5, 7)) - 1];
const dayLabel = (iso) => `${Number(iso.slice(8, 10))} ${month(iso)}`;
const num = (n) => n.toLocaleString("en-US");
const plural = (n, one, many = `${one}s`) => `${num(n)} ${n === 1 ? one : many}`;

/** A total per active day (a day with a commit), said as the profile card says it: whole from 10, one decimal below. */
export const perActiveDay = (n, days) => {
  const rate = n / days;
  return rate >= 10 ? String(Math.round(rate)) : rate.toFixed(1).replace(/\.0$/, "");
};

// The calendar, drawn like ContributionGraph (GitHub's own): a column per week, Sunday on top.
const P = 11.5; // cell pitch
const C = 9; // cell size
const TOP = 14; // room for the month labels
const LEFT = 22; // room for the weekdays' names
const WEEKDAYS = [
  [1, "Mon"],
  [3, "Wed"],
  [5, "Fri"],
];

// My work at FileSure, in its private repositories (data/workActivity.json, the graph above this card):
// on days this site has no commits it shows as faint grey squares, and its months as faint bars, so the
// blank months say where the work went. Shaded on its own scale, by quartile of its active days.
const WORK_ACTIVE = Object.values(WORK).filter(Boolean).sort((x, y) => x - y);
const WORK_CUTS = [0.25, 0.5, 0.75].map((f) => WORK_ACTIVE[Math.floor(WORK_ACTIVE.length * f)]);
const workLevel = (n) => 1 + WORK_CUTS.filter((c) => n > c).length;
const WORK_MONTHS = {};
for (const [date, n] of Object.entries(WORK)) WORK_MONTHS[date.slice(0, 7)] = (WORK_MONTHS[date.slice(0, 7)] || 0) + n;
const AT_FILESURE = "at FileSure, in private repositories";
const UNDER = 13; // room under the calendar for the line naming FileSure's weeks

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
    cells.push({ iso, col: Math.floor(i / 7), row: i % 7, ...EMPTY, ...a.days[iso], work: WORK[iso] || 0 });
  }
  // The weeks FileSure's faint squares span, for the line naming them under the calendar
  const workCols = cells.filter((c) => !c.commits && c.work).map((c) => c.col);
  const span = workCols.length ? [Math.min(...workCols), Math.max(...workCols)] : null;
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
    width: LEFT + cols * P - (P - C),
    height: TOP + 7 * P - (P - C) + (span ? UNDER : 0),
    shownFrom: new Date(first).toISOString().slice(0, 10),
    span,
  };
};

/** The day and the month with the most commits (the earlier on a tie), for the notes under the graphs, as on the profile card. */
const busiest = (a) => {
  const dates = Object.keys(a.days).filter((d) => DATE.test(d)).sort();
  if (!dates.length) return null;
  const on = (date) => ({ ...EMPTY, ...a.days[date] });
  const day = dates.reduce((best, date) => (on(date).commits > on(best).commits ? date : best));
  const months = new Map();
  for (const date of dates) {
    const key = date.slice(0, 7);
    if (!months.has(key)) months.set(key, { key, ...EMPTY });
    const sum = months.get(key);
    for (const k of Object.keys(EMPTY)) sum[k] += on(date)[k] || 0;
  }
  const month = [...months.values()].reduce((best, m) => (m.commits > best.commits ? m : best));
  return { day: { iso: day, ...on(day) }, month };
};

/** The last 12 months (fewer when it began later), each with its commits, merged pull requests and deployments, and FileSure's contributions. */
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
    out.unshift({ key, label: MON[m - 1], ...EMPTY, ...sums[key], work: WORK_MONTHS[key] || 0 });
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

  const { cells, months, width, height, shownFrom, span } = useMemo(() => calendar(activity), [activity]);
  const byMonth = useMemo(() => monthly(activity), [activity]);
  const best = useMemo(() => busiest(activity), [activity]);
  const { totals, from, to } = activity;
  // The latest file's scores; the build's copy has them too, should the latest file not
  const lighthouse = [activity.lighthouse, SNAPSHOT.lighthouse].find(isLighthouse);
  // Each total per active day, under its number, when the file says how many days had a commit
  const days = Number.isInteger(totals.activeDays) && totals.activeDays > 0 ? totals.activeDays : null;
  const rate = (n) => days && <dd className="sa-rate">{perActiveDay(n, days)} per active day</dd>;
  const bestMonth = best && `${MON[Number(best.month.key.slice(5)) - 1]}${best.month.key.slice(0, 4) === to.slice(0, 4) ? "" : ` ${best.month.key.slice(0, 4)}`}`;
  // One scale for the month's bars and FileSure's faint bar behind them, so their heights compare
  const top = Math.max(1, ...byMonth.flatMap((m) => [...SERIES.map(([k]) => m[k]), m.work]));
  const slot = width / byMonth.length;
  const bar = Math.min(9, (slot * 0.72 - 2 * GAP) / 3);
  const inset = (slot - (3 * bar + 2 * GAP)) / 2;
  const gridBottom = TOP + 7 * P - (P - C);

  return (
    <figure className="sa" ref={ref}>
      {title && <figcaption className="sa-title label">{title}</figcaption>}

      {/* Each number with its maker's logo, and its rate per active day, as on the profile card */}
      <dl className="sa-stats">
        {lighthouse && (
          <div className="sa-stat">
            <dt>Lighthouse, mobile · desktop</dt>
            <dd>
              <SiLighthouse className="sa-icon sa-icon-lighthouse" aria-hidden="true" />
              {`${lighthouse.mobile} · ${lighthouse.desktop}`}
            </dd>
            <dd className="sa-rate">on the live site</dd>
          </div>
        )}
        <div className="sa-stat">
          <dt>commits</dt>
          <dd>
            <SiGit className="sa-icon sa-icon-git" aria-hidden="true" />
            {num(totals.commits)}
          </dd>
          {rate(totals.commits)}
        </div>
        <div className="sa-stat">
          <dt>pull requests merged</dt>
          <dd>
            <SiGithub className="sa-icon sa-icon-github" aria-hidden="true" />
            {num(totals.mergedPullRequests)}
          </dd>
          {rate(totals.mergedPullRequests)}
        </div>
        <div className="sa-stat">
          <dt>deployments, {num(totals.productionDeploys)} to production</dt>
          <dd>
            <SiVercel className="sa-icon sa-icon-vercel" aria-hidden="true" />
            {num(totals.deployments)}
          </dd>
          {rate(totals.deployments)}
        </div>
      </dl>

      <div className="sa-graphs">
        <div className="sa-graph">
          <p className="sa-graph-title label">Day by day</p>
          <svg
            className="sa-svg"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`Commits day by day from ${dayLabel(shownFrom)} ${shownFrom.slice(0, 4)} to ${dayLabel(to)} ${to.slice(0, 4)}, with each day the site was deployed marked${span ? `, and on the other days my work ${AT_FILESURE}, in faint squares` : ""}`}
          >
            {months.map(([col, label]) => (
              <text key={col} x={LEFT + col * P} y="9">
                {label}
              </text>
            ))}
            {WEEKDAYS.map(([row, label]) => (
              <text key={label} x="0" y={TOP + row * P + 7}>
                {label}
              </text>
            ))}
            {/* A square (and its tooltip) a day, drawn once the card comes near: the page the build
                writes keeps the calendar's size, months and summary, so nothing moves when they appear */}
            {near && cells.map((c) => {
              const x = LEFT + c.col * P;
              const y = TOP + c.row * P;
              const busy = c.commits || c.pullRequests || c.deployments;
              const said = [
                busy && `${plural(c.commits, "commit")} · ${plural(c.pullRequests, "pull request")} · ${plural(c.deployments, "deployment")}`,
                c.work > 0 && `${plural(c.work, "contribution")} ${AT_FILESURE}`,
              ].filter(Boolean);
              return (
                <Fragment key={c.iso}>
                  <rect className={!c.commits && c.work ? `sa-fs-l${workLevel(c.work)}` : `cg-l${c.level}`} x={x} y={y} width={C} height={C} rx="2">
                    <title>{`${dayLabel(c.iso)}: ${said.length ? said.join("; ") : "no activity"}`}</title>
                  </rect>
                  {c.deployments > 0 && <path className="sa-deploy" d={`M${x + C / 2} ${y + 1.8}L${x + C - 1.6} ${y + C - 1.8}H${x + 1.6}Z`} />}
                </Fragment>
              );
            })}
            {/* Under FileSure's weeks, a bracket that names them */}
            {span && (
              <g className="sa-span">
                <path d={`M${LEFT + span[0] * P} ${gridBottom + 1}v3H${LEFT + span[1] * P + C}v-3`} />
                <text x={LEFT + ((span[0] + span[1]) * P + C) / 2} y={gridBottom + UNDER - 1} textAnchor="middle">
                  {AT_FILESURE}
                </text>
              </g>
            )}
          </svg>
          <p className="sa-legend label" aria-hidden="true">
            <span className="sa-scale">
              Less {[0, 1, 2, 3, 4].map((l) => <i key={l} className={`cg-l${l}`} />)} More
            </span>
            <span>
              <b className="sa-tri">▲</b> deployed
            </span>
            {span && (
              <span>
                <i className="sa-fs-l3" /> FileSure, private
              </span>
            )}
          </p>
          {best && (
            <p className="sa-note">
              Busiest day, <b>{dayLabel(best.day.iso)}</b>: {plural(best.day.commits, "commit")} · {plural(best.day.pullRequests, "pull request")} ·{" "}
              {plural(best.day.deployments, "deployment")}
            </p>
          )}
        </div>

        <div className="sa-graph">
          <p className="sa-graph-title label">Month by month</p>
          <svg
            className="sa-svg sa-bars"
            viewBox={`0 0 ${width} ${BARS_H + LABELS}`}
            role="img"
            aria-label={byMonth
              .filter((m) => m.commits || m.pullRequests || m.deployments || m.work)
              .map(
                (m) =>
                  `${m.label}: ${plural(m.commits, "commit")}, ${plural(m.pullRequests, "pull request")}, ${plural(m.deployments, "deployment")}` +
                  (m.work ? `, and ${plural(m.work, "contribution")} ${AT_FILESURE}` : "")
              )
              .join("; ")}
          >
            {byMonth.map((m, i) => (
              <g key={m.key}>
                {/* FileSure's month, a faint bar behind this site's three */}
                {m.work > 0 && (
                  <rect
                    className="sa-bar-fs"
                    x={i * slot + inset - 1}
                    y={BARS_H - Math.max(1.5, (m.work / top) * BARS_H)}
                    width={3 * bar + 2 * GAP + 2}
                    height={Math.max(1.5, (m.work / top) * BARS_H)}
                    rx="1.5"
                  />
                )}
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
            {byMonth.some((m) => m.work) && (
              <span>
                <i className="sa-bar-fs" /> FileSure, private
              </span>
            )}
          </p>
          {best && (
            <p className="sa-note">
              Busiest month, <b>{bestMonth}</b>: {plural(best.month.commits, "commit")} · {plural(best.month.pullRequests, "PR")} ·{" "}
              {plural(best.month.deployments, "deploy")}
            </p>
          )}
        </div>
      </div>

      <p className="sa-dates label">
        Since {month(from)} {from.slice(0, 4)}
        {days && ` · ${plural(days, "active day")}`} · private repository · updated after every deploy
      </p>
    </figure>
  );
};

export default SiteActivity;
