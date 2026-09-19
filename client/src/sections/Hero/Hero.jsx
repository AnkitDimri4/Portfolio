import { useEffect, useState } from "react";
import { FiArrowDown, FiArrowUpRight, FiClock, FiDownload, FiMapPin } from "react-icons/fi";
import NeuralField from "../../components/NeuralField";
import LocalTime from "../../components/LocalTime";
import ScrambleText from "../../components/ScrambleText";
import CodeCard from "../../components/CodeCard/CodeCard";
import { PROFILE } from "../../data/profile";
import "./Hero.css";

// "A D" as 8-bit ASCII — shown when hovering the name
const INITIALS_BINARY = "01000001 01000100";

const RoleRotator = ({ items }) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % items.length), 2400);
    return () => clearInterval(id);
  }, [items.length]);
  return (
    <span className="rotator">
      <span key={i} className="rotator-item">
        {items[i]}
      </span>
    </span>
  );
};

const Hero = () => (
  <section className="hero" id="home" aria-labelledby="hero-name">
    <NeuralField />
    <div className="hero-glow" aria-hidden="true" />

    <div className="wrap hero-inner">
      <div className="hero-grid">
        <div className="hero-main">
          <p className="hero-status">
            <span className="radar" aria-hidden="true" /> Open to full-time roles &amp; freelance
          </p>

          <p className="label hero-hello">
            <ScrambleText text="// hello, world — I'm" immediate speed={26} />
          </p>

          <ScrambleText
            as="h1"
            id="hero-name"
            className="hero-name"
            text={PROFILE.name}
            glyphs="01"
            hoverText={INITIALS_BINARY}
            title="A · D in binary"
            immediate
            speed={70}
          >
            Ankit Dimr<span className="accent">i</span>
          </ScrambleText>

          <p className="hero-role">
            Full-Stack Software <span className="serif">Engineer</span>
          </p>

          <p className="hero-lede">
            I build fast, reliable web &amp; mobile products with the MERN stack, React Native and machine learning —
            and I've mentored 5,000+ developers along the way.
          </p>

          <div className="hero-cta">
            <a className="btn btn-primary" href={PROFILE.whatsapp} target="_blank" rel="noreferrer">
              Hire me <FiArrowUpRight size={18} />
            </a>
            <a className="btn" href={PROFILE.resume} download="AnkitDimri_Resume.pdf">
              Resume <FiDownload size={17} />
            </a>
            <span className="hero-socials">
              {PROFILE.socials.map(({ label, href, icon: Icon }) => (
                <a key={label} className="icon-btn" href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
                  <Icon size={17} />
                </a>
              ))}
            </span>
          </div>
        </div>

        <div className="hero-aside">
          <CodeCard />
        </div>
      </div>

      <div className="hero-foot">
        <p className="label hero-where">
          <FiMapPin aria-hidden="true" /> {PROFILE.location}
          <span className="hero-sep" aria-hidden="true" />
          <FiClock aria-hidden="true" /> <LocalTime />
        </p>
        <p className="hero-building">
          <span className="label">Currently building</span>
          <RoleRotator items={PROFILE.roles} />
        </p>
        <a href="#about" className="scroll-cue label">
          Scroll <FiArrowDown aria-hidden="true" />
        </a>
      </div>
    </div>
  </section>
);

export default Hero;
