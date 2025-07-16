import { convertPxToRem } from "common/helpers";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

import { deviceQuery } from "styles/mediaSizes";

export const StyledUserChip = styled(Link)`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.palette.text.primary};
  flex-grow: 1;
  max-width: 100%;

  ${({ $disabled }) =>
    $disabled &&
    css`
      pointer-events: none;
    `}

  &:hover {
    color: ${({ theme }) => theme.palette.text.gray};
  }

  .image-wrap {
    .default-avatar {
      color: ${({ theme }) => theme.palette.text.secondary};
      width: ${convertPxToRem(20)};
      height: ${convertPxToRem(20)};
    }
  }

  .details {
    margin-left: ${convertPxToRem(12)};
    min-width: 0;

    .name,
    .username {
      line-height: 150%;
      margin-bottom: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .name {
      font-weight: 500;
      font-size: ${convertPxToRem(18)};

      @media ${deviceQuery.mobile} {
        font-size: ${convertPxToRem(16)};
      }
    }
    .username {
      font-weight: 300;
      font-size: ${convertPxToRem(14)};

      &:before {
        content: "@";
      }

      @media ${deviceQuery.mobile} {
        font-size: ${convertPxToRem(12)};
      }
    }
  }
`;
