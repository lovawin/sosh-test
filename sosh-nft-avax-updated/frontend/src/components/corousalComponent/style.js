import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const Main = styled.div`
  text-align: center;

  .asset-image-container {
    width: calc(100% - ${convertPxToRem(40)});
    margin: auto;
    position: relative;
    min-height: ${convertPxToRem(450)};

    @media ${deviceQuery.tablet} {
      min-height: ${convertPxToRem(300)};
    }

    @media ${deviceQuery.mobile} {
      width: calc(100% - ${convertPxToRem(30)});
    }

    .nav-item {
      position: absolute;
      width: ${convertPxToRem(30)};
      height: ${convertPxToRem(30)};
      top: 40vh;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      color: ${({ theme }) => theme.palette.text.primary};

      @media ${deviceQuery.tablet} {
        top: 20vh;
      }

      &:active {
        opacity: 0.8;
      }

      .icon {
        width: ${convertPxToRem(20)};
        height: ${convertPxToRem(20)};

        @media ${deviceQuery.mobile} {
          width: ${convertPxToRem(15)};
          height: ${convertPxToRem(15)};
        }
      }

      &.left {
        left: ${convertPxToRem(-35)};
        transform: translateY(-50%);

        @media ${deviceQuery.mobile} {
          left: ${convertPxToRem(-30)};
        }
      }
      &.right {
        right: ${convertPxToRem(-35)};
        transform: translateY(-50%) rotate(180deg);

        @media ${deviceQuery.mobile} {
          right: ${convertPxToRem(-30)};
        }
      }
    }

    .image-wrapper {
      min-height: ${convertPxToRem(450)};
      background: transparent;

      border-radius: ${({ theme }) => theme.shape.borderRadius.unit};

      .lazy-image {
        max-width: 100%;
      }

      @media ${deviceQuery.tablet} {
        min-height: ${convertPxToRem(300)};
      }
    }
  }

  .carousel.carousel-slider .control-arrow:hover {
    background: none;
  }
  .carousel .carousel-status {
    display: none;
  }
`;
export const Img = styled.img`
  max-width: 100%;
`;

export const FullImage = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 5%;
  background: black;
  overflow: hidden;
`;
