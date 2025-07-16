import { FormControl, FormLabel } from "react-bootstrap";
import styled from "styled-components";
import { convertPxToRem, convertWidthToRem } from "common/helpers/styleHelpers";

const defaultCheckboxWidth = convertWidthToRem(20);

export const InputWrap = styled.div`
  .checkmark-wrap {
    display: flex;
    align-items: center;

    &:last-child {
      margin-left: ${convertPxToRem(8)};
    }
  }
`;

export const StyledCheckmark = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${(props) =>
    props.width ? convertWidthToRem(props.width) : defaultCheckboxWidth};
  width: ${(props) =>
    props.width ? convertWidthToRem(props.width) : defaultCheckboxWidth};
  background-color: transparent;
  border-radius: 25%;
  border: 2px solid ${({ theme }) => theme.palette.common.border.light};

  font-size: ${convertPxToRem(20)};
  color: ${(props) => props.theme.palette.text.primary};
  cursor: pointer;

  .check-icon {
    width: ${({ width }) =>
      width
        ? `calc(${convertWidthToRem(width)}/3)`
        : `calc(${defaultCheckboxWidth}/3)`};
    width: ${({ width }) =>
      width
        ? `calc(${convertWidthToRem(width)}/3)`
        : `calc(${defaultCheckboxWidth}/3)`};
  }

  &.checked {
    background: ${(props) => props.theme.palette.common.gradientBackground};
    border-width: 0;
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus {
    box-shadow: 0px 0px 10px 0px
      ${({ theme }) => `${theme.palette.text.primary}55`};
  }
`;

export const LabelStyled = styled(FormLabel)`
  font-size: ${(props) => props.theme.typography.subText4};
  font-weight: 600;
  line-height: 1.6rem;
  margin-bottom: 0;
`;

export const InputStyled = styled(FormControl)`
  width: 0;
  height: 0;
  position: absolute;

  &.form-control {
    display: none;
  }
`;
