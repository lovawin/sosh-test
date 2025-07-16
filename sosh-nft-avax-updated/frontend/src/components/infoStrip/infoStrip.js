import { StyledMessageWrapper } from "./style";
import PropTypes from "prop-types";
import LinkIcon from "assets/icons/linkIcon";
import CloseIcon from "assets/icons/closeIcon";
import { setLocalStorageItem } from "common/helpers/localStorageHelpers";
import { STORAGES } from "constants/appConstants";

function InfoStrip({ onClose }) {
  const closeHandler = () => {
    setLocalStorageItem(STORAGES.isInfoStripClosed, true);
    onClose && onClose();
  };

  return (
    <StyledMessageWrapper>
      <p className="social-link-message">
        <LinkIcon className="bi bi-link-45deg" />
        Link your <span className="text-strong"> Social Media</span> account
        now!
      </p>
      <span className="close-icon-wrap" onClick={closeHandler}>
        <CloseIcon />
      </span>
    </StyledMessageWrapper>
  );
}

export default InfoStrip;
InfoStrip.propTypes = {
  onClose: PropTypes.func,
};
