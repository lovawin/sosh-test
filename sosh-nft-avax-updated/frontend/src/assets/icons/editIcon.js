import React from "react";
import PropTypes from "prop-types";

function EditIcon({ className, fillColor = "currentColor" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`edit-icon${className ? ` ${className}` : ""}`}
    >
      <path
        d="M8 4.00016H3C2.46957 4.00016 1.96086 4.21088 1.58579 4.58595C1.21071 4.96102 1 5.46973 1 6.00016V17.0002C1 17.5306 1.21071 18.0393 1.58579 18.4144C1.96086 18.7894 2.46957 19.0002 3 19.0002H14C14.5304 19.0002 15.0391 18.7894 15.4142 18.4144C15.7893 18.0393 16 17.5306 16 17.0002V12.0002M14.586 2.58616C14.7705 2.39514 14.9912 2.24278 15.2352 2.13796C15.4792 2.03314 15.7416 1.97797 16.0072 1.97566C16.2728 1.97335 16.5361 2.02396 16.7819 2.12452C17.0277 2.22508 17.251 2.37359 17.4388 2.56137C17.6266 2.74916 17.7751 2.97246 17.8756 3.21825C17.9762 3.46405 18.0268 3.72741 18.0245 3.99296C18.0222 4.25852 17.967 4.52096 17.8622 4.76497C17.7574 5.00898 17.605 5.22967 17.414 5.41416L8.828 14.0002H6V11.1722L14.586 2.58616Z"
        stroke={fillColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default EditIcon;
EditIcon.propTypes = {
  className: PropTypes.string,
  fillColor: PropTypes.string,
};
