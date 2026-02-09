import React from "react";
import "./Education.css";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { FaGraduationCap } from "react-icons/fa";
import { FcEngineering } from "react-icons/fc";
import "react-vertical-timeline-component/style.min.css";
import { MdSchool } from "react-icons/md";
import { motion } from "framer-motion";
import { Link } from "react-scroll";

const Education = () => {
  return (
    <motion.div
      className="education"
      id="education"
      initial={{ scale: 0.9, opacity: 0, x: 60 }}
      whileInView={{ scale: 1, opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="col-12 mt-4 mb-4 text-center text-uppercase">
        Education & Learning Journey
      </h2>
      <hr />

      <div className="mt-4 mb-4">
        <VerticalTimeline lineColor="#50505d">
          {/* ===== Formal Education ===== */}
          <VerticalTimelineElement
            position="right"
            contentStyle={{ background: "white", color: "black" }}
            contentArrowStyle={{ borderRight: "7px solid white" }}
            iconStyle={{ background: "#138781", color: "#fff" }}
            icon={<MdSchool />}
          >
            <h5 className="vertical-timeline-element-title1 mb-2">
              Bachelor of Arts
            </h5>
            <h6>Dehradun, India</h6>
          </VerticalTimelineElement>

          {/* ===== Full Stack Development ===== */}
          <VerticalTimelineElement
            position="left"
            contentStyle={{ background: "white", color: "black" }}
            contentArrowStyle={{ borderRight: "7px solid white" }}
            date="2021 – Present"
            iconStyle={{ background: "#138781", color: "#fff" }}
            icon={<MdSchool />}
          >
            <h3 className="vertical-timeline-element-title mb-3">
              Full Stack Web & React Native Development
            </h3>

            <h5 className="vertical-timeline-element-subtitle mt-2">
              Self-Taught · Online Courses · Internship-Driven Learning
            </h5>

            <p>
              Built a strong foundation in full-stack development through
              structured self-learning, professional certifications, and
              hands-on internship experience. Developed production-ready web and
              mobile applications using React, React Native, Node.js, Express,
              MongoDB, PostgreSQL, and modern authentication systems.
            </p>

            <p>
              Designed RESTful APIs, implemented secure authentication flows,
              managed client-side routing and navigation, and deployed
              applications with a focus on scalability, maintainability, and
              real-world usage.
            </p>

            <p className="edu-links">
              <strong>Explore:</strong>{" "}
              <Link
                to="certif"
                spy={true}
                smooth={true}
                offset={-100}
                duration={100}
                className="edu-link"
              >
                <FaGraduationCap size={25} color="black" />
              </Link>
            </p>
          </VerticalTimelineElement>

          {/* ===== Machine Learning & Data Science ===== */}
          <VerticalTimelineElement
            position="right"
            contentStyle={{ background: "white", color: "black" }}
            contentArrowStyle={{ borderRight: "7px solid white" }}
            date="Present"
            iconStyle={{ background: "#138781", color: "#fff" }}
            icon={<MdSchool />}
          >
            <h3 className="vertical-timeline-element-title mb-3">
              Applied Machine Learning, Data Science & Product Development
            </h3>

            <h5 className="vertical-timeline-element-subtitle mt-2">
              Project-Based Learning · GitHub-Driven Development
            </h5>

            <p>
              Advanced hands-on experience in Machine Learning and Data Science
              using Python, NumPy, Pandas, Scikit-learn, TensorFlow, and Keras,
              with focus on data preprocessing, feature engineering, model
              training, evaluation, and visualization through real-world,
              problem-driven projects.
            </p>

            <p>
              Applied ML systems within full-stack and React Native
              applications. Notable work includes RN-WALLET, a production-ready
              expense tracker with a Node.js + Express backend, PostgreSQL
              (Neon), Clerk authentication, Redis rate limiting, and a
              FastAPI-based ML microservice for automatic transaction
              categorization.
            </p>

            <p className="edu-links">
              <strong>Key Work:</strong>{" "}
              <Link
                to="projects"
                spy={true}
                smooth={true}
                offset={-100}
                duration={100}
                className="edu-link"
              >
                <FcEngineering size={25} />
                ML microservice architecture · RESTful API integration · Backend
                deployment on Render · NLP-based category prediction · Custom
                financial analytics dashboard · End-to-end full-stack + ML
                system integration
              </Link>
            </p>
          </VerticalTimelineElement>
        </VerticalTimeline>
      </div>
    </motion.div>
  );
};

export default Education;
