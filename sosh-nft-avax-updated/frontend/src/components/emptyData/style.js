import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const StyledEmptyData = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.palette.text.primary};

  .data-space {
    max-width: ${convertPxToRem(600)};
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .message {
      font-size: ${convertPxToRem(24)};
      margin-bottom: ${convertPxToRem(20)};
      line-height: 150%;
      text-align: center;

      @media ${deviceQuery.tablet} {
        font-size: ${convertPxToRem(20)};
      }
    }

    .action-area {
    }
  }
`;
