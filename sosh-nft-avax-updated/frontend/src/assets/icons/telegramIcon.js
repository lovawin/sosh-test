import React from "react";
import PropTypes from "prop-types";

const TelegramIcon = ({
  fillColor = "currentColor",
  className = "",
  ...props
}) => {
    const svgClassName = className
      ? "telegram-icon " + className
      : "telegram-icon";

  return (
    <svg
      width="28"
      height="24"
      viewBox="0 0 28 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={svgClassName}
      {...props}
    >
      <path
        d="M27.9188 2.1625L23.6938 22.0875C23.3751 23.4937 22.5438 23.8437 21.3626 23.1812L14.9251 18.4375L11.8188 21.425C11.4751 21.7687 11.1876 22.0562 10.5251 22.0562L10.9876 15.5L22.9188 4.71875C23.4376 4.25625 22.8063 4 22.1126 4.4625L7.36258 13.75L1.01258 11.7625C-0.368672 11.3312 -0.393672 10.3812 1.30008 9.71875L26.1376 0.150001C27.2876 -0.281249 28.2938 0.40625 27.9188 2.1625Z"
        fill={fillColor}
      />
    </svg>
  );
};

TelegramIcon.propTypes = {
  fillColor: PropTypes.string,
  className: PropTypes.string,
};

export default TelegramIcon;
