import React, { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineMenuFold } from "react-icons/ai";
import { FcHome, FcAbout, FcBriefcase, FcGenealogy, FcReadingEbook, FcEngineering, FcVoicePresentation, FcContacts } from "react-icons/fc";
import { Link } from 'react-scroll';
import './TabletNav.css';

const TabletNav = () => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(!open);
    }

    const handleMenuClick = () => {
        setOpen(false);
    }

    return (
        <>
            <div className="tablet-nav">
                <div className="tablet-nav-header">
                    {open ? (<AiOutlineMenuFold size={30} className="tablet-nav-icon" onClick={handleOpen} />) : (<GiHamburgerMenu size={30} className="tablet-nav-icon" onClick={handleOpen} />)}
                    <span className="tablet-nav-title">My Portfolio App</span>
                </div>
                {open && (
                    <div className="tablet-nav-menu">
                        <div className="nav-items">
                            <div className="nav-item">
                                <div className="nav-link"><Link to="home" spy={true} smooth={true} offset={-100} duration={100} onClick={handleMenuClick}><FcHome className='h' />Home</Link></div>
                            </div>
                            <div className="nav-item">
                                <div className="nav-link"><Link to="about" spy={true} smooth={true} offset={-100} duration={100} onClick={handleMenuClick}><FcAbout className='h' />About</Link></div>
                            </div>
                            <div className="nav-item">
                                <div className="nav-link"><Link to="education" spy={true} smooth={true} offset={-100} duration={100} onClick={handleMenuClick}><FcReadingEbook className='h' />Education</Link></div>
                            </div>
                            <div className='nav-item'>
                            <div className='nav-link'><Link to="techstack" spy={true} smooth={true} offset={-100} duration={100} onClick={handleMenuClick}><FcGenealogy className='h' />Tech Stack</Link></div>
                            </div>
                            <div className='nav-item'>
                            <div className='nav-link'><Link to="projects" spy={true} smooth={true} offset={-100} duration={100} onClick={handleMenuClick}><FcEngineering className='h' />Projects</Link></div>
                            </div>
                            <div className='nav-item'>
                            <div className='nav-link'><Link to="workexp" spy={true} smooth={true} offset={-100} duration={100} onClick={handleMenuClick}><FcBriefcase className='h' />Work Experience</Link></div>
                            </div>
                            <div className='nav-item'>
                            <div className='nav-link'><Link to="certif" spy={true} smooth={true} offset={-100} duration={100} onClick={handleMenuClick}><FcVoicePresentation className='h' />Testimonial</Link></div>
                            </div>
                            <div className='nav-item'>
                            <div className='nav-link'><Link to="contact" spy={true} smooth={true} offset={-100} duration={100} onClick={handleMenuClick}><FcContacts className='h' />Contact</Link></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default TabletNav;
