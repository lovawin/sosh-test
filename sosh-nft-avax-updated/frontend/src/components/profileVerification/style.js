import { convertPxToRem } from "common/helpers";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const Main = styled.div`
  p {
    margin-top: ${convertPxToRem(40)};
  }
`;

export const Heading = styled.div`
  font-weight: 800;
  font-size: ${convertPxToRem(32)};
  margin-bottom: ${convertPxToRem(20)};

  @media ${deviceQuery.tablet} {
    font-size: ${convertPxToRem(28)};
  }

  @media ${deviceQuery.mobile} {
    font-size: ${convertPxToRem(24)};
  }
`;
