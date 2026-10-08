---

# Portfolio Backend

> #### The API behind the **Portfolio**. Built with **Node.js**, **Express** and **PostgreSQL (Neon)**: it stores contact messages, sends **email notifications via SendGrid**, and serves cached **GitHub and LeetCode stats** so no token ever reaches the browser.

**Live:** [https://portfolio-backend-ie6f.onrender.com](https://portfolio-backend-ie6f.onrender.com/health) (Render free instance — the first request after a quiet period can take ~30 s while it wakes up)

<img width="500" height="900" alt="image" src="https://github.com/user-attachments/assets/a807796c-2723-4985-a8d0-58d068f031a2" />
<img width="500" height="900" alt="image" src="https://github.com/user-attachments/assets/9537a041-b637-4208-8d6a-bf1ffb02e76c" />
<div align="center">
<img width="650" height="400" alt="image" src="https://github.com/user-attachments/assets/1775b272-20bc-4169-91ee-a3eec7b40e4c" />
</div>
<img width="1839" height="910" alt="image" src="https://github.com/user-attachments/assets/e9e80f61-eeb5-458c-9a18-166f8fe2f256" />


https://github.com/user-attachments/assets/6688385e-51c2-48a7-b90c-5eef543272c2



---

## Tech Stack

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-3C873A?logo=nodedotjs&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-000000?logo=express&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white">
  <img alt="Neon" src="https://img.shields.io/badge/Neon-00E599?logo=neon&logoColor=black">
  <img alt="SendGrid" src="https://img.shields.io/badge/SendGrid-1A82E2">
  <img alt="Render" src="https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=black">
  <img alt="GitHub Actions" src="https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white">
</p>

- **Node.js** + **Express.js**
- **PostgreSQL (Neon)** via **pg** — TLS with certificate verification
- **SendGrid** (`@sendgrid/mail`) – email notifications
- **GitHub REST** and **LeetCode GraphQL** APIs – live stats, cached in memory
- **dotenv** – environment variables · **cors** – CORS allow-list
- **node:test** – Node's built-in test runner (no extra test dependencies)

---

##  Features

- Contact form API: validation, HTML-escaped notification emails, spam honeypot and per-IP rate limiting
- Each message is saved and emailed independently, so one failing service never loses it
- Live stats: GitHub commits and repositories (cached 1 h) and LeetCode solved count, acceptance rate, ranking and easy / medium / hard split (cached 10 min)
- 10-second timeouts on GitHub and LeetCode; the last good result is served if either is down
- `/health` endpoint for uptime monitors and Render's health check
- Security headers, JSON-only errors (no stack traces), 20 kB request limit

---

## Folder Structure

```

backend/
│
├── app.js                   # Express app: security headers, CORS, routes, /health, JSON errors
├── server.js                # loads .env and starts the server
├── routes/
│   └── portfolioRoutes.js
├── controllers/
│   ├── portfolioController.js   # contact form
│   ├── githubController.js      # GitHub stats
│   └── leetcodeController.js    # LeetCode stats
├── middleware/
│   └── rateLimit.js         # per-IP rate limiting (uses Cloudflare's visitor IP on Render)
├── lib/
│   └── contact.js           # validation, honeypot, HTML escaping
├── config/
│   └── db.js                # PostgreSQL pool (verified TLS)
├── test/                    # node:test suites
├── package.json
└── README.md

````

---

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=8080
DATABASE_URL=your_neon_postgres_url
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_SENDER_EMAIL=sender@example.com       # a verified SendGrid sender
SENDGRID_RECEIVER_EMAIL=receiver@example.com   # where contact messages are delivered
# Recommended: a classic GitHub token with NO scopes (public data only).
# Raises the GitHub API limit from 60 to 5,000 requests/hour.
GITHUB_TOKEN=your_github_token
# Optional: comma-separated origins allowed to call the API. When unset, the
# portfolio site, its Vercel preview URLs and localhost (3000 / 5173) are allowed.
CORS_ORIGIN=https://portfolio-nine-orcin-33.vercel.app
````

⚠️ **Do not commit `.env` to GitHub.** On Render, set these in the service's Environment settings.

---

## Run Backend Locally

```bash
cd backend
npm install
npm run dev        # restarts on file changes (npm start for production)
npm test           # 24 tests — no database, email or network needed
```

Server will start on:

```
http://localhost:8080
```

---

## API Endpoints

| Method | Path | What it returns |
|---|---|---|
| `GET` | `/health` | `{ "status": "ok", "uptime": 42 }` — calls no other service |
| `POST` | `/api/v1/portfolio/sendEmail` | Saves and emails a contact message |
| `GET` | `/api/v1/portfolio/github` | Public repositories with commit counts, plus `totalCommits` |
| `GET` | `/api/v1/portfolio/leetcode` | `totalSolved`, `acceptanceRate`, `ranking`, `solvedByDifficulty` |

### Send Contact Message

**POST** `/api/v1/portfolio/sendEmail`

**Request Body**

```json
{
  "name": "Ankit Dimri",
  "email": "dimri.ankitdimri@gmail.com",
  "msg": "Hello, I want to connect!"
}
```

**Response**

```json
{
  "success": true,
  "message": "Message sent and saved successfully"
}
```

All fields are required; the email must be valid (max 150 characters), the name max 100 and the message max 5,000 characters. Limited to 5 messages per 15 minutes per visitor (`429` with `Retry-After`). A `500` is returned only if both saving and emailing fail. More detail is in the [main README](../README.md#api).

---

##  Database

Messages are stored in the `contacts` table:

```sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(150),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

##  Security Notes

* Secrets live only in environment variables; the GitHub token never reaches the browser
* Parameterised SQL; visitor input is HTML-escaped in notification emails
* Database connections verify the server's TLS certificate
* Rate limiting, request size limit, spam honeypot, security headers and a CORS allow-list
* Errors are JSON and never include stack traces

---

##  Author

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
