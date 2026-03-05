import React from "react";
import { connect, useDispatch } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Logout } from "../../../store/actions/AuthActions";
import { isAuthenticated } from "../../../store/selectors/AuthSelectors";

function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();
    return <Component {...props} router={{ location, navigate, params }} />;
  }

  return ComponentWithRouterProp;
}

function LogoutPage(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function onLogout() {
    dispatch(Logout(navigate));
    // window.location.reload();
  }

  function onLock() {
    localStorage.setItem("isLocked", "true");
    localStorage.setItem("lockTimestamp", Date.now().toString());
    navigate("/page-lock-screen");
  }

  return (
    <>
      <button className="dropdown-item ai-icon" onClick={onLock}>
        <svg
          id="icon-lock"
          xmlns="http://www.w3.org/2000/svg"
          className="text-warning me-1"
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          fillRule="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span className="ms-2">Lock Screen</span>
      </button>
      <button className="dropdown-item ai-icon" onClick={onLogout}>
        <svg
          id="icon-logout"
          xmlns="http://www.w3.org/2000/svg"
          className="text-danger me-1"
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          fillRule="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1={21} y1={12} x2={9} y2={12} />
        </svg>
        <span className="ms-2">Logout </span>
      </button>
    </>
  );
}
const mapStateToProps = (state) => {
  return {
    isAuthenticated: isAuthenticated(state),
  };
};

export default withRouter(connect(mapStateToProps)(LogoutPage));
