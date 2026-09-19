import { useEffect } from "react";

/**
 * Scroll-reactive marquee: drifts at `speed` px/s, speeds up and leans (skew)
 * with scroll velocity, reverses when the page scrolls up, eases to a crawl on
 * hover, and stops entirely when off-screen or with reduced motion.
 * `direction`: -1 moves content left, 1 moves it right.
 */
const useVelocityMarquee = (trackRef, { speed = 60, direction = -1 } = {}) => {
  useEffect(() => {
    const track = trackRef.current;
    const lane = track?.parentElement;
    if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0, last = 0, offset = 0, boost = 0, dir = 1, factor = 1, hover = false, running = false, groupW = 0;
    let lastY = window.scrollY, pending = 0;

    const measure = () => (groupW = track.firstElementChild?.offsetWidth || 0);
    const ro = new ResizeObserver(measure);
    ro.observe(track.firstElementChild);
    measure();

    const onScroll = () => {
      const y = window.scrollY;
      pending += y - lastY;
      lastY = y;
    };
    const onEnter = () => (hover = true);
    const onLeave = () => (hover = false);

    const tick = (now) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (pending) dir = pending > 0 ? 1 : -1;
      const scrollSpeed = dt ? Math.min(Math.abs(pending) / dt, 5000) : 0;
      pending = 0;
      boost += (scrollSpeed * 0.18 - boost) * 0.1;
      factor += ((hover ? 0.18 : 1) - factor) * 0.08;

      const v = (speed * factor + boost) * dir * direction;
      offset += v * dt;
      if (groupW) {
        offset %= groupW;
        if (offset > 0) offset -= groupW;
      }
      const skew = Math.max(-9, Math.min(9, -Math.sign(v) * boost * 0.045));
      track.style.transform = `translate3d(${offset.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(lane);
    window.addEventListener("scroll", onScroll, { passive: true });
    lane.addEventListener("pointerenter", onEnter);
    lane.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      lane.removeEventListener("pointerenter", onEnter);
      lane.removeEventListener("pointerleave", onLeave);
    };
  }, [trackRef, speed, direction]);
};

export default useVelocityMarquee;
