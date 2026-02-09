import { useState } from "react";
import "./MLVideoCarousel.css"
// import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import {FcPrevious, FcNext } from 'react-icons/fc';

const MLVideoCarousel = ({ videos }) => {
  const [current, setCurrent] = useState(0);

  const handleNext = () => setCurrent((prev) => (prev + 1) % videos.length);
  const handlePrev = () =>
    setCurrent((prev) => (prev - 1 + videos.length) % videos.length);

  return (
    <div className="ml-video-carousel">
      <video key={current} src={videos[current]} controls className="w-100" />
      <div className="d-flex justify-content-center mt-2">
        <button onClick={handlePrev} className="btn btn-sm me-2 carousel-btn mr-3 mb-2">
          <FcPrevious size={18} />
        </button>
        <button onClick={handleNext} className="btn btn-sm carousel-btn mb-2">
          <FcNext  size={18} />
        </button>
      </div>
    </div>
  );
};

export default MLVideoCarousel;
