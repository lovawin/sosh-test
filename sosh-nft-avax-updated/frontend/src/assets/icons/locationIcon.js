import React from "react";
import PropTypes from "prop-types";

function LocationIcon({ className, fillColor = "currentColor" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className={`location-icon${className ? ` ${className}` : ""}`}
      viewBox="0 0 16 16"
    >
      <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
    </svg>
  );
}

export default LocationIcon;
LocationIcon.propTypes = {
  className: PropTypes.string,
  fillColor: PropTypes.string,
};
