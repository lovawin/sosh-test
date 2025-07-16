import { convertPxToRem } from "common/helpers";
import styled, { keyframes } from "styled-components";

const rotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
`;

const getAnimationTime = (speed) => {
  switch (speed) {
    case "slow":
      return "1s";
    case "fast":
      return "0.4s";
    default:
      return "0.6s";
  }
};

export const StyledLoader = styled.div`
  display: flex;
  flex-direction: ${({ vertical = false }) => (vertical ? "column" : "row")};
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: max-content;

  svg {
    width: ${({ width = "auto" }) => width ?? "24px"};
    height: ${({ width = "auto" }) => width ?? "24px"};
    animation: ${rotateAnimation} ${({ speed }) => getAnimationTime(speed)}
      infinite linear;
  }

  span.text {
    line-height: 112.1%;
    letter-spacing: 0.1em;
    max-width: 100vw;
    text-align: ${({ vertical = false }) => (vertical ? "center" : "left")};
    text-transform: uppercase;
    font-size: ${convertPxToRem(14)};
    margin: ${({ vertical = false }) =>
      vertical ? `${convertPxToRem(24)} 0 0` : `0 0 0 ${convertPxToRem(16)}`};
  }
`;
