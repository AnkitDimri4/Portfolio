import React from "react";
import "./WorkExp.css";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { SiCreatereactapp } from "react-icons/si";
const WorkExp = () => {
  return (
    <>
      <div className="work" id="workexp">
        <div className="work-exp">
          <h2 className="col-12 mt-4 mb-4 text-center text-uppercase">
            Work Experience
          </h2>
          <hr />
          <div className="mt-4 mb-4">
            <VerticalTimeline lineColor="#cacad5">
              <VerticalTimelineElement
                className="vertical-timeline-element--work"
                contentStyle={{ background: "white", color: "#131353" }}
                contentArrowStyle={{ borderRight: "7px solid white" }}
                position="left"
                date="Feb 2023 - Present"
                iconStyle={{ background: "#3b3d46", color: "#a08989" }}
                icon={<SiCreatereactapp />}
              >
                <h3 className="vertical-timeline-element-title">
                  Technical Mentor – Full Stack, React Native & AI/ML
                </h3>
                <h4 className="vertical-timeline-element-subtitle">
                  Tutedude · Remote
                </h4>

                <p>
                  Mentored 5,000+ students across MERN Stack, Data Structures &
                  Algorithms (C++ & Python), Machine Learning, Data Science,
                  React Native & CP.
                </p>

                <p>
                  Guided students in building production-ready full-stack and
                  ML-based applications, reviewed assignments, resolved complex
                  technical queries, and provided structured career-oriented
                  mentorship.
                </p>

                <p>
                  Designed and supervised hands-on Machine Learning projects
                  using real-world datasets. Led a comprehensive Data Science
                  project on Employee Performance & Retention Analysis,
                  alongside advanced ML case studies such as
                  <strong className="p-1">
                    Food Delivery Time Prediction, Global Pollution Analysis &
                    Energy Recovery, and Deforestation Analysis using SVM.
                  </strong>
                  Focused on end-to-end workflows, including data preprocessing,
                  feature engineering, model development, performance
                  evaluation, and scalable deployment.
                </p>
              </VerticalTimelineElement>
            </VerticalTimeline>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkExp;
