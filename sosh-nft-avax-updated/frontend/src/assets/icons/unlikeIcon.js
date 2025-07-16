import React from "react";
import PropTypes from "prop-types";

function UnlikeIcon({ fillColor = "#fff", className = "" }) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 1000 1000"
      enableBackground="new 0 0 1000 1000"
      xmlSpace="preserve"
      className={`unlike-icon${className ? ` ${className}` : ""}`}
    >
      <path
        fill={fillColor}
        d="M909.7,166.9c-95.3-87.4-249.7-87.4-345,0L500,226.2l-64.7-59.4c-95.3-87.4-249.7-87.4-344.9,0c-107.2,98.4-107.2,257.5,0,355.9l409.6,376l409.6-376C1016.8,424.4,1016.8,265.2,909.7,166.9z"
      />
    </svg>
  );
}

export default UnlikeIcon;

UnlikeIcon.propTypes = {
  fillColor: PropTypes.string,
  className: PropTypes.string,
};
