import React from "react";
import PropTypes from "prop-types";

function InstagramSolidIcon({ fillColor = "currentColor", className = "" }) {
  return (
    <svg
      id="Layer_1"
      version="1.1"
      viewBox="0 0 30 30"
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="26"
      height="26"
      fill={fillColor}
      className={`instagram-solid-icon${className ? ` ${className}` : ""}`}
    >
      <g>
        <circle cx="15" cy="15" r="4" />
        <path d="M19.999,3h-10C6.14,3,3,6.141,3,10.001v10C3,23.86,6.141,27,10.001,27h10C23.86,27,27,23.859,27,19.999v-10   C27,6.14,23.859,3,19.999,3z M15,21c-3.309,0-6-2.691-6-6s2.691-6,6-6s6,2.691,6,6S18.309,21,15,21z M22,9c-0.552,0-1-0.448-1-1   c0-0.552,0.448-1,1-1s1,0.448,1,1C23,8.552,22.552,9,22,9z" />
      </g>
    </svg>
  );
}

export default InstagramSolidIcon;

InstagramSolidIcon.propTypes = {
  fillColor: PropTypes.string,
  className: PropTypes.string,
};
