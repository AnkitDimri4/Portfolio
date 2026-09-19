import { useEffect, useRef, useState } from "react";
import { useInView } from "../lib/reveal";

const fmt = (n, decimals) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** Animates a number from 0 to `value` the first time it scrolls into view. */
const CountUp = ({ value, decimals = 0, prefix = "", suffix = "", duration = 1400 }) => {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView || value == null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(value);
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setShown(value * (1 - Math.pow(1 - t, 4)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="countup">
      <span aria-hidden="true">
        {prefix}
        {fmt(shown, decimals)}
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
