import React from "react";
import { ModalBody, ModalFooter, ModalTitle } from "react-bootstrap";

import PropTypes from "prop-types";
import { StyledModalWrapper } from "./style";
import CloseIcon from "assets/icons/closeIcon";
import ModalHeader from "react-bootstrap/esm/ModalHeader";

const ModalWrapper = ({
  children,
  fillColor = "black",
  showCloseButton = false,
  dialogWidth,
  title,
  footer,
  ...props
}) => {
  const { onHide } = props;
  return (
    <StyledModalWrapper
      $dialogWidth={dialogWidth}
      contentClassName="styled-modal-content"
      {...props}
    >
      {showCloseButton && (
        <div
          className="close-button-container"
          onClick={onHide}
          role="button"
          tabIndex="0"
          onKeyDown={() => {}}
        >
          <CloseIcon
            className="bi bi-x-lg close-button"
            fillColor={fillColor}
          />
        </div>
      )}

      {title ? (
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>
      ) : null}
      <ModalBody>{children}</ModalBody>
      {footer ? <ModalFooter>{footer}</ModalFooter> : null}
    </StyledModalWrapper>
  );
};

ModalWrapper.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  title: PropTypes.string,
  width: PropTypes.string,
  footer: PropTypes.node,
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
    PropTypes.element,
  ]),
  showCloseButton: PropTypes.bool,
  fillColor: PropTypes.string,
  dialogWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ModalWrapper;
