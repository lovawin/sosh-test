import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { convertPxToRem } from "common/helpers";

const StyledBoxSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.palette.common.contrast + "22"};
  width: ${({ $width }) => $width || convertPxToRem(50)};
  height: ${({ $height }) => $height || convertPxToRem(50)};
  border-radius: ${({ $radius }) => $radius || convertPxToRem(0)};
`;

function BoxSkeleton({ width, height, radius, className }) {
  return (
    <StyledBoxSkeleton
      $width={width}
      $height={height}
      $radius={radius}
      className={`skel-box${className ? ` ${className}` : ""}`}
    />
  );
}

export default BoxSkeleton;
BoxSkeleton.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  radius: PropTypes.string,
  className: PropTypes.string,
};
