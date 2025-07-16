import { convertPxToRem } from "common/helpers";
import { COMPONENT_SIZES } from "constants/appConstants";
import styled from "styled-components";

export const AvatarWrapper = styled.div`
  width: ${(props) => props.$width || convertPxToRem(100)};
  height: ${(props) => props.$height || convertPxToRem(100)};
  display: grid;
  place-items: center;
  flex-shrink: 0;

  &.avatar-${COMPONENT_SIZES.LARGE}-wrapper {
    width: ${(props) => props.$width || convertPxToRem(120)};
    height: ${(props) => props.$height || convertPxToRem(120)};
  }

  &.avatar-${COMPONENT_SIZES.SMALL}-wrapper {
    width: ${(props) => props.$width || convertPxToRem(80)};
    height: ${(props) => props.$height || convertPxToRem(80)};
  }

  &.avatar-${COMPONENT_SIZES.X_SMALL}-wrapper {
    width: ${(props) => props.$width || convertPxToRem(50)};
    height: ${(props) => props.$height || convertPxToRem(50)};
  }

  .image-wrap {
    width: 100%;
    height: 100%;
    display: flex;
    border-radius: ${(props) => (props.$square ? "0rem" : "50%")};
    overflow: hidden;
    position: relative;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    background-color: ${(props) =>
      props.$imgURL
        ? "transparent"
        : props.theme.palette.common.contrast + "20"};

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: ${(props) => !props.$imgURL && "none"};
    }

    svg {
      width: ${convertPxToRem(32)};
      height: ${convertPxToRem(32)};
      color: ${(props) => props.theme.palette.text.primary};

      &.${COMPONENT_SIZES.SMALL},&.${COMPONENT_SIZES.X_SMALL} {
        width: ${convertPxToRem(12.8)};
        height: ${convertPxToRem(12.8)};
      }
    }

    .loader-wrap {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background-color: ${(props) => props.theme.palette.common.light}88;
      color: ${(props) => props.theme.palette.primary.main};
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;
