import React from "react";
import "./About.css";
import image from "../../assets/images/About/1 (4).png";
import { motion } from "framer-motion";
import { BsGithub, BsLinkedin } from "react-icons/bs";
import { SiLeetcode } from "react-icons/si";
import { useGithubTotalCommits } from "./useGithubTotalCommits";
import { useLeetcodeStats } from "./useLeetcodeStats";

const About = () => {
  const commits = useGithubTotalCommits();
  const leetcode = useLeetcodeStats();

  return (
    <section className="about container" id="about">
      {/* ===== Top Section ===== */}
      <div className="row align-items-center">
        {/* Left: Image + Stats */}
        <motion.div
          className="col-lg-4 col-md-12 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }} 
        >
          <img src={image} alt="Ankit Dimri" className="about-avatar" />

          {/* Stats Cards */}
          <div className="stats-grid mt-4">
            <div className="stat-card">
              <h4>{commits !== null ? `${commits}` : "Loading..."}</h4>
              <p><BsGithub className="mr-1"/>GitHub Commits</p>
            </div>

            <div className="stat-card">
              <h4>{leetcode.totalSolved ? `${leetcode.totalSolved}` : "—"}</h4>
              <p>LeetCode Solved</p>
            </div>
            <div className="stat-card">
              <h4>{leetcode.acceptanceRate ?? "—"}%</h4>
              <p><SiLeetcode/>Acceptance</p>
            </div>
            <div className="stat-card">
              <h4>{leetcode.ranking ?? "—"}</h4>
              <p><SiLeetcode className="mr-1"/>Global Rank</p>
            </div>
            <div className="stat-card">
              <h4>3+ Years</h4>
              <p>Experience</p>
            </div>
            <div className="stat-card">
              <h5>5K+</h5>
              <p>Students Mentored</p>
            </div>
          </div>
          <div className="stats-grid mt-3 mb-2 d-flex justify-content-center">
            <div className="social-card">
              <a
                href="https://leetcode.com/u/user4612MW/"
                target="_blank"
                rel="noreferrer"
              >
                <SiLeetcode size={40} />
              </a>

              <a
                href="https://github.com/AnkitDimri4"
                target="_blank"
                rel="noreferrer"
              >
                <BsGithub size={40} />
              </a>

              <a
                href="https://www.linkedin.com/in/ankit-dimri-a6ab98263"
                target="_blank"
                rel="noreferrer"
              >
                <BsLinkedin size={40} />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Right: About Text */}
        <motion.div
          className="col-lg-8 col-md-12 about-content"
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1>About Me</h1>
          <p>
            Hi, I’m <strong>Ankit Dimri</strong>, a self-taught Full Stack
            Developer and Technical Mentor with{" "}
            <strong className="mr-1">3+ years of experience</strong>
            building and guiding real-world projects. I specialize in the
            <strong> MERN Stack, Python, and Data Science</strong>, with
            hands-on experience in{" "}
            <strong>Machine Learning, React Native</strong>, and
            <strong> DSA (C++ & Python)</strong>.
          </p>
          <p>
            I’ve professionally mentored <strong>5K+ students</strong>,
            helping them solve complex problems, build production-ready
            applications, and develop career-focused skills. I enjoy simplifying
            difficult concepts, designing scalable systems, and continuously
            improving my backend and deployment expertise.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
