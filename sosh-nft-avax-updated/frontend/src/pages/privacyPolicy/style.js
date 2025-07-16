import { convertPxToRem } from "common/helpers";
import styled from "styled-components";

export const StyledPrivacyWrapper = styled.div`
  margin: ${convertPxToRem(60)} auto;
  width: ${convertPxToRem(1000)};
  max-width: 100%;
`;
