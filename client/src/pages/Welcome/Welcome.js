import React from 'react'
import './Welcome.css';
import img6 from "../../assets/images/About/layer_61.png";
const Welcome = () => {
  return (
    <>
    <div className="parallax">
        <div className="parallax__layer parallax__layer__6">
          <img src={img6} alt="layer61" />
        </div>
        <div className="parallax__cover"></div>
      </div>
    </>
  )
}

export default Welcome;