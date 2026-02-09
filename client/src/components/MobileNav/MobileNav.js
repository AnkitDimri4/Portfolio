import React, { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineMenuFold } from "react-icons/ai";
import "./MobileNav.css";
import { FaGraduationCap } from "react-icons/fa";
import {
  FcHome,
  FcAbout,
  FcBriefcase,
  FcGenealogy,
  FcReadingEbook,
  FcEngineering,
  FcContacts,
} from "react-icons/fc";
import { Link } from "react-scroll";

const MobileNav = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(!open);
  const handleMenuClick = () => setOpen(false);

  return (
    <div className="mobile-nav">
      <div className="mobile-nav-header">
        {open ? (
          <AiOutlineMenuFold
            size={28}
            className="mobile-nav-icon"
            onClick={handleOpen}
          />
        ) : (
          <GiHamburgerMenu
            size={28}
            className="mobile-nav-icon"
            onClick={handleOpen}
          />
        )}
      </div>

      {open && (
        <div className="mobile-nav-menu">
          <div className="nav-grid">
            <Link to="home" smooth offset={-100} duration={100} onClick={handleMenuClick}>
              <FcHome /> Home
            </Link>

            <Link to="about" smooth offset={-100} duration={100} onClick={handleMenuClick}>
              <FcAbout /> About
            </Link>

            <Link to="education" smooth offset={-100} duration={100} onClick={handleMenuClick}>
              <FcReadingEbook /> Education
            </Link>

            <Link to="techstack" smooth offset={-100} duration={100} onClick={handleMenuClick}>
              <FcGenealogy /> Tech Stack
            </Link>

            <Link to="projects" smooth offset={-100} duration={100} onClick={handleMenuClick}>
              <FcEngineering /> Projects
            </Link>

            <Link to="workexp" smooth offset={-100} duration={100} onClick={handleMenuClick}>
              <FcBriefcase /> Work Experience
            </Link>

            <Link to="certif" smooth offset={-100} duration={100} onClick={handleMenuClick}>
              <FaGraduationCap /> Certificates
            </Link>

            <Link to="contact" smooth offset={-100} duration={100} onClick={handleMenuClick}>
              <FcContacts /> Contact
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNav;
