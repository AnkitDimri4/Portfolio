import React from "react";
import Typewriter from "typewriter-effect";
import "./Home.css";
import Resume from "../../assets/docs/resume.txt";
import Fade from "react-reveal/Fade";
// import { Link } from "react-scroll";
export const Home = () => {
  return (
    <>
      <div className="container-fluid home-container" id="home">
        <div className="container home-content">
          <Fade right>
            <h2>Hi 👋 I'm </h2>
            <h1>
              <Typewriter
                options={{
                  strings: [
                    "Ankit Dimri",
                    "MERN Stack Developer!",
                    "Full Stack Developer!",
                    "React Native Developer!",
                    "AI/ML Enthusiast!",
                    "Mobile App Developer!",
                    "Software Developer!",
                  ],
                  autoStart: true,
                  loop: true,
                }}
              />
            </h1>
          </Fade>
          <Fade bottom>
            <div className="home-buttons">
              <a
                className="btn btn-hire"
                href="https://api.whatsapp.com/send?phone=9760763472"
                rel="noreferrer"
                target="_blank"
              >
                Hire Me
              </a>
              {/* <Link to="contact" spy={true} smooth={true} offset={-100} duration={100} className="btn btn-hire">Hire Me</Link> */}
              <a className="btn btn-cv" href={Resume} download="../../assets/docs/AnkitDimri_Resume1.pdf">
                My Resume
              </a>
            </div>
          </Fade>
        </div>
      </div>
    </>
  );
};



