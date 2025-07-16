import React from "react";
import PropTypes from "prop-types";

const MiniLoaderIcon = ({ fillColor = "#000", ...rest }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1.6C6.25624 1.6 1.6 6.25624 1.6 12H0C0 5.37258 5.37258 0 12 0C15.4773 0 18.6093 1.47976 20.8 3.84152V0H22.4V6.4L16 6.4V4.8L19.5047 4.8C17.6112 2.82674 14.949 1.6 12 1.6ZM12 22.4C17.7438 22.4 22.4 17.7438 22.4 12H24C24 18.6274 18.6274 24 12 24C8.52273 24 5.39069 22.5202 3.2 20.1585V24H1.6V17.6H8V19.2H4.49528C6.3888 21.1733 9.05095 22.4 12 22.4Z"
        fill={fillColor}
      />
    </svg>
  );
};

MiniLoaderIcon.propTypes = {
  fillColor: PropTypes.string,
};

export default MiniLoaderIcon;
