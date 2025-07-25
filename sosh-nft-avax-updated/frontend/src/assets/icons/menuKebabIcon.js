import React from "react";
import PropTypes from "prop-types";

function MenuKebabIcon({ className, fillColor = "currentColor" }) {
  return (
    <svg
      width="5"
      height="23"
      viewBox="0 0 5 23"
      fill="none"
      className={`menu-kebab-icon${className ? ` ${className}` : ""}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="2.5"
        cy="2.5"
        r="2.5"
        transform="rotate(90 2.5 2.5)"
        fill={fillColor}
      />
      <circle
        cx="2.5"
        cy="11.5"
        r="2.5"
        transform="rotate(90 2.5 11.5)"
        fill={fillColor}
      />
      <circle
        cx="2.5"
        cy="20.5"
        r="2.5"
        transform="rotate(90 2.5 20.5)"
        fill={fillColor}
      />
    </svg>
  );
}

export default MenuKebabIcon;
MenuKebabIcon.propTypes = {
  className: PropTypes.string,
  fillColor: PropTypes.string,
};
