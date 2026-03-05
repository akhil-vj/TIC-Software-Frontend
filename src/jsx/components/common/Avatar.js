import React from "react";

const Avatar = ({ name, className = "", index = 0 }) => {
  const firstLetter = name ? name.charAt(0).toUpperCase() : "";
  // Generate a random background color
  // const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
  const colorMap = [
    "#6495ED",
    "#FF7F50",
    "#9FE2BF",
    "#3498db",
    "#e74c3c",
    "#27ae60",
  ];
  const sequence = index % colorMap.length;

  return (
    <div
      className={`${className}`}
      style={{ ...style, backgroundColor: colorMap[sequence] }}
    >
      {firstLetter}
    </div>
  );
};

export default Avatar;

const style = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  color: "white",
  fontSize: "28px",
  fontWeight: "500",
};
