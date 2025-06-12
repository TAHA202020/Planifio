import React from "react";
import useOverflow from "./useOverFlow";

const SmartMarquee = ({ children, className = "", speed = 8 }) => {
  const { isOverflowing, containerRef } = useOverflow();

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap ${className}`}
      style={{ width: "100%" }}
    >
      <div
        className={`inline-block ${
          isOverflowing ? "marquee" : ""
        }`}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
    </div>
  );
};

export default SmartMarquee;