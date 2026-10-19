import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { structuredDataScript } from "./builder/faq";
import { Shell as BuilderShell } from "./builder/Intro";
import { setSnapshot, snapshotScript } from "./lib/api";

/**
 * Renders the page to HTML at build time (see scripts/prerender.js), with `snapshot`: the API's
 * answers then, by path, which the page also carries for the browser (`snapshotScript`).
 */
export const render = (snapshot = {}) => {
  setSnapshot(snapshot);
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

export { snapshotScript };

/** The resume builder's top bar and heading, written into resume-builder/index.html the same way. */
export const renderBuilder = () => renderToString(<BuilderShell />);

/** The resume builder's structured data (its FAQ, and what it is), for its <head>. */
export const builderStructuredData = structuredDataScript;
