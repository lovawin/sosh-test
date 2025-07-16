import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const StyledUseTermsWrapper = styled.div`
  margin: ${convertPxToRem(60)} auto;
  width: ${convertPxToRem(1000)};
  max-width: 100%;

  .text-highlight {
    color: ${(props) => props.theme.palette.text.primary};
    font-weight: bold;
    font-size: ${convertPxToRem(20)};
    margin: ${convertPxToRem(30)} 0 ${convertPxToRem(15)};

    @media ${deviceQuery.tablet} {
      font-size: ${convertPxToRem(18)};
    }
  }
`;
