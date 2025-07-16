import React, { Suspense, useCallback, useMemo, useState } from "react";
import Aos from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import { setAddresses } from "store/Actions/data";
import { useDispatch, useSelector } from "react-redux";

import AppRouter from "routers/appRouter";
import { checkIfLoginAndUpdateState, logout } from "store/loginStore/actions";
import { updateAccountDetailsOnChainChange } from "store/commonStore/actions";
import Header from "components/header/header";
import NetworkErrorModal from "components/networkErrorModal";
import SocialShareModal from "components/socialShareModal";
import ConfirmModal from "components/confirmModal/confirmModal";
import { closeConfirmModal } from "store/commonStore/actionCreator";
import { getLocalStorageItem } from "common/helpers/localStorageHelpers";
import { STORAGES } from "constants/appConstants";
import InfoStrip from "components/infoStrip/infoStrip";
import { useLocation, useNavigate } from "react-router";
import Routes from "constants/routes";
import useQuery from "hooks/useQuery";
import { isTrue } from "common/helpers/textHelpers";
import LoadingBubbleCircle from "components/LoadingBubbleCircle";

function App() {
  const dispatch = useDispatch();
  const {
    confirmData: { visibility: confirmVisibility, ...restConfirmData },
  } = useSelector((state) => state.common);
  const { userData } = useSelector((state) => state.user);
  const [isInfoStripClosed, setIsInfoStripClosed] = useState(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { query } = useQuery();

  const closeInfoStrip = useCallback(() => {
    setIsInfoStripClosed(true);
  }, []);

  const openInfoStrip = useCallback(() => {
    setIsInfoStripClosed(false);
  }, []);

  useEffect(() => {
    const isClosed = getLocalStorageItem(STORAGES.isInfoStripClosed);
    if (!isClosed) {
      openInfoStrip();
    }
  }, [openInfoStrip]);

  const canShowInfoStrip = useMemo(() => {
    if (isInfoStripClosed) {
      return false;
    } else {
      if (userData?._id) {
        const {
          twitterUsername,
          instagramUsername,
          youtubeUsername,
          tiktokUsername,
        } = userData ?? {};
        if (
          twitterUsername ||
          instagramUsername ||
          youtubeUsername ||
          tiktokUsername
        ) {
          return false;
        }
        return true;
      } else {
        return false;
      }
    }
  }, [userData, isInfoStripClosed]);

  useEffect(() => {
    const isLanding = window.sessionStorage.getItem("landing");

    const ref = query.get("ref");
    if (ref) {
      sessionStorage.setItem(STORAGES.referralCode, ref);
    }

    if (!isTrue(isLanding) && pathname === Routes.home) {
      navigate(Routes.landing);
    } else if (ref) {
      navigate(Routes.home);
    }
  }, [query, navigate, pathname]);

  useEffect(() => {
    Aos.init({ duration: 2000 });
    dispatch(checkIfLoginAndUpdateState());
  }, [dispatch]);

  const hideConfirmModal = useCallback(() => {
    dispatch(closeConfirmModal());
  }, [dispatch]);

  useEffect(() => {
    // registering event listener for metamask account change
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        dispatch(logout());
      });
      window.ethereum.on("chainChanged", (chainId) => {
        dispatch(updateAccountDetailsOnChainChange(chainId));
      });
    }
  }, [dispatch]);

  useEffect(() => {
    const sAdd = localStorage.getItem("short_address");
    const fAdd = localStorage.getItem("full_address");
    dispatch(setAddresses(fAdd, sAdd));
  }, [dispatch]);

  const memoizedAppRouter = useMemo(() => {
    return <AppRouter />;
  }, []);

  const memoizedHeader = useMemo(() => {
    return <Header />;
  }, []);

  return (
    <div className="App">
      <Suspense fallback={<LoadingBubbleCircle />}>
        {memoizedHeader}
        {canShowInfoStrip && <InfoStrip onClose={closeInfoStrip} />}
        <section className="app-body">{memoizedAppRouter}</section>
      </Suspense>
      <NetworkErrorModal />
      <SocialShareModal />
      <ConfirmModal
        show={confirmVisibility}
        {...restConfirmData}
        onHide={hideConfirmModal}
      />
    </div>
  );
}

export default App;
