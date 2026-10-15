<div align="center">

# Ankit Dimri · Portfolio

**My personal site: a portfolio, a one-page resume builder, a live brain map and a call scheduler, built and run end to end.**

[![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-3C873A?logo=nodedotjs&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white)](https://neon.tech)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-96%20mobile%20·%20100%20desktop-ff6b35)](#performance)

### [Open the live site →](https://portfolio-nine-orcin-33.vercel.app/)

<a href="https://portfolio-nine-orcin-33.vercel.app/" title="Open the live site">
  <img src="https://portfolio-nine-orcin-33.vercel.app/og-image.jpg" alt="The portfolio's home page" width="880">
</a>

</div>

## What's on the site

| | |
|---|---|
| **[Portfolio](https://portfolio-nine-orcin-33.vercel.app/)** | Dark and light themes, live GitHub and LeetCode stats, project demos, certificates and a contact form. |
| **[Resume builder](https://portfolio-nine-orcin-33.vercel.app/resume-builder/)** | Three templates, a live preview that keeps the resume to one page, an ATS check against a job posting, and the PDF by email. No sign-up needed; signing in with Google or an email link keeps drafts on any device. |
| **[Brain map](https://portfolio-nine-orcin-33.vercel.app/brain-map/)** | My work, projects and skills on one page, with a guided tour. |
| **Schedule a call** | Open times in the visitor's time zone, booked straight into Google Calendar with a Google Meet link. |
| **[My resume](https://portfolio-nine-orcin-33.vercel.app/resume)** | A one-page PDF printed from the same data as the site on every build, so the two never disagree. |

<div align="center">
  <a href="https://portfolio-nine-orcin-33.vercel.app/resume-builder/" title="Open the resume builder">
    <img src="https://portfolio-nine-orcin-33.vercel.app/og-resume-builder.jpg" alt="The resume builder" width="880">
  </a>
</div>

## What's in this repository

The portfolio's own code, copied here from my private repository after every change:

- **`client/`**: the React and Vite front end: the pages, components and styles, pre-rendered to static HTML at build time, and in `client/public/` the brain map and the privacy and terms pages.
- **`backend/`**: the parts of the Node and Express API behind the contact form and the live GitHub and LeetCode stats, with their tests.

The resume builder (its templates, ATS check and PDF function), the call scheduler, sign-in and the admin view are private, so this copy doesn't build or run on its own. It's shared for reading: it carries no licence, so the usual copyright applies.

## Performance

Lighthouse on the live site, mobile · desktop:

| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Home | 96 · 100 | 100 · 97 | 100 · 100 | 100 · 100 |
| Resume builder | 96 · 100 | 100 · 100 | 100 · 100 | 100 · 100 |

On a phone (Lighthouse's slow 4G), the largest content shows in 2.3 seconds, nothing blocks the page for more than 10 ms, nothing shifts as it loads, and the builder loads 89 KB of JavaScript. What makes that possible:

- Pages are pre-rendered at build time, so the content arrives in the first response.
- Each page ships its own bundle, and the booking calendar loads only when someone opens it.
- Fonts are self-hosted and preloaded.
- Files are named by their content and cached for a year.

## Reliability

- The API can take a while to wake up. After 5 seconds the page says so; with no answer at all, a bar shows a timer and a Try now button, and whatever failed loads again once the server is back.
- A notice set from the admin view says what's paused. It's built into the page, so it shows even when the API is down.
- My resume and the notice are edited in the admin view and go live through a pull request: tests, a preview, then one-click approval.
- PDFs come from a function that downloads Chromium when it starts, which made each deployment about 90% smaller.

## Engineering

- 270+ tests, in Vitest and Node's test runner, with the API's SQL run on PGlite (PostgreSQL in memory).
- Every change on a branch and a pull request, with signed commits; GitHub Actions pinned to commit hashes, and Dependabot updates.
- Signed-in and admin routes check the session; HSTS, a Content Security Policy and other security headers on every page.

## Stack

| Part | Built with |
|---|---|
| Front end | React 18 and Vite, pre-rendered pages, a hand-built design system |
| API | Node.js and Express, on Render |
| Database | PostgreSQL on Neon |
| PDFs | Puppeteer and Chromium, in a Vercel function |
| Email and calendar | Gmail API, Resend, Google Calendar and Meet |
| Hosting and CI | Vercel, Render, GitHub Actions |

## Contact

[Live site](https://portfolio-nine-orcin-33.vercel.app/) (the contact form, or Schedule a call) · [LinkedIn](https://www.linkedin.com/in/ankit-dimri-a6ab98263) · [GitHub](https://github.com/AnkitDimri4)

<div align="center"><sub>© 2024–2026 Ankit Dimri. All rights reserved.</sub></div>
