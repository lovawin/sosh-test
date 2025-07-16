import { getLocalStorageItem } from "common/helpers/localStorageHelpers";
import { STORAGES, SUPPORTED_THEMES } from "constants/appConstants";
import {
  SET_CHAIN_ID,
  SET_CONFIRM_DATA,
  SET_HAS_METAMASK,
  SET_PROVIDER,
  SET_SHARE_VISIBILITY,
  SET_THEME,
  SET_WEB3_INSTANCE,
} from "./actionTypes";

const initialCommonState = {
  web3Instance: null,
  hasMetamask: typeof window.ethereum !== "undefined",
  chainId: null,
  provider: null,
  theme: getLocalStorageItem(STORAGES.theme) || SUPPORTED_THEMES.light,

  shareData: {
    visibility: false,
    text: null,
    longText: null,
    link: null,
  },
  confirmData: {
    visibility: false,
    message: null,
    onConfirm: null,
    confirmLabel: null,
    type: null,
    onCancel: null,
    title: null,
    prepend: null,
  },
};

export const commonReducer = (state = initialCommonState, action = {}) => {
  switch (action.type) {
    case SET_WEB3_INSTANCE:
      return {
        ...state,
        web3Instance: action.payload,
      };

    case SET_CHAIN_ID:
      return {
        ...state,
        chainId: action.payload,
      };

    case SET_HAS_METAMASK:
      return {
        ...state,
        hasMetamask: action.payload,
      };

    case SET_PROVIDER:
      return {
        ...state,
        provider: action.payload,
      };

    case SET_SHARE_VISIBILITY:
      return {
        ...state,
        shareData: {
          ...state.shareData,
          ...action.payload,
        },
      };

    case SET_THEME:
      return {
        ...state,
        theme: action.payload,
      };

    case SET_CONFIRM_DATA:
      return {
        ...state,
        confirmData: {
          ...state.confirmData,
          ...action.payload,
        },
      };

    default:
      return { ...state };
  }
};
