/**
 * a function to convert pixel to rem
 * @param {number} px
 * @returns {string}
 */

import { css } from "styled-components";

export const convertPxToRem = (px) => {
  return `${px / 16}rem`;
};

/**
 * a function to convert string or number width to rem
 * @param {string|number} width
 * @returns {string}
 */

export const convertWidthToRem = (width) => {
  if (typeof width === "string") {
    if (width.includes("px")) {
      return convertPxToRem(parseInt(width.replace("px", "")));
    }
    return width;
  } else if (typeof width === "number") {
    return convertPxToRem(width);
  }
};

export const getThemeColor = ({ theme, color = "primary" }) => {
  return theme.palette[color]?.main;
};

export const getTextColor = ({
  theme,
  transparent = false,
  color = "primary",
  skipTransparency = false,
}) => {
  return css`
    color: ${(transparent && !skipTransparency) || color === "secondary"
      ? theme.palette.text.primary
      : theme.palette[color]?.text};
  `;
};
