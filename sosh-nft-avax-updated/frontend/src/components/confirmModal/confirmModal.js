import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import { StyledConfirmModal } from "./style";

const ConfirmModal = ({
  show,
  onHide,
  message,
  title,
  onCancel,
  onConfirm,
  cancelLabel,
  prepend,
  confirmLabel,
  type,
}) => {
  const closeHandler = useCallback(() => {
    onHide && onHide();
  }, [onHide]);

  const confirmHandler = useCallback(() => {
    onConfirm && onConfirm();
    closeHandler();
  }, [onConfirm, closeHandler]);

  const cancelHandler = useCallback(() => {
    onCancel && onCancel();
    closeHandler();
  }, [onCancel, closeHandler]);

  return (
    <StyledConfirmModal
      title={title === "" ? null : title || "Confirmation !"}
      $type={type}
      centered
      show={show}
      onHide={closeHandler}
      header
      footer={
        <>
          <Button
            variant="secondary"
            className="cancel-button"
            onClick={cancelHandler}
          >
            {cancelLabel || "Cancel"}
          </Button>
          <Button
            variant="primary"
            className="confirm-button"
            onClick={confirmHandler}
          >
            {confirmLabel || "Confirm"}
          </Button>
        </>
      }
    >
      {prepend && <div className="modal-body-prepend">{prepend}</div>}
      <p>{message || "Are you sure to continue this action?"}</p>
    </StyledConfirmModal>
  );
};
export default ConfirmModal;

ConfirmModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
  text: PropTypes.string,
  cancelLabel: PropTypes.string,
  confirmLabel: PropTypes.string,
  type: PropTypes.string,
  prepend: PropTypes.node,
};
