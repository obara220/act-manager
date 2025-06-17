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
    case "DRIVER_ID":
      return {
        ...state,
        driverId: action.payload,
      };
    case "USER_ID":
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

export default authReducer;
