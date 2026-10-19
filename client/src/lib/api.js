import { useEffect, useState } from "react";
import { API_BASE as BASE, STUCK_MS, serverOk, serverTrouble } from "./serverStatus";

const cache = new Map();
const ATTEMPTS = 3;
const SLOW_MS = 4000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Gateways' errors: Render's while the server is down (502–504), and Cloudflare's in front of it (520–527).
const fromGateway = (status) => (status >= 502 && status <= 504) || (status >= 520 && status <= 527);

/** fetch, telling lib/serverStatus.js how the API answered, for the bar that says when it can't be reached. */
const call = async (url, init) => {
  const stuck = setTimeout(serverTrouble, STUCK_MS);
  try {
    const res = await fetch(url, init);
    if (fromGateway(res.status)) serverTrouble();
    else serverOk();
    return res;
  } catch (err) {
    serverTrouble();
    throw err;
  } finally {
    clearTimeout(stuck);
  }
};

// The API runs on a free Render instance that sleeps when idle and can take ~30 s to wake up,
// so network errors and 5xx responses are retried with a short backoff.
const request = async (path, attempt = 1) => {
  let res;
  try {
    res = await call(`${BASE}${path}`);
  } catch (err) {
    if (attempt >= ATTEMPTS) throw err;
  }
  if (res?.ok) return res.json();
  if (res && (res.status < 500 || attempt >= ATTEMPTS)) throw new Error(`HTTP ${res.status}`);
  await wait(1500 * attempt);
  return request(path, attempt + 1);
};

// One request per path per page load, shared by every component that asks.
export const fetchJSON = (path) => {
  if (!cache.has(path)) {
    cache.set(
      path,
      request(path).catch((err) => {
        cache.delete(path);
        throw err;
      })
    );
  }
  return cache.get(path);
};

/** A fresh request each time (for data that changes, like free call slots), with the same retries. */
export const getJSON = (path) => request(path);

// The API's answers when the page was built (scripts/prerender.js writes them into the page, as
// <script type="application/json" id="api-snapshot">). useApi starts from them, so the numbers show
// at once, even while the API wakes up (Render's free plan sleeps after 15 quiet minutes and takes
// about 20 seconds to wake), and the live answer replaces them when it comes.
let snapshot = {};
if (typeof document !== "undefined") {
  try {
    snapshot = JSON.parse(document.getElementById("api-snapshot")?.textContent || "{}") || {};
  } catch {
    snapshot = {};
  }
}

/** Sets the answers useApi starts from: the pre-render, before it renders the page, and the tests. */
export const setSnapshot = (answers = {}) => {
  snapshot = answers;
};

/** The answers as a data block for the page: JSON, with every "<" escaped so nothing in it can end the block. */
export const snapshotScript = (answers) =>
  `<script type="application/json" id="api-snapshot">${JSON.stringify(answers).replace(/</g, "\\u003c")}</script>`;

/**
 * { data, error, slow }: the page's snapshot of the answer at first, if it has one, then the live
 * answer. `slow` turns true while a request is still pending after a few seconds, with nothing to show.
 */
export const useApi = (path) => {
  const [state, setState] = useState(() => ({ data: snapshot[path] ?? null, error: null, slow: false }));
  useEffect(() => {
    let live = true;
    const timer = setTimeout(() => live && setState((s) => (s.data || s.error ? s : { ...s, slow: true })), SLOW_MS);
    fetchJSON(path)
      .then(
        (data) => live && setState({ data, error: null, slow: false }),
        // With the snapshot, it stays: older numbers rather than none
        (error) => live && setState((s) => (s.data ? s : { data: null, error, slow: false }))
      )
      .finally(() => clearTimeout(timer));
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [path]);
  return state;
};

/**
 * One request (no retries), for sending or changing something: resolves with the API's answer, or
 * rejects with its message, `status` and `data` (the answer). A network error rejects as fetch's
 * own, without `status`, and so does a gateway's error page (Render's or Cloudflare's).
 */
export const sendJSON = async (path, { method = "GET", body, headers } = {}) => {
  const res = await call(`${BASE}${path}`, {
    method,
    headers: { ...(body !== undefined && { "Content-Type": "application/json" }), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  // A gateway's error page rather than the API's answer: the API wasn't reached, so it fails the way
  // no answer at all does, without a status (the API's own errors, a 503 included, are JSON).
  if (data === null && fromGateway(res.status)) throw new TypeError(`The server couldn't be reached (HTTP ${res.status}).`);
  if (!res.ok || data?.success === false) {
    throw Object.assign(new Error(data?.message || "Something went wrong. Please try again."), { status: res.status, data: data ?? {} });
  }
  return data ?? {};
};

export const postJSON = (path, body) => sendJSON(path, { method: "POST", body });
