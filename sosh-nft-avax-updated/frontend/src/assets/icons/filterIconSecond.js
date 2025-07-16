import * as React from "react";
import PropTypes from "prop-types";
const FilterIconSecond = ({ fillColor = "currentColor", props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={38}
    fill="none"
    {...props}
  >
    <path
      fill={fillColor}
      fillOpacity={0.5}
      d="M39.632 2.273A3.84 3.84 0 0 0 36.094 0H3.89A3.893 3.893 0 0 0 .942 6.432l13.386 15.515 1.104 14.206a1.2 1.2 0 0 0 1.66 1.016l6.961-2.88a1.2 1.2 0 0 0 .74-1.016l.875-11.321L39.054 6.437a3.841 3.841 0 0 0 .578-4.164Zm-2.4 2.595L23.592 20.68a1.18 1.18 0 0 0-.288.689l-.85 10.98-4.752 1.97L16.7 21.36a1.18 1.18 0 0 0-.288-.689L2.759 4.868A1.493 1.493 0 0 1 3.89 2.4h32.205a1.493 1.493 0 0 1 1.13 2.468h.008Z"
    />
  </svg>
);
export default FilterIconSecond;

FilterIconSecond.propTypes = {
  fillColor: PropTypes.string,
};
