import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const StyledMenuDrawer = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.navbar.height};
  left: 0;
  width: 100%;
  border-top: 1px solid ${({ theme }) => theme.palette.common.border.light};
  background: ${({ theme }) => theme.palette.common.card.backgroundColor};
  z-index: 999;

  .user-data-card {
    border: none;
    padding-top: 0;
  }

  .buttons-wrap {
    display: flex;
    gap: ${convertPxToRem(20)};
    justify-content: center;
    padding: ${convertPxToRem(20)};
    & > * {
      min-width: ${convertPxToRem(160)};
    }

    @media ${deviceQuery.tablet} {
      flex-wrap: wrap;
      & > * {
        flex-grow: 1;
      }
    }

    .button {
      &.outline {
        background-image: ${({
          theme,
        }) => ` linear-gradient(${theme.palette.common.card.backgroundColor},${theme.palette.common.card.backgroundColor}),
          ${theme.palette.gradient.main}`};
      }
    }
  }

  .userdata-card-footer {
    .site-link-wrap {
      width: ${convertPxToRem(500)};
      max-width: 100%;
    }
    .social-icons-wrap {
      max-width: 100%;

      margin: ${convertPxToRem(20)} auto 0;
      justify-content: center;

      .icon {
        width: ${convertPxToRem(20)};
        height: ${convertPxToRem(20)};
        margin: ${convertPxToRem(10)};
      }
    }
  }
`;
