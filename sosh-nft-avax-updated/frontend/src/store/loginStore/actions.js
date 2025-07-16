import {
  getLocalStorageItem,
  loginToLocalStorage,
  logoutFromLocalStorage,
} from "common/helpers/localStorageHelpers";
import {
  getAccount,
  getBalance,
  initProviderAndWeb3Instance,
  reqAccountAndSignature,
} from "common/helpers/web3Helpers";
import { STORAGES } from "constants/appConstants";
import { apiHandler } from "services/axios";
import {
  resetAccountDetails,
  setAccountDetails,
  setUserBalance,
  setUserData,
} from "store/userStore/actionCreators";
import { setLogin, startLoginLoading, stopLoginLoading } from "./actionCreator";
import { checkIfLogin } from "common/common";
import { getMessageApi, loginApi } from "services/loginServices";
import { getUserApi } from "services/userServices";
import { toast } from "react-toastify";
import errorLogger from "services/errorLogger";

export const login = ({
  username,
  name,
  email,
  account,
  referralCode,
  signature,
  message,
  onError: onErrorCallback,
} = {}) => {
  return async (dispatch, getState) => {
    console.log('Starting login process with:', { username, name, email, account, referralCode });
    const { web3Instance } = getState().common;
    
    if (!web3Instance) {
      const error = new Error('Web3 instance not initialized');
      errorLogger.logError(error, { type: 'LOGIN_ERROR', subType: 'NO_WEB3_INSTANCE' });
      throw error;
    }

    dispatch(startLoginLoading());

    try {
      const loginResponse = await apiHandler(
        () => loginApi({ username, name, email, signature, message, referralCode }),
        {
          onSuccess: async (result) => {
            console.log('Login API success:', result);
            const { user, token } = result?.data ?? {};

            if (!user || !token) {
              throw new Error('Invalid login response');
            }

            console.log('Storing login data in localStorage:', { userId: user?.id });
            loginToLocalStorage(token, user?.id);

            console.log('Dispatching login state:', { isLogin: true, token, address: account });
            dispatch(setLogin({ isLogin: true, token, address: account }));

            try {
              const balance = await getBalance(web3Instance, account);
              console.log('Got wallet balance:', balance);
              dispatch(setUserBalance({ eth: balance.eth }));
            } catch (error) {
              console.error('Error getting balance:', error);
              errorLogger.logError(error, {
                type: 'BALANCE_ERROR',
                context: { account }
              });
            }

            toast(result?.message || "Successfully logged in!", {
              type: "success",
              position: "top-right",
            });

            console.log('Setting user data in Redux:', user);
            dispatch(setUserData(user));
            return result;
          },
          onError: (error, response) => {
            console.error('Login API error:', error, response);
            const errorMessage = error?.message || "Login failed. Please try again.";
            toast(errorMessage, {
              type: "error",
              position: "top-right",
            });

            const _error =
              typeof response?.data?.message === "string"
                ? response?.data.message
                : error;

            errorLogger.logError(_error, {
              type: 'LOGIN_ERROR',
              context: {
                username,
                account,
                timestamp: new Date().toISOString()
              }
            });

            if (onErrorCallback) {
              onErrorCallback(_error);
            } else {
              throw new Error(_error);
            }
          },
        }
      );

      return loginResponse;
    } catch (error) {
      console.error('Login process failed:', error);
      throw error;
    } finally {
      console.log('Login process completed');
      dispatch(stopLoginLoading());
    }
  };
};

