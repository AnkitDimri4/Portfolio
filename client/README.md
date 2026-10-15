# Client

The portfolio's front end: **React 18 + Vite**, pre-rendered to static HTML at build time and served by **Vercel**. Live at [portfolio-nine-orcin-33.vercel.app](https://portfolio-nine-orcin-33.vercel.app/).

[![React 18](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)](https://react.dev)
[![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Hosted on Vercel](https://img.shields.io/badge/Hosted_on-Vercel-000000?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDIgMjMgMjFIMXoiLz48L3N2Zz4=)](https://vercel.com)
[![Lighthouse: 96 on mobile, 100 on desktop](https://img.shields.io/badge/Lighthouse-96_mobile_%C2%B7_100_desktop-F44B21?logo=lighthouse&logoColor=white)](https://portfolio-nine-orcin-33.vercel.app/)

> This folder is the public part of the site's code. The resume builder (its pages, templates and PDF function) and the call scheduler are private, so it doesn't build on its own: it's here to read.

## Contents

| Path | What it holds |
|---|---|
| `index.html` | The page shell: meta tags, Open Graph and Twitter cards, JSON-LD, preloaded fonts, and a small script that sets the theme before the first paint. The pre-rendered app is written into it at build time. |
| `src/main.jsx` | Starts the app: **hydrates** the pre-rendered HTML, or renders from scratch when there is none. |
| `src/App.jsx` | The page: the nav, the sections in order, and the footer. |
| `src/entry-server.jsx` | The entry the pre-render step uses, with React's `renderToString`. |
| `src/sections/` | **Hero, About, Work, Journey, Stack, Certificates, Contact**: a folder each, with its styles. |
| `src/components/` | Shared pieces: `Nav`, `Footer` (with the map dialog), `CodeCard`, `ContributionGraph`, `Marquee`, `NeuralField` (the hero's canvas network), `ScrambleText`, `CountUp`, `LocalTime`, `LiveSignal`, `SectionHead`, `ServerBar` and `Notice`. |
| `src/data/` | The site's content, as data: `profile.js` (profile, navigation, projects, journey, certificates), `resume-data.js` with `resume.js` (experience and the resume), and `notice.json` (the line shown when something's down or paused). |
| `src/lib/` | `api.js` (every request to the API: a shared cache and retries), `serverStatus.js` (whether the API can be reached), `notice.js` (when and where the notice shows), `theme.js` (dark and light) and `reveal.js` (scroll reveals). |
| `src/styles/` | The design tokens (colour, type, spacing) and the scroll animations. |
| `src/assets/` | Images (WebP) and certificates. |
| `public/` | Files served as they are: fonts, icons, the Open Graph images, `sitemap.xml`, `robots.txt`, `manifest.json`, and three static pages: the **brain map** (`brain-map/`), **privacy** and **terms**. |
| `scripts/prerender.js` | Runs after `vite build`: renders the app into the built `index.html`. |
| `vite.config.js` | The build: one entry, and bundle, per page; the output folder; a dev proxy to a local API. |
| `eslint.config.js` | The lint rules: any warning fails. |

## How it works

### Pre-rendering and hydration

`npm run build` runs `vite build`, then a server build of `src/entry-server.jsx`, then `scripts/prerender.js`, which writes the rendered page into the HTML. Visitors, search engines and link previews get the whole page in the first response, before any JavaScript runs. In the browser, React **hydrates** that markup instead of rendering it again.

### Content as data

The sections read everything from `src/data/`. A new project, job or certificate is an edit to `profile.js` or `resume-data.js`, with no component to change. The same experience data feeds the Journey section and the one-page resume PDF at [`/resume`](https://portfolio-nine-orcin-33.vercel.app/resume), so the two never disagree.

### Talking to the API

`src/lib/api.js` is the only place that calls the API:

- `useApi(path)` is a React hook for data the page shows, such as the GitHub and LeetCode stats. Every component asking for the same path shares one request and its cached answer.
- Network errors and 5xx answers get up to 3 attempts, with a short backoff between them.
- A gateway's error (502–504 from the host, 520–527 from Cloudflare) or a request still waiting after a minute tells `serverStatus.js` the API can't be reached. A bar then says so, with how long it's been down, a countdown to the next check and a **Try now** button. When the API answers again, what failed loads again by itself.

### Theme

Dark by default, light on request. The choice is saved in `localStorage` and applied by an inline script in `index.html` before the first paint, so the page never flashes the wrong theme.

### Motion

Cards unfold into place, headlines flip up and the tech ribbons react to scroll speed. It's compositor-only CSS, triggered by one shared `IntersectionObserver` per margin (`reveal.js`). With **reduced motion** set in the system, everything simply appears.

### Performance

- Each page is its own entry, so it loads only its own JavaScript.
- Heavy parts load only when needed: the booking calendar when someone opens it, and the stack grid.
- Fonts are self-hosted and preloaded, with `font-display: swap`.
- Built files are named by their content, so Vercel caches them for a year.
- Lighthouse on the live site: **96** on mobile and **100** on desktop for performance, with no layout shift.

### SEO and sharing

A canonical URL, `robots` meta, Open Graph and Twitter cards with a 1200×630 image, JSON-LD describing me as a `Person`, a `sitemap.xml` and a `robots.txt`.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | The Vite dev server |
| `npm run build` | The production build: Vite, the server build, pre-rendering, and the resume PDF |
| `npm run preview` | Serves the production build locally |
| `npm test` | The tests (Vitest) |
| `npm run lint` | ESLint, failing on any warning |

## Tests

Vitest with Testing Library, in jsdom. In this folder:

- `App.test.jsx`: the page renders my name as its heading, and every section.
- `hydration.test.jsx`: the pre-rendered HTML holds the page's content, and hydrates without mismatches, even for a visitor with a saved light theme and reduced motion.
- `components/ServerBar/ServerBar.test.jsx`: the bar stays away while the API answers; counts a gateway's error or a minute without an answer; says what's paused and when it tries again; tries again on **Try now**; notices when the browser itself is offline.
- `lib/notice.test.js`: the notice shows only where it's meant to, from its start until its end.

## Built with

| Area | Built with |
|---|---|
| **Framework** | [![React 18](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev) [![Vite 8](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev) |
| **Language and styles** | [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript) [![CSS](https://img.shields.io/badge/CSS-663399?style=for-the-badge&logo=css&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS) [![react-icons 5](https://img.shields.io/badge/react--icons_5-E91E63?style=for-the-badge&logo=react&logoColor=white)](https://react-icons.github.io/react-icons/) |
| **Tests and lint** | [![Vitest 5](https://img.shields.io/badge/Vitest_5-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev) [![Testing Library](https://img.shields.io/badge/Testing_Library-E33332?style=for-the-badge&logo=testinglibrary&logoColor=white)](https://testing-library.com) [![ESLint 10](https://img.shields.io/badge/ESLint_10-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org) |
| **Hosting** | [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDIgMjMgMjFIMXoiLz48L3N2Zz4=)](https://vercel.com) |
