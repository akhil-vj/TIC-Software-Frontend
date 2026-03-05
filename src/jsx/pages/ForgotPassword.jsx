import React, { useState } from "react";
import { connect, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loadingToggleAction } from "../../store/actions/AuthActions";

import forgotBg from "../../images/tic-login-bg.png";
import forgotBgFloat from "../../images/tic-login-bg1.png";
import { LoadingButton } from "../components/common/LoadingBtn";
import { FormAction } from "../../store/slices/formSlice";

const FORGOT_PASSWORD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap');

  .tic-forgot-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #dce8f5;
    padding: 24px;
  }

  .tic-forgot-card {
    display: grid;
    grid-template-columns: 1fr;
    width: min(500px, 100%);
    border-radius: 24px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.85),
      0 24px 80px rgba(100,130,180,0.18);
    animation: tic-forgot-card-in 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes tic-forgot-card-in {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* ══ LEFT PANEL ══ */
  .tic-forgot-left {
    position: relative;
    display: none;
    flex-direction: column;
    overflow: hidden;
  }

  .tic-forgot-left::after {
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

  /* z:0 — floating bg */
  .tic-forgot-bg-float {
    position: absolute;
    inset: 0;
    z-index: 0;
    background-size: cover;
    background-position: left top;
    background-repeat: no-repeat;
    animation: tic-forgot-float 5s ease-in-out infinite;
  }

  @keyframes tic-forgot-float {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }

  /* z:10 — static logo cropped from bg image */
  .tic-forgot-logo-wrap {
    position: absolute;
    top: 10px;
    left: 2px;
    z-index: 10;
    width: 200px;
    height: 130px;
    background-image: var(--tic-forgot-bg);
    background-size: 532px 620px;
    background-position: -20px -18px;
    background-repeat: no-repeat;
    border-bottom-right-radius: 20px;
    overflow: hidden;
  }

  /* z:2 — feature cards */
  .tic-forgot-features {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 0 18px;
    margin-top: auto;
  }

  .tic-forgot-feature-card {
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

  .tic-forgot-feature-card.full-width { grid-column: 1 / -1; }

  .tic-forgot-feature-icon {
    width: 30px; height: 30px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 1px;
  }
  .tic-forgot-feature-icon.blue   { background: rgba(41,100,200,0.1);  color: #2964c8; }
  .tic-forgot-feature-icon.purple { background: rgba(120,80,200,0.1);  color: #7850c8; }
  .tic-forgot-feature-icon.teal   { background: rgba(20,140,180,0.1);  color: #148cb4; }

  .tic-forgot-feature-text h4 {
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 600;
    color: #1a2a4a; margin: 0 0 3px;
  }
  .tic-forgot-feature-text p {
    font-family: 'Outfit', sans-serif;
    font-size: 11.5px; color: #5a7090;
    margin: 0; line-height: 1.45;
  }

  .tic-forgot-tagline {
    position: relative;
    z-index: 2;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; color: #7a95b8; margin-top: auto; padding: 0 18px 16px;
    text-align: center; letter-spacing: 0.05em;
  }
  .tic-forgot-tagline span { opacity: 0.6; margin: 0 4px; }

  /* ══ RIGHT PANEL ══ */
  .tic-forgot-right {
    display: flex;
    flex-direction: column;
    padding: 45px 40px;
    background: #fff;
  }

  .tic-forgot-form-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px; font-weight: 700; color: #0d1e3a;
    margin: 0 0 8px; letter-spacing: -0.8px;
  }

  .tic-forgot-form-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 13px; color: #5a7090; margin: 0 0 24px;
  }

  .tic-forgot-alert {
    padding: 12px 14px; border-radius: 8px; margin-bottom: 16px;
    font-family: 'Outfit', sans-serif; font-size: 12.5px;
    display: flex; align-items: flex-start; gap: 8px;
  }
  .tic-forgot-alert-err {
    background: #fef2f2; border: 1px solid #fecaca; color: #991b1b;
  }
  .tic-forgot-alert-ok {
    background: #f0fdf4; border: 1px solid #86efac; color: #15803d;
  }
  .tic-forgot-alert svg { flex-shrink: 0; margin-top: 2px; }

  .tic-forgot-field {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
  }

  .tic-forgot-field-label {
    font-family: 'Outfit', sans-serif;
    font-size: 12.5px; font-weight: 600; color: #1a2a4a;
    margin-bottom: 6px; display: flex; align-items: center; gap: 5px;
  }
  .tic-forgot-field-label svg { margin-top: -1px; }

  .tic-forgot-input {
    padding: 10px 12px;
    border: 1px solid #dfe5f0;
    border-radius: 8px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; color: #3d4a60;
    background: #f9fbfe;
    transition: all 0.2s ease;
    outline: none;
  }
  .tic-forgot-input:focus {
    background: #fff;
    border-color: #2964c8;
    box-shadow: 0 0 0 3px rgba(41,100,200,0.08);
  }
  .tic-forgot-input.has-error {
    border-color: #ef4444;
    background: #fef2f2;
  }
  .tic-forgot-input::placeholder { color: #aab4c6; }

  .tic-forgot-field-err {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: 5px;
    font-family: 'Outfit', sans-serif;
    font-size: 12px; color: #c0392b;
  }
  .tic-forgot-field-err svg { flex-shrink: 0; margin-top: 2px; }

  .tic-forgot-submit-wrap .btn {
    width: 100%; height: 50px; border-radius: 12px;
    font-family: 'Outfit', sans-serif;
    font-size: 15px; font-weight: 600; letter-spacing: 0.04em;
    background: linear-gradient(135deg, #2964c8 0%, #1a6fc4 55%, #2560b0 100%) !important;
    border: none !important;
    box-shadow: 0 4px 20px rgba(41,100,200,0.30);
    position: relative; overflow: hidden;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    color: #fff !important;
    margin-top: 12px;
  }
  .tic-forgot-submit-wrap .btn::before {
    content: '';
    position: absolute; top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.45s ease;
  }
  .tic-forgot-submit-wrap .btn:hover::before { left: 100%; }
  .tic-forgot-submit-wrap .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(41,100,200,0.36) !important;
  }

  .tic-forgot-info {
    display: flex; align-items: flex-start; gap: 8px;
    margin: 18px 0; padding: 12px 12px;
    background: #eff6ff; border-radius: 8px;
    border-left: 3px solid #2964c8;
    font-family: 'Outfit', sans-serif; font-size: 12px; color: #1e40af;
  }
  .tic-forgot-info svg { flex-shrink: 0; margin-top: 2px; }

  .tic-forgot-back {
    text-align: center; margin-top: 18px;
    font-family: 'Outfit', sans-serif; font-size: 13px; color: #5a7090;
  }
  .tic-forgot-back a {
    color: #2964c8; font-weight: 600; text-decoration: none; transition: color 0.2s;
  }
  .tic-forgot-back a:hover { color: #c0392b; }

  @media (max-width: 767px) {
    .tic-forgot-card  { width: min(100%, 100%); }
    .tic-forgot-right { padding: 35px 24px; }
    .tic-forgot-form-title { font-size: 28px; }
  }
`;

function ForgotPassword(props) {
  const [email, setEmail] = useState("");
  let errorsObj = { email: "" };
  const [errors, setErrors] = useState(errorsObj);
  const [submitted, setSubmitted] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  function onResetPassword(e) {
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

    setErrors(errorObj);
    if (error) return;

    dispatch(FormAction.setLoading(true));
    dispatch(loadingToggleAction(true));

    // Simulate API call - replace with actual reset password API
    setTimeout(() => {
      dispatch(loadingToggleAction(false));
      dispatch(FormAction.setLoading(false));
      setSubmitted(true);
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }, 1500);
  }

  return (
    <>
      <style>{FORGOT_PASSWORD_STYLES}</style>

      <div className="tic-forgot-root">
        <div className="tic-forgot-card">

          {/* ══ LEFT PANEL ══ */}
          <div
            className="tic-forgot-left"
            style={{ "--tic-forgot-bg": `url(${forgotBg})` }}
          >
            {/* z:0 — bg floats */}
            <div
              className="tic-forgot-bg-float"
              style={{ backgroundImage: `url(${forgotBgFloat})` }}
            />

            {/* z:10 — logo cropped from bg, static */}
            <div className="tic-forgot-logo-wrap" />

            {/* z:2 — feature cards */}
            <div className="tic-forgot-features">
              <div className="tic-forgot-feature-card">
                <div className="tic-forgot-feature-icon blue">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
                  </svg>
                </div>
                <div className="tic-forgot-feature-text">
                  <h4>Secure Recovery</h4>
                  <p>Your account safety is our priority.</p>
                </div>
              </div>

              <div className="tic-forgot-feature-card">
                <div className="tic-forgot-feature-icon purple">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div className="tic-forgot-feature-text">
                  <h4>Instant Support</h4>
                  <p>Help is just one email away.</p>
                </div>
              </div>

              <div className="tic-forgot-feature-card full-width">
                <div className="tic-forgot-feature-icon teal">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.1 4.1A10 10 0 0 0 4.9 19"/>
                  </svg>
                </div>
                <div className="tic-forgot-feature-text">
                  <h4>Quick Reset</h4>
                  <p>Get back to your dashboard fast.</p>
                </div>
              </div>
            </div>

            <p className="tic-forgot-tagline">
              Safe <span>·</span> Fast <span>·</span> Easy
            </p>
          </div>

          {/* ══ RIGHT PANEL ══ */}
          <div className="tic-forgot-right">
            <h4 className="tic-forgot-form-title">Reset Password</h4>
            <p className="tic-forgot-form-sub">Enter your email to receive reset instructions</p>

            {props.errorMessage && (
              <div className="tic-forgot-alert tic-forgot-alert-err">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {props.errorMessage}
              </div>
            )}

            {submitted ? (
              <div className="tic-forgot-alert tic-forgot-alert-ok">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Check your email for password reset instructions. Redirecting to login...
              </div>
            ) : (
              <>
                <form onSubmit={onResetPassword}>

                  {/* Email */}
                  <div className="tic-forgot-field">
                    <label className="tic-forgot-field-label" htmlFor="forgot-email">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2.5">
                        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                      Email Address
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      className={`tic-forgot-input${errors.email ? " has-error" : ""}`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors(p => ({ ...p, email: "" }));
                      }}
                      placeholder="your@email.com"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <div className="tic-forgot-field-err">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <div className="tic-forgot-info">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <span>We'll send you an email with instructions to reset your password.</span>
                  </div>

                  {/* Submit Button */}
                  <div className="tic-forgot-submit-wrap">
                    <LoadingButton label="Send Reset Link" className="btn-block" />
                  </div>

                </form>

                {/* Back to Login */}
                <p className="tic-forgot-back">
                  Remember your password? <Link to="/login">Back to Login</Link>
                </p>
              </>
            )}
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

export default connect(mapStateToProps)(ForgotPassword);
