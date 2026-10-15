// The bar that says the API can't be reached (lib/serverStatus.js), on the resume builder's pages and
// in Schedule a call: what's paused, how long it's been down, and when it's tried again, until it
// answers. Then, for a few seconds, that it's back. It looks like the notice's line (Notice.css).
import { useEffect, useState } from "react";
import { FiCheckCircle, FiRefreshCw, FiWifiOff } from "react-icons/fi";
import { tryNow, useServerStatus } from "../../lib/serverStatus";
import "../Notice/Notice.css";
import "./ServerBar.css";

const BACK_MS = 6000;
const PAUSED = {
  builder: "Signing in, saving to your account and emailing your PDF are paused. The builder itself works, and your draft is safe in this browser.",
  scheduler: "Booking a call is paused until it's back. You can still email me.",
};

/** 75 000 ms as "1:15"; an hour or more as "1:02:03". */
export const clock = (ms) => {
  const total = Math.max(0, Math.round(ms / 1000));
  const pad = (n) => String(n).padStart(2, "0");
  const [h, m, s] = [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60];
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

/** The time now, every second while `on`. */
const useNow = (on) => {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!on) return undefined;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [on]);
  return now;
};

/** `place`: "builder" or "scheduler", for what it says is paused. */
export default function ServerBar({ place, className = "" }) {
  const { down, since, nextTry, checking, backAt } = useServerStatus();
  const now = useNow(down);
  // "It's back" shows for a few seconds after the server answers again.
  const [doneWith, setDoneWith] = useState(0);
  useEffect(() => {
    if (!backAt) return undefined;
    const timer = setTimeout(() => setDoneWith(backAt), Math.max(0, backAt + BACK_MS - Date.now()));
    return () => clearTimeout(timer);
  }, [backAt]);
  const classes = `site-notice server-bar ${className}`.trim();

  if (down) {
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    return (
      <aside className={classes} aria-label="Server status">
        <FiWifiOff aria-hidden="true" />
        <div className="server-bar-body">
          <p>
            <strong>{offline ? "You're offline." : "Can't reach the server."}</strong> {PAUSED[place]}
          </p>
          <p className="server-bar-time">
            <span>Down for {clock(now - since)}</span>
            <span>{checking ? "Trying again…" : `Trying again in ${clock(nextTry - now)}`}</span>
            <button type="button" className="server-bar-try" onClick={tryNow} disabled={checking}>
              <FiRefreshCw aria-hidden="true" /> Try now
            </button>
          </p>
        </div>
      </aside>
    );
  }
  if (backAt && backAt !== doneWith) {
    return (
      <aside className={`${classes} is-back`} aria-label="Server status">
        <FiCheckCircle aria-hidden="true" />
        <p role="status">
          <strong>The server is back.</strong> If something didn't work, try it again.
        </p>
      </aside>
    );
  }
  return null;
}
