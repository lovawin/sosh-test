import {
  SET_LOGIN,
  SET_LOGIN_ADDRESS,
  SET_LOGIN_LOADING,
  SET_LOGIN_STATE,
  SET_TOKEN,
} from "./actiontypes";

export const setLoginState = (state) => {
  return {
    type: SET_LOGIN_STATE,
    payload: state,
  };
};

export const setLoginToken = (token) => {
  return {
    type: SET_TOKEN,
    payload: token,
  };
};

export const setLoginAddress = (address) => {
  return {
    type: SET_LOGIN_ADDRESS,
    payload: address,
  };
};

export const setLogin = (
  { isLogin, address, token } = {
    isLogin: false,
    address: "",
    token: "",
  }
) => {
  return {
    type: SET_LOGIN,
    payload: {
      isLogin,
      address,
      token,
    },
  };
};

export const startLoginLoading = () => {
  return {
    type: SET_LOGIN_LOADING,
    payload: true,
  };
};

export const stopLoginLoading = () => {
  return {
    type: SET_LOGIN_LOADING,
    payload: false,
  };
};
