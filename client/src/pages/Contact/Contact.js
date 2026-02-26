import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "./Contact.css";
import { motion } from "framer-motion";
import {  BsGithub, BsLinkedin } from "react-icons/bs";
import { SiLeetcode } from "react-icons/si";
import { SiGmail } from "react-icons/si";
import "react-toastify/dist/ReactToastify.css";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Contact = () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const [name, setname] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!name || !email || !msg) {
        return toast.error("Please provide all fields");
      }

      const res = await axios.post(
        `${BACKEND_URL}/api/v1/portfolio/sendEmail`,
        { name, email, msg },
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setname("");
        setEmail("");
        setMsg("");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <div className="contact" id="contact">
        <div className="card card0 border-0">
          <div className="row">
            {/* Left Image (LightSpeed replacement) */}
            <div className="col-md-6 col-lg-6 col-xl-6 col-sm-12">
              <div className="card1">
                <div className="row border-line">
                  {/* <motion.img
                    src="https://img.freepik.com/free-photo/hot-line-contact-us-call-center-search-interface_53876-124009.jpg?w=2000"
                    alt="contact"
                    className="image"
                    initial={{ x: -120, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  /> */}
                  <DotLottieReact
                    src="https://lottie.host/0013fd71-5b14-4e80-a52a-57376c661363/BVOz5EovdF.json"
                    loop
                    autoplay
                  />
                </div>
              </div>
            </div>

            {/* Right Form (Rotate replacement) */}
            <div className="col-md-6 col-lg-6">
              <motion.div
                className="card2 d-flex card border-0 px-4 py-5"
                initial={{ rotateY: 90, opacity: 0 }}
                whileInView={{ rotateY: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="row">
                  <div className="col-md-12 mb-2">
                    <h6 className="contact-icons d-flex align-items-center gap-3">
                      <span>Contact With</span>

                      <a
                        href="https://www.linkedin.com/in/ankit-dimri-a6ab98263"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <BsLinkedin
                          className="iconD linkedin"
                          color="#0a66c2"
                        />
                      </a>

                      <a
                        href="https://github.com/AnkitDimri4"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <BsGithub className="iconD github" color="#000" />
                      </a>
                      <a
                        href="https://leetcode.com/u/user4612MW/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <SiLeetcode
                          className="iconD leetcode"
                          color="#FFA116"
                        />
                      </a>

                      <a href="mailto:dimri.ankitdimri@gmail.com">
                        <SiGmail className="iconD" color="#FFA116" />
                      </a>
                    </h6>
                  </div>

                  <div className="row px-3 fix">
                    <div className="col-md-12 mb-4 d-flex align-items-center justify-content-center">
                      <div className="line"></div>
                      <h6 className="or text-center mx-3">OR</h6>
                      <div className="line"></div>
                    </div>
                  </div>

                  <div className="col-md-12 px-3 mb-2">
                    <input
                      type="text"
                      placeholder="Enter your Name"
                      value={name}
                      onChange={(e) => setname(e.target.value)}
                    />
                  </div>

                  <div className="col-md-12 px-3 mb-2">
                    <input
                      type="email"
                      placeholder="Enter Your Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="col-md-12 px-3 mb-1">
                    <textarea
                      placeholder="Write your message"
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                    />
                  </div>

                  <div className="col-md-12 text-center mb-1">
                    <button className="button" onClick={handleSubmit}>
                      SEND MESSAGE
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;

