import "./Certification.css";
import certification7 from "../../assets/images/Certificate/Certi.png";
import certification8 from "../../assets/images/Certificate/DS.png";
import certification2 from "../../assets/images/Certificate/RN.png";
import certification3 from "../../assets/images/Certificate/DSAwithC++.png";
import certification4 from "../../assets/images/Certificate/MERN.png";
import certification5 from "../../assets/images/Certificate/ML.png";
import certification6 from "../../assets/images/Certificate/Python.png";
import certification1 from "../../assets/images/Certificate/HRPythonBasic.png";
import certification from "../../assets/images/Certificate/www.freecodecamp.org_certification_Ankitdimri_responsive-web-design.png";

import Tilt from 'react-parallax-tilt';
import { GiCompass } from "react-icons/gi";
import { FaCompassDrafting } from "react-icons/fa6";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const Certification = () => {
    const certificates = [
        certification, certification1, certification2, certification3,
        certification4, certification5, certification6, certification7, certification8
    ];
    const [index, setIndex] = useState(0);

    // Auto slide every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % certificates.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [certificates.length]);

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="certif-container"
            id="certif"
        >
            <div className="certif-left">
                <div className="certif-text-container">
                    <div className="certif-headings">
                        <div className="certif-heading">
                            <FaCompassDrafting />Certifications &  
                            <span style={{ color: '#580d17ff' }}>
                                &ensp;Skills!!<GiCompass />
                            </span>
                        </div>
                    </div>
                    <div className="certif-para">
                        <span>
                            Certified in MERN Stack, Machine Learning, React Native, Data Science, DSA with C++, DSA with Python, ReactJS, Python, and Competitive Programming. Also completed 300+ hours on FreeCodeCamp and earned a Python (Basic) certificate from HackerRank.
                        </span>
                    </div>
                </div>

                <div className="certif-cards-container">
                    <div className="certif-cards">
                        <span className="certif-card-text">
                            300+ Hours FreeCodeCamp + HackerRank Certified
                        </span>
                    </div>

                    <div className="certif-cards">
                        <span className="certif-card-text">
                           Ready for professional development roles
                        </span>
                    </div>
                </div>
            </div>

            <div className="certif-right">
                <div className="certif-image-container">
                    <Tilt
                        className="parallax-effect-img"
                        tiltMaxAngleX={40}
                        tiltMaxAngleY={40}
                        perspective={1000}
                        transitionSpeed={1500}
                        scale={1.1}
                        gyroscope={false}
                    >
                        <div className="slider-wrapper">
                            <img
                                src={certificates[index]}
                                className="inner-element fade-slide"
                                alt="Certificate"
                            />
                        </div>
                    </Tilt>
                </div>
            </div>
        </motion.div>
    );
};

export default Certification;
