import React from "react";
import LeftDecoImage from "../images/code.png";
import RightDecoImage from "../images/bug.png";

const Decoration = ({ status }) => {
  if (status !== "PLAYING") return null;

  return (
    <>
      <img
        src={LeftDecoImage}
        alt="code"
        className="BodyLevelDeco left"
        style={{ width: "200px" }}
      />
      <img
        src={RightDecoImage}
        alt="bug"
        className="BodyLevelDeco right"
        style={{ width: "200px" }}
      />
    </>
  );
};

export default Decoration;
