import React, { useCallback, useEffect, useState } from "react";
import { StyledHeader } from "./style";

import { Link, useNavigate, useLocation } from "react-router-dom";
import errorLogger from "services/errorLogger";
import WalletForm from "../walletFormModal/walletForm";
import { useDispatch, useSelector } from "react-redux";
import Routes from "constants/routes";
import { getChainId, initProviderAndWeb3Instance } from "common/helpers/web3Helpers";
import { setChainId } from "store/commonStore/actionCreator";
import {
  login,
  connectAndSendSignatureRequest,
} from "store/loginStore/actions";
import { getUserApi } from "services/userServices";
import MenuDrawer from "./components/menuDrawer/menuDrawer";
import CustomButton from "components/CustomButton";
import MenuBarIcon from "assets/icons/menuBarIcon";
import AppLogo from "assets/logos/appLogo";
import HeaderSearch from "./components/headerSearch/headerSearch";
import { toast } from "react-toastify";
import { STORAGES, SUPPORTED_THEMES } from "constants/appConstants";
import SunIcon from "assets/icons/sunIcon";
import MoonIcon from "assets/icons/moonIcon";
import { updateThemeInLocalAndRedux } from "store/commonStore/actions";
import {
  startLoginLoading,
  stopLoginLoading,
} from "store/loginStore/actionCreator";
import {
  getItemFromSession,
  removeItemFromSession,
} from "common/helpers/sessionStorageHelpers";

