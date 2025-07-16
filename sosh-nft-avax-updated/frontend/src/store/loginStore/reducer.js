import {
  SET_LOGIN,
  SET_LOGIN_ADDRESS,
  SET_LOGIN_LOADING,
  SET_LOGIN_STATE,
  SET_TOKEN,
} from "./actiontypes";

const initialLoginState = {
  token: "",
  isLogin: false,
  isLoginLoading: true,
  address: "",
};

export default function loginReducer(state = initialLoginState, action = {}) {
  switch (action.type) {
    case SET_LOGIN_STATE: {
      return {
        ...state,
        isLogin: action.payload,
      };
    }
    case SET_TOKEN: {
      return {
        ...state,
        token: action.payload,
      };
    }

    case SET_LOGIN_ADDRESS: {
      return {
        ...state,
        address: action.payload,
      };
    }

    case SET_LOGIN: {
      return {
        ...state,
        isLogin: action.payload.isLogin,
        address: action.payload.address,
        token: action.payload.token,
      };
    }

    case SET_LOGIN_LOADING: {
      return {
        ...state,
        isLoginLoading: action.payload,
      };
    }

    default:
      return { ...state };
  }
}
