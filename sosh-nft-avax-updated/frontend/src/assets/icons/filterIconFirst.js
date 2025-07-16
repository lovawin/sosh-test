import * as React from "react";
import PropTypes from "prop-types";
const FilterIconFirst = ({fillColor = "currentColor",props}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    fill="none"
    {...props}
  >
    <path
      fill={fillColor}
      fillOpacity={0.5}
      d="M40 23.78v.46a2 2 0 0 1-2 2H15.32c-1.104 0-2-.896-2-2v-.46c0-1.104.896-2 2-2H38a1.998 1.998 0 0 1 2 2Zm-2 6.88H15.32c-1.104 0-2 .896-2 2v.46a2 2 0 0 0 2 2H38a2 2 0 0 0 2-2v-.46a2.004 2.004 0 0 0-2-2ZM6.88 21.78h-4.88c-1.105 0-2.001.896-2.001 2v.46a2 2 0 0 0 2 2h4.881a2 2 0 0 0 1.999-2v-.46a1.998 1.998 0 0 0-1.999-2Zm0 8.88h-4.88c-1.105 0-2.001.896-2.001 2v.46a2 2 0 0 0 2 2h4.881a2 2 0 0 0 1.999-2v-.46a1.998 1.998 0 0 0-1.999-2ZM38 12.88H15.32c-1.104 0-2 .896-2 2v.46a2.003 2.003 0 0 0 2 2H38a1.998 1.998 0 0 0 2-2v-.46a2 2 0 0 0-2-2ZM38 4H15.32c-1.104 0-2 .896-2 2v.46a2.004 2.004 0 0 0 2 2H38a1.998 1.998 0 0 0 2-2V6a2 2 0 0 0-2-2ZM6.881 12.88h-4.88c-1.105 0-2.001.896-2.001 2v.46a2.004 2.004 0 0 0 2 2h4.881a1.998 1.998 0 0 0 1.999-2v-.46a1.998 1.998 0 0 0-1.999-2Zm0-8.88h-4.88C.896 4 0 4.896 0 6v.46a2.004 2.004 0 0 0 2 2h4.881a1.998 1.998 0 0 0 1.999-2V6A1.998 1.998 0 0 0 6.88 4Z"
    />
  </svg>
);
export default FilterIconFirst;

FilterIconFirst.propTypes = {
  fillColor: PropTypes.string,
};
