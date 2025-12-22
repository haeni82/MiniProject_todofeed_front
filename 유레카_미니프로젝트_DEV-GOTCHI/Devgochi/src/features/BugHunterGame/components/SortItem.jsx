import React from "react";
import CodeImage from "../images/code.png";
import BugImage from "../images/bug.png";

const SortItem = ({ data }) => {
  const imageSrc = data.type === "정상코드" ? CodeImage : BugImage;

  return (
    <img
      src={imageSrc}
      alt={data.type}
      style={{
        position: "absolute",
        left: `${data.x - 20}px`,
        top: `${data.y}px`,
        width: "40px",
        height: "40px",
        transition: "top 0.02s linear",
        imageRendering: "pixelated",
      }}
    />
  );
};

export default SortItem;