export const logout = (callback) => {
  return async (dispatch, getState) => {
    const isLogin = getState().login.isLogin;

    if (!isLogin) return;

    try {
      console.log('Starting logout process');
      logoutFromLocalStorage();
      
      toast("Wallet disconnected successfully!", {
        type: "success",
        position: "top-right",
      });

      dispatch(resetAccountDetails());
      dispatch(setLogin({}));
      dispatch(setUserData(null));

      console.log('Logout completed successfully');
      if (callback) callback();
    } catch (error) {
      console.error('Logout error:', error);
      errorLogger.logError(error, {
        type: 'LOGOUT_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  };
};

export const connectAndSendSignatureRequest = ({ onRequestSuccess } = {}) => {
  return async (dispatch, getState) => {
    const web3Instance = getState().common.web3Instance;

    if (!web3Instance) {
      throw new Error('Web3 instance not initialized');
    }

    try {
      console.log('Starting wallet connection...');
      const provider = web3Instance.currentProvider;
      
      if (!provider) {
        throw new Error('No Web3 provider available');
      }

      await provider.enable();
      console.log('Provider enabled');

      const messageResponse = await apiHandler(() => getMessageApi());
      if (!messageResponse?.data?.signinmessage) {
        const error = new Error('Invalid signin message received from server');
        errorLogger.logError(error, {
          type: 'SIGNATURE_ERROR',
          subType: 'INVALID_MESSAGE_FORMAT',
          response: messageResponse
        });
        throw error;
      }

      const message = messageResponse.data.signinmessage;
      console.log('Got signin message:', message);

      try {
        console.log('Requesting account and signature...');
        const [account, signature] = await reqAccountAndSignature(
          web3Instance,
          message
        );
        
        if (!account || !signature) {
          throw new Error('Failed to get account or signature');
        }

        console.log('Got account and signature:', { 
          account, 
          signaturePreview: signature.substring(0, 10) + '...' 
        });

        // Update Redux state before calling onRequestSuccess
        await dispatch(setAccountDetails({ account, signature, message }));
        console.log('Account details set in Redux');

        if (onRequestSuccess) {
          console.log('Calling onRequestSuccess handler');
          await onRequestSuccess({ 
            address: account, 
            signature, 
            message 
          });
        }
      } catch (error) {
        if (error?.code === 4001) {
          console.error('User rejected signature request');
          errorLogger.logError(error, {
            type: 'SIGNATURE_ERROR',
            subType: 'USER_REJECTED'
          });
          toast("You rejected the signature request", {
            type: "error",
            position: "top-right",
          });
        } else {
          console.error('Signature request failed:', error);
          errorLogger.logError(error, {
            type: 'SIGNATURE_ERROR',
            subType: 'REQUEST_FAILED'
          });
          toast("Failed to get signature. Please try again.", {
            type: "error",
            position: "top-right",
          });
        }
        throw error;
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  };
};

export const checkIfLoginAndUpdateState = (callback) => {
  return async (dispatch, getState) => {
    const token = getLocalStorageItem(STORAGES.token);
    dispatch(startLoginLoading());

    try {
      console.log('Checking login state...');
      const [web3Instance] = await initProviderAndWeb3Instance({
        dispatch,
      });

      const address = await getAccount(web3Instance);
      console.log('Got wallet address:', address);

      if (checkIfLogin() && address) {
        console.log('User is logged in, getting balance...');
        const balance = await getBalance(web3Instance, address);
        
        await apiHandler(() => getUserApi(address), {
          onSuccess: (result) => {
            console.log('Got user data:', result);
            const user = result?.data ?? {};

            console.log('Updating Redux state with user data');
            dispatch(setUserData(user));
            dispatch(setAccountDetails({ address, signature: "", message: "" }));
            dispatch(setUserBalance({ eth: balance.eth }));
            dispatch(setLogin({ isLogin: true, token, address }));
          },
          onError: (error) => {
            // Only log actual errors, not the expected "user not found" case
            if (!error.response || error.response.status !== 404) {
              errorLogger.logError(error, {
                type: 'LOGIN_STATE_ERROR',
                context: {
                  address: address,
                  hasToken: !!token
                }
              });
              console.error("Login state error:", error);
              toast(error?.message || "Failed to verify login state.", {
                type: "error",
                position: "top-right",
              });
            }
            logoutFromLocalStorage();
          }
        });
      } else {
        console.log('User not logged in or no address found');
        logoutFromLocalStorage();
      }
    } catch (error) {
      console.error('Login state check failed:', error);
      errorLogger.logError(error, {
        type: 'LOGIN_STATE_CHECK_ERROR',
        context: {
          hasToken: !!token
        }
      });
      toast(error?.message || "Failed to verify login state.", {
        type: "error",
        position: "top-right",
      });
      logoutFromLocalStorage();
    } finally {
      dispatch(stopLoginLoading());
      if (callback) callback();
    }
  };
};
