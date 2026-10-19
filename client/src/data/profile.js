// All site content lives here — edit this file to update the portfolio.
import { SiGithub, SiLeetcode, SiLinkedin } from "../components/brandIcons";
import { FiAward, FiCompass, FiCpu, FiLayers, FiMail, FiUser } from "react-icons/fi";

import { EXPERIENCE, duration, monthsAt, period, showType, tenure } from "./resume";

export const PROFILE = {
  name: "Ankit Dimri",
  role: "Software Engineer",
  location: "Dehradun, India",
  timezone: "Asia/Kolkata",
  email: "dimri.ankitdimri@gmail.com",
  whatsapp: "https://wa.me/919760763472",
  // Built by `npm run resume` into public/, so the address never changes (also served at /resume).
  resume: "/AnkitDimri_Resume.pdf",
  roles: ["iOS & Android apps", "Next.js web apps", "REST APIs", "cloud infrastructure", "CI/CD pipelines", "ML-powered products"],
  socials: [
    { label: "GitHub", href: "https://github.com/AnkitDimri4", handle: "@AnkitDimri4", icon: SiGithub },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/ankit-dimri-a6ab98263", handle: "in/ankit-dimri", icon: SiLinkedin },
    { label: "LeetCode", href: "https://leetcode.com/u/user4612MW/", handle: "user4612MW", icon: SiLeetcode },
  ],
};

// "Schedule a call": switched on with the contact details, in resume.js.
export { BOOKING } from "./resume";

// The resume builder (/resume-builder/): `enabled` shows its button in the hero and its footer link
// (the brain map links to it in its header). Visitors can build and preview a resume; getting the
// PDF by email is marked "coming soon" on the page until that step is live.
export const RESUME_BUILDER = { enabled: true, href: "/resume-builder/" };

export const NAV = [
  { id: "about", label: "About", icon: FiUser },
  { id: "work", label: "Work", icon: FiLayers },
  { id: "journey", label: "Journey", icon: FiCompass },
  { id: "stack", label: "Stack", icon: FiCpu },
  { id: "certificates", label: "Certificates", icon: FiAward },
  { id: "contact", label: "Contact", icon: FiMail },
];

const GH = "https://github.com/user-attachments/assets/";
const FILESURE = EXPERIENCE.find((job) => job.short === "FileSure");

export const PROJECTS = [
  {
    // A job, not a personal repo: its links replace Source/Live, and my contribution graph
    // from there replaces the demo.
    work: "FileSure",
    title: "FileSure",
    kind: "Work · iOS & Android · Web · Cloud",
    summary:
      "The company-data platform I worked on, first as an intern, then as a Software Engineer. I built its iOS and Android app from scratch in React Native (Expo), writing 92 of its first 100 commits, and shipped it to 1.0.13 with 80+ over-the-air updates. I also rebuilt screening for 3.8M companies so filters answer in seconds instead of timing out at 60 s, moved the backend from AWS to GCP, and ran 7 production releases in one week.",
    tech: ["React Native", "Expo", "Next.js", "Node.js", "Express", "MongoDB", "ClickHouse", "GCP", "AWS", "Cloudflare", "Jenkins"],
    links: FILESURE.links,
  },
  {
    // This site, in a full row after FileSure rather than with my own projects: its activity card
    // (Lighthouse on the live site, commits, merged pull requests, deployments, day by day and month by
    // month) replaces the demo.
    activity: true,
    repo: "Portfolio",
    title: "This Portfolio",
    short: "Portfolio",
    kind: "Full Stack · My site",
    summary:
      "The site you're on. Pre-rendered React with a hand-built design system, on a Node/Express API with Neon PostgreSQL. It has a one-page resume builder (three templates, an ATS check, the PDF by email, and Google sign-in with drafts on any device), cached live GitHub & LeetCode stats, and Google Meet calls booked straight into Google Calendar.",
    tech: ["React", "Vite", "Node.js", "Express", "PostgreSQL", "Google Calendar API", "Gmail API", "Puppeteer", "Resend", "Canvas"],
    github: "https://github.com/AnkitDimri4/Portfolio",
  },
  {
    repo: "RN-WALLET",
    title: "RN-Wallet",
    short: "RN-Wallet",
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
    short: "Todo",
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
    short: "QuickCart",
    kind: "Full Stack · E-commerce",
    summary:
      "A full MERN storefront: product catalogue, cart and checkout with Stripe payments, JWT authentication, Redux state management and Cloudinary-hosted media.",
    tech: ["React", "Redux", "Node.js", "Express", "MongoDB", "JWT", "Stripe", "Cloudinary"],
    image: `${GH}2eefd77e-6808-472b-85be-f4e43edf3b20`,
    github: "https://github.com/AnkitDimri4/quickcart-mern",
  },
];

