import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { Shell as BuilderShell } from "./builder/Intro";

/** Renders the page to HTML at build time (see scripts/prerender.js). */
export const render = () =>
  renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  );

/** The resume builder's top bar and heading, written into resume-builder/index.html the same way. */
export const renderBuilder = () => renderToString(<BuilderShell />);
