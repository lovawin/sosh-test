import { convertPxToRem } from "common/helpers";
import styled from "styled-components";

export const StyledFollowListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${convertPxToRem(18)};

  .action-wrap {
    margin-left: ${convertPxToRem(12)};

    .follow-button {
      margin-left: 0.625rem;
      font-weight: 600;
      font-size: ${convertPxToRem(14)};
      padding: 2px;
      line-height: 150%;

      & > span {
        padding: ${convertPxToRem(4)} ${convertPxToRem(14)};
        .spinner {
          width: ${convertPxToRem(18)};
          height: ${convertPxToRem(18)};
        }
      }
    }
  }
`;
