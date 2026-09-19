import { useEffect, useState } from "react";

const BASE = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
const cache = new Map();

// One request per path per page load, shared by every component that asks.
export const fetchJSON = (path) => {
  if (!cache.has(path)) {
    cache.set(
      path,
      fetch(`${BASE}${path}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .catch((err) => {
          cache.delete(path);
          throw err;
        })
    );
  }
  return cache.get(path);
};

export const useApi = (path) => {
  const [state, setState] = useState({ data: null, error: null });
  useEffect(() => {
    let live = true;
    fetchJSON(path).then(
      (data) => live && setState({ data, error: null }),
      (error) => live && setState({ data: null, error })
    );
    return () => {
      live = false;
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
