import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";

import CustomButton from "components/CustomButton";
import EllipsedText from "components/EllipsedText";
import UserDataCard from "components/userDataCard/userDataCard";
import { useSelector } from "react-redux";

import { StyledUserDataCardWrap, StyledUserPopover } from "./style";
import { OverlayTrigger } from "react-bootstrap";
import { convertPxToRem } from "common/helpers";

function ConnectButton({ onWalletConnect }) {
  const { isLogin, address, isLoginLoading } = useSelector(
    (state) => state.login
  );
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  const showOverlay = useCallback(() => {
    setOverlayVisible(true);
  }, []);

  const hideOverlay = useCallback(() => {
    setOverlayVisible(false);
  }, []);

  const toggleOverlay = useCallback(() => {
    setOverlayVisible((prev) => !prev);
  }, []);

  const walletConnectHandler = () => {
    onWalletConnect && onWalletConnect();
  };

  const renderCardPopover = ({ style, ...restProps }) => {
    return (
      <StyledUserPopover
        {...restProps}
        style={{
          ...style,
          backgroundColor: "transparent",
          paddingTop: convertPxToRem(30),
          border: "none",
        }}
        onMouseEnter={showOverlay}
        onMouseLeave={hideOverlay}
      >
        <StyledUserDataCardWrap>
          <UserDataCard />
        </StyledUserDataCardWrap>
      </StyledUserPopover>
    );
  };

  if (isLogin) {
    return (
      <OverlayTrigger
        show={isOverlayVisible}
        onToggle={toggleOverlay}
        popperConfig={{ strategy: "fixed" }}
        overlay={renderCardPopover}
        placement="bottom"
        trigger={["hover"]}
      >
        <span>
          <CustomButton className="user-address" color="gradient">
            <EllipsedText text={address} ellipsePosition="middle" />
          </CustomButton>
        </span>
      </OverlayTrigger>
    );
  } else {
    return (
      <CustomButton
        className="connect-button"
        color="gradient"
        onClick={walletConnectHandler}
        disabled={isLoginLoading}
        loading={isLoginLoading}
        loadingContent="Connecting..."
      >
        Connect Wallet
      </CustomButton>
    );
  }
}

export default ConnectButton;

ConnectButton.propTypes = {
  onWalletConnect: PropTypes.func,
};
