import { useEffect, useState } from "react";

const BASE = (import.meta.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
const cache = new Map();
const ATTEMPTS = 3;
const SLOW_MS = 4000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The API runs on a free Render instance that sleeps when idle and can take ~30 s to wake up,
// so network errors and 5xx responses are retried with a short backoff.
const request = async (path, attempt = 1) => {
  let res;
  try {
    res = await fetch(`${BASE}${path}`);
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

/** { data, error, slow } — `slow` turns true while a request is still pending after a few seconds. */
export const useApi = (path) => {
  const [state, setState] = useState({ data: null, error: null, slow: false });
  useEffect(() => {
    let live = true;
    const timer = setTimeout(() => live && setState((s) => (s.data || s.error ? s : { ...s, slow: true })), SLOW_MS);
    fetchJSON(path)
      .then(
        (data) => live && setState({ data, error: null, slow: false }),
        (error) => live && setState({ data: null, error, slow: false })
      )
      .finally(() => clearTimeout(timer));
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [path]);
  return state;
};

export const postJSON = async (path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }
  return data;
};
