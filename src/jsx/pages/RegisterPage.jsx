import React, { useState } from "react";
import { connect, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  loadingToggleAction,
  signupAction,
} from "../../store/actions/AuthActions";

import registerBg from "../../images/tic-login-bg.png";
import registerBgFloat from "../../images/tic-login-bg1.png";
import { LoadingButton } from "../components/common/LoadingBtn";
import { FormAction } from "../../store/slices/formSlice";

const REGISTER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap');

  .tic-register-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #dce8f0;
    padding: 24px;
  }

  .tic-register-card {
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    width: min(1020px, 100%);
    min-height: 620px;
    border-radius: 24px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.85),
      0 24px 80px rgba(100,130,180,0.18);
    animation: tic-register-card-in 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes tic-register-card-in {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* ══ LEFT PANEL ══ */
  .tic-register-left {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 620px;
    overflow: hidden;
  }

  .tic-register-left::after {
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
  .tic-register-left::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    background-size: cover;
    background-position: center top;
    background-repeat: no-repeat;
    background-image: var(--tic-register-bg-float);
  }

  /* z:1 — floating bg (animates on top of static copy) */
  .tic-register-bg-float {
    position: absolute;
    inset: 0;
    z-index: 1;
    background-size: cover;
    background-position: center top;
    background-repeat: no-repeat;
    animation: tic-register-float 5s ease-in-out infinite;
  }

  @keyframes tic-register-float {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }

  .tic-register-logo-wrap {
    position: absolute;
    top: 10px;
    left: 2px;
    z-index: 10;
    width: 200px;
    height: 130px;
    background-image: var(--tic-register-bg);
    background-size: 532px 620px;
    background-position: -20px -18px;
    background-repeat: no-repeat;
    border-bottom-right-radius: 20px;
    overflow: hidden;
  }

  .tic-register-features {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 0 18px;
    margin-top: auto;
    padding-bottom: 0;
  }

  .tic-register-feature-card {
    background: rgba(255,255,255,0.82);
    border-radius: 14px;
    padding: 16px 15px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.92);
    box-shadow: 0 2px 10px rgba(80,120,200,0.07);
    display: flex;
    align-items: flex-start;
    gap: 10px;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .tic-register-feature-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(41,100,200,0.13);
    background: rgba(255,255,255,0.95);
  }

  .tic-register-feature-card.full-width { grid-column: 1 / -1; }

  .tic-register-feature-icon {
    width: 32px; height: 32px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 1px;
  }
  .tic-register-feature-icon.blue   { background: rgba(41,100,200,0.1);  color: #2964c8; }
  .tic-register-feature-icon.purple { background: rgba(120,80,200,0.1);  color: #7850c8; }
  .tic-register-feature-icon.teal   { background: rgba(20,140,180,0.1);  color: #148cb4; }

  .tic-register-feature-text h4 {
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 600;
    color: #1a2a4a; margin: 0 0 3px;
  }
  .tic-register-feature-text p {
    font-family: 'Outfit', sans-serif;
    font-size: 11.5px; color: #5a7090;
    margin: 0; line-height: 1.45;
  }

  .tic-register-tagline {
    position: relative;
    z-index: 2;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; color: #7a95b8;
    letter-spacing: 0.12em;
    text-align: center;
    width: 100%;
    padding: 14px 0 20px;
  }
  .tic-register-tagline span { margin: 0 5px; color: #9ab0cc; }

  /* ══ RIGHT PANEL ══ */
  .tic-register-right {
    background: #ffffff;
    padding: 40px 52px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 620px;
  }

  [data-theme-version="dark"] .tic-register-right       { background: #1e2139; }
  [data-theme-version="dark"] .tic-register-form-title  { color: #e8ecf8; }
  [data-theme-version="dark"] .tic-register-form-sub    { color: #8891b2; }
  [data-theme-version="dark"] .tic-register-field-label { color: #6e7a9f; }
  [data-theme-version="dark"] .tic-register-input       { background: #262a48; border-color: #2d3358; color: #e0e4f5; }
  [data-theme-version="dark"] .tic-register-input:focus { background: #2d3358; }
  [data-theme-version="dark"] .tic-register-remember    { color: #8891b2; }

  .tic-register-form-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px; font-weight: 600;
    color: #0d1117; line-height: 1.2; margin-bottom: 6px;
  }

  .tic-register-form-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 13.5px;
    color: #5a6a84;
    font-weight: 500;
    margin-bottom: 24px;
  }

  .tic-register-alert {
    display: flex; align-items: center; gap: 8px;
    border-radius: 10px; padding: 10px 14px;
    font-family: 'Outfit', sans-serif; font-size: 13px; margin-bottom: 16px;
  }
  .tic-register-alert-err { background: #fff0f0; color: #c0392b; border: 1.5px solid #f5c6c6; }
  .tic-register-alert-ok  { background: #f0faf4; color: #1a7a4a; border: 1.5px solid #b8e8cd; }

  .tic-register-field { margin-bottom: 16px; position: relative; }
  .tic-register-field-label {
    display: flex; align-items: center; gap: 6px;
    font-family: 'Outfit', sans-serif;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: #4a5a78; margin-bottom: 7px;
  }

  .tic-register-input {
    width: 100%; height: 46px; border-radius: 12px;
    border: 1.5px solid #e8edf5; background: #f8fafc;
    font-family: 'Outfit', sans-serif; font-size: 14px; color: #0d1117;
    padding: 0 16px; transition: all 0.22s ease; outline: none;
    box-sizing: border-box;
  }
  .tic-register-input:focus {
    border-color: #1a6fc4; background: #fff;
    box-shadow: 0 0 0 4px rgba(26,111,196,0.09);
  }
  .tic-register-input.has-error {
    border-color: #e74c3c;
    background: #fff8f8;
  }
  .tic-register-input.has-error:focus {
    border-color: #e74c3c;
    box-shadow: 0 0 0 4px rgba(231,76,60,0.08);
  }
  .tic-register-input::placeholder { color: #c8d4e4; }

  .tic-register-field-err {
    font-family: 'Outfit', sans-serif; font-size: 11.5px; color: #e74c3c;
    margin-top: 4px; display: flex; align-items: center; gap: 4px;
  }

  .tic-register-terms {
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    color: #5a6a84;
    margin-bottom: 0;
  }

  .tic-register-terms a {
    color: #1a6fc4;
    text-decoration: none;
    font-weight: 500;
  }

  .tic-register-terms a:hover {
    text-decoration: underline;
  }

  .tic-register-submit-wrap .btn {
    width: 100%; height: 50px; border-radius: 12px;
    font-family: 'Outfit', sans-serif;
    font-size: 15px; font-weight: 600; letter-spacing: 0.04em;
    background: linear-gradient(135deg, #1258a8 0%, #1a6fc4 55%, #1560b0 100%) !important;
    border: none !important;
    box-shadow: 0 4px 20px rgba(26,111,196,0.30);
    position: relative; overflow: hidden;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    color: #fff !important;
  }
  .tic-register-submit-wrap .btn::before {
    content: '';
    position: absolute; top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    transition: left 0.45s ease;
  }
  .tic-register-submit-wrap .btn:hover::before { left: 100%; }
  .tic-register-submit-wrap .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(26,111,196,0.38) !important;
  }

  .tic-register-signin {
    text-align: center; margin-top: 16px;
    font-family: 'Outfit', sans-serif; font-size: 13px; color: #5a6a84;
  }
  .tic-register-signin a {
    color: #1a6fc4; font-weight: 600; text-decoration: none; transition: color 0.2s;
  }
  .tic-register-signin a:hover { color: #c0392b; }

  @media (max-width: 767px) {
    .tic-register-card  { grid-template-columns: 1fr; }
    .tic-register-left  { display: none; }
    .tic-register-right { padding: 35px 24px; }
    .tic-register-form-title { font-size: 28px; }
  }
`;

function RegisterPage(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  let errorsObj = { email: "", password: "", confirmPassword: "", terms: "" };
  const [errors, setErrors] = useState(errorsObj);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  function onSignUp(e) {
    e.preventDefault();
    let error = false;
    const errorObj = { ...errorsObj };

    if (email === "") {
      errorObj.email = "Email is required";
      error = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorObj.email = "Please enter a valid email";
      error = true;
    }

    if (password === "") {
      errorObj.password = "Password is required";
      error = true;
    } else if (password.length < 6) {
      errorObj.password = "Password must be at least 6 characters";
      error = true;
    }

    if (confirmPassword === "") {
      errorObj.confirmPassword = "Please confirm your password";
      error = true;
    } else if (password !== confirmPassword) {
      errorObj.confirmPassword = "Passwords do not match";
      error = true;
    }

    if (!agreeTerms) {
      errorObj.terms = "You must agree to the terms";
      error = true;
    }

    setErrors(errorObj);
    if (error) return;

    dispatch(FormAction.setLoading(true));
    dispatch(loadingToggleAction(true));
    dispatch(signupAction(email, password, navigate));
  }

  return (
    <>
      <style>{REGISTER_STYLES}</style>

      <div className="tic-register-root">
        <div className="tic-register-card">

          {/* ══ LEFT PANEL ══ */}
          <div
            className="tic-register-left"
            style={{
              "--tic-register-bg": `url(${registerBg})`,
              "--tic-register-bg-float": `url(${registerBgFloat})`,
            }}
          >
            {/* z:1 — floating bg (animates); z:0 static copy via ::before pseudo */}
            <div
              className="tic-register-bg-float"
              style={{ backgroundImage: `url(${registerBgFloat})` }}
            />

            {/* z:10 — Logo cropped from same bg image, completely static */}
            <div className="tic-register-logo-wrap" />

            {/* z:2 — Feature cards sit above gradient overlay */}
            <div className="tic-register-features">
              <div className="tic-register-feature-card full-width">
                <div className="tic-register-feature-icon blue">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div className="tic-register-feature-text">
                  <h4>Join Our Network</h4>
                  <p>Connect with B2B travel partners worldwide.</p>
                </div>
              </div>

              <div className="tic-register-feature-card">
                <div className="tic-register-feature-icon purple">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div className="tic-register-feature-text">
                  <h4>24/7 Support</h4>
                  <p>Get help when you need it most.</p>
                </div>
              </div>

              <div className="tic-register-feature-card">
                <div className="tic-register-feature-icon teal">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div className="tic-register-feature-text">
                  <h4>Instant Setup</h4>
                  <p>Start managing in minutes.</p>
                </div>
              </div>
            </div>

            <p className="tic-register-tagline">
              Fast <span>·</span> Easy <span>·</span> Secure
            </p>
          </div>

          {/* ══ RIGHT PANEL ══ */}
          <div className="tic-register-right">
            <h4 className="tic-register-form-title">Create Account</h4>
            <p className="tic-register-form-sub">Join TIC Tours and manage your travel business</p>

            {props.errorMessage && (
              <div className="tic-register-alert tic-register-alert-err">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {props.errorMessage}
              </div>
            )}
            {props.successMessage && (
              <div className="tic-register-alert tic-register-alert-ok">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {props.successMessage}
              </div>
            )}

            <form onSubmit={onSignUp}>

              {/* Email */}
              <div className="tic-register-field">
                <label className="tic-register-field-label" htmlFor="reg-email">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2.5">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  className={`tic-register-input${errors.email ? " has-error" : ""}`}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                  placeholder="your@email.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <div className="tic-register-field-err">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="tic-register-field">
                <label className="tic-register-field-label" htmlFor="reg-password">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  className={`tic-register-input${errors.password ? " has-error" : ""}`}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                />
                {errors.password && (
                  <div className="tic-register-field-err">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="tic-register-field">
                <label className="tic-register-field-label" htmlFor="reg-confirm">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Confirm Password
                </label>
                <input
                  id="reg-confirm"
                  type="password"
                  className={`tic-register-input${errors.confirmPassword ? " has-error" : ""}`}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: "" })); }}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <div className="tic-register-field-err">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="agree-terms"
                  checked={agreeTerms}
                  onChange={(e) => { setAgreeTerms(e.target.checked); setErrors(p => ({ ...p, terms: "" })); }}
                />
                <label className="form-check-label tic-register-terms" htmlFor="agree-terms">
                  I agree to the <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link>
                </label>
              </div>
              {errors.terms && (
                <div className="tic-register-field-err" style={{ marginBottom: "12px" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {errors.terms}
                </div>
              )}

              {/* Submit Button */}
              <div className="tic-register-submit-wrap" style={{ marginTop: "18px" }}>
                <LoadingButton label="Create Account" className="btn-block" />
              </div>

              {/* Sign In Link */}
              <p className="tic-register-signin">
                Already have an account? <Link to="/login">Sign In</Link>
              </p>

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

export default connect(mapStateToProps)(RegisterPage);