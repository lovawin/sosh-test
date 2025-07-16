import React from "react";
import PropTypes from "prop-types";

import PlaceholderIcon from "assets/icons/placeholderIcon";
import { useTheme } from "styled-components";
import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { keyframes } from "styled-components";
import { css } from "styled-components";

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }`;

export const StyledImageSkeleton = styled.div`
  width: 100%;
  position: relative;
  padding-top: ${(props) =>
    props?.freeSize ? 0 : `calc(100% / ${props?.aspectRatio})`};
  overflow: hidden;

  .image-wrapper {
    position: ${(props) => (props.freeSize ? "static" : "absolute")};
    top: 0;
    left: 0;
    width: 100%;
    height: ${(props) => (props.freeSize ? "auto" : "100%")};
    display: flex !important;
    align-items: center;
    justify-content: center;
    background-color: ${(props) => props.theme.palette.common.contrast + "11"};

    &.placeholder-image {
      position: absolute;
      height: 100%;
      .placeholder-icon {
        width: calc(100% / 3);
        height: auto;
        opacity: 0.5;
        max-width: ${convertPxToRem(160)};

        ${({ $loading }) =>
          $loading &&
          css`
            animation: ${pulseAnimation} 1.5s infinite;
          `};
      }
    }
  }

  .place-holder {
    display: inline-block;
    width: 100%;
    height: 100%;
    background-color: ${(props) => props.theme.palette.secondary.light};
  }
`;

const ImageSkeleton = ({
  loading = true,
  aspectRatio = 1.36,
  freeSize = false,

  ...props
}) => {
  const theme = useTheme();

  return (
    <StyledImageSkeleton
      aspectRatio={aspectRatio}
      freeSize={freeSize}
      $loading={loading}
      {...props}
    >
      <div className="image-wrapper placeholder-image">
        <PlaceholderIcon backgroundColor={theme.palette.common.gray} />
      </div>
    </StyledImageSkeleton>
  );
};

ImageSkeleton.propTypes = {
  aspectRatio: PropTypes.number,
  freeSize: PropTypes.bool,
  wrapperClassName: PropTypes.string,
  loading: PropTypes.bool,
};

export default React.memo(ImageSkeleton);
