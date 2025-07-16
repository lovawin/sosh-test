import {
  RESET_ACCOOUNT_DETAILS,
  SET_ACCOUNT_DETAILS,
  SET_USER_BALANCE,
  SET_USER_DATA,
  SET_USER_MESSAGE,
  SET_USER_SIGNATURE,
} from "./actionTypes";

export const setUserData = (userData) => {
  return {
    type: SET_USER_DATA,
    payload: userData,
  };
};

export const setUserBalance = ({ eth } = { eth: 0 }) => {
  return {
    type: SET_USER_BALANCE,
    payload: { eth },
  };
};

export const setAccountDetails = ({ signature, message, account } = {}) => {
  return {
    type: SET_ACCOUNT_DETAILS,
    payload: {
      signature,
      message,
      account,
    },
  };
};

export const setUserMessage = (message) => {
  return {
    type: SET_USER_MESSAGE,
    payload: message,
  };
};

export const setUserSignature = (signature) => {
  return {
    type: SET_USER_SIGNATURE,
    payload: signature,
  };
};

export const resetAccountDetails = () => {
  return {
    type: RESET_ACCOOUNT_DETAILS,
  };
};
