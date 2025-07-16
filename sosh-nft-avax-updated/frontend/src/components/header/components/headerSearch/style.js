import { convertPxToRem } from "common/helpers";
import { Popover } from "react-bootstrap";
import styled from "styled-components";
import { deviceQuery } from "styles/mediaSizes";

export const StyledPopover = styled(Popover)`
  z-index: 1000;
  width: auto;
  max-width: 100vw !important;
  margin-top: ${convertPxToRem(-10)};

  .popover-arrow {
    display: none !important;
  }
`;

export const StyledSearchWrap = styled.div`
  .search-wrap {
    width: ${convertPxToRem(400)};
    max-width: 100%;
    border-radius: ${convertPxToRem(40)};
    height: ${convertPxToRem(44)};
    position: relative;
    border: 1px solid ${(props) => props.theme.palette.common.border.light};
    color: ${({ theme }) => theme.palette.text.primary};

    @media ${deviceQuery.laptop} {
      width: unset;
    }

    .search-icon {
      width: ${convertPxToRem(20)};
      height: ${convertPxToRem(20)};
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: ${convertPxToRem(15)};
      color: ${({ theme }) => theme.palette.text.gray};
    }

    .search-input {
      width: 100%;
      height: 100%;
      padding: 0 ${convertPxToRem(15)} 0 ${convertPxToRem(50)};
      border: none;
      outline: none;
      background-color: transparent;
      caret-color: ${({ theme }) => theme.palette.text.primary};
      color: ${({ theme }) => theme.palette.text.primary};

      &::placeholder {
        color: ${({ theme }) => theme.palette.text.primary};
      }
    }
  }
`;
