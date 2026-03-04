import axios from "axios";
import Swal from "sweetalert2";
import { loginConfirmedAction, Logout } from "../store/actions/AuthActions";
import { URLS } from "../constants";
import { formatDate } from "../jsx/utilis/date";
import { buildApiUrl } from "./apiConfig";

/* ---------------- SIGNUP ---------------- */

export function signUp(values, id) {
  const postData = {
    username: values.username,
    email: values.email,
    password: values.password,
    c_password: values.password,
    phone: values.phone,
    first_name: values.firstName,
    last_name: values.secondName,
    role_id: values.role.value,
    country: values.country.value,
    language: values.language.value,
    address: values.address,
    start_date: formatDate(values.fromDate),
    end_date: formatDate(values.toDate),
  };

  return axios.post(buildApiUrl(URLS.REGISTER_URL), postData);
}

/* ---------------- LOGIN ---------------- */

export function login(email, password) {
  const postData = {
    username: email,
    password,
  };

  return axios.post(buildApiUrl(URLS.LOGIN_URL), postData);
}

/* ---------------- ERROR HANDLER (FIXED) ---------------- */

export function formatError(errorResponse) {
  // If backend is unreachable, CORS blocked, DNS error, etc.
  if (!errorResponse) {
    Swal.fire(
      "Network Error",
      "Unable to reach the server. Please check the API URL or your network connection.",
      "error"
    );
    return "NETWORK_ERROR";
  }

  const status = errorResponse.status;

  switch (status) {
    case "EMAIL_EXISTS":
      Swal.fire("Oops", "Email already exists", "error");
      return "EMAIL_EXISTS";

    case "EMAIL_NOT_FOUND":
      Swal.fire("Oops", "Email not found", "error", { confirmButtonText: "Try Again!" });
      return "EMAIL_NOT_FOUND";

    case 401:
      Swal.fire("Oops", "Invalid Username or Password", "error", { // Changed swal to Swal.fire
        confirmButtonText: "Try Again!",
      });
      return "INVALID_CREDENTIALS";

    case "USER_DISABLED":
      Swal.fire("Oops", errorResponse.data.message, "error");
      return "USER_DISABLED";

    default:
      Swal.fire("Error", "Something went wrong. Please try again.", "error"); // Changed swal to Swal.fire
      return "UNKNOWN_ERROR";
  }
}

/* ---------------- TOKEN SAVE ---------------- */

export function saveTokenInLocalStorage(tokenDetails) {
  tokenDetails.authExpireTime = new Date(
    new Date().getTime() + import.meta.env.REACT_APP_EXPIRE_IN * 1000
  );

  localStorage.setItem("userDetails", JSON.stringify(tokenDetails));
}

/* ---------------- LOGOUT TIMER ---------------- */

export function runLogoutTimer(dispatch, timer, navigate) {
  setTimeout(() => {
    dispatch(Logout(navigate));
  }, timer);
}

/* ---------------- AUTO LOGIN ---------------- */

export function checkAutoLogin(dispatch, navigate) {
  const tokenDetailsString = localStorage.getItem("userDetails");

  if (!tokenDetailsString) {
    dispatch(Logout(navigate));
    return;
  }

  const tokenDetails = JSON.parse(tokenDetailsString);

  const expireTime = new Date(tokenDetails.authExpireTime);
  const now = new Date();

  if (now > expireTime) {
    dispatch(Logout(navigate));
    return;
  }

  dispatch(loginConfirmedAction(tokenDetails));

  const remaining = expireTime.getTime() - now.getTime();
  runLogoutTimer(dispatch, remaining, navigate);
}

/* ---------------- CHECK LOGIN ---------------- */

export function isLogin() {
  return !!localStorage.getItem("userDetails");
}

/* ---------------- VERIFY PASSWORD FOR LOCK SCREEN ---------------- */

export function verifyPassword(password) {
  const token = localStorage.getItem("token");
  
  return axios.post(
    buildApiUrl("/api/verify-password"),
    { password },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
