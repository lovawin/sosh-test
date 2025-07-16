import { convertPxToRem } from "common/helpers";
import styled, { css } from "styled-components";

import { deviceQuery } from "styles/mediaSizes";

export const StyledTagsWrapper = styled.div`
  .tags-section-title {
    font-weight: 500;
    font-size: ${convertPxToRem(18)};
    line-height: 150%;
    margin-bottom: ${convertPxToRem(20)};
  }

  .tag-list {
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    @media ${deviceQuery.laptop} {
      flex-wrap: nowrap;
      width: 100%;
      overflow: auto;
    }

    & > div:not(:last-child) {
      margin-right: ${convertPxToRem(10)};
    }

    .tag {
      border: 1px solid ${({ theme }) => theme.palette.common.border.light};
      color: ${(props) => props.theme.palette.text.primary};
      text-align: center;
      padding: ${convertPxToRem(6)} ${convertPxToRem(8)};
      text-decoration: none;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      border-radius: ${({ theme }) => theme.shape.borderRadius.unit};
      position: relative;
      padding-right: ${({ $cancelable }) =>
        $cancelable ? convertPxToRem(24) : convertPxToRem(8)};
      @media ${deviceQuery.tablet} {
        height: ${convertPxToRem(40)};
        padding: ${convertPxToRem(4)};
      }
      cursor: ${({ $selectible }) => ($selectible ? "pointer" : "default")};

      &.selected {
        background-color: ${({ theme }) =>
          theme.palette.common.contrast + "22"};
      }

      ${({ $selectible }) =>
        $selectible &&
        css`
          &:hover {
            opacity: 0.8;
          }
        `}

      .tag-label {
        display: flex;
        align-items: center;
        font-size: ${convertPxToRem(14)};
        margin: 0 ${convertPxToRem(8)};
      }

      .close-icon-wrap {
        width: ${convertPxToRem(16)};
        height: ${convertPxToRem(16)};
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: absolute;
        top: 50%;
        right: ${convertPxToRem(8)};
        transform: translateY(-50%);
        border-radius: 50%;
        &:hover {
          background-color: ${({ theme }) =>
            theme.palette.common.contrast + "11"};
        }

        .close-icon {
          width: ${convertPxToRem(11)};
          height: ${convertPxToRem(11)};
        }
      }
    }
  }
`;
