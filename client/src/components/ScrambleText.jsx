import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useInView } from "../lib/reveal";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>/{}[]=+*#$%&_";

/**
 * Terminal-style "decode" effect. The real text always stays in the DOM (so
 * crawlers and screen readers only ever see the real words); the animated
 * characters are painted by a CSS ::after overlay driven by a data attribute.
 *  - `immediate`: play on mount (above the fold); otherwise it plays on scroll-in
 *  - `glyphs`: characters used as noise while decoding (e.g. "01")
 *  - `hoverText`: on hover, morph into this text and hold it; morph back on leave
 */
const ScrambleText = ({
  text,
  as: Tag = "span",
  className = "",
  children,
  immediate = false,
  speed = 40,
  glyphs = GLYPHS,
  hoverText,
  replayOnHover = false,
  ...rest
}) => {
  const ref = useRef(null);
  const raf = useRef(0);
  const inView = useInView(ref);

  // Animate the overlay toward `target`, settling left to right.
  // `hold` keeps the overlay showing `target` afterwards; `alt` switches to the alternate style.
  const morph = useCallback(
    (target, { hold = false, alt = false, pace = speed } = {}) => {
      const el = ref.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      cancelAnimationFrame(raf.current);
      const chars = [...target];
      const noise = () => glyphs[(Math.random() * glyphs.length) | 0];
      const start = performance.now();
      let last = 0;
      el.classList.add("is-scrambling");
      el.classList.toggle("is-alt", alt);
      const tick = (now) => {
        if (now - last > 45) {
          last = now;
          const elapsed = now - start;
          let done = true;
          el.dataset.scramble = chars
            .map((ch, i) => {
              if (ch === " " || elapsed > i * pace + 260) return ch;
              done = false;
              return noise();
            })
            .join("");
          if (done) {
            if (!hold) {
              el.classList.remove("is-scrambling", "is-alt");
              delete el.dataset.scramble;
            }
            return;
          }
        }
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    },
    [glyphs, speed]
  );

  const run = useCallback(() => morph(text), [morph, text]);

  useLayoutEffect(() => {
    if (immediate) run();
  }, [immediate, run]);

  useEffect(() => {
    if (!immediate && inView) run();
  }, [immediate, inView, run]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const hoverProps = hoverText
    ? {
        onMouseEnter: () => morph(hoverText, { hold: true, alt: true, pace: 26 }),
        onMouseLeave: () => morph(text),
      }
    : replayOnHover
      ? { onMouseEnter: run }
      : {};

  return (
    <Tag ref={ref} className={`scramble ${className}`} {...hoverProps} {...rest}>
      {children ?? text}
    </Tag>
  );
};

export default ScrambleText;
