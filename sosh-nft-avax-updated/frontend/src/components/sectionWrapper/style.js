import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const StyledSectionWrapper = styled.div`
  width: 100%;
  margin: 0 auto;
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
`;
