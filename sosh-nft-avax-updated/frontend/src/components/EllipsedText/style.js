import { convertPxToRem } from "common/helpers";
import styled from "styled-components";

export const StyledEllipsedText = styled.span`
  .show-more-button {
    margin-left: ${convertPxToRem(5)};
    cursor: pointer;
  }
`;