// Repos shown first in "More on GitHub" (others fill in by most recent push).
export const PINNED_REPOS = ["Machine_Learning_Notes_and_Projects", "DataScience_Project", "LeetCode2024-25DCC"];

// Work entries come from resume.js, so the timeline and the resume PDF never disagree.
// GitHub work the live count can't see: contributions on employers' accounts, in private repos.
export const WORK_CONTRIBUTIONS = EXPERIENCE.filter((job) => job.github).map((job) => ({
  org: job.short ?? job.org,
  count: job.github.contributions,
}));

/** Live public-repo commits plus the work contributions above; null while the live count is unknown. */
export const allContributions = (publicCommits) =>
  publicCommits == null ? null : WORK_CONTRIBUTIONS.reduce((sum, w) => sum + w.count, publicCommits);

// Years of experience: every month at an employer counted once, rounded down to a half year
// (44 months → 3.5), with each employer's share, oldest first.
const MONTHS_WORKED = new Set(EXPERIENCE.flatMap(monthsAt)).size;
export const EXPERIENCE_YEARS = {
  years: Math.floor((MONTHS_WORKED / 12) * 2) / 2,
  employers: EXPERIENCE.map((job) => ({
    org: job.short ?? job.org,
    months: monthsAt(job).length,
    text: duration(monthsAt(job).length),
  })).reverse(),
};

const WORK = EXPERIENCE.map((job) => ({
  period: tenure(job).replace(" – ", " — "),
  tag: "Work",
  title: job.roles[0].title,
  org: [job.org, job.location, ...(showType(job.roles[0]) ? [job.roles[0].type] : [])].join(" · "),
  // A promotion shows each role with its own points, newest first; one role just lists its points.
  roles:
    job.roles.length > 1
      ? job.roles.map((r) => ({ title: r.title, period: period(r), summary: r.summary, highlights: r.highlights, points: r.points }))
      : [],
  links: job.links ?? [],
  skills: job.skills ?? [],
  points: job.roles.length > 1 ? [] : job.roles[0].points,
}));

export const JOURNEY = [
  ...WORK,
  // Self-learning before the jobs above: each ends in Jan 2026, newest start first.
  {
    period: "2023 — Jan 2026",
    tag: "ML",
    title: "Applied Machine Learning & Data Science",
    org: "Project-based · GitHub-driven",
    points: [
      "Python, NumPy, Pandas, scikit-learn, TensorFlow & Keras — preprocessing, feature engineering, training, evaluation and visualisation.",
      "Shipped ML inside products, e.g. RN-Wallet's FastAPI service for NLP-based transaction categorisation.",
    ],
  },
  {
    period: "2021 — Jan 2026",
    tag: "Build",
    title: "Full Stack Web & React Native Development",
    org: "Self-taught · Courses · Internships",
    points: [
      "Built and deployed web and mobile apps with React, React Native, Node.js, Express, MongoDB and PostgreSQL.",
      "Designed REST APIs, secure authentication flows and navigation, with a focus on maintainable, scalable code.",
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

// Every certificate image, as { "../assets/img/certs/<file>.webp": url }
const CERT_IMAGES = import.meta.glob("../assets/img/certs/*.webp", { eager: true, import: "default" });

const certImage = (file) => {
  const url = CERT_IMAGES[`../assets/img/certs/${file}.webp`];
  if (!url) throw new Error(`Missing certificate image: assets/img/certs/${file}.webp`);
  return url;
};

const cert = (slug, title, issuer, date) => ({
  slug,
  title,
  issuer,
  date,
  thumb: certImage(`${slug}-thumb`),
  full: certImage(slug),
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
