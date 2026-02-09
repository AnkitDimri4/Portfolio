
---

# Portfolio Frontend

> This is the **React frontend** for the personal portfolio application.  
> It consumes the backend API for contact form submissions (powered by SendGrid) and dynamically displays projects, certificates, and work experience.

**Live Demo:** [https://portfolio-nine-orcin-33.vercel.app/](https://portfolio-nine-orcin-33.vercel.app/)

https://github.com/user-attachments/assets/1ea69af4-9503-41a1-ad9b-612c1a9c6e28


---

## Features

- Responsive UI for Desktop, Tablet, and Mobile
- Home, About, Welcome, Education, Work Experience, Projects, Certificates, and Contact sections
- Techstack showcase
- GitHub projects fetched dynamically via GitHub API
- Uses **SendGrid** via backend API for sending contact form emails
-  Contact form with real-time validation
- Dark/Light theme toggle using `ThemeContext`

---

## Tech Stack

- **Frontend:** React, React Router, Context API  
- **Styling:** CSS (responsive layout), Bootstrap  
- **Utilities:** Custom hooks, reusable components  
- **Notifications:** `react-toastify` for form alerts  
- **Deployment:** Vercel  

---

## Folder Structure

```

frontend(client)/
│
├── public/                  # Static assets: images, favicon
├── src/
│   ├── assets/              # Images, resume
│   ├── components/          # Layout, Menu, MobileNav, TabletNav, reusable components
│   ├── context/             # ThemeContext for dark/light mode
│   ├── pages/               # About, Certificates, Contact, Educations, Home, Projects, Techstack, Welcome, WorkExp
│   ├── utils/               # techstackList.js and helper utilities
│   ├── App.js               # Main App component
│   ├── index.js             # React entry point
│   └── index.css            # Global styling
├── package.json
├── package-lock.json
└── README.md

````

---

## Setup & Installation

1. **Clone the repo**
```bash
git clone https://github.com/AnkitDimri4/Portfolio.git
cd Portfolio/frontend
````

2. **Install dependencies**

```bash
npm install
```

3. **Create `.env` file in `frontend/`**

```env
REACT_APP_GITHUB_TOKEN=your_github_token
REACT_APP_BACKEND_URL=http://localhost:8080
```

4. **Run the development server**

```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) to view the frontend locally.

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
