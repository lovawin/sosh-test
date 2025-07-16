import React from "react";
import PropTypes from "prop-types";

const User3Icon = ({ fillColor = "#6A6A6A", className, ...restProps }) => {
  return (
    <svg
      width="32"
      height="40"
      viewBox="0 0 32 40"
      className={`user3-icon${className ? ` ${className}` : ""}`}
      {...restProps}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.9997 3.49967C12.3166 3.49967 9.333 6.48254 9.333 10.1611C9.333 13.8397 12.3166 16.8226 15.9997 16.8226C19.6828 16.8226 22.6663 13.8397 22.6663 10.1611C22.6663 6.48254 19.6828 3.49967 15.9997 3.49967ZM6.66634 10.1611C6.66634 5.00814 10.8454 0.833008 15.9997 0.833008C21.1539 0.833008 25.333 5.00814 25.333 10.1611C25.333 15.3141 21.1539 19.4892 15.9997 19.4892C10.8454 19.4892 6.66634 15.3141 6.66634 10.1611ZM9.33333 25.8174C5.65114 25.8174 2.66667 28.8011 2.66667 32.4827V36.4754H29.333V32.4827C29.333 28.8011 26.3485 25.8174 22.6663 25.8174H9.33333ZM0 32.4827C0 27.3277 4.17897 23.1507 9.33333 23.1507H22.6663C27.8207 23.1507 31.9997 27.3277 31.9997 32.4827V39.142H0V32.4827Z"
        fill={fillColor}
      />
    </svg>
  );
};

export default User3Icon;

User3Icon.propTypes = {
  fillColor: PropTypes.string,
  className: PropTypes.string,
};
