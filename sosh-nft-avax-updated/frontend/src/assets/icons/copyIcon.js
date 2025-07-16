import React from "react";
import PropTypes from "prop-types";

const CopyIcon = ({ fillColor = "currentColor", className = "", ...props }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`copy-icon${className ? ` ${className}` : ""}`}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.00065 1.33333C5.63246 1.33333 5.33398 1.63181 5.33398 2V15.3333C5.33398 15.7015 5.63246 16 6.00065 16H16.6673C17.0355 16 17.334 15.7015 17.334 15.3333V3.69012L13.7988 1.33333H6.00065ZM4.00065 2C4.00065 0.89543 4.89608 0 6.00065 0H14.2025L18.6673 2.97654V15.3333C18.6673 16.4379 17.7719 17.3333 16.6673 17.3333H16.0007V18C16.0007 19.1046 15.1052 20 14.0007 20H3.33398C2.22942 20 1.33398 19.1046 1.33398 18V4.66667C1.33398 3.5621 2.22941 2.66667 3.33398 2.66667H4.00065V2ZM4.00065 4H3.33398C2.96579 4 2.66732 4.29848 2.66732 4.66667V18C2.66732 18.3682 2.96579 18.6667 3.33398 18.6667H14.0007C14.3688 18.6667 14.6673 18.3682 14.6673 18V17.3333H6.00065C4.89608 17.3333 4.00065 16.4379 4.00065 15.3333V4Z"
        fill={fillColor}
      />
    </svg>
  );
};

CopyIcon.propTypes = {
  fillColor: PropTypes.string,
  className: PropTypes.string,
};

export default CopyIcon;
