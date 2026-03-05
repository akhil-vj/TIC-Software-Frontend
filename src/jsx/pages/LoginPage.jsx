import React, { useState } from "react";
import { connect, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  loadingToggleAction,
  loginAction,
} from "../../store/actions/AuthActions";

import loginBg from "../../images/tic-login-bg.png";
import loginBgFloat from "../../images/tic-login-bg1.png";
import { LoadingButton } from "../components/common/LoadingBtn";
import { FormAction } from "../../store/slices/formSlice";

const LOGIN_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap');

  .tic-login-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #dce8f5;
    padding: 24px;
  }

  .tic-card {
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    width: min(1020px, 100%);
    min-height: 620px;
    border-radius: 24px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.85),
      0 24px 80px rgba(100,130,180,0.18);
    animation: tic-card-in 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes tic-card-in {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* ══ LEFT PANEL ══ */
  .tic-left {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .tic-left::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(220,232,248,0.0) 0%,
      rgba(210,225,245,0.15) 55%,
      rgba(200,218,242,0.50) 100%
    );
    pointer-events: none;
    z-index: 1;
  }

  /* z:0 — static bg copy (prevents blank gap during float animation) */
  .tic-left::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    background-size: cover;
    background-position: right top;
    background-repeat: no-repeat;
    background-image: var(--tic-bg-float);
  }

  /* z:1 — floating bg (animates on top of static copy) */
  .tic-bg-float {
    position: absolute;
    inset: 0;
    z-index: 1;
    background-size: cover;
    background-position: right top;
    background-repeat: no-repeat;
    animation: tic-float 5s ease-in-out infinite;
  }

  @keyframes tic-float {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }

  /* z:10 — static logo cropped from tic-login-bg.png */
  .tic-logo-wrap {
    position: absolute;
    top: 10px;
    left: 2px;
    z-index: 10;
    width: 200px;
    height: 130px;
    background-image: var(--tic-login-bg);
    background-size: 532px 620px;
    background-position: -20px -18px;
    background-repeat: no-repeat;
    border-bottom-right-radius: 20px;
    overflow: hidden;
  }

  /* z:2 — feature cards */
  .tic-features {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 0 18px;
    margin-top: auto;
  }

  .tic-feature-card {
    background: rgba(255,255,255,0.78);
    border-radius: 14px;
    padding: 13px 13px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.92);
    box-shadow: 0 2px 10px rgba(80,120,200,0.07);
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .tic-feature-card.full-width { grid-column: 1 / -1; }

  .tic-feature-icon {
    width: 30px; height: 30px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 1px;
  }
  .tic-feature-icon.blue   { background: rgba(41,100,200,0.1);  color: #2964c8; }
  .tic-feature-icon.purple { background: rgba(120,80,200,0.1);  color: #7850c8; }
  .tic-feature-icon.teal   { background: rgba(20,140,180,0.1);  color: #148cb4; }

  .tic-feature-text h4 {
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 600;
    color: #1a2a4a; margin: 0 0 3px;
  }
  .tic-feature-text p {
    font-family: 'Outfit', sans-serif;
    font-size: 11.5px; color: #5a7090;
    margin: 0; line-height: 1.45;
  }

  .tic-tagline {
    position: relative;
    z-index: 2;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; color: #7a95b8;
    letter-spacing: 0.12em;
    text-align: center;
    width: 100%;
    padding: 14px 0 20px;
  }
  .tic-tagline span { margin: 0 5px; color: #9ab0cc; }

  /* ══ RIGHT PANEL ══ */
  .tic-right {
    background: #ffffff;
    padding: 52px 52px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  [data-theme-version="dark"] .tic-right       { background: #1e2139; }
  [data-theme-version="dark"] .tic-form-title  { color: #e8ecf8; }
  [data-theme-version="dark"] .tic-form-sub    { color: #8891b2; }
  [data-theme-version="dark"] .tic-field-label { color: #6e7a9f; }
  [data-theme-version="dark"] .tic-input       { background: #262a48; border-color: #2d3358; color: #e0e4f5; }
  [data-theme-version="dark"] .tic-input:focus { background: #2d3358; }
  [data-theme-version="dark"] .tic-remember    { color: #8891b2; }
  [data-theme-version="dark"] .tic-security    { border-color: #2d3358; color: #4a5278; }

  .tic-form-title {
    font-family: 'Playfair Display', serif;
    font-size: 36px; font-weight: 600;
    color: #0d1117; line-height: 1.2; margin-bottom: 8px;
  }
  .tic-form-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 14px; color: #8a9ab8; font-weight: 400; margin-bottom: 36px;
  }

  .tic-alert {
    display: flex; align-items: center; gap: 8px;
    border-radius: 10px; padding: 10px 14px;
    font-family: 'Outfit', sans-serif; font-size: 13px; margin-bottom: 16px;
  }
  .tic-alert-err { background: #fff0f0; color: #c0392b; border: 1.5px solid #f5c6c6; }
  .tic-alert-ok  { background: #f0faf4; color: #1a7a4a; border: 1.5px solid #b8e8cd; }

  .tic-field { margin-bottom: 20px; position: relative; }
  .tic-field-label {
    display: flex; align-items: center; gap: 6px;
    font-family: 'Outfit', sans-serif;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: #4a5a78; margin-bottom: 9px;
  }
  .tic-input {
    width: 100%; height: 52px; border-radius: 12px;
    border: 1.5px solid #e8edf5; background: #f8fafc;
    font-family: 'Outfit', sans-serif; font-size: 15px; color: #0d1117;
    padding: 0 46px 0 16px; transition: all 0.22s ease; outline: none;
    box-sizing: border-box;
  }
  .tic-input:focus {
    border-color: #2964c8; background: #fff;
    box-shadow: 0 0 0 4px rgba(41,100,200,0.08);
  }
  .tic-input::placeholder { color: #c8d4e4; }

  .tic-field-err {
    font-family: 'Outfit', sans-serif; font-size: 11.5px; color: #e74c3c;
    margin-top: 5px; display: flex; align-items: center; gap: 4px;
  }

  .tic-pwd-btn {
    position: absolute; right: 14px; bottom: 16px;
    background: none; border: none; cursor: pointer; padding: 2px;
    color: #b0bcd4; transition: color 0.2s; line-height: 0;
  }
  .tic-pwd-btn:hover { color: #2964c8; }

  .tic-extras {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 28px;
  }
  .tic-remember {
    font-family: 'Outfit', sans-serif; font-size: 13.5px; color: #64748b;
  }
  .tic-forgot {
    font-family: 'Outfit', sans-serif; font-size: 13.5px; font-weight: 500;
    color: #c0392b; text-decoration: none; transition: opacity 0.2s;
  }
  .tic-forgot:hover { opacity: 0.7; }

  .tic-submit-wrap .btn {
    width: 100%; height: 54px; border-radius: 12px;
    font-family: 'Outfit', sans-serif;
    font-size: 15.5px; font-weight: 600; letter-spacing: 0.04em;
    background: linear-gradient(135deg, #1a3a8f 0%, #2964c8 55%, #1a52a8 100%) !important;
    border: none !important;
    box-shadow: 0 4px 20px rgba(41,100,200,0.28);
    position: relative; overflow: hidden;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    color: #fff !important;
  }
  .tic-submit-wrap .btn::before {
    content: '';
    position: absolute; top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.45s ease;
  }
  .tic-submit-wrap .btn:hover::before { left: 100%; }
  .tic-submit-wrap .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(41,100,200,0.36) !important;
  }

  .tic-signup {
    text-align: center; margin-top: 22px;
    font-family: 'Outfit', sans-serif; font-size: 13.5px; color: #94a3b8;
  }
  .tic-signup a {
    color: #2964c8; font-weight: 600; text-decoration: none; transition: color 0.2s;
  }
  .tic-signup a:hover { color: #c0392b; }

  .tic-security {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    margin-top: 28px; padding-top: 22px; border-top: 1px solid #f0f4fa;
    font-family: 'Outfit', sans-serif; font-size: 12px; color: #c0cce0;
    letter-spacing: 0.05em;
  }

  @media (max-width: 767px) {
    .tic-card  { grid-template-columns: 1fr; }
    .tic-left  { display: none; }
    .tic-right { padding: 40px 28px; }
  }
`;

function Login(props) {
  const [email, setEmail]                         = useState("testuser");
  const [password, setPassword]                   = useState("123456");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  let errorsObj = { email: "", password: "" };
  const [errors, setErrors] = useState(errorsObj);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  function onLogin(e) {
    e.preventDefault();
    let error = false;
    const errorObj = { ...errorsObj };
    if (email === "") { errorObj.email = "Username is required"; error = true; }
    if (password === "") { errorObj.password = "Password is required"; error = true; }
    setErrors(errorObj);
    if (error) return;
    dispatch(FormAction.setLoading(true));
    dispatch(loadingToggleAction(true));
    dispatch(loginAction(email, password, navigate));
  }

  return (
    <>
      <style>{LOGIN_STYLES}</style>

      <div className="tic-login-root">
        <div className="tic-card">

          {/* ══ LEFT PANEL ══ */}
          <div
            className="tic-left"
            style={{
              "--tic-login-bg": `url(${loginBg})`,
              "--tic-bg-float": `url(${loginBgFloat})`,
            }}
          >
            {/* z:1 — floating bg (animates); z:0 static copy via ::before pseudo */}
            <div
              className="tic-bg-float"
              style={{ backgroundImage: `url(${loginBgFloat})` }}
            />

            {/* z:10 — logo cropped from tic-login-bg.png, static */}
            <div className="tic-logo-wrap" />

            {/* z:2 — feature cards */}
            <div className="tic-features">
              <div className="tic-feature-card">
                <div className="tic-feature-icon blue">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <div className="tic-feature-text">
                  <h4>Manage Enquiries</h4>
                  <p>Track and convert travel leads efficiently.</p>
                </div>
              </div>

              <div className="tic-feature-card">
                <div className="tic-feature-icon purple">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <div className="tic-feature-text">
                  <h4>Real-Time Analytics</h4>
                  <p>Monitor queries, confirmations &amp; revenue.</p>
                </div>
              </div>

              <div className="tic-feature-card full-width">
                <div className="tic-feature-icon teal">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div className="tic-feature-text">
                  <h4>Agent &amp; Operations Control</h4>
                  <p>Streamline B2B workflows seamlessly.</p>
                </div>
              </div>
            </div>

            <p className="tic-tagline">
              Secure <span>·</span> Reliable <span>·</span> Scalable
            </p>
          </div>

          {/* ══ RIGHT PANEL ══ */}
          <div className="tic-right">
            <h4 className="tic-form-title">Welcome back</h4>
            <p className="tic-form-sub">Sign in to your TIC Tours dashboard</p>

            {props.errorMessage && (
              <div className="tic-alert tic-alert-err">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {props.errorMessage}
              </div>
            )}
            {props.successMessage && (
              <div className="tic-alert tic-alert-ok">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {props.successMessage}
              </div>
            )}

            <form onSubmit={onLogin}>

              <div className="tic-field">
                <label className="tic-field-label" htmlFor="tic-username">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  Username
                </label>
                <input
                  id="tic-username"
                  className="tic-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                />
                {errors.email && (
                  <div className="tic-field-err">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="tic-field">
                <label className="tic-field-label" htmlFor="tic-password">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="tic-password"
                    type={isPasswordVisible ? "text" : "password"}
                    className="tic-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="tic-pwd-btn"
                    onClick={() => setIsPasswordVisible((v) => !v)}
                    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {isPasswordVisible ? (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </>
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password && (
                  <div className="tic-field-err">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errors.password}
                  </div>
                )}
              </div>

              <div className="tic-extras">
                <div className="form-check custom-checkbox ms-1">
                  <input type="checkbox" className="form-check-input" id="tic_remember" />
                  <label className="form-check-label tic-remember" htmlFor="tic_remember">
                    Remember me
                  </label>
                </div>
                <Link to="/page-forgot-password" className="tic-forgot">
                  Forgot password?
                </Link>
              </div>

              <div className="tic-submit-wrap">
                <LoadingButton label="Sign In to Dashboard" className="btn-block" />
              </div>

              <p className="tic-signup">
                Don't have an account?{" "}
                <Link to="/page-register">Sign Up</Link>
              </p>

              <div className="tic-security">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Powered by TIC Tours Team
              </div>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  errorMessage:   state.auth.errorMessage,
  successMessage: state.auth.successMessage,
  showLoading:    state.auth.showLoading,
});

export default connect(mapStateToProps)(Login);