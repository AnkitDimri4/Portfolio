import "./RailFoot.css";

const pad = (n) => String(n).padStart(2, "0");

/**
 * Under a row of cards to drag or swipe, driven by lib/useRail.js: a line whose bright part is the part of
 * the row in view, and "03 / 07". Only to look at (the cards are what's read out). `phone`: shown on phones
 * only, where the row is one to swipe (Stack, Work); elsewhere always (Certificates).
 */
const RailFoot = ({ thumb, current, total, hint, phone = false, className = "" }) => (
  <div className={["rail-foot", phone && "rail-foot--phone", className].filter(Boolean).join(" ")} aria-hidden="true">
    <span className="rail-track">
      <span className="rail-thumb" ref={thumb} />
    </span>
    <span className="label rail-count">
      <b>{pad(current)}</b> / {pad(total)}
    </span>
    {hint && <span className="label rail-hint">{hint}</span>}
  </div>
);

export default RailFoot;
