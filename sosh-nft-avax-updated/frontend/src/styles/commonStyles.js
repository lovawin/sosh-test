import { css } from "styled-components";

export const InteractiveCardStyles = css`
  ${({ $interactive = true }) =>
    $interactive
      ? css`
          &:hover {
            box-shadow: ${({ theme }) =>
              `0 4px 8px 0 ${theme.palette.common.contrast}33 , 0 6px 20px 0 ${theme.palette.common.contrast}11`};
            transform: scale(1.004);
          }
        `
      : css`
          pointer-events: none;
        `}
`;
