import styled, { keyframes } from "styled-components";

const bubbleAnimation = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
`;

export const StyledLoadingSpinningBubbles = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  margin: auto;
  width: 100vw;
  height: 100vh;
  z-index: 999;

  .loader {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .bubble-container {
    position: absolute;
    top: calc(50% - 15px / 2);
    left: calc(50% - 15px / 2);
    transform-origin: -150% 50%;
  }

  .bubble-container .bubble {
    background: #00adb5;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    animation: ${bubbleAnimation} 1s infinite;
    animation-delay: inherit;
  }

  .bubble-container:nth-of-type(0n + 1) {
    transform: translateX(200%) rotate(-90deg);
    animation-delay: -1.5s;
  }

  .bubble-container:nth-of-type(0n + 2) {
    transform: translateX(200%) rotate(-45deg);
    animation-delay: -1.375s;
  }

  .bubble-container:nth-of-type(0n + 3) {
    transform: translateX(200%);
    animation-delay: -1.25s;
  }

  .bubble-container:nth-of-type(0n + 4) {
    transform: translateX(200%) rotate(45deg);
    animation-delay: -1.125s;
  }

  .bubble-container:nth-of-type(0n + 5) {
    transform: translateX(200%) rotate(90deg);
    animation-delay: -1s;
  }

  .bubble-container:nth-of-type(0n + 6) {
    transform: translateX(200%) rotate(135deg);
    animation-delay: -0.875s;
  }

  .bubble-container:nth-of-type(0n + 7) {
    transform: translateX(200%) rotate(180deg);
    animation-delay: -0.75s;
  }

  .bubble-container:nth-of-type(0n + 8) {
    transform: translateX(200%) rotate(225deg);
    animation-delay: -0.625s;
  }
`;
