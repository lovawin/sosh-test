import React from "react";
import PropTypes from "prop-types";
import { StyledMenuDrawer } from "./style";
import CustomButton from "components/CustomButton";
import { useSelector } from "react-redux";
import EllipsedText from "components/EllipsedText";
import { Collapse } from "react-bootstrap";
import UserDataCard from "components/userDataCard/userDataCard";
import Portal from "components/portal";

function MenuDrawer({
  show,
  onHide,
  mountOnEnter = true,
  unmountOnExit = true,
  timeout = 500,
  onWalletConnect,
  onNewPostClick,
  onItemClick,
}) {
  const { isLogin, address } = useSelector((state) => state.login) || {};

  const walletConnectHandler = () => {
    onWalletConnect && onWalletConnect();
    onItemClick && onItemClick();
  };

  const NewPostClickHandler = () => {
    onNewPostClick && onNewPostClick();
    onItemClick && onItemClick();
  };

  return (
    <>
      <Collapse
        in={show}
        mountOnEnter={mountOnEnter}
        unmountOnExit={unmountOnExit}
        timeout={timeout}
      >
        <StyledMenuDrawer>
          <div className="buttons-wrap">
            {!isLogin ? (
              <CustomButton
                className="connect-button"
                color="gradient"
                onClick={walletConnectHandler}
              >
                Connect Wallet
              </CustomButton>
            ) : (
              <CustomButton
                className="user-address"
                interactive={false}
                color="gradient"
              >
                <EllipsedText text={address} ellipsePosition="middle" />
              </CustomButton>
            )}

            <CustomButton
              className="new-post-button"
              onClick={NewPostClickHandler}
              color="gradient"
              outline
            >
              New Post
            </CustomButton>
          </div>

          <UserDataCard parent="drawer" onItemClick={onItemClick} />
        </StyledMenuDrawer>
      </Collapse>
      {show && (
        <Portal fallbackOnBody>
          <div className="overlay-backdrop" onClick={onHide}></div>
        </Portal>
      )}
    </>
  );
}

export default MenuDrawer;

MenuDrawer.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func,
  mountOnEnter: PropTypes.bool,
  onWalletConnect: PropTypes.func,
  onNewPostClick: PropTypes.func,
};
