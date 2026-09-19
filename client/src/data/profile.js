// All site content lives here — edit this file to update the portfolio.
import { SiGithub, SiLeetcode, SiLinkedin } from "../components/brandIcons";
import { FiAward, FiCompass, FiCpu, FiLayers, FiMail, FiUser } from "react-icons/fi";

import resume from "../assets/docs/AnkitDimri_Resume1.pdf";

export const PROFILE = {
  name: "Ankit Dimri",
  role: "Full Stack Software Engineer",
  location: "Dehradun, India",
  timezone: "Asia/Kolkata",
  email: "dimri.ankitdimri@gmail.com",
  whatsapp: "https://wa.me/919760763472",
  resume,
  roles: ["MERN stack apps", "React Native apps", "ML-powered products", "REST APIs", "real-time systems"],
  socials: [
    { label: "GitHub", href: "https://github.com/AnkitDimri4", handle: "@AnkitDimri4", icon: SiGithub },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/ankit-dimri-a6ab98263", handle: "in/ankit-dimri", icon: SiLinkedin },
    { label: "LeetCode", href: "https://leetcode.com/u/user4612MW/", handle: "user4612MW", icon: SiLeetcode },
  ],
};

export const NAV = [
  { id: "about", label: "About", icon: FiUser },
  { id: "work", label: "Work", icon: FiLayers },
  { id: "journey", label: "Journey", icon: FiCompass },
  { id: "stack", label: "Stack", icon: FiCpu },
  { id: "certificates", label: "Certificates", icon: FiAward },
  { id: "contact", label: "Contact", icon: FiMail },
];

const GH = "https://github.com/user-attachments/assets/";

export const PROJECTS = [
  {
    repo: "RN-WALLET",
    title: "RN-Wallet",
    kind: "Mobile · Full Stack · ML",
    summary:
      "A production-ready expense tracker. React Native + Expo on the front, a Node/Express API on Neon PostgreSQL behind Clerk auth and Upstash Redis rate limiting — plus a FastAPI microservice that auto-categorises every transaction with machine learning.",
    tech: ["React Native", "Expo", "Node.js", "Express", "PostgreSQL", "Redis", "Clerk", "FastAPI", "scikit-learn", "Chart Kit"],
    videos: [
      { src: `${GH}62a3e6ea-94c2-4926-b9bd-27649c6360b8`, label: "Dashboard" },
      { src: `${GH}a498f09c-a84a-4cfe-af4f-e101835fdd42`, label: "Transactions" },
      { src: `${GH}5fa62d59-626b-4da3-b589-7df8360c5937`, label: "ML categories" },
    ],
    github: "https://github.com/AnkitDimri4/RN-WALLET",
  },
  {
    repo: "TODO-RN",
    title: "Todo — Expo × Convex",
    kind: "Mobile · Real-time",
    summary:
      "A real-time task app built with Expo Router and TypeScript on a Convex backend — edits sync instantly across devices, with themed UI and persistent local state.",
    tech: ["React Native", "Expo Router", "TypeScript", "Convex", "Async Storage"],
    videos: [{ src: `${GH}3065c555-f74a-4c38-8546-bacc5c37c95a`, label: "Demo" }],
    github: "https://github.com/AnkitDimri4/TODO-RN",
  },
  {
    repo: "quickcart-mern",
    title: "QuickCart",
    kind: "Full Stack · E-commerce",
    summary:
      "A full MERN storefront: product catalogue, cart and checkout with Stripe payments, JWT authentication, Redux state management and Cloudinary-hosted media.",
    tech: ["React", "Redux", "Node.js", "Express", "MongoDB", "JWT", "Stripe", "Cloudinary"],
    image: `${GH}2eefd77e-6808-472b-85be-f4e43edf3b20`,
    github: "https://github.com/AnkitDimri4/quickcart-mern",
  },
  {
    repo: "Portfolio",
    title: "This Portfolio",
    kind: "Full Stack",
    summary:
      "The site you're on. React front end with a hand-built design system, and a Node/Express API that stores messages in Neon PostgreSQL, sends SendGrid notifications and serves cached live GitHub & LeetCode stats.",
    tech: ["React", "Node.js", "Express", "PostgreSQL", "SendGrid", "Canvas"],
    videos: [{ src: `${GH}6688385e-51c2-48a7-b90c-5eef543272c2`, label: "Walkthrough" }],
    github: "https://github.com/AnkitDimri4/Portfolio",
  },
];

// Repos shown first in "More on GitHub" (others fill in by most recent push).
export const PINNED_REPOS = ["Machine_Learning_Notes_and_Projects", "DataScience_Project", "LeetCode2024-25DCC"];

export const JOURNEY = [
  {
    period: "Feb 2023 — Now",
    tag: "Work",
    title: "Technical Mentor — Full Stack, React Native & AI/ML",
    org: "Tutedude · Remote",
    points: [
      "Mentored 5,000+ students across the MERN stack, DSA in C++ & Python, machine learning, data science, React Native and competitive programming.",
      "Guided learners to ship production-ready full-stack and ML apps — reviewing code, unblocking complex bugs and giving career-focused feedback.",
      "Designed and supervised real-dataset ML projects: Employee Performance & Retention, Food Delivery Time Prediction, Global Pollution & Energy Recovery, and Deforestation Analysis with SVMs.",
    ],
  },
  {
    period: "2021 — Now",
    tag: "Build",
    title: "Full Stack Web & React Native Development",
    org: "Self-taught · Courses · Internships",
    points: [
      "Built and deployed web and mobile apps with React, React Native, Node.js, Express, MongoDB and PostgreSQL.",
      "Designed REST APIs, secure authentication flows and navigation, with a focus on maintainable, scalable code.",
    ],
  },
  {
    period: "Ongoing",
    tag: "ML",
    title: "Applied Machine Learning & Data Science",
    org: "Project-based · GitHub-driven",
    points: [
      "Python, NumPy, Pandas, scikit-learn, TensorFlow & Keras — preprocessing, feature engineering, training, evaluation and visualisation.",
      "Ships ML inside products, e.g. RN-Wallet's FastAPI service for NLP-based transaction categorisation.",
    ],
  },
  {
    period: "Degree",
    tag: "Education",
    title: "Bachelor of Arts",
    org: "Dehradun, India",
    points: [],
  },
];


const cert = (slug, title, issuer, date) => ({
  slug,
  title,
  issuer,
  date,
  thumb: require(`../assets/img/certs/${slug}-thumb.webp`),
  full: require(`../assets/img/certs/${slug}.webp`),
});

export const CERTIFICATES = [
  cert("mern", "MERN Stack Development", "Tutedude", "Mar 2025"),
  cert("data-science", "Data Science", "Tutedude", "Oct 2024"),
  cert("machine-learning", "Machine Learning", "Tutedude", "Aug 2024"),
  cert("react-native", "React Native", "Tutedude", "Aug 2024"),
  cert("dsa-cpp", "Data Structures & Algorithms", "Tutedude", "Aug 2024"),
  cert("hackerrank-python", "Python (Basic)", "HackerRank", "Aug 2024"),
  cert("freecodecamp", "Responsive Web Design · 300 hrs", "freeCodeCamp", "May 2024"),
  cert("python", "Python Programming", "Tutedude", "Feb 2023"),
  cert("cpp", "C++ Programming", "Tutedude", "Feb 2022"),
];
