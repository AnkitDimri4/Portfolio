import { useEffect, useRef, useState } from "react";
import { useInView } from "../lib/reveal";
import { useIsomorphicLayoutEffect } from "../lib/useIsomorphicLayoutEffect";

const fmt = (n, decimals) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Animates a number from 0 to `value` the first time it scrolls into view.
 * The real value is rendered first (pre-rendered HTML, crawlers and hydration all agree);
 * before the first client paint it drops to 0 for the animation — unless motion is reduced.
 * When `value` changes later (the live number replacing the page's own), it moves from the
 * number on screen to the new one, rather than counting up from 0 again.
 */
const CountUp = ({ value, decimals = 0, prefix = "", suffix = "", duration = 1400 }) => {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [animate, setAnimate] = useState(false);
  const [shown, setShown] = useState(0);
  const onScreen = useRef(0);

  useIsomorphicLayoutEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAnimate(true);
  }, []);

  useEffect(() => {
    if (!animate || !inView || value == null) return;
    let raf;
    const from = onScreen.current;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      onScreen.current = from + (value - from) * (1 - Math.pow(1 - t, 4));
      setShown(onScreen.current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, inView, value, duration]);

  return (
    <span ref={ref} className="countup">
      <span aria-hidden="true">
        {prefix}
        {fmt(animate ? shown : value ?? 0, decimals)}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {value != null ? fmt(value, decimals) : ""}
        {suffix}
      </span>
    </span>
  );
};

export default CountUp;
