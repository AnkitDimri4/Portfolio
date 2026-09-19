import { useState } from "react";
import { FiArrowUp, FiArrowUpRight, FiClock, FiFileText, FiMail, FiMapPin, FiMaximize2 } from "react-icons/fi";
import LocalTime from "../LocalTime";
import { NAV, PROFILE } from "../../data/profile";
import { useTheme } from "../../context/ThemeContext";
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
              <a href={PROFILE.resume} download="AnkitDimri_Resume.pdf" className="footer-link">
                <FiFileText aria-hidden="true" /> Résumé (PDF)
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <p className="label">Local time</p>
          <p className="footer-time">
            <FiClock aria-hidden="true" /> <LocalTime />
          </p>
          <p className="footer-muted">
            <FiMapPin aria-hidden="true" /> {PROFILE.location}
          </p>
          <button type="button" className="footer-map" onClick={() => setMapOpen(true)} aria-label="Open full-screen map of Dehradun, India">
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
        <p>© {new Date().getFullYear()} Ankit Dimri. All rights reserved.</p>
        <p>Designed &amp; built by Ankit Dimri with React &amp; Node.js.</p>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
