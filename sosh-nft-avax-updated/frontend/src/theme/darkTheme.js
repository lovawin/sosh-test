import getBaseTheme, { commonColors } from "./theme";

const ThemeColors = {
  light: "#B7B7B7",
  primaryBackgroundGradient: `linear-gradient(90deg, #005BEA 0%, #00C6FB 105.49%),
  linear-gradient(90deg, #02212C -2.59%, #00B0F0 160.54%),
  linear-gradient(96.76deg, #FFA17F -44.56%, #00223E 189.36%);`,
};

const baseTheme = getBaseTheme(ThemeColors);

export const DarkTheme = {
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    common: {
      ...baseTheme.palette.common,
      border: {
        ...baseTheme.palette.common.border,
        light: "#1e4976",
        lightGray: "#646363",
      },
      backgroundColor: "#0a1929",
      card: {
        ...baseTheme.palette.common.card,
        backgroundColor: "#031e3c",
        hover: "#ffffff11",
      },
      gray: "#b5b6c7",
      contrast: commonColors.white,
      matched: commonColors.black,
    },
    gradient: {
      ...baseTheme.palette.gradient,
      textAlt: commonColors.white,
    },
    text: {
      ...baseTheme.palette.text,
      primary: commonColors.white,
      secondary: commonColors.lightGray,
      gray: "#b5b6c7",
    },
  },
};
