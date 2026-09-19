import { useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiMaximize2, FiX } from "react-icons/fi";
import SectionHead from "../../components/SectionHead";
import { Reveal } from "../../lib/reveal";
import { CERTIFICATES } from "../../data/profile";
import useRail from "./useRail";
import "./Certificates.css";

const Lightbox = ({ index, onClose, onStep }) => {
  const ref = useRef(null);
  const cert = CERTIFICATES[index];

  useEffect(() => {
    const dialog = ref.current;
    if (index == null) {
      if (dialog.open) dialog.close();
    } else if (!dialog.open) {
      dialog.showModal();
    }
  }, [index]);

  useEffect(() => {
    const onKey = (e) => {
      if (index == null) return;
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onStep]);

  return (
    <dialog ref={ref} className="lightbox" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()} aria-label="Certificate viewer">
      {cert && (
        <div className="lightbox-inner">
          <img src={cert.full} alt={`${cert.title} certificate — ${cert.issuer}`} />
          <div className="lightbox-bar">
            <p>
              <strong>{cert.title}</strong> <span className="label">· {cert.issuer} · {cert.date}</span>
            </p>
            <div className="lightbox-actions">
              <button className="icon-btn" onClick={() => onStep(-1)} aria-label="Previous certificate">
                <FiArrowLeft />
              </button>
              <button className="icon-btn" onClick={() => onStep(1)} aria-label="Next certificate">
                <FiArrowRight />
              </button>
              <button className="icon-btn" onClick={onClose} aria-label="Close">
                <FiX />
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
};

const pad = (n) => String(n).padStart(2, "0");

const Certificates = () => {
  const rail = useRef(null);
  const thumb = useRef(null);
  const current = useRail(rail, thumb, CERTIFICATES.length);
  const [open, setOpen] = useState(null);
  const step = (dir) => setOpen((i) => (i + dir + CERTIFICATES.length) % CERTIFICATES.length);
  const scroll = (dir) => {
    const el = rail.current;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="section certs" id="certificates" aria-labelledby="certs-title">
      <div className="wrap">
        <div className="certs-head">
          <SectionHead
            index={5}
            label="Certificates"
            id="certs-title"
            title={
              <>
                Certified &amp; <span className="serif">always learning.</span>
              </>
            }
          >
            {CERTIFICATES.length} certifications across MERN, React Native, ML, data science and DSA — plus 300+ hours on
            freeCodeCamp.
          </SectionHead>
          <div className="certs-nav">
            <button className="icon-btn" onClick={() => scroll(-1)} aria-label="Scroll certificates left">
              <FiArrowLeft />
            </button>
            <button className="icon-btn" onClick={() => scroll(1)} aria-label="Scroll certificates right">
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>

      <div className="certs-rail" ref={rail} tabIndex={0} aria-label="Certificates gallery">
        {CERTIFICATES.map((c, i) => (
          <Reveal className="cert" key={c.slug} delay={Math.min(i, 3)}>
            <button className="cert-btn" onClick={() => setOpen(i)}>
              <span className="cert-img">
                <img src={c.thumb} alt="" loading="lazy" decoding="async" width="560" height="430" draggable="false" />
                <span className="cert-zoom" aria-hidden="true">
                  <FiMaximize2 />
                </span>
              </span>
              <span className="cert-meta">
                <span className="cert-title">{c.title}</span>
                <span className="label">
                  {c.issuer} · {c.date}
                </span>
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      <div className="wrap certs-foot" aria-hidden="true">
        <span className="certs-track">
          <span className="certs-thumb" ref={thumb} />
        </span>
        <span className="label certs-count">
          <b>{pad(current)}</b> / {pad(CERTIFICATES.length)}
        </span>
        <span className="label certs-hint">Drag or swipe</span>
      </div>

      <Lightbox index={open} onClose={() => setOpen(null)} onStep={step} />
    </section>
  );
};

export default Certificates;
