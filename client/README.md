---

# Portfolio Frontend

> The **React frontend** of the portfolio. It is built with **Vite**, **pre-rendered to static HTML** at build time and hydrated by React in the browser, and it reads live data (GitHub, LeetCode) and sends contact messages through the [backend API](../backend/README.md).

**Live:** [https://portfolio-nine-orcin-33.vercel.app/](https://portfolio-nine-orcin-33.vercel.app/) · Screenshots, features and performance numbers are in the [main README](../README.md).

---

## Tech Stack

<p align="center">
  <img alt="React 18" src="https://img.shields.io/badge/React_18-149ECA?logo=react&logoColor=white">
  <img alt="Vite 8" src="https://img.shields.io/badge/Vite_8-646CFF?logo=vite&logoColor=white">
  <img alt="Vitest" src="https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white">
  <img alt="Testing Library" src="https://img.shields.io/badge/Testing_Library-E33332?logo=testinglibrary&logoColor=white">
  <img alt="ESLint" src="https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white">
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white">
</p>

- **UI:** React 18, hand-built CSS design system (dark &amp; light themes, CSS scroll-driven animations), react-icons
- **Build:** Vite 8; `scripts/prerender.js` renders the page to HTML after `vite build`
- **Quality:** Vitest + Testing Library, ESLint (any warning fails CI)
- **Deployment:** Vercel (settings in `vercel.json`)

---

## Run Locally

Requires **Node.js 22.13 or newer**.

```bash
cd client
npm install
npm start          # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm start` | Dev server on http://localhost:3000 |
| `npm run build` | Production build and pre-rendering into `build/` |
| `npm run preview` | Serves the production build locally |
| `npm test` | Runs the tests once (Vitest) |
| `npm run lint` | Lints the code; any warning fails CI |

---

## Environment

`client/.env` (or `client/.env.development.local` for local overrides):

```env
REACT_APP_BACKEND_URL=https://portfolio-backend-ie6f.onrender.com
```

Set it to `http://localhost:8080` to use a local backend. If it is not set, `/api` requests go to `http://localhost:8080` through the dev-server proxy.

⚠️ Every `REACT_APP_*` and `VITE_*` variable is compiled into the public JavaScript. **Never put tokens or keys here** — GitHub data is fetched by the backend, which keeps its token on the server.

---

## Folder Structure

```
client/
├── index.html               # SEO/meta, fonts, theme script; the app is pre-rendered into it
├── public/                  # fonts, icons, og-image, sitemap, robots
├── scripts/prerender.js     # renders the app to static HTML after `vite build`
├── src/
│   ├── main.jsx             # hydrates the pre-rendered HTML (renders from scratch in dev)
│   ├── entry-server.jsx     # server render used by the pre-render step
│   ├── App.jsx
│   ├── sections/            # Hero, About, Work, Journey, Stack, Certificates, Contact
│   ├── components/          # Nav, Footer (+ map dialog), CodeCard, Marquee, NeuralField, ScrambleText…
│   ├── data/profile.js      # all site content: profile, projects, journey, certificates
│   ├── lib/                 # API client, theme, scroll-reveal helpers
│   ├── styles/              # design tokens, scroll "unfold" animations
│   └── assets/              # resume PDF, WebP images, certificates
├── vite.config.js
├── eslint.config.js
└── vercel.json              # Vite preset, security headers, long-term caching for /assets/
```

To change projects, experience or certificates, edit **`src/data/profile.js`** — no component changes needed.

---

## Pre-rendering: one rule

The HTML is generated at build time, so React's first render in the browser must produce exactly the same markup; otherwise React throws it away and renders the page again. Anything that depends on the visitor's browser — the current time, the saved theme, `prefers-reduced-motion`, window size, live API data — must be read **after mount** (in an effect) or through `useSyncExternalStore`, never during the first render. `src/hydration.test.jsx` fails if this rule is broken.

---

## Author

**Ankit Dimri**  
Full-stack Developer
📍 Dehradun, India  

[![GitHub](https://img.shields.io/badge/GitHub-AnkitDimri4-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AnkitDimri4)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-ankit--dimri-0A66C2?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI%2BPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIwLjQ0NyAyMC40NTJoLTMuNTU0di01LjU2OWMwLTEuMzI4LS4wMjctMy4wMzctMS44NTItMy4wMzctMS44NTMgMC0yLjEzNiAxLjQ0NS0yLjEzNiAyLjkzOXY1LjY2N0g5LjM1MVY5aDMuNDE0djEuNTYxaC4wNDZjLjQ3Ny0uOSAxLjYzNy0xLjg1IDMuMzctMS44NSAzLjYwMSAwIDQuMjY3IDIuMzcgNC4yNjcgNS40NTV2Ni4yODZ6TTUuMzM3IDcuNDMzYy0xLjE0NCAwLTIuMDYzLS45MjYtMi4wNjMtMi4wNjUgMC0xLjEzOC45Mi0yLjA2MyAyLjA2My0yLjA2MyAxLjE0IDAgMi4wNjQuOTI1IDIuMDY0IDIuMDYzIDAgMS4xMzktLjkyNSAyLjA2NS0yLjA2NCAyLjA2NXptMS43ODIgMTMuMDE5SDMuNTU1VjloMy41NjR2MTEuNDUyek0yMi4yMjUgMEgxLjc3MUMuNzkyIDAgMCAuNzc0IDAgMS43Mjl2MjAuNTQyQzAgMjMuMjI3Ljc5MiAyNCAxLjc3MSAyNGgyMC40NTFDMjMuMiAyNCAyNCAyMy4yMjcgMjQgMjIuMjcxVjEuNzI5QzI0IC43NzQgMjMuMiAwIDIyLjIyMiAwaC4wMDN6Ii8%2BPC9zdmc%2B)](https://www.linkedin.com/in/ankit-dimri-a6ab98263)
[![LeetCode](https://img.shields.io/badge/LeetCode-user4612MW-FFA116?style=for-the-badge&logo=leetcode&logoColor=black)](https://leetcode.com/u/user4612MW/)

---

<div align="center">
    Created by <b>Ankit Dimri</b>  
    © 2024
</div> 

---
