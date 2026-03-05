import React from "react";

const Footer = ({ changeFooter }) => {
  let d = new Date();
  return (
    <div className={`footer ${changeFooter}`}>
      <div className="copyright">
        <p>
          Copyright © Designed &amp; Developed by{" "}
          <a href="http://dexignlab.com/" target="_blank" rel="noreferrer">
            DexignLab
          </a>{" "}
          {d.getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Footer;
