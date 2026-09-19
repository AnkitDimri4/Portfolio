import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useInView } from "../lib/reveal";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>/{}[]=+*#$%&_";
const rand = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

/**
 * Terminal-style "decode" effect. The real text always stays in the DOM (so
 * crawlers and screen readers only ever see the real words); the random glyphs
 * are painted by a CSS ::after overlay driven by a data attribute.
 * `immediate` starts on mount (above the fold); otherwise it plays on scroll-in.
 */
const ScrambleText = ({ text, as: Tag = "span", className = "", children, immediate = false, speed = 40, replayOnHover = false, ...rest }) => {
  const ref = useRef(null);
  const raf = useRef(0);
  const inView = useInView(ref);

  const run = useCallback(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(raf.current);
    const chars = [...text];
    const start = performance.now();
    let last = 0;
    el.classList.add("is-scrambling");
    const tick = (now) => {
      if (now - last > 50) {
        last = now;
        const elapsed = now - start;
        let done = true;
        el.dataset.scramble = chars
          .map((ch, i) => {
            if (ch === " " || elapsed > i * speed + 300) return ch;
            done = false;
            return rand();
          })
          .join("");
        if (done) {
          el.classList.remove("is-scrambling");
          delete el.dataset.scramble;
          return;
        }
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [text, speed]);

  useLayoutEffect(() => {
    if (immediate) run();
  }, [immediate, run]);

  useEffect(() => {
    if (!immediate && inView) run();
  }, [immediate, inView, run]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <Tag ref={ref} className={`scramble ${className}`} onMouseEnter={replayOnHover ? run : undefined} {...rest}>
      {children ?? text}
    </Tag>
  );
};

export default ScrambleText;
