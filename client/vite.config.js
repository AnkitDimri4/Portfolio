import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Keep the REACT_APP_* names already used in .env files and on Vercel.
  envPrefix: ["VITE_", "REACT_APP_"],
  server: {
    port: 3000,
    // Relative /api requests (when REACT_APP_BACKEND_URL is unset) go to the local backend.
    proxy: { "/api": "http://localhost:8080" },
  },
  build: {
    outDir: "build",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});
