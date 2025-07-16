import { getCurrentNetworkName } from "common/common";
import { getChainId } from "common/helpers/web3Helpers";
import getConfig from "configs/config";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { setChainId } from "store/commonStore/actionCreator";
import { StyledNetworkErrorModal } from "./style";

function NetworkErrorModal() {
  const { chainId, web3Instance } = useSelector((state) => state.common);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();

  const isWrongChain = useMemo(() => {
    return chainId !== getConfig().currentChainId;
  }, [chainId]);
  const { isLogin } = useSelector((state) => state.login);

  useEffect(() => {
    setErrorMessage(
      `You are not connected to correct network. Please connect to  ${getCurrentNetworkName()} network`
    );
  }, []);

  const getAndSetChainId = useCallback(
    async (web3) => {
      const _chainId = await getChainId(web3);

      dispatch(setChainId(_chainId));
    },
    [dispatch]
  );
  useEffect(() => {
    if (!chainId && web3Instance) {
      getAndSetChainId(web3Instance);
    }
  }, [web3Instance, getAndSetChainId, chainId]);

  return (
    <StyledNetworkErrorModal
      centered
      show={Boolean(chainId && isWrongChain && isLogin)}
      onHide={() => {}}
    >
      <h2 className="modal-title">Change Network</h2>
      <p className="error-message">{errorMessage}</p>
    </StyledNetworkErrorModal>
  );
}

export default NetworkErrorModal;
