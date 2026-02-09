import React, { useState, useEffect } from "react";
import "./App.css";
import { Triangle as Loader } from "react-loader-spinner";
import { Layout } from "./components/Layout/Layout";
import Certification from "./pages/Certificates/Certification";
import About from "./pages/About/About";
import Techstack from "./pages/Techstack/Techstack";
import Projects from "./pages/Projects/Projects";
import Education from "./pages/Educations/Education";
import WorkExp from "./pages/WorkExp/WorkExp";
import Contact from "./pages/Contact/Contact";
import ScrollToTop from "react-scroll-to-top";
import { useTheme } from "./context/ThemeContext";
import MobileNav from "./components/MobileNav/MobileNav";
import { ToastContainer } from "react-toastify";
import Welcome from "./pages/About/Welcome";

function App() {
  const [theme] = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    },5000); 
  }, []);

  return (
    <>
      <div>
        {loading ? (
          <div className="LoaderContainer">
            <Loader
              className="Loader"
              type="Triangle"
              color="black"
              height={100}
              width={100}
            />
          </div>
        ) : (
          <div id={theme} >
            <Welcome />
            <ToastContainer />
            <MobileNav />
            <Layout />
            <div className="container">
              <About />
              <Education />
              <Techstack />
              <Projects />
              <WorkExp />
              <Certification />
              <Contact />
            </div>
            
            <div className="footer pb-3 ms-3">
              <h4 className="text-center">
                Made with ❤️ AnkitDimri &copy; 2024
              </h4>
            </div>
            <ScrollToTop smooth />
          </div>
        )}
      </div>
    </>
  );
}

export default App;