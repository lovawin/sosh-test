import { setLocalStorageItem } from "common/helpers/localStorageHelpers";
import {
  getAccount,
  getBalance,
  hexToNumber,
} from "common/helpers/web3Helpers";
import { STORAGES } from "constants/appConstants";
import {
  setAccountDetails,
  setUserBalance,
} from "store/userStore/actionCreators";
import { setChainId, setTheme } from "./actionCreator";

export const updateAccountDetailsOnChainChange = (chainId) => {
  return async (dispatch, getState) => {
    const isLogin = getState().login.isLogin;
    const web3Instance = getState().common.web3Instance;

    const chainIdAsNumber = hexToNumber(chainId);
    dispatch(setChainId(chainIdAsNumber));
    if (!isLogin) return;
    try {
      const account = await getAccount(web3Instance);
      const balances = await getBalance(web3Instance, account, {
        chainId: chainIdAsNumber,
      });
      const signature = getState().login.signature;
      dispatch(setAccountDetails({ account, signature }));
      dispatch(setUserBalance({ eth: balances.eth }));
    } catch (error) {
      console.error(error);
    }
  };
};

export const updateThemeInLocalAndRedux = (theme) => {
  return (dispatch, getState) => {
    const { theme: currentTheme } = getState().common;

    if (theme === currentTheme) return;
    const isSet = setLocalStorageItem(STORAGES.theme, theme);

    if (isSet) {
      dispatch(setTheme(theme));
    }
  };
};
