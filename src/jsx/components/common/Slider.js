import React, { useState, useEffect } from "react";

export default function CustomSlider({
  array,
  slidesPerView = 4,
  maxSlidesPerView = 4,
  gap = "20px",
  breakpoints,
}) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getColumns = () => {
    const matchingBreakpoint = breakpoints?.find(
      (bp) => windowWidth <= bp.width
    );
    return matchingBreakpoint ? matchingBreakpoint.slides : slidesPerView;
  };
  const sliderStyle = {
    display: "grid",
    gridAutoRows: "100px",
    gridTemplateColumns: `repeat(auto-fit, minmax(calc((100% - ${gap} * ${
      getColumns() - 1
    }) / ${getColumns()}), 1fr))`,
    gap: `${gap}`,
  };

  return (
    <div className="custom-slider-container">
      <div className="custom-slider" style={sliderStyle}>
        {array.map((slide, key) => (
          <div className="custom-slide">
            <h5 className="slide-label">{slide.label}</h5>
            <h5 className="slide-value">{slide.value}</h5>
          </div>
        ))}
      </div>
    </div>
  );
}
