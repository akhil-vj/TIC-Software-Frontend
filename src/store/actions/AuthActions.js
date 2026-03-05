import React from "react";
//import { useNavigate } from "react-router-dom";

import {
  formatError,
  login,
  runLogoutTimer,
  saveTokenInLocalStorage,
  signUp,
} from "../../services/AuthService";

import { FormAction } from "../slices/formSlice";

export const SIGNUP_CONFIRMED_ACTION = "[signup action] confirmed signup";
export const SIGNUP_FAILED_ACTION = "[signup action] failed signup";
export const LOGIN_CONFIRMED_ACTION = "[login action] confirmed login";
export const LOGIN_FAILED_ACTION = "[login action] failed login";
export const LOADING_TOGGLE_ACTION = "[Loading action] toggle loading";
export const LOGOUT_ACTION = "[Logout action] logout action";

export function signupAction(email, password, navigate) {
  return (dispatch) => {
    signUp(email, password)
      .then((response) => {
        saveTokenInLocalStorage(response.data);

        runLogoutTimer(
          dispatch,
          response.data.expiresIn * 1000
        );

        dispatch(confirmedSignupAction(response.data));
        navigate("/dashboard");
      })
      .catch((error) => {
        const msg = formatError(error?.response);
        dispatch(signupFailedAction(msg));
      });
  };
}

export function Logout(navigate) {
  localStorage.removeItem("userDetails");
  navigate("/login");

  return {
    type: LOGOUT_ACTION,
  };
}

export function loginAction(email, password, navigate) {
  return (dispatch) => {
    login(email, password)
      .then((response) => {
        saveTokenInLocalStorage(response.data);

        runLogoutTimer(
          dispatch,
          import.meta.env.REACT_APP_EXPIRE_IN * 1000,
          navigate
        );

        dispatch(loginConfirmedAction(response.data));
        navigate("/dashboard");
      })
      .catch((error) => {
        const msg = formatError(error?.response);
        dispatch(loginFailedAction(msg));
      })
      .finally(() => {
        dispatch(FormAction.setLoading(false));
      });
  };
}

export function loginFailedAction(data) {
  return {
    type: LOGIN_FAILED_ACTION,
    payload: data,
  };
}

export function loginConfirmedAction(data) {
  return {
    type: LOGIN_CONFIRMED_ACTION,
    payload: data,
  };
}

export function confirmedSignupAction(payload) {
  return {
    type: SIGNUP_CONFIRMED_ACTION,
    payload,
  };
}

export function signupFailedAction(message) {
  return {
    type: SIGNUP_FAILED_ACTION,
    payload: message,
  };
}

export function loadingToggleAction(status) {
  return {
    type: LOADING_TOGGLE_ACTION,
    payload: status,
  };
}

export const PROFILE_UPDATED_ACTION = "[profile action] updated profile";

export function profileUpdatedAction(data) {
  return {
    type: PROFILE_UPDATED_ACTION,
    payload: data,
  };
}
