import { useEffect, useState } from "react";

/**
 * Horizontal rail helpers:
 *  - click-and-drag scrolling with momentum for mouse users (touch keeps native swipe)
 *  - a click that ends a drag doesn't open the card underneath
 *  - drives a custom progress thumb and returns the current position (1-based)
 */
const useRail = (railRef, thumbRef, total) => {
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    const rail = railRef.current;
    const thumb = thumbRef.current;
    if (!rail) return;

    // ---- progress thumb + counter ----
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = rail.scrollWidth - rail.clientWidth;
      const p = max > 0 ? rail.scrollLeft / max : 0;
      const w = Math.min(1, rail.clientWidth / rail.scrollWidth);
      if (thumb) {
        thumb.style.width = `${w * 100}%`;
        thumb.style.transform = `translateX(${(p * (1 - w) * 100) / w}%)`;
      }
      const card = rail.firstElementChild;
      const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
      const step = card ? card.offsetWidth + gap : 1;
      setCurrent(p > 0.995 ? total : Math.min(total, Math.round(rail.scrollLeft / step) + 1));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const ro = new ResizeObserver(onScroll);
    ro.observe(rail);
    update();

    // ---- drag with momentum (mouse only) ----
    let down = false, moved = false, startX = 0, startLeft = 0, lastX = 0, lastT = 0, v = 0, glide = 0;
    const onDown = (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      cancelAnimationFrame(glide);
      down = true;
      moved = false;
      startX = lastX = e.clientX;
      startLeft = rail.scrollLeft;
      lastT = performance.now();
      v = 0;
    };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        rail.classList.add("is-dragging");
      }
      if (!moved) return;
      rail.scrollLeft = startLeft - dx;
      const now = performance.now();
      v = 0.8 * v + 0.2 * ((e.clientX - lastX) / Math.max(1, now - lastT));
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      if (!moved) return;
      let vel = -v * 16; // px per frame
      const step = () => {
        vel *= 0.93;
        rail.scrollLeft += vel;
        if (Math.abs(vel) > 0.4) glide = requestAnimationFrame(step);
        else rail.classList.remove("is-dragging"); // scroll-snap settles the last card
      };
      glide = requestAnimationFrame(step);
    };
    // Mouse presses shouldn't focus the card (focus would scroll the page to it and select text);
    // clicks still fire, and keyboard focus is unaffected.
    const onMouseDown = (e) => {
      if (e.button === 0) e.preventDefault();
    };
    const onClickCapture = (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    rail.addEventListener("scroll", onScroll, { passive: true });
    rail.addEventListener("pointerdown", onDown);
    rail.addEventListener("mousedown", onMouseDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    rail.addEventListener("click", onClickCapture, true);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(glide);
      ro.disconnect();
      rail.removeEventListener("scroll", onScroll);
      rail.removeEventListener("pointerdown", onDown);
      rail.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      rail.removeEventListener("click", onClickCapture, true);
    };
  }, [railRef, thumbRef, total]);

  return current;
};

export default useRail;
