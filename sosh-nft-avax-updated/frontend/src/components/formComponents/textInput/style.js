import { convertPxToRem } from "common/helpers";
import styled, { css } from "styled-components";

import { deviceQuery } from "styles/mediaSizes";

const getConditionalStyles = ({ $isTextarea, $outline }) => {
  const height = convertPxToRem(30);
  if ($isTextarea) {
    return css`
      min-height: ${height};
      padding: ${convertPxToRem(10)};
    `;
  } else if ($outline) {
    return css`
      min-height: ${height};
      padding: ${convertPxToRem(10)};
    `;
  } else {
    return css`
      height: ${convertPxToRem(30)};
      border-radius: 0;
    `;
  }
};

export const StyledTextInput = styled.div`
  .input-wrap {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .text-input-label {
      flex-shrink: 0;
      margin-bottom: 0;
      cursor: pointer;

      font-size: ${convertPxToRem(16)};

      @media ${deviceQuery.mobile} {
        font-size: ${convertPxToRem(14)};
      }
    }

    .custom-text-input {
      outline: none;

      width: 100%;
      border: 1px solid ${(props) => props.theme.palette.common.border.gray};
      border-width: 0 0 1px 0;
      background: none;
      font-size: ${convertPxToRem(16)};
      line-height: 150%;
      padding: ${convertPxToRem(2)} ${convertPxToRem(5)};
      color: ${(props) => props.theme.palette.text.primary};
      border-radius: ${({ theme }) => theme.shape.borderRadius.unit};

      ${(props) => getConditionalStyles(props)}

      ${({ $outline }) =>
        $outline &&
        css`
          border-width: 1px;
        `}

      &::placeholder {
        color: ${(props) => props.theme.palette.text.secondary};
        opacity: 1; /* Firefox */
      }

      &:disabled {
        opacity: 0.8;
        cursor: not-allowed;
      }
    }
  }

  .text-helper {
    color: ${(props) => props.theme.palette.text.tertiary};
  }

  .text-helper,
  .invalid-feedback {
    display: block;
    margin-top: ${convertPxToRem(3)};
    font-size: ${convertPxToRem(14)};
    line-height: 150%;
    text-align: inherit;

    @media ${deviceQuery.mobile} {
      font-size: ${convertPxToRem(12)};
    }
  }
`;
