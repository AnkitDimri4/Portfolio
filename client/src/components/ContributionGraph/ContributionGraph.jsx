import { useRef } from "react";
import ACTIVITY from "../../data/workActivity.json";
import { useInView } from "../../lib/reveal";
import "./ContributionGraph.css";

// My GitHub contribution graph from FileSure (date → contributions, copied from the work
// account's public graph): a column per week, Sunday on top, like GitHub's own.
const DAYS = Object.keys(ACTIVITY).sort();
const FIRST = Date.parse(`${DAYS[0]}T00:00:00Z`);
const ACTIVE = DAYS.map((d) => ACTIVITY[d]).filter(Boolean).sort((a, b) => a - b);
// Shaded by quartile of the active days.
const CUTS = [0.25, 0.5, 0.75].map((f) => ACTIVE[Math.floor(ACTIVE.length * f)]);
const level = (n) => (n === 0 ? 0 : 1 + CUTS.filter((c) => n > c).length);

const P = 11.5; // cell pitch
const C = 9; // cell size
const TOP = 14; // room for the month labels
// Spelled out rather than toLocaleDateString, so the pre-rendered HTML and the browser agree.
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const month = (iso) => MON[Number(iso.slice(5, 7)) - 1];
const day = (iso) => `${Number(iso.slice(8, 10))} ${month(iso)}`; // "25 Apr"

const CELLS = DAYS.map((iso) => {
  const i = Math.round((Date.parse(`${iso}T00:00:00Z`) - FIRST) / 864e5);
  return { iso, n: ACTIVITY[iso], col: Math.floor(i / 7), row: i % 7 };
});
const MONTHS = [
  { col: 0, label: month(DAYS[0]) },
  ...CELLS.filter((c) => c.row === 0 && Number(c.iso.slice(8)) <= 7).map((c) => ({ col: c.col, label: month(c.iso) })),
];
const WIDTH = (CELLS.at(-1).col + 1) * P - (P - C);
const HEIGHT = TOP + 7 * P - (P - C);

export const TOTAL = ACTIVE.reduce((sum, n) => sum + n, 0);
const ACTIVE_DAYS = ACTIVE.length;
// The first day with a contribution, not the Sunday the graph starts on.
const FROM = DAYS.find((d) => ACTIVITY[d]);
const TO = DAYS.at(-1);

const ContributionGraph = ({ title }) => {
  const ref = useRef(null);
  // A square (and its tooltip) for every day is drawn once the graph comes near: the page the build
  // writes keeps the graph's size, its months and its summary, so nothing moves when they appear.
  const near = useInView(ref, "800px 0px");
  return (
    <figure className="cgraph" ref={ref}>
      {title && <figcaption className="cgraph-title label">{title}</figcaption>}
      <svg
        className="cgraph-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`${TOTAL.toLocaleString("en-US")} contributions on ${ACTIVE_DAYS} days between ${day(FROM)} and ${day(TO)} ${TO.slice(0, 4)}`}
      >
        {MONTHS.map((m) => (
          <text key={m.col} x={m.col * P} y="9">
            {m.label}
          </text>
        ))}
        {near &&
          CELLS.map((c) => (
            <rect key={c.iso} className={`cg-l${level(c.n)}`} x={c.col * P} y={TOP + c.row * P} width={C} height={C} rx="2">
              <title>{`${day(c.iso)}: ${c.n} contribution${c.n === 1 ? "" : "s"}`}</title>
            </rect>
          ))}
      </svg>
      <p className="cgraph-foot label">
        <span>
          <b>{TOTAL.toLocaleString("en-US")}</b> contributions · <b>{ACTIVE_DAYS}</b> active days
        </span>
        <span className="cgraph-scale" aria-hidden="true">
          Less {[0, 1, 2, 3, 4].map((l) => <i key={l} className={`cg-l${l}`} />)} More
        </span>
      </p>
      <p className="cgraph-dates label">
        {day(FROM)} – {day(TO)} {TO.slice(0, 4)} · private repositories
      </p>
    </figure>
  );
};

export default ContributionGraph;
