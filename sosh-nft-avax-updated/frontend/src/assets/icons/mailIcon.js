import React from "react";
import PropTypes from "prop-types";

const MailIcon = ({ fillColor = "currentColor", className = "", ...props }) => {
  return (
    <svg
      width="26"
      height="22"
      viewBox="0 0 26 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mail-icon${className ? ` ${className}` : ""}`}
      {...props}
    >
      <path
        d="M25.7999 5.79679V17.2C25.7999 18.2609 25.3785 19.2783 24.6284 20.0284C23.8782 20.7786 22.8608 21.2 21.7999 21.2H4.19995C3.13909 21.2 2.12167 20.7786 1.37152 20.0284C0.621378 19.2783 0.199951 18.2609 0.199951 17.2V5.79679L12.5936 13.0896C12.7167 13.1622 12.857 13.2005 13 13.2005C13.1429 13.2005 13.2832 13.1622 13.4064 13.0896L25.7999 5.79679ZM21.7999 0.399994C22.7842 0.399839 23.7339 0.762564 24.4675 1.41878C25.201 2.07499 25.6669 2.97862 25.776 3.95679L13 11.472L0.223951 3.95679C0.333004 2.97862 0.798869 2.07499 1.53242 1.41878C2.26598 0.762564 3.21572 0.399839 4.19995 0.399994H21.7999Z"
        fill={fillColor}
      />
    </svg>
  );
};

MailIcon.propTypes = {
  fillColor: PropTypes.string,
  className: PropTypes.string,
};

export default MailIcon;
