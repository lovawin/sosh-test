import React from "react";

import PropTypes from "prop-types";
import { StyledDeleteButton } from "./style";
import DeleteIcon from "assets/icons/deleteIcon";
import MiniLoader from "components/miniLoader";

function DeleteButton({ onClick, loading, noLabel = false }) {
  return (
    <StyledDeleteButton
      className="button delete-button"
      $noLabel={noLabel}
      onClick={onClick}
    >
      {loading ? (
        <MiniLoader className="icon" />
      ) : (
        <DeleteIcon className="icon" />
      )}
      {noLabel ? null : <span className="label">Delete</span>}
    </StyledDeleteButton>
  );
}

export default DeleteButton;

DeleteButton.propTypes = {
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  noLabel: PropTypes.bool,
};
