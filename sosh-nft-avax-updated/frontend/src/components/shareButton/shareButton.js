import React from "react";

import PropTypes from "prop-types";
import ShareIcon from "assets/icons/shareIcon";
import { useDispatch } from "react-redux";
import { openShareModal } from "store/commonStore/actionCreator";
import { StyledShareButton } from "./style";

function ShareButton({ link, text, longText }) {
  const dispatch = useDispatch();

  const clickHandler = () => {
    dispatch(
      openShareModal({
        text,
        longText,
        link,
      })
    );
  };

  return (
    <StyledShareButton className="button share-button" onClick={clickHandler}>
      <ShareIcon className="icon" />
      <span className="label"> Share</span>
    </StyledShareButton>
  );
}

export default ShareButton;

ShareButton.propTypes = {
  link: PropTypes.string,
  text: PropTypes.string,
  longText: PropTypes.string,
};
