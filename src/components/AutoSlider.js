import React, { useState, useEffect } from "react";
import "./AutoSlider.css";

const images = [
  'https://i.ibb.co/gLnKmMf2/1740071666614.jpg',
  'https://i.ibb.co/yFtPwhyR/1739551658608.png',
    'https://i.ibb.co/8LhBzXXm/imresizer-1739360154608.jpg',
    'https://i.ibb.co/9m7HDhQ9/1739282421936-1.jpg',
  'https://i.ibb.co/QFSRQTN6/1739202411400.jpg',
  "https://i.ibb.co/BHMqpK5x/1739107614640.jpg",
];

const AutoSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        let nextIndex = prevIndex + direction;

        if (nextIndex >= images.length) {
          setDirection(-1); // Reverse direction
          return prevIndex - 1;
        } else if (nextIndex < 0) {
          setDirection(1); // Forward again
          return prevIndex + 1;
        }

        return nextIndex;
      });
    }, 5000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div className="slider-container">
      <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} className="slider-image" />
    </div>
  );
};

export default AutoSlider;
