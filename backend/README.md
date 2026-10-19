# Backend

The public parts of the portfolio's API: **Node.js + Express** on **Render**, with **PostgreSQL** on **Neon**. It's what the site's contact form and live stats talk to.

[![Node.js 22](https://img.shields.io/badge/Node.js-22-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express 4](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL on Neon](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech)
[![Hosted on Render](https://img.shields.io/badge/Hosted_on-Render-46E3B7?logo=render&logoColor=black)](https://render.com)

> The API also serves the resume builder, sign-in, the call scheduler and the admin view. Their code, and the routes file that wires everything up, are private, so this folder doesn't run on its own: it's here to read.

## Contents

| Path | What it does |
|---|---|
| `server.js` | Loads the environment (from `.env` when run locally) and starts the server on `PORT`. |
| `app.js` | The Express app: security headers, the CORS allow-list, a ceiling of 600 requests a minute per visitor, JSON body limits, `/health`, the API under `/api/v1/portfolio`, and errors as JSON. |
| `controllers/portfolioController.js` | The contact form: checks the message, saves it to PostgreSQL and emails it to me. |
| `controllers/githubController.js` | GitHub stats: my repositories and the commits I made in each, fetched on the server and cached. |
| `controllers/leetcodeController.js` | LeetCode stats: problems solved by difficulty, acceptance rate and ranking, cached. |
| `lib/contact.js` | The contact form's checks, and the escaping for the notification email. |
| `lib/mailer.js` | Sends the notification emails through Resend's API. |
| `middleware/rateLimit.js` | Per-visitor rate limits: a fixed window, kept in memory. |
| `config/db.js` | The PostgreSQL pool, over TLS with the certificate verified. |
| `test/` | The tests for all of the above (`node:test`). |

## Endpoints

All at `https://portfolio-backend-ie6f.onrender.com`.

### `GET /health`

A liveness check for monitors and for Render: `{ "status": "ok", "uptime": <seconds since it started> }`.

### `POST /api/v1/portfolio/sendEmail`: the contact form

The body is JSON: `name`, `email` and `msg`, plus a hidden field that only bots fill in.

- **Checks:** all three are required, the email must look like one, and the name, email and message are limited to 100, 150 and 5,000 characters. The whole body is limited to 20 kB.
- **Bots:** when the hidden field is filled in, the answer says it worked, and nothing is stored or sent.
- **What happens:** the message is saved in the `contacts` table and emailed to me, with **Reply** going straight to the sender. Both happen independently: if one fails, the message still arrives through the other, and the visitor isn't asked to send it again.
- **Limit:** 5 messages per visitor every 15 minutes.
- **Answers:** `200` when it's saved or sent; `400` with what to fix; `429`, with `Retry-After`, over the limit; `500` only if saving and sending both failed.

### `GET /api/v1/portfolio/github`: GitHub stats

My public repositories, without forks (name, description, language, stars, forks, last push), each with the commits I made on its default branch, and `totalCommits`.

- Each count costs one request: the number of the last page of a one-commit-per-page list.
- Answers are cached for an hour. When some counts fail (GitHub's rate limit, say), the last known ones are used and it tries again after 5 minutes. If a total still can't be known, `totalCommits` is `null` and `partial` is `true`, rather than a silent undercount.
- My work in the private repository counts under its public copy, this repository.
- With `GITHUB_TOKEN` set, GitHub allows 5,000 requests an hour instead of 60.
- **Limit:** 60 requests a minute per visitor (`429`, with `Retry-After`, past it). The cache means GitHub itself is asked at most once an hour, whatever comes in.

### `GET /api/v1/portfolio/leetcode`: LeetCode stats

From LeetCode's GraphQL API: problems solved (easy, medium, hard), the acceptance rate (accepted submissions out of all submissions) and the ranking. Cached for 10 minutes; if LeetCode fails after a success, the last answer is served. Limited to 60 requests a minute per visitor.

## Security

- **Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, and no `X-Powered-By`.
- **CORS:** only the site, its Vercel previews and `localhost` can call it; `CORS_ORIGIN` replaces that list.
- **Errors:** JSON without stack traces or file paths (`Invalid request body`, `Request too large`, `Something went wrong`). A request that fails, for any reason, gets a JSON 500; it never stops the server.
- **Input:** checked and length-limited; anything a visitor types is escaped before it goes into an email; SQL is parameterised.
- **Rate limits:** every route has its own limit per visitor, and every request, whatever its path, counts toward a ceiling of 600 a minute. They count each visitor by their real address: on Render, traffic comes through Cloudflare, so its `CF-Connecting-IP` header is used there, and only there.
- **Database:** TLS, with the certificate verified.
- **Secrets** live only in Render's settings, never in the code.

## Environment

| Variable | For |
|---|---|
| `PORT` | The port to listen on (Render sets it) |
| `DATABASE_URL` | PostgreSQL (Neon) |
| `RESEND_API_KEY`, `NOTIFY_EMAIL` | Emailing contact messages to me, through Resend |
| `MAIL_FROM` | Optional: the sender, once a domain is verified with Resend |
| `GITHUB_TOKEN` | Optional: a token with no scopes, for GitHub's higher rate limit |
| `RESUME_GITHUB_TOKEN` | Optional: lets the GitHub stats count the commits in the private repository |
| `CORS_ORIGIN` | Optional: comma-separated origins, replacing the default allow-list |
| `TRUST_CF_CONNECTING_IP` | Optional: `true` to trust Cloudflare's visitor address outside Render |

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Starts the server |
| `npm run dev` | Starts it, and restarts it when a file changes (`node --watch`) |
| `npm test` | The tests (`node:test`) |

## Tests

`node:test`, with `fetch` and the clock faked, so they need no network and no secrets:

- `contact.test.js`: the form's checks, the hidden field and the escaping;
- `mailer.test.js`: sending through Resend, and what happens when it isn't set up;
- `rateLimit.test.js`: the limit per visitor, and Cloudflare's address trusted only on Render;
- `stats.test.js`: GitHub's totals (complete, partial, from the last known counts, and the private repository's) and LeetCode's.

## Built with

| Area | Built with |
|---|---|
| **Runtime** | [![Node.js 22](https://img.shields.io/badge/Node.js_22-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org) [![Express 4](https://img.shields.io/badge/Express_4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com) [![dotenv 16](https://img.shields.io/badge/dotenv_16-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black)](https://github.com/motdotla/dotenv) |
| **Data** | [![PostgreSQL (pg 8)](https://img.shields.io/badge/PostgreSQL_(pg_8)-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://node-postgres.com) [![Neon](https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=neon&logoColor=black)](https://neon.tech) |
| **Email** | [![Resend](https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white)](https://resend.com) |
| **Stats from** | [![GitHub REST API](https://img.shields.io/badge/GitHub_REST_API-181717?style=for-the-badge&logo=github&logoColor=white)](https://docs.github.com/rest) [![LeetCode GraphQL](https://img.shields.io/badge/LeetCode_GraphQL-FFA116?style=for-the-badge&logo=leetcode&logoColor=black)](https://leetcode.com) |
| **Hosting** | [![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com) |
| **Tests** | [![node:test](https://img.shields.io/badge/node%3Atest-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/api/test.html) |
