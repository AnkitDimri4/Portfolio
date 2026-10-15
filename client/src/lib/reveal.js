import { createElement, useEffect, useRef, useState } from "react";

// One shared IntersectionObserver per rootMargin for every observed element on the page.
const DEFAULT_MARGIN = "0px 0px -8% 0px";
const callbacks = new WeakMap();
const observers = new Map();

const getObserver = (rootMargin) => {
  if (typeof IntersectionObserver === "undefined") return null;
  if (!observers.has(rootMargin)) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            callbacks.get(e.target)?.();
            io.unobserve(e.target);
            callbacks.delete(e.target);
          }
        }),
      { rootMargin, threshold: rootMargin === DEFAULT_MARGIN ? 0.08 : 0 }
    );
    observers.set(rootMargin, io);
  }
  return observers.get(rootMargin);
};

/** True once the element has come within `rootMargin` of the viewport (never flips back). */
export const useInView = (ref, rootMargin = DEFAULT_MARGIN) => {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    const io = getObserver(rootMargin);
    if (!el || !io) return setInView(true);
    callbacks.set(el, () => setInView(true));
    io.observe(el);
    return () => {
      io.unobserve(el);
      callbacks.delete(el);
    };
  }, [ref, rootMargin]);
  return inView;
};

/** Fades/slides children in when scrolled into view. `delay` staggers siblings. */
export const Reveal = ({ as = "div", delay = 0, className = "", style, children, ...rest }) => {
  const ref = useRef(null);
  const inView = useInView(ref);
  return createElement(
    as,
    {
      ref,
      className: `reveal${inView ? " in" : ""}${className ? ` ${className}` : ""}`,
      style: { "--d": delay, ...style },
      ...rest,
    },
    children
  );
};
