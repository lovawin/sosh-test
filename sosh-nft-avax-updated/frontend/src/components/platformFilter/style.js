import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const StyledTagsWrapper = styled.div`
  .platform-tags-section-title {
    font-weight: 500;
    font-size: ${convertPxToRem(18)};
    line-height: 150%;
    margin-bottom: ${convertPxToRem(20)};
  }

  .platform-tag-list {
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

    .platform-tag {
      border: 1px solid ${({ theme }) => theme.palette.common.border.light};
      color: ${(props) => props.theme.palette.text.primary};
      text-align: center;

      height: ${convertPxToRem(50)};
      padding: ${convertPxToRem(6)};
      text-decoration: none;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      margin-bottom: ${convertPxToRem(10)};
      cursor: pointer;

      @media ${deviceQuery.tablet} {
        height: ${convertPxToRem(40)};
        padding: ${convertPxToRem(4)};
      }

      &.selected {
        background-color: ${({ theme }) =>
          theme.palette.common.contrast + "22"};
      }

      &:hover {
        opacity: 0.8;
      }

      border-radius: ${convertPxToRem(25)};

      .platform-tag-image {
        width: ${convertPxToRem(38)};
        height: ${convertPxToRem(38)};
        border-radius: 50%;

        @media ${deviceQuery.tablet} {
          width: ${convertPxToRem(32)};
          height: ${convertPxToRem(32)};
        }
      }

      .platform-tag-label {
        font-size: ${convertPxToRem(14)};
        padding: 0 ${convertPxToRem(15)};

        &.less-spaced {
          padding: 0 ${convertPxToRem(10)};
        }
      }
    }
  }
`;
