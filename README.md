
---

# Full-Stack Portfolio Project

> This repository contains the **full-stack personal portfolio** application built with **React (Frontend)** and **Node.js/Express/PostgreSQL (Backend)**.
> It showcases a professional portfolio, projects, certificates, and a contact form with email notifications via **SendGrid** and persistent database storage.

> **Live Frontend:** [https://portfolio-nine-orcin-33.vercel.app/](https://portfolio-nine-orcin-33.vercel.app/)
- > **Backend API (Deployed on Render):** `https://your-backend-url.onrender.com/api/v1/portfolio/sendEmail`

---

| ![img1](https://github.com/user-attachments/assets/29e9a4c6-7da6-43e4-853f-95087b8bcccd) | ![img2](https://github.com/user-attachments/assets/8c3dff1c-e8c7-4338-8da8-a29595692e23) | ![img3](https://github.com/user-attachments/assets/d8571ca1-39c9-4367-925a-3804111e07b2) |
|-------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| ![img4](https://github.com/user-attachments/assets/9772cb73-f97e-4e6a-8a9b-e1327157061a) | ![img5](https://github.com/user-attachments/assets/beb3e8b8-8682-4931-a149-03d4d6451191) | ![img6](https://github.com/user-attachments/assets/e387745b-fa83-4fad-8fa9-8c138ee06934) |
| ![img7](https://github.com/user-attachments/assets/0c9fd42f-16a3-4e0a-ad9a-1eea416cd7ec) | ![img8](https://github.com/user-attachments/assets/b000814b-b52e-4605-bf5d-2bd306e20d2b) | ![img9](https://github.com/user-attachments/assets/3c0db3c8-1196-430e-a885-4cb5322e191b)                                                                                          |

---

## Project Overview

The project demonstrates full-stack development skills with:

* Responsive React frontend with multiple sections
* Backend API to store and email contact form messages via SendGrid
* PostgreSQL (Neon) database for persistent storage
* Input validation and error handling
* Secure environment variable management

---

## Features

### Frontend

* Responsive design (Desktop, Tablet, Mobile)
* Pages: Home, About, Welcome, Projects, Certificates, Education, Work Experience, Contact
* Projects section includes a Machine Learning video carousel
* Dynamic fetching of GitHub projects via API
* Dark/Light mode toggle using `ThemeContext`
* Reusable components and custom hooks for modularity

### Backend

* Node.js + Express REST API
* PostgreSQL (Neon) database to store contact messages
* **SendGrid email service** for sending notifications on contact submissions
* Input validation and error handling
* Endpoint: `POST /api/v1/portfolio/sendEmail`

---

## Tech Stack

| Frontend          | Backend                  |
| ----------------- | ------------------------ |
| React             | Node.js                  |
| React Router      | Express.js               |
| Context API       | PostgreSQL (Neon)        |
| CSS / Responsive  | pg (Postgres client)     |
| react-toastify    | SendGrid (Email Service) |
| Custom Hooks      | dotenv, cors             |
| Vercel Deployment | Render Deployment        |

---

## Folder Structure

```
Portfolio/
│
├── frontend/                # React frontend
│   ├── public/              # Static assets: images, favicon
│   ├── src/
│   │   ├── assets/          # Images, resume
│   │   ├── components/      # Layout, Menu, MobileNav, TabletNav, reusable components
│   │   ├── context/         # ThemeContext for dark/light mode
│   │   ├── pages/           # About, Certificates, Contact, Educations, Home, Projects, Techstack, Welcome, WorkExp
│   │   ├── utils/           # techstackList.js and helper utilities
│   │   ├── App.js           # Main App component
│   │   ├── index.js         # React entry point
│   │   └── index.css        # Global styling
│   ├── package.json
│   └── README.md
│
├── backend/                 # Node.js backend
│   ├── controllers/         # portfolioController.js
│   ├── routes/              # portfolioRoutes.js
│   ├── config/              # db.js
│   ├── server.js
│   ├── package.json
│   └── README.md
│
└── README.md                # Root full-stack README
```

---

## Environment Variables

### Frontend `.env`

```env
REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com
```

⚠️ Every `REACT_APP_*` variable is compiled into the public JavaScript bundle. **Never put tokens or keys in the frontend** — GitHub data is fetched by the backend instead.

### Backend `.env`

```env
PORT=8080
DATABASE_URL=your_neon_postgres_url
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_SENDER_EMAIL=sender@example.com
SENDGRID_RECEIVER_EMAIL=receiver@example.com
# Optional: raises the GitHub API rate limit (a fine-grained token with public read access is enough)
GITHUB_TOKEN=your_github_token
# Optional but recommended: comma-separated origins allowed to call the API
CORS_ORIGIN=https://portfolio-nine-orcin-33.vercel.app,http://localhost:3000
```

⚠️ **Do not commit `.env` files to GitHub. Use `.gitignore`.**

---

## Setup & Run Locally

### Backend

```bash
cd backend
npm install
npm run dev   # or: npm start
```

Server will run at `http://localhost:8080` (or use the Render deployment URL).

### Frontend

```bash
cd client
npm install
npm start
```

For local development, point the frontend at the local API with a `client/.env.development.local` containing `REACT_APP_BACKEND_URL=http://localhost:8080`.

Frontend will run at `http://localhost:3000`

---

## Deployment

### Backend (Render)

* Push backend code to GitHub
* Connect the repo to [Render](https://render.com/)
* Set environment variables in Render dashboard
* Deploy service → URL accessible as `https://your-backend-url.onrender.com`

### Frontend (Vercel)

* Push frontend code to GitHub
* Connect repo to [Vercel](https://vercel.com/)
* Set environment variable `REACT_APP_BACKEND_URL` to your Render backend URL
* Deploy → live frontend at `https://portfolio-nine-orcin-33.vercel.app/`

---

## API Documentation

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

Validation: all fields required, valid email (max 150 chars), name max 100 chars, message max 5,000 chars. Rate limited to 5 messages per 15 minutes per IP (`429` when exceeded).

### GitHub Stats

**GET** `/api/v1/portfolio/github` — public repositories with commit counts, stars, language and last push, plus `totalCommits`. Fetched server-side and cached for 1 hour.

### LeetCode Stats

**GET** `/api/v1/portfolio/leetcode` — `totalSolved`, `acceptanceRate` and global `ranking`. Cached for 10 minutes.

Errors are always JSON (`{ "success": false, "message": "..." }`) and never include stack traces.

---

## Database

Messages are stored in `contacts` table (PostgreSQL):

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

## Author

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
