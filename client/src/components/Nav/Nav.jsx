import { useEffect, useState } from "react";
import { FiArrowUpRight, FiMoon, FiSun } from "react-icons/fi";
import { NAV, PROFILE } from "../../data/profile";
import { useTheme } from "../../context/ThemeContext";
import "./Nav.css";

const useActiveSection = (ids) => {
  const [active, setActive] = useState("");
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return active;
};

const SECTION_IDS = ["home", ...NAV.map((n) => n.id)];

export const ThemeToggle = () => {
  const [theme, setTheme] = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button className="icon-btn theme-toggle" onClick={() => setTheme(next)} aria-label={`Switch to ${next} theme`}>
      {theme === "dark" ? <FiSun size={17} /> : <FiMoon size={17} />}
    </button>
  );
};

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(SECTION_IDS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className={`nav${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
        <div className="wrap nav-inner">
          <a href="#home" className="brand" title="Back to top" onClick={() => setOpen(false)}>
            <span className="brand-mark" aria-hidden="true">
              AD
            </span>
            <span className="brand-name">Ankit Dimri</span>
          </a>

          <nav className="nav-links" aria-label="Primary">
            {NAV.map((item, i) => (
              <a key={item.id} href={`#${item.id}`} className={active === item.id ? "is-active" : ""} aria-current={active === item.id ? "true" : undefined}>
                <span className="nav-num">0{i + 1}</span>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <ThemeToggle />
            <a className="btn btn-primary btn-sm nav-cta" href="#contact">
              Let's talk <FiArrowUpRight size={16} />
            </a>
            <button className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span className="menu-lines" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="nav-progress" aria-hidden="true" />
      </header>

      <div id="mobile-menu" className={`mobile-menu${open ? " is-open" : ""}`} hidden={!open}>
        <nav aria-label="Mobile">
          {NAV.map(({ id, label, icon: Icon }, i) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)} style={{ "--i": i }}>
              <Icon className="mobile-menu-icon" aria-hidden="true" />
              {label}
            </a>
          ))}
        </nav>
        <div className="mobile-menu-foot">
          <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
          <div>
            {PROFILE.socials.map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="icon-btn" aria-label={label}>
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Nav;
