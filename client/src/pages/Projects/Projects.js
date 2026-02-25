import React, { useEffect, useState } from "react";
import MLVideoCarousel from "./MLVideoCarousel.jsx"
import "./Projects.css";
import { motion } from "framer-motion";
import { BsGithub } from "react-icons/bs";

/* ================== Animations ================== */

const headingVariants = {
  hidden: { rotateX: 90, opacity: 0 },
  visible: {
    rotateX: 0,
    opacity: 1,
    transition: { duration: 0.6 },
  },
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

/* ================== Unified Project List ================== */

const PROJECTS = [
  {
    key: "RN-WALLET",
    title: "RN-WALLET (Expense Tracker)",
    type: "Mobile App",
    image:
      "https://img.freepik.com/premium-vector/prompt-poster-commerce-online-banking-activities_82574-13581.jpg",
    tech: [ "React Native", "Expo", "Node.js", "Express", "PostgreSQL", "Neon", "Redis", "Python3", "FastAPI", "Scikit-learn", "Joblib", "Upstash", "Clerk Auth", "ML Integration", "Expense Tracker", "Wallet App", "Full Stack", "Web Service", "React Native Chart Kit", "React Native SVG Charts", "Mobile App"],

    github: "https://github.com/AnkitDimri4/RN-WALLET",
  },
  {
    key: "TODO-RN",
    title: "Todo App (Expo + Convex)",
    type: "Mobile App",
    image:"https://img.freepik.com/premium-vector/media-audit-with-people-doing-various-processes_82574-6336.jpg",
    tech: ["React Native","Expo","Convex","TypeScript","Mobile App","Full Stack","Async Storage","Expo Router","Real-time",
    ],
    github: "https://github.com/AnkitDimri4/TODO-RN",
  },
  {
    key: "Machine_Learning_Notes_and_Projects",
    title: "Machine Learning Projects",
    type: "ML Repository",
    image:"https://img.freepik.com/free-vector/artificial-intelligence-concept-illustration_114360-7000.jpg",
    tech: ["Python","NumPy","Pandas","Matplotlib","Seaborn","Scikit-learn","TensorFlow","Keras","Deep Learning","Neural Networks","Decision Trees","Support Vector Machines","Linear & Logistic Regression","Data Preprocessing",
    ],
    github:"https://github.com/AnkitDimri4/Machine_Learning_Notes_and_Projects",
  },
  {
    key: "DataScience_Project",
    title: "Data Science Projects",
    type: "ML Repository",
    image:"https://img.freepik.com/free-vector/data-science-concept-illustration_114360-864.jpg",
    tech: ["Python","NumPy","Pandas","Matplotlib","Data Science","Machine Learning","Deep Learning","Neural Networks","Jupyter Notebook","Image Recognition","Data Preprocessing","Visualization","Model Evaluation",
    ],
    github: "https://github.com/AnkitDimri4/DataScience_Project",
  },
  {
    key: "LeetCode2024-25DCC",
    title: "LeetCode Daily Coding Challenges",
    type: "DSA / Algorithms",
    image:"https://img.freepik.com/free-vector/algorithm-concept-illustration_114360-865.jpg",
    tech: ["Python","Java","C++","DSA","Algorithms","Problem Solving","Optimal Time/Space Complexity","Interview Prep",
    ],
    github: "https://leetcode.com/u/user4612MW/",
  },
  {
    key: "Portfolio",
    title: "Developer Portfolio",
    type: "Full Stack",
    image:"https://img.freepik.com/free-vector/portfolio-concept-illustration_114360-126.jpg",
    tech: ["React","Node.js","Express","PostgreSQL","Neon","PG","Nodemailer","Server-side Validation","Gmail SMTP","Full Stack","Responsive UI",
    ],
    github: "https://github.com/AnkitDimri4/Portfolio",
  },
  {
    key: "quickcart-mern",
    title: "QuickCart MERN Ecommerce",
    type: "Full Stack-Ecom",
    image: "https://github.com/user-attachments/assets/93a15a4a-7357-465a-a9e7-332493bd0002",
    tech: ["React","Node.js","Express","MongoDB","Redux","JWT Authentication","Stripe Payments","Cloudinary Integration","Responsive UI",
    ],
    github: "https://github.com/AnkitDimri4/quickcart-mern",
  },
];

/* ================== Helpers ================== */

const fetchCommitCount = async (username, repo) => {
  const res = await fetch(
    `https://api.github.com/repos/${username}/${repo}/commits?per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
      },
    },
  );
  const link = res.headers.get("link");
  if (!link) return 1;
  const match = link.match(/page=(\d+)>; rel="last"/);
  return match ? parseInt(match[1], 10) : 1;
};

/* ================== Component ================== */

const Projects = () => {
  const [githubProjects, setGithubProjects] = useState([]);

  const staticProjects = PROJECTS.filter((p) =>
    ["Mobile App", "Full Stack", "Full Stack-Ecom"].includes(p.type)
  );

  useEffect(() => {
    const loadGithubProjects = async () => {
      const res = await fetch(
        "https://api.github.com/users/AnkitDimri4/repos",
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
          },
        },
      );

      const data = await res.json();

      const repoNames = PROJECTS.map((p) => p.key);

      const selected = data.filter((repo) => repoNames.includes(repo.name));

      const enriched = await Promise.all(
        selected.map(async (repo) => {
          const meta = PROJECTS.find((p) => p.key === repo.name);
          const commits = await fetchCommitCount("AnkitDimri4", repo.name);

          return {
            ...repo,
            commits,
            title: meta.title,
            tech: meta.tech,
          };
        }),
      );

      setGithubProjects(enriched);
    };

    loadGithubProjects();
  }, []);

  return (
    <div className="container project" id="projects">
      {/* ===== Static Projects ===== */}
      <motion.div
        variants={headingVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2 className="text-center text-uppercase">Top Recent Projects</h2>
        <hr />
        <p className="pb-3 text-center  ml-4">
          👉 My featured projects with live source code and GitHub integration.
        </p>
      </motion.div>
      <motion.div className="row" variants={gridVariants} id="ads">
        {staticProjects.map((p, i) => (
          <motion.div key={i} className="col-md-4 mb-4" variants={cardVariants}>
            <div className="card rounded">
              <div className="card-image">
                <span id="card-notify-badge">{p.type}</span>
                {/* <img src={p.image} alt={p.title} /> */}
                {/* RN-WALLET and TODO-RN use single video */}
                {i === 0 ? (
                  // RN-WALLET - 3 video carousel
                  <MLVideoCarousel
                    videos={[
                      "https://github.com/user-attachments/assets/62a3e6ea-94c2-4926-b9bd-27649c6360b8",
                      "https://github.com/user-attachments/assets/a498f09c-a84a-4cfe-af4f-e101835fdd42",
                      "https://github.com/user-attachments/assets/5fa62d59-626b-4da3-b589-7df8360c5937",
                    ]}
                  />
                ) : i === 1 ? (
                  // Todo App - single video
                  <video
                    src="https://github.com/user-attachments/assets/3065c555-f74a-4c38-8546-bacc5c37c95a"
                    controls
                    className="w-100"
                  />
                ) : i === 2 ? (
                  // Developer Portfolio - single video
                  <video
                    src="https://github.com/user-attachments/assets/6688385e-51c2-48a7-b90c-5eef543272c2"
                    controls
                    className="w-100"
                  />
                ) : (
                  // fallback for other projects
                  <img src={p.image} alt={p.title} />
                )}
              </div>

              <div className="card-image-overly m-auto mt-3">
                {p.tech.map((t, j) => (
                  <span key={j} className="card-detail-badge">
                    {t}
                  </span>
                ))}
              </div>

              <div className="card-body text-center">
                <h6>{p.title}</h6>
                <a
                  className="ad-btn"
                  href={p.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  View
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ===== Live GitHub ===== */}
      <h2 className="text-center mt-20 mb-4">
        <BsGithub className="mr-2" size={45} /> Live GitHub Projects
      </h2>

      <hr />

      <motion.div className="row mt-4" variants={gridVariants}>
        {githubProjects.map((repo) => (
          <motion.div
            key={repo.id}
            className="col-md-4 mb-4"
            variants={cardVariants}
          >
            <div className="card p-3 h-80 text-center ml-3 mt-2">
              <h3>{repo.title}</h3>
              <hr />
              <h6>{repo.description}</h6>

              <div className="card-image-overly mb-2">
                {repo.tech.map((t, i) => (
                  <span key={i} className="card-detail-badge">
                    {t}
                  </span>
                ))}
              </div>

              <p>
                ⭐ {repo.stargazers_count} | 🧾 {repo.commits}
              </p>

              <a
                className="ad-btn"
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
              >
                <BsGithub /> GitHub
              </a>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Projects;




