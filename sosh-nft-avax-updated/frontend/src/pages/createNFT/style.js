import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const Main = styled.div`
  display: flex;
  flex-wrap: wrap;
  min-height: calc(100vh - ${(props) => props.theme.navbar.height});

  @media ${deviceQuery.tablet} {
    flex-direction: column-reverse;
  }

  .col {
    width: 50%;

    .section-heading {
      font-size: ${convertPxToRem(32)};

      @media ${deviceQuery.tablet} {
        font-size: ${convertPxToRem(28)};
      }

      @media ${deviceQuery.mobile} {
        font-size: ${convertPxToRem(24)};
      }
    }

    @media ${deviceQuery.tablet} {
      width: 100%;
    }
  }
`;
