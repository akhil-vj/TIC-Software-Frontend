import React, { useContext, useState } from "react";
/// React router dom
import { Link } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";
import { BRAND } from "../../../constants";

// export function NavMenuToggle() {
//   setTimeout(() => {
//     let mainwrapper = document.querySelector("#main-wrapper");
//     if (mainwrapper.classList.contains("menu-toggle")) {
//       mainwrapper.classList.remove("menu-toggle");
//     } else {
//       mainwrapper.classList.add("menu-toggle");
//     }
//   }, 200);
// }

const NavHader = () => {
  const [toggle, setToggle] = useState(false);
  const { navigationHader, openMenuToggle, background } =
    useContext(ThemeContext);
  function NavMenuToggle() {
      setTimeout(() => {
        let mainwrapper = document.querySelector("#main-wrapper");
        if (toggle) {
          mainwrapper.classList.remove("menu-toggle");
        } else {
          mainwrapper.classList.add("menu-toggle");
        }
      }, 200);
    }
  return (
    <div className="nav-header">
      <Link to="/dashboard" className="brand-logo" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0', textDecoration: 'none'}}>
        <img src="/tic_logo.png" alt="TIC Tours Logo" className="logo-abbr" style={{maxWidth: '100%', maxHeight: '50px', width: 'auto', height: 'auto'}} />
      </Link>

      <div
        className="nav-control"
        onClick={() => {
          setToggle((prev)=>!prev);
          openMenuToggle();
          NavMenuToggle();
          //SideBarOverlay();
        }}
      >
        <div className={`hamburger ${toggle ? "is-active" : ""}`}>
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
          <svg
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="22" y="11" width="4" height="4" rx="2" fill="#2A353A" />
            <rect x="11" width="4" height="4" rx="2" fill="#2A353A" />
            <rect x="22" width="4" height="4" rx="2" fill="#2A353A" />
            <rect x="11" y="11" width="4" height="4" rx="2" fill="#2A353A" />
            <rect x="11" y="22" width="4" height="4" rx="2" fill="#2A353A" />
            <rect width="4" height="4" rx="2" fill="#2A353A" />
            <rect y="11" width="4" height="4" rx="2" fill="#2A353A" />
            <rect x="22" y="22" width="4" height="4" rx="2" fill="#2A353A" />
            <rect y="22" width="4" height="4" rx="2" fill="#2A353A" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default NavHader;
