// ===== LOCK TIME CONFIGURATION =====
// Change this value to control when the user's session locks
// Value in MINUTES

const INACTIVITY_MINUTES = 10;

// Auto-calculated (do not modify)
const INACTIVITY_TIMEOUT_MS = INACTIVITY_MINUTES * 60 * 1000;
const WARNING_TIMEOUT_MS = (INACTIVITY_MINUTES - 1) * 60 * 1000;

const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];

const LOCK_SCREEN_MESSAGES = {
  LOCKED_TITLE: "Account Locked",
  LOCKED_SUBTITLE: `You've been inactive for ${INACTIVITY_MINUTES} minutes.`,
  LOCKED_INFO: "Enter your password to unlock your account.",
  LOGGED_IN_AS: "Logged in as:",
  PASSWORD_LABEL: "Password",
  PASSWORD_PLACEHOLDER: "Enter your password",
  UNLOCK_BUTTON: "Unlock",
  UNLOCKING_BUTTON: "Verifying...",
  LOGOUT_BUTTON: "Logout",
  ERROR_EMPTY_PASSWORD: "Password is required",
  ERROR_INVALID_PASSWORD: "Invalid password. Please try again.",
  ERROR_VERIFICATION: "Error verifying password. Please try again.",
  SECURITY_WARNING: "For security reasons, your account was locked due to inactivity.",
};

export {
  INACTIVITY_MINUTES,
  INACTIVITY_TIMEOUT_MS,
  WARNING_TIMEOUT_MS,
  ACTIVITY_EVENTS,
  LOCK_SCREEN_MESSAGES,
};

export default {
  INACTIVITY_MINUTES,
  INACTIVITY_TIMEOUT_MS,
  WARNING_TIMEOUT_MS,
  ACTIVITY_EVENTS,
  LOCK_SCREEN_MESSAGES,
};
