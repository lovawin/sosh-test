import { ADD_ASSETS, RESET_ASSETS, SET_ASSETS } from "./actionTypes";

export const addAssetsToStore = (assets) => {
  return {
    type: ADD_ASSETS,
    payload: assets,
  };
};

export const resetStoreAssets = () => {
  return {
    type: RESET_ASSETS,
  };
};

export const setAssetsInStore = (assets = []) => {
  return {
    type: SET_ASSETS,
    payload: assets,
  };
};
