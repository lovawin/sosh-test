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

export const StyledWrapper = styled.div`
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
    .lazy-image {
      width: 100%;
    }
  }

  .place-holder {
    display: inline-block;
    width: 100%;
    height: 100%;
    background-color: ${(props) => props.theme.palette.common.contrast + "11"};
  }

  .loader-wrap {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-color: ${(props) => props.theme.palette.white.light}88;
    opacity: 0.5;
    color: ${(props) => props.theme.palette.primary.main};
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
