import React from "react";
import PropTypes from "prop-types";

const ShareIcon = ({
  fillColor = "currentColor",
  className = "",
  ...props
}) => {
  
  const svgClassName = className ? "share-icon " + className : "share-icon";

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill={fillColor}
      className={svgClassName}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.9938 8.99519L9.7906 0V5.38824H8.83768C6.47713 5.38824 4.25775 6.30752 2.58852 7.97676C0.919281 9.64599 0 11.8654 0 14.2261V18L1.57434 16.275C3.68028 13.9677 6.66966 12.633 9.7906 12.6027V17.9905L17.9938 8.99519ZM1.05482 15.2883V14.2261C1.05482 12.1472 1.86438 10.1926 3.33435 8.72259C4.80432 7.25262 6.75879 6.44307 8.83768 6.44307H10.8453V2.722L16.5664 8.99519L10.8453 15.2685V11.5475H9.89896C6.56955 11.5475 3.36786 12.9063 1.05482 15.2883Z"
        fill={fillColor}
      />
    </svg>
  );
};

ShareIcon.propTypes = {
  fillColor: PropTypes.string,
};

export default ShareIcon;
