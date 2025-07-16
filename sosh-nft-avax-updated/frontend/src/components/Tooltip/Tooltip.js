import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { OverlayTrigger } from 'react-bootstrap';
import { StyledToolTip } from './style';

const Tooltip = ({
  message,
  children,
  showTooltip = true,
  variant = 'dark',
  overlayTriggerProps = {},
}) => {
  const [show, setShow] = useState(false);

  const onToggleHandler = (nextShow) => {
    if (showTooltip) setShow(nextShow);
    else setShow(false);
  };

  return (
    <OverlayTrigger
      show={show}
      onToggle={onToggleHandler}
      placement="auto"
      delay={{ hide: 50 }}
      overlay={<StyledToolTip variant={variant}>{message}</StyledToolTip>}
      {...overlayTriggerProps}
    >
      {children}
    </OverlayTrigger>
  );
};

Tooltip.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.element]),
  showTooltip: PropTypes.bool,
  variant: PropTypes.oneOf(['light', 'dark']),
  overlayTriggerProps: PropTypes.shape(OverlayTrigger.propTypes),
};

export default Tooltip;
