import { useEffect, useRef, useState } from "react";
import { FiCheckCircle, FiGitBranch } from "react-icons/fi";
import { SiTypescript } from "../brandIcons";
import "./CodeCard.css";

const SOURCE = `const engineer = {
  name: "Ankit Dimri",
  role: "Full Stack Software Engineer",
  stack: ["MERN", "Next.js", "Python"],
  mobile: "React Native + Expo",
  ai: ["TensorFlow", "FastAPI"],
  mentored: 5000,
  openToWork: true,
};

engineer.ship("intelligent products");`;

// Tiny tokenizer — just enough TypeScript for the snippet above.
const TOKEN = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|\b(const|let|true|false)\b|\b(\d+)\b|([A-Za-z_$][\w$]*)(?=\s*:)|([A-Za-z_$][\w$]*)(?=\s*\()|([{}[\]();,.:=])/g;
const CLASSES = [null, "com", "str", "key", "num", "prop", "fn", "pun"];

const tokenize = (line) => {
  const out = [];
  let last = 0;
  for (const m of line.matchAll(TOKEN)) {
    if (m.index > last) out.push(["", line.slice(last, m.index)]);
    const g = m.findIndex((v, i) => i > 0 && v !== undefined);
    out.push([CLASSES[g], m[0]]);
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(["", line.slice(last)]);
  return out;
};

const LINES = SOURCE.split("\n").map(tokenize);
const TOTAL = SOURCE.replace(/\n/g, "").length;

const CodeCard = () => {
  const cardRef = useRef(null);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [typed, setTyped] = useState(reduced ? TOTAL : 0);
  const done = typed >= TOTAL;

  useEffect(() => {
    if (reduced) return;
    let id;
    const startId = setTimeout(() => {
      id = setInterval(() => setTyped((n) => (n >= TOTAL ? (clearInterval(id), n) : n + 3)), 22);
    }, 700);
    return () => {
      clearTimeout(startId);
      clearInterval(id);
    };
  }, [reduced]);

  // 3D tilt + glare that follows the pointer
  const onMove = (e) => {
    if (reduced) return;
    const el = cardRef.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
  };
  const onLeave = () => {
    const el = cardRef.current;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  let budget = typed;
  let cursorPlaced = false;

  return (
    <div className="code-card-stage">
      <figure className="code-card" ref={cardRef} onPointerMove={onMove} onPointerLeave={onLeave} aria-label="Code snippet describing Ankit Dimri as an engineer">
        <div className="code-head">
          <span className="code-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="code-tab">
            <SiTypescript aria-hidden="true" /> engineer.ts
          </span>
          <span className="code-branch label">
            <FiGitBranch aria-hidden="true" /> main
          </span>
        </div>

        <pre className="code-body" aria-hidden="true">
          <code>
            {LINES.map((tokens, li) => {
              const content = [];
              for (const [cls, text] of tokens) {
                if (budget <= 0) break;
                const shown = text.slice(0, budget);
                budget -= shown.length;
                content.push(
                  <span key={content.length} className={cls ? `t-${cls}` : undefined}>
                    {shown}
                  </span>
                );
              }
              const showCursor = !cursorPlaced && budget <= 0;
              if (showCursor) cursorPlaced = true;
              return (
                <div className="code-line" key={li}>
                  <span className="code-ln" aria-hidden="true">
                    {li + 1}
                  </span>
                  <span className="code-text">
                    {content}
                    {showCursor && <span className="code-cursor" aria-hidden="true" />}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>

        <div className={`code-term${done ? " is-done" : ""}`} aria-live="off">
          <p>
            <span className="t-key">$</span> npm run ship
          </p>
          <p className="code-ok">
            <FiCheckCircle aria-hidden="true" /> build passed · 0 errors · 0 warnings
          </p>
        </div>

        <div className="code-status label" aria-hidden="true">
          <span>TypeScript</span>
          <span>UTF-8</span>
          <span>Ln {LINES.length}, Col 1</span>
        </div>
        <span className="code-glare" aria-hidden="true" />
      </figure>
    </div>
  );
};

export default CodeCard;
