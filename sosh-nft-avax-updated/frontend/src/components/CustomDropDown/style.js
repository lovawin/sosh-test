import { convertPxToRem } from "common/helpers";
import { Dropdown } from "react-bootstrap";
import styled from "styled-components";

export const StyledDropdown = styled(Dropdown)`
  .dropdown-toggle {
    &::after {
      content: none;
    }
  }

  .dropdown-menu {
    max-width: 100vw;
    width: ${({ $width }) => ($width ? $width : "auto")};
    border-radius: ${convertPxToRem(5)};
    overflow: hidden;
    margin-top: -30px;
    margin-right: 10px;
    padding: 0;
    box-shadow: ${(props) => props.theme.palette.common.shadows0};

    .dropdown-item {
      &:active {
        background-color: ${(props) => props.theme.palette.primary.light};
        color: ${(props) => props.theme.palette.text.dark};
      }

      .dropdown-item-icon {
        width: ${convertPxToRem(16)};
        height: ${convertPxToRem(16)};
        margin-right: ${convertPxToRem(8)};
      }
    }
  }
`;
