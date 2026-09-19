/** Small "live data" indicator: animated signal bars + label (replaces blinking dots). */
const LiveSignal = ({ label = "Live", className = "" }) => (
  <span className={`live-signal ${className}`}>
    <span className="live-bars" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
    {label}
  </span>
);

/** "just now" / "12 min ago" / "3 h ago" from an ISO timestamp. */
export const timeAgo = (iso) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(mins) || mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  return `${Math.round(mins / 60)} h ago`;
};

export default LiveSignal;
