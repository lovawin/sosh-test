import { convertPxToRem } from "common/helpers";
import { StyledCardButton } from "components/styled/styledCardButton";
import styled from "styled-components";

export const StyledShareButton = styled(StyledCardButton)`
  padding: ${convertPxToRem(5)} ${convertPxToRem(10)};

  .icon {
    width: ${convertPxToRem(14)};
    height: ${convertPxToRem(14)};
    margin-right: ${convertPxToRem(5)};
  }
`;
