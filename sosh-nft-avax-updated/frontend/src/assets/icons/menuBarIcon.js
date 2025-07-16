import React from "react";
import PropTypes from "prop-types";

function MenuBarIcon({ fillColor = "currentColor", className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="35"
      height="35"
      className={`menu-bar-icon${className ? ` ${className}` : ""}`}
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
        fill={fillColor}
      />
    </svg>
  );
}

export default MenuBarIcon;

MenuBarIcon.propTypes = {
  fillColor: PropTypes.string,
  className: PropTypes.string,
};
