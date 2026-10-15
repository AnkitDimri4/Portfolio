// Whether the API can be reached, for the bar that says so when it can't (components/ServerBar), on
// the resume builder's pages and in Schedule a call. Every call through lib/api.js reports how it
// went. These count as trouble:
// - no answer at all: the network, or Cloudflare in front of Render turning the call away;
// - a gateway's error: Render's 502–504, Cloudflare's 520–527;
// - no answer after a minute, which is past Render's waking up.
// Trouble starts a check of /health. While that fails, the server is down, and it's checked again
// after 15 s, 30 s, then every minute, until it answers. Any answer from the API means it's up.
// Checks run only while something on the page shows the status. The home page's own calls just
// report.
import { useSyncExternalStore } from "react";

export const API_BASE = (import.meta.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
export const STUCK_MS = 60_000; // a call still waiting after this is trouble
const CHECK_MS = 15_000; // a check that hasn't answered by then has failed
const DELAYS = [15_000, 30_000, 60_000]; // between checks while it's down; then every minute

const IDLE = { down: false, since: 0, nextTry: 0, checking: false, backAt: 0 };
let state = IDLE;
let troubleAt = 0; // when trouble was first seen, before a check says it's down
let failures = 0;
let timer = null;
let round = 0; // which check is the current one: a newer check, or an answer, makes older ones moot
const listeners = new Set();

const set = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
};

/** GET /health: true if the API answers it. */
const healthy = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store", signal: AbortSignal.timeout?.(CHECK_MS) });
    return res.ok && (await res.json()).status === "ok";
  } catch {
    return false;
  }
};

const check = async () => {
  clearTimeout(timer);
  timer = null;
  const mine = ++round;
  set({ checking: true });
  const ok = await healthy();
  if (mine !== round || !listeners.size) return;
  if (ok) {
    serverOk();
    return;
  }
  const now = Date.now();
  const delay = DELAYS[Math.min(failures, DELAYS.length - 1)];
  failures += 1;
  set({ down: true, since: state.since || troubleAt || now, nextTry: now + delay, checking: false, backAt: 0 });
  timer = setTimeout(check, delay);
};

/** The API answered: it's up. lib/api.js calls this. */
export const serverOk = () => {
  troubleAt = 0;
  failures = 0;
  if (!state.down && !state.checking) return;
  clearTimeout(timer);
  timer = null;
  round += 1;
  set({ down: false, since: 0, nextTry: 0, checking: false, backAt: state.down ? Date.now() : state.backAt });
};

/** No answer from the API, a gateway's error, or none after a minute. lib/api.js calls this. */
export const serverTrouble = () => {
  if (state.down || state.checking) return;
  troubleAt ||= Date.now();
  if (listeners.size) check();
};

/** Check now, rather than wait for the next try: the bar's "Try now", and coming back online. */
export const tryNow = () => {
  if (listeners.size && !state.checking) check();
};

if (typeof window !== "undefined") {
  window.addEventListener("offline", serverTrouble);
  window.addEventListener("online", () => state.down && tryNow());
}

const subscribe = (listener) => {
  listeners.add(listener);
  if (listeners.size === 1 && troubleAt && !state.checking) check(); // trouble seen before anything showed it
  return () => {
    listeners.delete(listener);
    if (listeners.size) return;
    // Nothing shows it any more: stop checking, and start afresh next time.
    clearTimeout(timer);
    timer = null;
    round += 1;
    troubleAt = 0;
    failures = 0;
    state = IDLE;
  };
};

/** { down, since, nextTry, checking, backAt }, kept current. */
export const useServerStatus = () => useSyncExternalStore(subscribe, () => state, () => IDLE);

/** When the server last came back after being down (0 if it hasn't): to load again what couldn't. */
export const useServerBack = () =>
  useSyncExternalStore(
    subscribe,
    () => state.backAt,
    () => 0
  );
