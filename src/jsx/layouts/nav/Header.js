import React, { useState, useEffect, useMemo, useContext } from "react";

import { Link, useNavigate } from "react-router-dom";
/// Scroll
import { Dropdown } from "react-bootstrap";
import PerfectScrollbar from "react-perfect-scrollbar";

import LogoutPage from "./Logout";
import { ThemeContext } from "../../../context/ThemeContext";

/// Image
import profile from "../../../images/user.jpg";
import avatar from "../../../images/avatar/1.jpg";
import { isDevelopement } from "../../utilis/isDevelopment";
import ResetPassword from "../../components/common/ResetPassword";
import { useDispatch, useSelector } from "react-redux";
import { setUserPermission } from "../../../store/slices/permissionSlice";

const Header = ({ onNote }) => {
  const { background, changeBackground } = useContext(ThemeContext);
  const [searchBut, setSearchBut] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const user = useSelector(state => state.auth.auth.data)
  const dispatch = useDispatch()
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setUserPermission(user.permissions))
  }, [])
  //For header fixed
  const [headerFix, setheaderFix] = useState(false);
  useEffect(() => {
    window.addEventListener("scroll", () => {
      setheaderFix(window.scrollY > 50);
    });
  }, []);

  const searchOptions = useMemo(
    () => [
      { label: "Dashboard", path: "/dashboard", tags: ["home"] },
      { label: "Dashboard Dark", path: "/dashboard-dark", tags: [] },
      { label: "Ticketing", path: "/ticketing", tags: ["support", "tickets"] },
      { label: "Tickets", path: "/tickets", tags: ["support"] },
      { label: "Enquiry", path: "/enquiry", tags: ["enquiry list"] },
      { label: "Enquiry Detail", path: "/enquiry-detail", tags: ["detail"] },
      { label: "Quotation", path: "/quotation", tags: ["itinerary"] },
      { label: "Follow Ups", path: "/follow-ups", tags: ["followup"] },
      { label: "Supplier Payments", path: "/supplier-payments", tags: ["payment"] },
      { label: "Payments", path: "/payments", tags: ["payment"] },
      { label: "Leads", path: "/leads", tags: ["lead"] },
      { label: "Settings", path: "/settings", tags: ["admin"] },
      { label: "Hotels", path: "/hotels", tags: ["accommodation"] },
      { label: "Hotel Add", path: "/hotels/add", tags: ["accommodation"] },
      { label: "Transfer", path: "/transfer", tags: ["transport"] },
      { label: "Transfer Add", path: "/transfer/add", tags: ["transport"] },
      { label: "Activity", path: "/activity", tags: ["experiences"] },
      { label: "Destination", path: "/destination", tags: [] },
      { label: "Sub Destination", path: "/sub-destination", tags: [] },
      { label: "Lead Source", path: "/lead-source", tags: [] },
      { label: "Priority", path: "/priority", tags: [] },
      { label: "Requirement", path: "/requirement", tags: [] },
      { label: "Day Itinerary", path: "/day-itinerary", tags: [] },
      { label: "Mail Settings", path: "/mail-settings", tags: [] },
      { label: "Currency", path: "/currency", tags: [] },
      { label: "Company Settings", path: "/company-settings", tags: ["branding"] },
      { label: "Currency Settings", path: "/currency-settings", tags: [] },
      { label: "Fields", path: "/fields", tags: ["company fields"] },
      { label: "User", path: "/user", tags: ["users", "staff"] },
      { label: "User Role", path: "/user-role", tags: ["roles", "permissions"] },
      { label: "Agent", path: "/agent", tags: ["agents"] },
    ],
    [],
  );

  const filteredOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term.length < 2) return [];
    const matches = (opt) => {
      const haystack = [opt.label, opt.path, ...(opt.tags || [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    };
    return searchOptions.filter(matches).slice(0, 8);
  }, [searchOptions, searchTerm]);

  const handleSearchNavigate = (path) => {
    if (!path) return;
    navigate(path);
    setSearchTerm("");
    setSearchBut(false);
  };

  const handleSearchSubmit = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return;
    const exactMatch = searchOptions.find(
      (opt) => opt.label.toLowerCase() === term || opt.path.toLowerCase() === term,
    );
    if (exactMatch) {
      handleSearchNavigate(exactMatch.path);
    }
    // if no exact match, do nothing (avoid incorrect redirects)
  };

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleBlur = () => {
    // Delay to allow click on dropdown items
    setTimeout(() => setSearchBut(false), 150);
  };

  const handleReset = () => {
    setShowResetModal(true)
  }

  return (
    <div className={`header ${headerFix ? "sticky" : ""}`}>
      <div className="header-content">
        <nav className="navbar navbar-expand">
          <div className="collapse navbar-collapse justify-content-between">
            <div className="header-left">
              <div
                className="input-group search-area"
                style={{ position: "relative" }}
              >
                <input
                  type="text"
                  className={`form-control ${searchBut ? "active" : ""}`}
                  placeholder="Search here..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchBut(true)}
                  onKeyDown={onSearchKeyDown}
                  onBlur={handleBlur}
                />
                <span className="input-group-text" onClick={handleSearchSubmit} style={{ cursor: 'pointer' }}>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.5605 15.4395L13.7527 11.6317C14.5395 10.446 15 9.02625 15 7.5C15 3.3645 11.6355 0 7.5 0C3.3645 0 0 3.3645 0 7.5C0 11.6355 3.3645 15 7.5 15C9.02625 15 10.446 14.5395 11.6317 13.7527L15.4395 17.5605C16.0245 18.1462 16.9755 18.1462 17.5605 17.5605C18.1462 16.9747 18.1462 16.0252 17.5605 15.4395V15.4395ZM2.25 7.5C2.25 4.605 4.605 2.25 7.5 2.25C10.395 2.25 12.75 4.605 12.75 7.5C12.75 10.395 10.395 12.75 7.5 12.75C4.605 12.75 2.25 10.395 2.25 7.5V7.5Z"
                      fill="#01A3FF"
                    />
                  </svg>
                </span>
                {searchBut && filteredOptions.length > 0 && (
                  <div
                    className="search-hint text-muted"
                    style={{ position: "absolute", top: "100%", left: 0, fontSize: 12 }}
                  >
                    Suggested: {filteredOptions[0].label}
                  </div>
                )}
                {searchBut && filteredOptions.length > 0 && (
                  <div
                    className="search-dropdown card"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 18px)",
                      left: 0,
                      right: 0,
                      zIndex: 1020,
                      background: "#f7f7f7",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                    }}
                  >
                    <ul className="list-group list-group-flush">
                      {filteredOptions.map((option) => (
                        <li
                          key={option.path}
                          className="list-group-item c-pointer"
                          onClick={() => handleSearchNavigate(option.path)}
                        >
                          {option.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <ul className="navbar-nav header-right">
              {/* <li className="nav-item">
                <button
                  className="nav-link nav-action i-false c-pointer"
                  onClick={() =>
                    changeBackground(
                      background.value === "light"
                        ? { value: "dark", label: "Dark" }
                        : { value: "light", label: "Light" }
                    )
                  }
                  style={{ border: "none", background: "transparent", cursor: "pointer" }}
                  title="Toggle Dark/Light Mode"
                >
                  {background.value === "dark" ? (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
                        fill="#FDB913"
                        stroke="#666666"
                        strokeWidth="2"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="5" fill="#FFD700" />
                      <path
                        d="M12 1V3M12 21V23M23 12H21M3 12H1M20.485 3.515L19.071 4.929M4.929 19.071L3.515 20.485M20.485 20.485L19.071 19.071M4.929 4.929L3.515 3.515"
                        stroke="#666666"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </li> */}

              <li className="nav-item ">
                <Dropdown className="dropdown header-profile2">
                  <Dropdown.Toggle
                    variant=""
                    as="a"
                    className="nav-link i-false c-pointer"
                  >
                    <div className="header-info2 d-flex align-items-center">
                      <div className="d-flex align-items-center sidebar-info">
                        <div>
                          <h4 className="mb-0">{user.first_name}</h4>
                          <span className="d-block text-end">{user.roles[0] ? user.roles[0].name : 'Nil'}</span>
                        </div>
                      </div>
                      <img src={profile} alt="" />
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    align="right"
                    className="mt-3 dropdown-menu dropdown-menu-end"
                  >

                    {isDevelopement && (
                      <>
                        <Link
                          to="/app-profile"
                          className="dropdown-item ai-icon"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24px"
                            height="24px"
                            viewBox="0 0 24 24"
                            version="1.1"
                            className="svg-main-icon"
                          >
                            <g
                              stroke="none"
                              strokeWidth="1"
                              fill="none"
                              fillRule="evenodd"
                            >
                              <polygon points="0 0 24 0 24 24 0 24" />
                              <path
                                d="M12,11 C9.790861,11 8,9.209139 8,7 C8,4.790861 9.790861,3 12,3 C14.209139,3 16,4.790861 16,7 C16,9.209139 14.209139,11 12,11 Z"
                                fill="#000000"
                                fillRule="nonzero"
                                opacity="0.3"
                              />
                              <path
                                d="M3.00065168,20.1992055 C3.38825852,15.4265159 7.26191235,13 11.9833413,13 C16.7712164,13 20.7048837,15.2931929 20.9979143,20.2 C21.0095879,20.3954741 20.9979143,21 20.2466999,21 C16.541124,21 11.0347247,21 3.72750223,21 C3.47671215,21 2.97953825,20.45918 3.00065168,20.1992055 Z"
                                fill="var(--primary)"
                                fillRule="nonzero"
                              />
                            </g>
                          </svg>
                          <span className="ms-2">Profile </span>
                        </Link>


                        <Link
                          to="/quotation-inbox"
                          className="dropdown-item ai-icon"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24px"
                            height="24px"
                            viewBox="0 0 24 24"
                            version="1.1"
                            className="svg-main-icon"
                          >
                            <g
                              stroke="none"
                              strokeWidth="1"
                              fill="none"
                              fillRule="evenodd"
                            >
                              <rect x="0" y="0" width="24" height="24" />
                              <path
                                d="M21,12.0829584 C20.6747915,12.0283988 20.3407122,12 20,12 C16.6862915,12 14,14.6862915 14,18 C14,18.3407122 14.0283988,18.6747915 14.0829584,19 L5,19 C3.8954305,19 3,18.1045695 3,17 L3,8 C3,6.8954305 3.8954305,6 5,6 L19,6 C20.1045695,6 21,6.8954305 21,8 L21,12.0829584 Z M18.1444251,7.83964668 L12,11.1481833 L5.85557487,7.83964668 C5.4908718,7.6432681 5.03602525,7.77972206 4.83964668,8.14442513 C4.6432681,8.5091282 4.77972206,8.96397475 5.14442513,9.16035332 L11.6444251,12.6603533 C11.8664074,12.7798822 12.1335926,12.7798822 12.3555749,12.6603533 L18.8555749,9.16035332 C19.2202779,8.96397475 19.3567319,8.5091282 19.1603533,8.14442513 C18.9639747,7.77972206 18.5091282,7.6432681 18.1444251,7.83964668 Z"
                                fill="#000000"
                              />
                              <circle
                                fill="var(--primary)"
                                opacity="0.3"
                                cx="19.5"
                                cy="17.5"
                                r="2.5"
                              />
                            </g>
                          </svg>
                          <span className="ms-2">Inbox </span>
                        </Link>
                      </>
                    )}
                    <button className="dropdown-item ai-icon" onClick={handleReset}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        viewBox="0 0 24 24"
                        version="1.1"
                        className="svg-main-icon"
                      >
                        <g
                          stroke="none"
                          strokeWidth="1"
                          fill="none"
                          fillRule="evenodd"
                        >
                          <rect x="0" y="0" width="24" height="24" />
                          <path
                            d="M18.6225,9.75 L18.75,9.75 C19.9926407,9.75 21,10.7573593 21,12 C21,13.2426407 19.9926407,14.25 18.75,14.25 L18.6854912,14.249994 C18.4911876,14.250769 18.3158978,14.366855 18.2393549,14.5454486 C18.1556809,14.7351461 18.1942911,14.948087 18.3278301,15.0846699 L18.372535,15.129375 C18.7950334,15.5514036 19.03243,16.1240792 19.03243,16.72125 C19.03243,17.3184208 18.7950334,17.8910964 18.373125,18.312535 C17.9510964,18.7350334 17.3784208,18.97243 16.78125,18.97243 C16.1840792,18.97243 15.6114036,18.7350334 15.1896699,18.3128301 L15.1505513,18.2736469 C15.008087,18.1342911 14.7951461,18.0956809 14.6054486,18.1793549 C14.426855,18.2558978 14.310769,18.4311876 14.31,18.6225 L14.31,18.75 C14.31,19.9926407 13.3026407,21 12.06,21 C10.8173593,21 9.81,19.9926407 9.81,18.75 C9.80552409,18.4999185 9.67898539,18.3229986 9.44717599,18.2361469 C9.26485393,18.1556809 9.05191298,18.1942911 8.91533009,18.3278301 L8.870625,18.372535 C8.44859642,18.7950334 7.87592081,19.03243 7.27875,19.03243 C6.68157919,19.03243 6.10890358,18.7950334 5.68746499,18.373125 C5.26496665,17.9510964 5.02757002,17.3784208 5.02757002,16.78125 C5.02757002,16.1840792 5.26496665,15.6114036 5.68716991,15.1896699 L5.72635306,15.1505513 C5.86570889,15.008087 5.90431906,14.7951461 5.82064513,14.6054486 C5.74410223,14.426855 5.56881236,14.310769 5.3775,14.31 L5.25,14.31 C4.00735931,14.31 3,13.3026407 3,12.06 C3,10.8173593 4.00735931,9.81 5.25,9.81 C5.50008154,9.80552409 5.67700139,9.67898539 5.76385306,9.44717599 C5.84431906,9.26485393 5.80570889,9.05191298 5.67216991,8.91533009 L5.62746499,8.870625 C5.20496665,8.44859642 4.96757002,7.87592081 4.96757002,7.27875 C4.96757002,6.68157919 5.20496665,6.10890358 5.626875,5.68746499 C6.04890358,5.26496665 6.62157919,5.02757002 7.21875,5.02757002 C7.81592081,5.02757002 8.38859642,5.26496665 8.81033009,5.68716991 L8.84944872,5.72635306 C8.99191298,5.86570889 9.20485393,5.90431906 9.38717599,5.82385306 L9.49484664,5.80114977 C9.65041313,5.71688974 9.7492905,5.55401473 9.75,5.3775 L9.75,5.25 C9.75,4.00735931 10.7573593,3 12,3 C13.2426407,3 14.25,4.00735931 14.25,5.25 L14.249994,5.31450877 C14.250769,5.50881236 14.366855,5.68410223 14.552824,5.76385306 C14.7351461,5.84431906 14.948087,5.80570889 15.0846699,5.67216991 L15.129375,5.62746499 C15.5514036,5.20496665 16.1240792,4.96757002 16.72125,4.96757002 C17.3184208,4.96757002 17.8910964,5.20496665 18.312535,5.626875 C18.7350334,6.04890358 18.97243,6.62157919 18.97243,7.21875 C18.97243,7.81592081 18.7350334,8.38859642 18.3128301,8.81033009 L18.2736469,8.84944872 C18.1342911,8.99191298 18.0956809,9.20485393 18.1761469,9.38717599 L18.1988502,9.49484664 C18.2831103,9.65041313 18.4459853,9.7492905 18.6225,9.75 Z"
                            fill="#000000"
                            fillRule="nonzero"
                            opacity="0.3"
                          />
                          <path
                            d="M12,15 C13.6568542,15 15,13.6568542 15,12 C15,10.3431458 13.6568542,9 12,9 C10.3431458,9 9,10.3431458 9,12 C9,13.6568542 10.3431458,15 12,15 Z"
                            fill="#000000"
                          />
                        </g>
                      </svg>
                      <span className="ms-2">Reset Password</span>
                    </button>
                    <LogoutPage />
                  </Dropdown.Menu>
                </Dropdown>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <ResetPassword showModal={showResetModal} setShowModal={setShowResetModal} />
    </div>
  );
};

export default Header;
