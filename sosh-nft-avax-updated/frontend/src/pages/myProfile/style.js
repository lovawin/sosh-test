import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const StyledProfilePage = styled.div`
  display: flex;
  width: 100%;
  margin: ${convertPxToRem(30)} 0 ${convertPxToRem(50)};
  flex-wrap: wrap;
  a {
    text-decoration: none;
  }

  .user-data-wrap {
    width: max(${convertPxToRem(400)}, 25vw);
    max-width: 100%;

    @media ${deviceQuery.tabletL} {
      width: 100%;
    }
  }

  .post-list-wrap {
    flex-grow: 1;
    margin-left: ${({ theme }) => theme.spacing.unit4};

    .cards-grid {
      overflow: visible !important;
    }

    @media ${deviceQuery.tabletL} {
      margin-left: 0;
      max-width: 100%;
    }

    .spin-loader {
      margin: ${convertPxToRem(30)} auto;
    }
  }
`;
