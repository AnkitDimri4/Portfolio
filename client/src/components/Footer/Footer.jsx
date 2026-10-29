import { useState } from "react";
import { FiArrowUp, FiArrowUpRight, FiCalendar, FiClock, FiEdit3, FiFileText, FiMail, FiMapPin, FiMaximize2 } from "react-icons/fi";
import LocalTime from "../LocalTime";
import { NAV, PROFILE, RESUME_BUILDER } from "../../data/profile";
import { useTheme } from "../../lib/theme";
import { bookingEnabled, bookingProps } from "../../lib/booking";
// Pre-rendered from OpenStreetMap tiles (© OpenStreetMap contributors), centred on Dehradun
import mapDark from "../../assets/img/map-dehradun-dark.webp";
import mapLight from "../../assets/img/map-dehradun-light.webp";
import MapDialog from "./MapDialog";
import "./Footer.css";

const Footer = () => {
  const [theme] = useTheme();
  const [mapOpen, setMapOpen] = useState(false);
  return (
  <footer className="footer">
    <div className="wrap">
      <div className="footer-top">
        <div className="footer-col">
          <p className="label">Navigate</p>
          <ul>
            {NAV.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <a href={`#${id}`} className="footer-link">
                  <Icon aria-hidden="true" /> {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <p className="label">Elsewhere</p>
          <ul>
            {PROFILE.socials.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer" className="footer-link">
                  <Icon aria-hidden="true" /> {label}
                  <FiArrowUpRight className="footer-ext" aria-hidden="true" />
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${PROFILE.email}`} className="footer-link">
                <FiMail aria-hidden="true" /> Email
              </a>
            </li>
            <li>
              <a href={PROFILE.resume} target="_blank" rel="noreferrer" className="footer-link">
                <FiFileText aria-hidden="true" /> Resume (PDF)
              </a>
            </li>
            {RESUME_BUILDER.enabled && (
              <li>
                <a href={RESUME_BUILDER.href} className="footer-link">
                  <FiEdit3 aria-hidden="true" /> Resume builder
                </a>
              </li>
            )}
            {bookingEnabled && (
              <li>
                <button type="button" className="footer-link" {...bookingProps}>
                  <FiCalendar aria-hidden="true" /> Schedule a call
                </button>
              </li>
            )}
          </ul>
        </div>

        <div className="footer-col footer-col--time">
          <p className="label">Local time</p>
          <p className="footer-time">
            <FiClock aria-hidden="true" /> <LocalTime />
          </p>
          <p className="footer-muted">
            <FiMapPin aria-hidden="true" /> {PROFILE.location}
          </p>
          <button type="button" className="footer-map" onClick={() => setMapOpen(true)}>
            {/* Named by its content (not aria-label) so the visible map credit is part of the name. */}
            <span className="sr-only">Open full-screen map of Dehradun, India</span>
            <img src={theme === "light" ? mapLight : mapDark} alt="" width="720" height="400" loading="lazy" decoding="async" />
            <span className="map-pin" aria-hidden="true" />
            <span className="map-coords" aria-hidden="true">
              30.32°N · 78.03°E
            </span>
            <span className="map-expand" aria-hidden="true">
              <FiMaximize2 />
            </span>
            <span className="map-credit">© OpenStreetMap</span>
          </button>
          <MapDialog open={mapOpen} onClose={() => setMapOpen(false)} />
        </div>

        <a href="#home" className="footer-top-link">
          Back to top <FiArrowUp aria-hidden="true" />
        </a>
      </div>

      <div className="footer-bottom">
        {/* The page is pre-rendered at build time; the browser corrects the year if it has changed since. */}
        <p suppressHydrationWarning>{`© ${new Date().getFullYear()} Ankit Dimri. All rights reserved.`}</p>
        <p>
          Designed &amp; built by Ankit Dimri with React &amp; Node.js ·{" "}
          <a href="/privacy/" className="footer-privacy">
            Privacy
          </a>{" "}
          ·{" "}
          <a href="/terms/" className="footer-privacy">
            Terms
          </a>
        </p>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
