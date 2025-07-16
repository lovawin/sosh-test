import * as React from "react"
import PropTypes from "prop-types";
const ThreeDotIcon = ({ fillColor = "currentColor", props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill={fillColor}
    className="bi bi-three-dots-vertical"
    {...props}
  >
    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
  </svg>
)
export default ThreeDotIcon


ThreeDotIcon.propTypes = {
  fillColor: PropTypes.string,
};