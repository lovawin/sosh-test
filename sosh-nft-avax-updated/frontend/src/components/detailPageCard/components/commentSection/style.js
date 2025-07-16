import { convertPxToRem } from "common/helpers";
import styled from "styled-components";

export const StyledCommentSectionWrap = styled.div`
  .comments-loader {
    margin: 0 auto ${convertPxToRem(10)};

    .spinner {
      width: ${convertPxToRem(18)};
      height: ${convertPxToRem(18)};
    }
    .text {
      font-size: ${convertPxToRem(12)};
    }
  }
`;

export const InputLable = styled.label`
  position: relative;
  height: ${convertPxToRem(38)};
  font-size: 0.875rem;
  border-radius: 1.25rem;
  width: fit-content;
  border-radius: ${convertPxToRem(20)};
  overflow: hidden;
  margin-bottom: 0.2rem;
  border: 1px solid ${({ theme }) => theme.palette.common.border.light};

  .emoji-icon-wrap {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: ${convertPxToRem(10)};

    .emoji-icon {
      width: ${convertPxToRem(18)};
    }
  }
`;

export const Input = styled.input`
  padding: ${convertPxToRem(6)} ${convertPxToRem(6)} ${convertPxToRem(6)}
    ${convertPxToRem(38)};
  color: ${({ theme }) => theme.palette.text.primary};
  height: 100%;
  caret-color: ${({ theme }) => theme.palette.text.primary};
  outline: none;
  width: 100%;
  background-color: transparent;
  font-size: 0.875rem;
  touch-action: manipulation;
  border: none;

  &::placeholder {
    color: ${({ theme }) => theme.palette.text.tertiary};
  }
`;

export const CommentForm = styled.form`
  display: flex;
  margin-top: 1.2rem;
  margin-bottom: 0.7rem;

  .comment-button {
    width: ${convertPxToRem(38)};
    height: ${convertPxToRem(38)};
    padding: 0;
    margin-left: ${convertPxToRem(20)};

    .spinner {
      margin: 0;
    }

    .airplane-icon {
      width: ${convertPxToRem(20)};
      transform: translate(-1px, 0);
    }
  }
`;
