import React from "react";
import PropTypes from "prop-types";

function MoonIcon({ fillColor = "currentColor", className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      fill={fillColor}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={`moon-icon${className ? ` ${className}` : ""}`}
    >
      <path d="M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  );
}

export default MoonIcon;

MoonIcon.propTypes = {
  fillColor: PropTypes.string,
  className: PropTypes.string,
};
