import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { getTextColor, convertPxToRem } from "common/helpers/styleHelpers";

export const CustomButtonHoverEffects = {
  regular: "regular",
  insetTopLeft: "inset-top-left",
};

const getThemeColor = ({ theme, color = "primary" }) => {
  return theme.palette[color]?.main;
};

const getBackgroundColor = ({
  theme,
  $transparent = false,
  color = "primary",
  skipTransparency = false,
}) => {
  return css`
    background: ${$transparent && !skipTransparency
      ? "transparent"
      : getThemeColor({ theme, color })};
  `;
};

const getBorder = ({ theme, $transparent = false, color = "primary" }) => {
  if (color === "gradient") {
    return css`
      background-image: linear-gradient(
          ${theme.palette.common.backgroundColor},
          ${theme.palette.common.backgroundColor}
        ),
        ${getThemeColor({ theme, color })};
      background-origin: border-box;
      background-clip: content-box, border-box;
      color: ${theme.palette[color].textAlt};
    `;
  }
  return css`
    border: ${$transparent ? "transparent" : getThemeColor({ theme, color })}
      solid 1px;
  `;
};

const getHoverStyles = (props) => {
  const { $outline, disabled, color } = props;
  const themeColor = getThemeColor({
    ...props,
    color: color === "gradient" ? "primary" : color,
  });
  if (disabled) return;
  return css`
    ${$outline
      ? css`
          box-shadow: none;
          color: ${themeColor};
          ${color !== "gradient" && getBorder({ theme: props.theme })}
        `
      : css`
          background: ${props.theme.palette[props.color].dark};
        `}
  `;
};

export const StyledCustomButton = styled.button`
  width: ${(props) => (props.$width ? props.$width : "max-content")};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.2s ease-in-out;

  font-size: ${({ theme, $fontSize }) =>
    $fontSize ? $fontSize : theme.typography.text1};
  ${(props) => getBackgroundColor(props)}
  ${(props) => getTextColor(props)}
  border:none;
  transition: width 0.3s ease-in-out;
  padding: 2px;
  white-space: nowrap;

  & > span {
    display: flex;
    align-items: center;
    padding: ${convertPxToRem(8)} ${convertPxToRem(13)};
  }

  ${({ $interactive }) =>
    !$interactive &&
    css`
      pointer-events: none;
    `};
  border-radius: ${({ $rounded }) => ($rounded ? convertPxToRem(50) : 0)};

  &:hover {
    ${(props) => getHoverStyles(props)}
  }

  ${(props) =>
    props.$outline &&
    css`
      color: ${props.theme.palette.text.primary};

      ${(props) => getBorder(props)}
    `}

  .spinner {
    border-width: ${convertPxToRem(2)};
    margin-right: ${convertPxToRem(8)};
    width: ${convertPxToRem(20)};
    height: ${convertPxToRem(20)};
  }

  &:focus {
    box-shadow: none;
    ${(props) => getBackgroundColor(props)}
    border-color: transparent;
    ${(props) =>
      props.$outline &&
      css`
        background: ${props.theme.palette.secondary.light};
        ${(props) => getBorder(props)}
      `}
  }

  &:not(:disabled):focus:active:hover,
  &.btn:not(:disabled):focus:active {
    box-shadow: none;
  }

  &:disabled,
  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  &:focus-visible {
    outline: none;
  }

  &.success {
    background-color: ${(props) => props.theme.palette.common.success};
  }

  &.error {
    background-color: ${(props) => props.theme.palette.common.error};
  }
`;

StyledCustomButton.propTypes = {
  $width: PropTypes.string,
  $fontSize: PropTypes.string,
  $transparent: PropTypes.bool,
  $outline: PropTypes.bool,
  $rounded: PropTypes.bool,
  $hoverStyle: PropTypes.oneOf(Object.values(CustomButtonHoverEffects)),
  $interactive: PropTypes.bool,
};
