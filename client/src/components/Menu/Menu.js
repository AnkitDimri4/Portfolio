import React from 'react'
import imgage from './profile_pic.png';
import './Menu.css';
import { useTheme } from "../../context/ThemeContext";
import { BsFillMoonStarsFill, BsFillSunFill } from "react-icons/bs";
import { FaGraduationCap } from "react-icons/fa";
import { FcHome, FcAbout, FcBriefcase, FcGenealogy, FcReadingEbook, FcEngineering, FcContacts } from "react-icons/fc";
import { Link } from 'react-scroll';
import Zoom from 'react-reveal/Zoom';
import Fade from 'react-reveal/Fade';
export const Menu = ({ toggle }) => {
    const [theme, setTheme] = useTheme();
  const handleTheme = () => {
    setTheme((prevState) => (prevState === "light" ? "dark" : "light"));
  };
  return (
    <>
      {toggle ? (
        <>
        <Zoom>
        <div className="navbar-profile-pic">
            <Link to="about" spy={true} smooth={true} offset={-100} duration={100} ><img src={imgage} alt="Frontend developer profile" /></Link>
          </div>
          <div className="theme-btn" onClick={handleTheme}>
          {theme === "light" ? (
            <BsFillMoonStarsFill size={20} />
          ) : (
            <BsFillSunFill size={20} />
          )}
        </div>
        </Zoom>
          <Fade bottom>
          <div className='nav-items'>
            <div className='nav-item'>
              <div className='nav-link'><Link to="home" spy={true} smooth={true} offset={-100} duration={100}  className="contact-link"><FcHome className='h' />Home</Link></div>
            </div>
            <div className='nav-item'>
              <div className='nav-link'><Link to="about" spy={true} smooth={true} offset={-100} duration={100}  className="contact-link"><FcAbout className='h' />About</Link></div>
            </div>
            <div className='nav-item'>
              <div className='nav-link'><Link to="education" spy={true} smooth={true} offset={-100} duration={100} className="contact-link"><FcReadingEbook className='h' />Education</Link></div>
            </div>
            <div className='nav-item'>
              <div className='nav-link'><Link to="techstack" spy={true} smooth={true} offset={-100} duration={100} className="contact-link"><FcGenealogy className='h' />Tech Stack</Link></div>
            </div>
            <div className='nav-item'>
              <div className='nav-link'><Link to="projects" spy={true} smooth={true} offset={-100} duration={100}  className="contact-link"><FcEngineering className='h' />Projects</Link></div>
            </div>
            <div className='nav-item'>
              <div className='nav-link'><Link to="workexp" spy={true} smooth={true} offset={-100} duration={100}  className="contact-link"><FcBriefcase className='h' />Work Exp</Link></div>
            </div>
            <div className='nav-item'>
              <div className='nav-link'><Link to="certif" spy={true} smooth={true} offset={-100} duration={100} className="contact-link"><FaGraduationCap className='h' />Certifications</Link></div>
            </div>
            <div className='nav-item'>
              <div className='nav-link'><Link to="contact" spy={true} smooth={true} offset={-100} duration={100} className="contact-link"><FcContacts className='h' />Contact</Link></div>
            </div>
          </div>
          </Fade>
        </>
      ) : (
        <>
        <Zoom>
        <p className="navbar-profile-pic1">
          <Link to="about" spy={true} smooth={true} offset={-100} duration={100} ><img src={imgage} alt="Frontend developer profile" /></Link>
        </p>
        <div className="theme-btn1" onClick={handleTheme}>
          {theme === "light" ? (
            <BsFillMoonStarsFill size={16} />
          ) : (
            <BsFillSunFill size={16} />
          )}
        </div>
        </Zoom>
          <Fade bottom>
            <div className='nav-items'>
            <div className='nav-item'>
              <div className='nav-link'><Link to="home" spy={true} smooth={true} offset={-100} duration={100} ><FcHome className='h' title='Home'/></Link></div>
            </div>
            <div className='nav-item'>
              <div className='nav-link'><Link to="about" spy={true} smooth={true} offset={-100} duration={100} ><FcAbout className='h' title='About'/></Link></div>
            </div>
            <div className='nav-item'>
              <div className='nav-link'><Link to="education" spy={true} smooth={true} offset={-100} duration={100} ><FcReadingEbook className='h' title='Education'/></Link></div>
            </div>
            <div className='nav-item'>
              <div className='nav-link'><Link to="techstack" spy={true} smooth={true} offset={-100} duration={100} ><FcGenealogy className='h' title='Tech Stack'/></Link></div>
            </div>
            <div className='nav-item'>
              <div className='nav-link'><Link to="projects" spy={true} smooth={true} offset={-100} duration={100} ><FcEngineering className='h' title='Project'/></Link></div>
            </div>
            <div className='nav-item'>
              <div className='nav-link'><Link to="workexp" spy={true} smooth={true} offset={-100} duration={100} ><FcBriefcase className='h' title='Work Experience'/></Link></div>
            </div>
            <div className='nav-item'>
              <div className='nav-link'><Link to="certif" spy={true} smooth={true} offset={-100} duration={100} ><FaGraduationCap className='h' title='Certifications'/></Link></div>
            </div>
            <div className='nav-item'>
              <div className='nav-link'><Link to="contact" spy={true} smooth={true} offset={-100} duration={100} ><FcContacts className='h' title='Contact'/></Link></div>
            </div>
          </div>
          </Fade>
        </>
      )}
    </>
  );
};