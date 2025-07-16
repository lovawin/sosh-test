import React from "react";
import PropTypes from "prop-types";

function CloseIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      className={`close-icon${className ? ` ${className}` : ""}`}
    >
      <path
        fillRule="evenodd"
        d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"
      />
      <path
        fillRule="evenodd"
        d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"
      />
    </svg>
  );
}

export default CloseIcon;
CloseIcon.propTypes = {
  className: PropTypes.string,
  fillColor: PropTypes.string,
};
