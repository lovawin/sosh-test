import React from "react";
import PropTypes from "prop-types";

import { StyledSectionWrapper } from "./style";

const SectionWrapper = ({ children, ...restProps }) => {
  return (
    <StyledSectionWrapper fluid className="page-wrapper" {...restProps}>
      {children}
    </StyledSectionWrapper>
  );
};

export default SectionWrapper;
SectionWrapper.propTypes = {
  children: PropTypes.node,
};
