import { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

const readColors = () => {
  const s = getComputedStyle(document.documentElement);
  return {
    ink: s.getPropertyValue("--field-ink").trim() || "242, 239, 232",
    hot: s.getPropertyValue("--field-hot").trim() || "255, 107, 53",
  };
};

/**
 * Hero background: a drifting node network (a nod to neural nets / systems)
 * that leans toward the cursor. Plain 2D canvas, paused when off-screen.
 */
const NeuralField = () => {
  const canvasRef = useRef(null);
  const colors = useRef(null);
  const [theme] = useTheme();

  useEffect(() => {
    colors.current = readColors();
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const host = canvas.parentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    colors.current = colors.current || readColors();

    let w = 0, h = 0, nodes = [], raf = 0, running = false, visible = true, ready = false;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, on: false };
    const LINK = () => Math.max(110, Math.min(170, Math.sqrt(w * h) / 7));
    const RADIUS = 240;
    const BUCKETS = 5;
    // Touch devices have no hover interaction, so 30fps is plenty and saves battery.
    const frameGap = window.matchMedia("(pointer: coarse)").matches ? 1000 / 30 : 0;
    let lastFrame = 0;

    const seed = () => {
      const count = Math.round(Math.max(40, Math.min(160, (w * h) / 11000)));
      nodes = Array.from({ length: count }, () => {
        const a = Math.random() * Math.PI * 2;
        const s = 0.12 + Math.random() * 0.28;
        return { x: Math.random() * w, y: Math.random() * h, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 0.7 + Math.random() * 1.5, heat: 0 };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const nw = rect.width, nh = rect.height;
      if (!nw || !nh) return;
      const reseed = !nodes.length || Math.abs(nw * nh - w * h) / (w * h || 1) > 0.25;
      w = nw;
      h = nh;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reseed) seed();
      if (!running) draw();
    };

    const draw = () => {
      const { ink, hot } = colors.current;
      const link = LINK();
      const link2 = link * link;
      ctx.clearRect(0, 0, w, h);

      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;

      for (const n of nodes) {
        if (!reduced) {
          if (pointer.on) {
            const dx = pointer.x - n.x, dy = pointer.y - n.y;
            const d = Math.hypot(dx, dy);
            if (d < RADIUS && d > 1) {
              const f = (1 - d / RADIUS) * 0.035;
              n.vx += (dx / d) * f;
              n.vy += (dy / d) * f;
            }
            n.heat = Math.max(0, 1 - d / RADIUS);
          } else n.heat *= 0.94;

          const sp = Math.hypot(n.vx, n.vy);
          const max = 1.4, min = 0.12;
          if (sp > max) { n.vx *= max / sp; n.vy *= max / sp; }
          else if (sp < min) { n.vx *= 1.02; n.vy *= 1.02; }
          n.vx *= 0.992;
          n.vy *= 0.992;
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
          if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
        }
      }

      // Batch the calm lines into a few alpha buckets (one stroke call each);
      // only the handful of "hot" lines near the cursor are stroked individually.
      ctx.lineWidth = 1;
      const buckets = Array.from({ length: BUCKETS }, () => new Path2D());
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > link2) continue;
          const t = 1 - Math.sqrt(d2) / link;
          const heat = Math.max(a.heat, b.heat);
          if (heat > 0.15) {
            ctx.strokeStyle = `rgba(${hot}, ${t * 0.55 * heat + t * 0.08})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          } else {
            const p = buckets[Math.min(BUCKETS - 1, (t * BUCKETS) | 0)];
            p.moveTo(a.x, a.y);
            p.lineTo(b.x, b.y);
          }
        }
      }
      buckets.forEach((p, k) => {
        ctx.strokeStyle = `rgba(${ink}, ${((k + 0.5) / BUCKETS) * 0.13})`;
        ctx.stroke(p);
      });

      for (const n of nodes) {
        ctx.fillStyle = n.heat > 0.1 ? `rgba(${hot}, ${0.5 + n.heat * 0.5})` : `rgba(${ink}, 0.45)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + n.heat * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now) => {
      if (now - lastFrame >= frameGap) {
        lastFrame = now;
        draw();
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!ready || running || reduced || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
      if (!pointer.on) { pointer.x = pointer.tx; pointer.y = pointer.ty; }
      pointer.on = pointer.ty > 0 && pointer.ty < rect.height;
      host.style.setProperty("--mx", `${(pointer.tx / rect.width) * 100}%`);
      host.style.setProperty("--my", `${(pointer.ty / rect.height) * 100}%`);
    };
    const onLeave = () => (pointer.on = false);
    const onVisibility = () => (document.hidden ? stop() : start());

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      visible ? start() : stop();
    });
    io.observe(canvas);
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }
    document.addEventListener("visibilitychange", onVisibility);

    resize();
    // Keep the loop off the critical path: wait for load, then an idle moment.
    const idle = (cb) => (window.requestIdleCallback ? window.requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 300));
    const kickoff = () =>
      idle(() => {
        ready = true;
        start();
      });
    if (document.readyState === "complete") kickoff();
    else window.addEventListener("load", kickoff, { once: true });

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("load", kickoff);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-field" aria-hidden="true" />;
};

export default NeuralField;
