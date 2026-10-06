import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";

/** Renders the page to HTML at build time (see scripts/prerender.js). */
export const render = () =>
  renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  );
