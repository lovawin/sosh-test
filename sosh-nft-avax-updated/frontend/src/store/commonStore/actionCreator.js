import {
  SET_CHAIN_ID,
  SET_CONFIRM_DATA,
  SET_HAS_METAMASK,
  SET_PROVIDER,
  SET_SHARE_VISIBILITY,
  SET_THEME,
  SET_WEB3_INSTANCE,
} from "./actionTypes";

export const setWeb3Instance = (web3Instance) => {
  return {
    type: SET_WEB3_INSTANCE,
    payload: web3Instance,
  };
};

export const setChainId = (chainId) => {
  return {
    type: SET_CHAIN_ID,
    payload: chainId,
  };
};

export const setHasMetamask = (hasMetamask) => {
  return {
    type: SET_HAS_METAMASK,
    payload: hasMetamask,
  };
};

export const setProvider = (provider) => {
  return {
    type: SET_PROVIDER,
    payload: provider,
  };
};

export const openShareModal = ({
  text,
  longText,
  link,
  modalTitle,
  linkName,
}) => {
  return {
    type: SET_SHARE_VISIBILITY,
    payload: {
      visibility: true,
      text,
      longText,
      link,
      modalTitle,
      linkName,
    },
  };
};

export const closeShareModal = () => {
  return {
    type: SET_SHARE_VISIBILITY,
    payload: {
      visibility: false,
      text: null,
      longText: null,
      link: null,
    },
  };
};

export const setTheme = (theme) => {
  return {
    type: SET_THEME,
    payload: theme,
  };
};

export const openConfirmModal = (data) => {
  return {
    type: SET_CONFIRM_DATA,
    payload: {
      visibility: true,
      ...data,
    },
  };
};

export const closeConfirmModal = () => {
  return {
    type: SET_CONFIRM_DATA,
    payload: {
      visibility: false,
      message: null,
      prepend: null,
      type: null,
      onCancel: null,
      onConfirm: null,
      title: null,
    },
  };
};

export const setConfirmData = (data) => {
  return {
    type: SET_CONFIRM_DATA,
    payload: data,
  };
};
