import Chevron from "assets/icons/chevron";
import { convertPxToRem } from "common/helpers";
import styled, { css } from "styled-components";

export const CustomMenuStyled = styled.div`
  max-width: 100%;
  background-color: ${(props) => props.theme.palette.selectMenu.bg};

  &.dropdown-menu {
    min-width: ${convertPxToRem(200)};
  }

  .menu-wrapper {
    width: 100%;
    box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.05);
    padding: 0px;
    border: none;
    max-height: ${convertPxToRem(320)};
    overflow-y: auto;

    ${(props) =>
      !props.$data &&
      css`
        display: grid;
        place-items: center;
      `}

    .search-wrapper {
      padding: ${convertPxToRem(5)};
      position: sticky;
      top: 0;
      background-color: ${(props) => props.theme.palette.white.main};
      .search-input {
        height: ${convertPxToRem(40)};
      }
    }

    .dropdown-item {
      align-items: center;
      padding: ${convertPxToRem(10)} ${convertPxToRem(20)};
      margin: ${convertPxToRem(5)} 0;
      display: flex;

      &:active,
      &:focus,
      &:hover {
        background-color: ${(props) => props.theme.palette.selectMenu.hover};
        color: ${(props) => props.theme.palette.text.dark};
      }

      &.active {
        background-color: ${(props) => props.theme.palette.selectMenu.selected};
        color: ${(props) => props.theme.palette.text.dark};
      }

      .checkmark {
        margin-right: ${convertPxToRem(10)};
        span {
          font-size: ${convertPxToRem(14)};
        }
      }

      p {
        margin: 0;
      }
    }
  }
`;

export const StyledChevron = styled(Chevron)`
  position: absolute;
  width: ${convertPxToRem(15)};
  height: ${convertPxToRem(15)};
  right: ${convertPxToRem(10)};
  top: 50%;
  transform: translateY(-50%) rotate(180deg);
  transform-origin: center;
  transition: 0.2s transform ease-in-out;
  ${({ $isOpen }) =>
    $isOpen &&
    css`
      transform: translateY(-50%) rotate(0deg);
    `}
`;
