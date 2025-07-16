import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const StyledCommentItem = styled.div`
  margin: ${convertPxToRem(30)} 0;

  .extra-details {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .comment-action-details {
      .comment-actions-wrapper {
        display: flex;
        justify-content: flex-end;
        align-items: center;

        .button {
          &:not(first-child) {
            margin-left: ${convertPxToRem(5)};
          }
        }
      }
      .like-details {
        color: ${(props) => props.theme.palette.text.tertiary};
        font-size: ${convertPxToRem(14)};
        display: flex;
        align-items: center;
        justify-content: flex-end;

        @media ${deviceQuery.tablet} {
          font-size: ${convertPxToRem(12)};
        }
      }
    }
  }

  .comment {
    font-size: ${convertPxToRem(16)};
    color: ${(props) => props.theme.palette.text.primary};
    margin-top: ${convertPxToRem(5)};
    word-break: break-all;
    @media ${deviceQuery.tablet} {
      font-size: ${convertPxToRem(14)};
    }
  }
`;
