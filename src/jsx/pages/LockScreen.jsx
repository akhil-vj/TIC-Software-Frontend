import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { LOCK_SCREEN_MESSAGES } from "../../constants/lockTime";

const logo = "/logo.png";
const logolight = "/logo.png";

const LockScreen = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const dispatch = useDispatch();

  // Get current user email from Redux store
  const userEmail = useSelector((state) => state?.auth?.user?.email || "User");

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!password.trim()) {
      setError(LOCK_SCREEN_MESSAGES.ERROR_EMPTY_PASSWORD);
      setLoading(false);
      return;
    }

    // Simulate verification - add small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify against stored lock PIN
    const storedLockPIN = localStorage.getItem("lockPIN");

    if (storedLockPIN && password === storedLockPIN) {
      // PIN verified successfully
      localStorage.removeItem("isLocked");
      localStorage.removeItem("lockTimestamp");

      // Reset inactivity timer
      window.dispatchEvent(new Event("resetInactivityTimer"));

      // Navigate back to dashboard
      nav("/dashboard");
    } else {
      setError(LOCK_SCREEN_MESSAGES.ERROR_INVALID_PASSWORD);
    }

    setLoading(false);
  };

  const handleLogout = () => {
    // Clear all session data
    localStorage.removeItem("isLocked");
    localStorage.removeItem("lockTimestamp");
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
    nav("/login");
  };

  return (
    <div className="authincation h-100">
      <div className="container vh-100">
        <div className="row justify-content-center h-100 align-items-center">
          <div className="col-md-6">
            <div className="authincation-content">
              <div className="row no-gutters">
                <div className="col-xl-12">
                  <div className="auth-form">
                    <div className="text-center mb-3">
                      <img
                        className="logo-abbr dark-logo"
                        width="200"
                        src={logo}
                        alt="Logo"
                      />
                      <img
                        className="logo-abbr light-logo text-center m-auto"
                        width="200"
                        src={logolight}
                        alt="Logo Light"
                      />
                    </div>

                    <h4 className="text-center mb-2">
                      {LOCK_SCREEN_MESSAGES.LOCKED_TITLE}
                    </h4>
                    <p className="text-center text-muted mb-4 fs-14">
                      {LOCK_SCREEN_MESSAGES.LOCKED_SUBTITLE} <br />
                      {LOCK_SCREEN_MESSAGES.LOCKED_INFO}
                    </p>

                    <div className="text-center mb-3">
                      <p className="fs-14">
                        <strong>{LOCK_SCREEN_MESSAGES.LOGGED_IN_AS}</strong> <br />
                        <span className="text-primary">{userEmail}</span>
                      </p>
                    </div>

                    <form onSubmit={submitHandler}>
                      <div className="form-group mb-3">
                        <label className="form-label">
                          <strong>{LOCK_SCREEN_MESSAGES.PASSWORD_LABEL}</strong>
                        </label>
                        <input
                          type="password"
                          className={`form-control ${error ? "is-invalid" : ""}`}
                          placeholder={LOCK_SCREEN_MESSAGES.PASSWORD_PLACEHOLDER}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) setError("");
                          }}
                          disabled={loading}
                        />
                        {error && (
                          <div className="invalid-feedback d-block mt-2">
                            {error}
                          </div>
                        )}
                      </div>

                      <div className="d-grid gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <div className="spinner-border text-light spinner-border-sm me-2" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              {LOCK_SCREEN_MESSAGES.UNLOCKING_BUTTON}
                            </>
                          ) : (
                            LOCK_SCREEN_MESSAGES.UNLOCK_BUTTON
                          )}
                        </button>
                      </div>
                    </form>

                    <div className="text-center mt-3">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleLogout}
                        disabled={loading}
                      >
                        {LOCK_SCREEN_MESSAGES.LOGOUT_BUTTON}
                      </button>
                    </div>

                    <div className="text-center mt-3 fs-12 text-muted">
                      <p>{LOCK_SCREEN_MESSAGES.SECURITY_WARNING}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