const Header = () => {
  const [isDrawrOpen, setDrawrOpen] = useState(false);
  const [registerFormVisibility, setRegisterFormVisibility] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { web3Instance, theme } = useSelector((state) => state.common);
  const dispatch = useDispatch();
  const { isLogin } = useSelector((state) => state.login);

  const NewPostClickHandler = () => {
    if (isLogin) {
      navigate(Routes.createNFT);
    } else {
      toast("Connect your wallet to mint NFT!", {
        position: "top-right",
      });
    }
  };

  const showRegisterForm = useCallback(() => {
    console.log('Showing registration form');
    setRegisterFormVisibility(true);
  }, []);

  const hideRegisterForm = useCallback(() => {
    console.log('Hiding registration form');
    setRegisterFormVisibility(false);
  }, []);

  useEffect(() => {
    const isHomepage = location.pathname.split("?")[0] === Routes.home;
    if (getItemFromSession(STORAGES.formLinkClicked) && isHomepage) {
      showRegisterForm();
      removeItemFromSession(STORAGES.formLinkClicked);
    }
  }, [location, showRegisterForm]);

  const toggleDrawer = useCallback(() => {
    setDrawrOpen((prev) => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawrOpen(false);
  }, []);

  const themeChangeHandler = useCallback(() => {
    const newTheme =
      theme === SUPPORTED_THEMES.dark
        ? SUPPORTED_THEMES.light
        : SUPPORTED_THEMES.dark;
    dispatch(updateThemeInLocalAndRedux(newTheme));
  }, [dispatch, theme]);

  const walletConnectHandler = async () => {
    const hasMetamask = typeof window.ethereum !== "undefined";

    if (!hasMetamask) {
      console.log('MetaMask not found');
      errorLogger.logError(new Error("MetaMask not installed"), {
        type: 'WALLET_NOT_FOUND',
        context: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });
      toast("Please install Metamask", {
        position: "top-right",
        type: "error",
      });
      return;
    }

    dispatch(startLoginLoading());
    try {
      console.log('Initializing Web3...');
      const [initializedWeb3] = await initProviderAndWeb3Instance({ dispatch });
      
      if (!initializedWeb3) {
        throw new Error('Failed to initialize Web3');
      }

      const curChainId = await getChainId(initializedWeb3);
      dispatch(setChainId(curChainId));
      console.log('Chain ID set:', curChainId);

      await dispatch(
        connectAndSendSignatureRequest({
          onRequestSuccess: async ({ address, signature, message }) => {
            console.log('Signature request successful, verifying user...', { address });
            try {
              const userResponse = await getUserApi(address);
              console.log('User API response:', userResponse);

              if (!userResponse?.data?.data) {
                console.log('No user data found, showing registration form');
                showRegisterForm();
                return;
              }

              const { name, username, email } = userResponse.data.data;
              console.log('Existing user found, proceeding with login:', { username });

              await dispatch(
                login({
                  account: address,
                  signature,
                  message,
                  name,
                  email,
                  username,
                  onError: (error) => {
                    console.error('Login error:', error);
                    errorLogger.logError(error, {
                      type: 'LOGIN_ERROR',
                      context: {
                        address,
                        username,
                        timestamp: new Date().toISOString()
                      }
                    });
                    showRegisterForm();
                  },
                })
              );
            } catch (error) {
              console.error('User verification error:', error);
              errorLogger.logError(error, {
                type: 'USER_VERIFICATION_ERROR',
                context: {
                  address,
                  timestamp: new Date().toISOString()
                }
              });

              // Check if it's a 404 (user not found) error
              if (error.response?.status === 404) {
                console.log('New user detected, showing registration form');
                showRegisterForm();
              } else {
                toast("Failed to verify user. Please try again.", {
                  type: "error",
                  position: "top-right",
                });
              }
            }
          },
        })
      );
    } catch (error) {
      console.error('Wallet connection error:', error);
      errorLogger.logError(error, {
        type: 'WALLET_INITIALIZATION_ERROR',
        context: {
          hasMetamask: true,
          timestamp: new Date().toISOString()
        }
      });
      
      let errorMessage = "Failed to connect wallet. Please try again.";
      if (error.code === 4001) {
        errorMessage = "You rejected the connection request.";
      }
      
      toast(errorMessage, {
        type: "error",
        position: "top-right",
      });
    } finally {
      dispatch(stopLoginLoading());
    }
  };

  const url = window.location.href.split("/");
  const [isLanding, setIsLanding] = useState(false);
  
  useEffect(() => {
    setIsLanding(false);
    for (let i = 0; i < url.length; i++) {
      if ("/" + url[i] === Routes.landing) {
        setIsLanding(true);
      }
    }
  }, [url]);

  const hanldeHome = () => {
    window.sessionStorage.setItem("landing", true);
    navigate("/");
  };

  return (
    <>
      <StyledHeader
        className="app-header"
        style={{ justifyContent: "space-between", display: "flex" }}
      >
        <Link to="/">
          <AppLogo />
        </Link>

        <div className="actions-wrapper">
          {isLanding ? (
            <>
              <CustomButton
                onClick={hanldeHome}
                className="app-launch-btn"
                color="gradient"
              >
                Enter App
              </CustomButton>
              <CustomButton
                onClick={themeChangeHandler}
                className="theme-button"
                color="gradient"
                outline
              >
                {theme === SUPPORTED_THEMES.dark ? (
                  <SunIcon className="theme-icon" />
                ) : (
                  <MoonIcon className="theme-icon" />
                )}
              </CustomButton>
            </>
          ) : (
            <>
              <HeaderSearch />
              <CustomButton
                onClick={themeChangeHandler}
                className="theme-button"
                color="gradient"
                outline
              >
                {theme === SUPPORTED_THEMES.dark ? (
                  <SunIcon className="theme-icon" />
                ) : (
                  <MoonIcon className="theme-icon" />
                )}
              </CustomButton>
              <span className="menu-icon-wrap" onClick={toggleDrawer}>
                <MenuBarIcon />
              </span>
            </>
          )}
        </div>
      </StyledHeader>

      <MenuDrawer
        show={isDrawrOpen}
        onWalletConnect={walletConnectHandler}
        onNewPostClick={NewPostClickHandler}
        onItemClick={closeDrawer}
        onHide={closeDrawer}
      />

      <WalletForm
        centered
        show={registerFormVisibility}
        onHide={hideRegisterForm}
      />
    </>
  );
};

export default Header;
