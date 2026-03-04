/// Menu
// import Metismenu from "metismenujs";
import React, { useReducer, useContext, useEffect, useState } from "react";
/// Scroll
import PerfectScrollbar from "react-perfect-scrollbar";
import { Collapse } from "react-bootstrap";
import { Link } from "react-router-dom";
import { MenuList } from "./Menu";
import { useScrollPosition } from "@n8tb1t/use-scroll-position";
import { ThemeContext } from "../../../context/ThemeContext";
import { useSelector } from "react-redux";

const reducer = (previousState, updatedState) => ({
  ...previousState,
  ...updatedState,
});

const initialState = {
  active: "",
  activeSubmenu: "",
};

const SideBar = () => {
  let d = new Date();
  const {
    iconHover,
    sidebarposition,
    headerposition,
    sidebarLayout,
    ChangeIconSidebar,
  } = useContext(ThemeContext);

  const [state, setState] = useReducer(reducer, initialState);

  useEffect(() => {
    var btn = document.querySelector(".nav-control");
    var aaa = document.querySelector("#main-wrapper");
    function toggleFunc() {
      return aaa.classList.toggle("menu-toggle");
    }
    btn.addEventListener("click", toggleFunc);
  }, []);

  let handleheartBlast = document.querySelector(".heart");
  function heartBlast() {
    return handleheartBlast.classList.toggle("heart-blast");
  }

  const [hideOnScroll, setHideOnScroll] = useState(true);
  useScrollPosition(
    ({ prevPos, currPos }) => {
      const isShow = currPos.y > prevPos.y;
      if (isShow !== hideOnScroll) setHideOnScroll(isShow);
    },
    [hideOnScroll],
  );

  const handleMenuActive = (status) => {
    setState({ active: status });
    if (state.active === status) {
      setState({ active: "" });
    }
  };
  const handleSubmenuActive = (status) => {
    setState({ activeSubmenu: status });
    if (state.activeSubmenu === status) {
      setState({ activeSubmenu: "" });
    }
  };
  /// Path
  let path = window.location.pathname;
  path = path.split("/");
  path = path[path.length - 1];
  /// Active menu

  const {userPermission} = useSelector((state)=> state)
  // console.log('userper',userPermission)
  const [visibleItems, setVisibleItems] = useState([]);
  useEffect(() => {
    // Filter sidebar items based on user's permissions
    // console.log('sidebar permis',userPermission)
    const filteredItems = MenuList.filter((item) =>
      userPermission.some((permission) => {
        const permissionSlug = permission.slug;
        // Find the index of the first occurrence of '-read-'
        const indexOfRead = permissionSlug.indexOf("-read-");
        if (indexOfRead === -1) return false;

        // Extract the substring before '-read-'
        const extractedPermission = permissionSlug.substring(0, indexOfRead)

       const specialMenu = item.title === 'Settings' 
       return extractedPermission === item.to || specialMenu;
      })
    );
    // console.log('sidebar filt',filteredItems)
    setVisibleItems(filteredItems);
  }, [userPermission]);

  return (
    <div
      onMouseEnter={() => ChangeIconSidebar(true)}
      onMouseLeave={() => ChangeIconSidebar(false)}
      className={`dlabnav ${iconHover} ${
        sidebarposition.value === "fixed" &&
        sidebarLayout.value === "horizontal" &&
        headerposition.value === "static"
          ? hideOnScroll > 120
            ? "fixed"
            : ""
          : ""
      }`}
    >
      <PerfectScrollbar className="dlabnav-scroll">
        <ul className="metismenu" id="menu">
          {visibleItems?.map((data, index) => {
            let menuClass = data.classsChange;
            if (menuClass === "menu-title") {
              return (
                <li className={menuClass} key={index}>
                  {data.title}
                </li>
              );
            } else {
              return (
                <li
                  className={` ${
                    state.active === data.title ? "mm-active" : ""
                  }`}
                  key={index}
                >
                  {data.content && data.content.length > 0 ? (
                    <>
                      <Link
                        to={"#"}
                        className="has-arrow"
                        onClick={() => {
                          handleMenuActive(data.title);
                        }}
                      >
                        {data.iconStyle}
                        <span className="nav-text">{data.title}</span>
                        <span className="ms-1 badge badge-xs style-1 badge-danger">
                          {data.update}
                        </span>
                      </Link>
                      <Collapse in={state.active === data.title ? true : false}>
                        <ul
                          className={`${
                            menuClass === "mm-collapse" ? "mm-show" : ""
                          }`}
                        >
                          {data.content &&
                            data.content.map((data, index) => {
                              return (
                                <li
                                  key={index}
                                  className={`${
                                    state.activeSubmenu === data.title
                                      ? "mm-active"
                                      : ""
                                  }`}
                                >
                                  {data.content && data.content.length > 0 ? (
                                    <>
                                      <Link
                                        to={data.to}
                                        className={
                                          data.hasMenu ? "has-arrow" : ""
                                        }
                                        onClick={() => {
                                          handleSubmenuActive(data.title);
                                        }}
                                      >
                                        {data.title}
                                      </Link>
                                      <Collapse
                                        in={
                                          state.activeSubmenu === data.title
                                            ? true
                                            : false
                                        }
                                      >
                                        <ul
                                          className={`${
                                            menuClass === "mm-collapse"
                                              ? "mm-show"
                                              : ""
                                          }`}
                                        >
                                          {data.content &&
                                            data.content.map((data, index) => {
                                              return (
                                                <li key={index}>
                                                  <Link
                                                    className={`${
                                                      path === data.to
                                                        ? "mm-active"
                                                        : ""
                                                    }`}
                                                    to={data.to}
                                                  >
                                                    {data.title}
                                                  </Link>
                                                </li>
                                              );
                                            })}
                                        </ul>
                                      </Collapse>
                                    </>
                                  ) : (
                                    <Link to={data.to}>{data.title}</Link>
                                  )}
                                </li>
                              );
                            })}
                        </ul>
                      </Collapse>
                    </>
                  ) : (
                    <Link to={data.to}>
                      {data.iconStyle}
                      <span className="nav-text">{data.title}</span>
                    </Link>
                  )}
                </li>
              );
            }
          })}
        </ul>

        {/* <div className="support-box">
                <div className="media"> 
                  <span>
                    <svg width="22" height="29" viewBox="0 0 22 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.74982 1.40323C2.74982 2.17821 2.13421 2.80645 1.37482 2.80645C0.615425 2.80645 -0.000183105 2.17821 -0.000183105 1.40323C-0.000183105 0.628246 0.615425 0 1.37482 0C2.13421 0 2.74982 0.628246 2.74982 1.40323Z" fill="#FCFCFC"/>
                      <path d="M9.16648 1.40323C9.16648 2.17821 8.55088 2.80645 7.79148 2.80645C7.03209 2.80645 6.41648 2.17821 6.41648 1.40323C6.41648 0.628246 7.03209 0 7.79148 0C8.55088 0 9.16648 0.628246 9.16648 1.40323Z" fill="#FCFCFC"/>
                      <path d="M15.5832 1.40323C15.5832 2.17821 14.9675 2.80645 14.2082 2.80645C13.4488 2.80645 12.8332 2.17821 12.8332 1.40323C12.8332 0.628246 13.4488 0 14.2082 0C14.9675 0 15.5832 0.628246 15.5832 1.40323Z" fill="#FCFCFC"/>
                      <path d="M21.9998 1.40323C21.9998 2.17821 21.3842 2.80645 20.6248 2.80645C19.8654 2.80645 19.2498 2.17821 19.2498 1.40323C19.2498 0.628246 19.8654 0 20.6248 0C21.3842 0 21.9998 0.628246 21.9998 1.40323Z" fill="#FCFCFC"/>
                      <path d="M2.74982 7.95161C2.74982 8.72659 2.13421 9.35484 1.37482 9.35484C0.615425 9.35484 -0.000183105 8.72659 -0.000183105 7.95161C-0.000183105 7.17663 0.615425 6.54839 1.37482 6.54839C2.13421 6.54839 2.74982 7.17663 2.74982 7.95161Z" fill="#FCFCFC"/>
                      <path d="M9.16648 7.95161C9.16648 8.72659 8.55088 9.35484 7.79148 9.35484C7.03209 9.35484 6.41648 8.72659 6.41648 7.95161C6.41648 7.17663 7.03209 6.54839 7.79148 6.54839C8.55088 6.54839 9.16648 7.17663 9.16648 7.95161Z" fill="#FCFCFC"/>
                      <path d="M15.5832 7.95161C15.5832 8.72659 14.9675 9.35484 14.2082 9.35484C13.4488 9.35484 12.8332 8.72659 12.8332 7.95161C12.8332 7.17663 13.4488 6.54839 14.2082 6.54839C14.9675 6.54839 15.5832 7.17663 15.5832 7.95161Z" fill="#FCFCFC"/>
                      <path d="M21.9998 7.95161C21.9998 8.72659 21.3842 9.35484 20.6248 9.35484C19.8654 9.35484 19.2498 8.72659 19.2498 7.95161C19.2498 7.17663 19.8654 6.54839 20.6248 6.54839C21.3842 6.54839 21.9998 7.17663 21.9998 7.95161Z" fill="#FCFCFC"/>
                      <path d="M2.74982 14.5C2.74982 15.275 2.13421 15.9032 1.37482 15.9032C0.615425 15.9032 -0.000183105 15.275 -0.000183105 14.5C-0.000183105 13.725 0.615425 13.0968 1.37482 13.0968C2.13421 13.0968 2.74982 13.725 2.74982 14.5Z" fill="#FCFCFC"/>
                      <path d="M9.16648 14.5C9.16648 15.275 8.55088 15.9032 7.79148 15.9032C7.03209 15.9032 6.41648 15.275 6.41648 14.5C6.41648 13.725 7.03209 13.0968 7.79148 13.0968C8.55088 13.0968 9.16648 13.725 9.16648 14.5Z" fill="#FCFCFC"/>
                      <path d="M15.5832 14.5C15.5832 15.275 14.9675 15.9032 14.2082 15.9032C13.4488 15.9032 12.8332 15.275 12.8332 14.5C12.8332 13.725 13.4488 13.0968 14.2082 13.0968C14.9675 13.0968 15.5832 13.725 15.5832 14.5Z" fill="#FCFCFC"/>
                      <path d="M21.9998 14.5C21.9998 15.275 21.3842 15.9032 20.6248 15.9032C19.8654 15.9032 19.2498 15.275 19.2498 14.5C19.2498 13.725 19.8654 13.0968 20.6248 13.0968C21.3842 13.0968 21.9998 13.725 21.9998 14.5Z" fill="#FCFCFC"/>
                      <path d="M2.74982 21.0484C2.74982 21.8234 2.13421 22.4516 1.37482 22.4516C0.615425 22.4516 -0.000183105 21.8234 -0.000183105 21.0484C-0.000183105 20.2734 0.615425 19.6452 1.37482 19.6452C2.13421 19.6452 2.74982 20.2734 2.74982 21.0484Z" fill="#FCFCFC"/>
                      <path d="M9.16648 21.0484C9.16648 21.8234 8.55088 22.4516 7.79148 22.4516C7.03209 22.4516 6.41648 21.8234 6.41648 21.0484C6.41648 20.2734 7.03209 19.6452 7.79148 19.6452C8.55088 19.6452 9.16648 20.2734 9.16648 21.0484Z" fill="#FCFCFC"/>
                      <path d="M15.5832 21.0484C15.5832 21.8234 14.9675 22.4516 14.2082 22.4516C13.4488 22.4516 12.8332 21.8234 12.8332 21.0484C12.8332 20.2734 13.4488 19.6452 14.2082 19.6452C14.9675 19.6452 15.5832 20.2734 15.5832 21.0484Z" fill="#FCFCFC"/>
                      <path d="M21.9998 21.0484C21.9998 21.8234 21.3842 22.4516 20.6248 22.4516C19.8654 22.4516 19.2498 21.8234 19.2498 21.0484C19.2498 20.2734 19.8654 19.6452 20.6248 19.6452C21.3842 19.6452 21.9998 20.2734 21.9998 21.0484Z" fill="#FCFCFC"/>
                      <path d="M2.74982 27.5968C2.74982 28.3718 2.13421 29 1.37482 29C0.615425 29 -0.000183105 28.3718 -0.000183105 27.5968C-0.000183105 26.8218 0.615425 26.1935 1.37482 26.1935C2.13421 26.1935 2.74982 26.8218 2.74982 27.5968Z" fill="#FCFCFC"/>
                      <path d="M9.16648 27.5968C9.16648 28.3718 8.55088 29 7.79148 29C7.03209 29 6.41648 28.3718 6.41648 27.5968C6.41648 26.8218 7.03209 26.1935 7.79148 26.1935C8.55088 26.1935 9.16648 26.8218 9.16648 27.5968Z" fill="#FCFCFC"/>
                      <path d="M15.5832 27.5968C15.5832 28.3718 14.9675 29 14.2082 29C13.4488 29 12.8332 28.3718 12.8332 27.5968C12.8332 26.8218 13.4488 26.1935 14.2082 26.1935C14.9675 26.1935 15.5832 26.8218 15.5832 27.5968Z" fill="#FCFCFC"/>
                      <path d="M21.9998 27.5968C21.9998 28.3718 21.3842 29 20.6248 29C19.8654 29 19.2498 28.3718 19.2498 27.5968C19.2498 26.8218 19.8654 26.1935 20.6248 26.1935C21.3842 26.1935 21.9998 26.8218 21.9998 27.5968Z" fill="#FCFCFC"/>
                      </svg>
                  </span>
                </div>
                <div className="info">
                  <h3 className="fs-20">Upgrade you Account to Pro</h3>
                  <Link to={"#"} className="btn bg-white btn-sm">Upgrade</Link>
                </div>
              </div> */}
      </PerfectScrollbar>
    </div>
  );
};

export default SideBar;
