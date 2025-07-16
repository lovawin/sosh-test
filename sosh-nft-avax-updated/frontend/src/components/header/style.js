import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const StyledHeader = styled.div`
  display: flex;
  position: sticky;
  top: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.palette.common.backgroundColor};
  border-bottom: 1px solid ${({ theme }) => theme.palette.common.border.light};
  height: ${({ theme }) => theme.navbar.height};
  padding: ${convertPxToRem(16)} 0;
  z-index: 99;
  align-items: center;
  justify-content: space-between;

  padding-left: ${convertPxToRem(80)};
  padding-right: ${convertPxToRem(80)};

  @media only screen {
    @media ${deviceQuery.desktop} {
      padding-left: ${convertPxToRem(60)};
      padding-right: ${convertPxToRem(60)};
    }

    @media ${deviceQuery.laptop} {
      padding-left: ${convertPxToRem(40)};
      padding-right: ${convertPxToRem(40)};
    }

    @media ${deviceQuery.tablet} {
      padding-left: ${convertPxToRem(15)};
      padding-right: ${convertPxToRem(15)};
    }
  }

  .app-logo {
    width: ${convertPxToRem(101)};
    margin-top: ${convertPxToRem(-10)};

    @media ${deviceQuery.tablet} {
      width: ${convertPxToRem(70)};
    }
  }

  .actions-wrapper {
    display: flex;
    align-items: center;

    @media ${deviceQuery.laptop} {
      flex-grow: 1;

      .search-container {
        margin-right: auto;
      }
    }

    @media ${deviceQuery.tablet} {
      flex-grow: 0;
      justify-content: flex-end;
    }

    & > * {
      margin-left: ${convertPxToRem(20)};
    }

    .connect-button,
    .user-address {
      margin-left: ${convertPxToRem(30)};
    }

    .connect-button,
    .new-post-button,
    .user-address {
      min-width: ${convertPxToRem(160)};
    }

    .theme-button {
      width: ${convertPxToRem(40)};
      height: ${convertPxToRem(40)};
      & > span {
        padding: ${convertPxToRem(10)};

        .theme-icon {
          width: ${convertPxToRem(20)};
          height: ${convertPxToRem(20)};
        }
      }
    }

    .app-launch-btn {
      margin-left: auto;
    }

    .menu-icon-wrap {
      cursor: pointer;
    }
  }
`;
