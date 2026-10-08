---

# Portfolio Frontend

> The **React frontend** of the portfolio. It is built with **Vite**, **pre-rendered to static HTML** at build time and hydrated by React in the browser, and it reads live data (GitHub, LeetCode) and sends contact messages through the [backend API](../backend/README.md).

**Live:** [https://portfolio-nine-orcin-33.vercel.app/](https://portfolio-nine-orcin-33.vercel.app/) · Screenshots, features and performance numbers are in the [main README](../README.md).

---

## Tech Stack

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

<img width="31" height="36" alt="image" src="https://github.com/user-attachments/assets/688ecd8d-44e4-4da7-ab4c-678e021ba95f" /> [GitHub](https://github.com/AnkitDimri4)
<img width="28" height="36" alt="image" src="https://github.com/user-attachments/assets/82e50c6e-5619-4c7c-b763-ccfba890b500" /> [LinkedIn](https://linkedin.com/in/ankit-dimri-a6ab98263)
<img width="55" height="55" alt="image" src="https://github.com/user-attachments/assets/0519c35c-0e2e-4bba-be91-cceb69e077b8" />[LeetCode](https://leetcode.com/u/user4612MW/)

---

<div align="center">
    Created by <b>Ankit Dimri</b>  
    © 2024
</div> 

---
