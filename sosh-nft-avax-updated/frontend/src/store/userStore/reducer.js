import {
  RESET_ACCOOUNT_DETAILS,
  SET_ACCOUNT_DETAILS,
  SET_USER_BALANCE,
  SET_USER_DATA,
  SET_USER_MESSAGE,
  SET_USER_SIGNATURE,
} from "./actionTypes";

const initialUserState = {
  userData: {},
  ownerAssets: {},
  balance: {
    eth: 0,
  },
  account: "",
  signature: "",
  message: "",
};

export const userReducer = (state = initialUserState, action = {}) => {
  switch (action.type) {
    case SET_USER_DATA:
      return {
        ...state,
        userData: action.payload,
      };

    case "ASSETSBYID":
      return {
        ...state,
        ownerAssets: action.payload,
      };
    case SET_USER_BALANCE:
      return {
        ...state,
        balance: action.payload,
      };

    case SET_ACCOUNT_DETAILS:
      return {
        ...state,
        ...action.payload,
      };

    case SET_USER_SIGNATURE:
      return {
        ...state,
        signature: action.payload,
      };

    case SET_USER_MESSAGE:
      return {
        ...state,
        message: action.payload,
      };

    case RESET_ACCOOUNT_DETAILS:
      return {
        ...state,
        signature: "",
        message: "",
        account: "",
      };

    default:
      return { ...state };
  }
};
