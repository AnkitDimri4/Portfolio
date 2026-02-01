
---

# Portfolio Backend

> #### This is the backend service for the **Portfolio** application.  It is built with **Node.js**, **Express**, and **PostgreSQL (Neon)**, and handles contact form submissions with **email notifications via Gmail SMTP**.

---

## Tech Stack

- **Node.js**
- **Express.js**
- **PostgreSQL (Neon)**
- **pg** – PostgreSQL client
- **Nodemailer** – Gmail SMTP email service
- **dotenv** – Environment variable management
- **cors** – Cross-Origin Resource Sharing

---

##  Features

- REST API for contact form submission
- Stores contact messages in PostgreSQL (Neon)
- Sends email notification on each submission
- Input validation and error handling
- Secure environment variable usage

---

## Folder Structure

```

backend/
│
├── controllers/
│   └── portfolioController.js
│
├── routes/
│   └── portfolioRoutes.js
│
├── config/
│   └── db.js
│
├── server.js
├── package.json
└── README.md

````

---

## Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=8080
DATABASE_URL=your_neon_postgres_url
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
````

⚠️ **Do not commit `.env` to GitHub**

---

## Run Backend Locally

```bash
cd server
npm install
node server.js
```

Server will start on:

```
http://localhost:8080
```

---

## API Endpoints

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

* Uses environment variables for secrets
* Prevents missing-field submissions
* Avoids exposing credentials in source code

---

##  Author

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