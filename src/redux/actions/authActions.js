// src/redux/actions/authActions.js
export const SET_USER_AUTH = "SET_USER_AUTH";

export const setUserAuth = (isAuthenticated) => {
  return {
    type: SET_USER_AUTH,
    payload: isAuthenticated,
  };
};
