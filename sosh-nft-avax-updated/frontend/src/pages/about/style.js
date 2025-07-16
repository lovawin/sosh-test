import { convertPxToRem } from "common/helpers";
import styled from "styled-components";

export const StyledAboutWrapper = styled.div`
  margin: ${convertPxToRem(60)} auto;
  width: ${convertPxToRem(1000)};
  max-width: 100%;
  .body-text {
    font-size: 1.2rem;
  }
`;
