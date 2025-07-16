import React from 'react';
import PropTypes from 'prop-types';

const TickIcon = ({ fillColor = '#fff', ...props }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23.5315 4.80032L8.80012 19.5317L0.46875 11.2003L1.60012 10.0689L8.80012 17.2689L22.4001 3.66895L23.5315 4.80032Z"
        fill={fillColor}
      />
    </svg>
  );
};

TickIcon.propTypes = {
  fillColor: PropTypes.string,
};

export default TickIcon;
