import { convertPxToRem } from "common/helpers";
import { Popover } from "react-bootstrap";
import styled from "styled-components";

export const StyledUserDataCardWrap = styled.div`
  width: ${convertPxToRem(350)};
  max-width: 100vw;
`;

export const StyledUserPopover = styled(Popover)`
  z-index: 1000;
  width: auto;
  max-width: 100vw !important;
  margin-top: ${convertPxToRem(-10)};

  .popover-arrow {
    display: none !important;
  }
`;
