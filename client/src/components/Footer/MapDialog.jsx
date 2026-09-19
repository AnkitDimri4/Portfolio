import { useEffect, useRef, useState } from "react";
import { FiExternalLink, FiMapPin, FiNavigation, FiX } from "react-icons/fi";

export const PLACE = { name: "Dehradun, Uttarakhand, India", lat: 30.3165, lon: 78.0322 };

const EMBED =
  "https://www.openstreetmap.org/export/embed.html" +
  `?bbox=${PLACE.lon - 0.26}%2C${PLACE.lat - 0.13}%2C${PLACE.lon + 0.26}%2C${PLACE.lat + 0.13}` +
  `&layer=mapnik&marker=${PLACE.lat}%2C${PLACE.lon}`;
const OSM_LINK = `https://www.openstreetmap.org/?mlat=${PLACE.lat}&mlon=${PLACE.lon}#map=12/${PLACE.lat}/${PLACE.lon}`;
const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${PLACE.lat},${PLACE.lon}`;

/**
 * In-page full-screen map. The interactive OpenStreetMap embed is only mounted
 * while the dialog is open, so it costs nothing until someone asks for it.
 */
const MapDialog = ({ open, onClose }) => {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) setLoaded(false);
    // stop the page behind from scrolling while the map has focus
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog ref={ref} className="map-dialog" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()} aria-label="Map of Dehradun, India">
      {open && (
        <div className="map-dialog-inner">
          <header className="map-dialog-bar">
            <p className="map-dialog-title">
              <FiMapPin aria-hidden="true" />
              <span>
                <strong>{PLACE.name}</strong>
                <span className="label">
                  {PLACE.lat.toFixed(2)}°N · {PLACE.lon.toFixed(2)}°E · IST (UTC+5:30)
                </span>
              </span>
            </p>
            <div className="map-dialog-actions">
              <a className="btn btn-sm" href={DIRECTIONS} target="_blank" rel="noreferrer">
                <FiNavigation size={14} /> Directions
              </a>
              <a className="icon-btn" href={OSM_LINK} target="_blank" rel="noreferrer" aria-label="Open in OpenStreetMap" title="Open in OpenStreetMap">
                <FiExternalLink />
              </a>
              <button className="icon-btn" onClick={onClose} aria-label="Close map" autoFocus>
                <FiX />
              </button>
            </div>
          </header>
          <div className={`map-dialog-frame${loaded ? " is-loaded" : ""}`}>
            <span className="map-dialog-loading label" aria-hidden="true">
              Loading map…
            </span>
            <iframe title="Interactive map of Dehradun, India" src={EMBED} loading="lazy" onLoad={() => setLoaded(true)} />
          </div>
        </div>
      )}
    </dialog>
  );
};

export default MapDialog;
