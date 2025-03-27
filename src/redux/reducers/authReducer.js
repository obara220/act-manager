// src/redux/reducers/authReducer.js
import { SET_USER_AUTH } from "../actions/authActions";

const initialState = {
  isAuthenticated: false,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_AUTH:
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    default:
      return state;
  }
};

export default authReducer;
