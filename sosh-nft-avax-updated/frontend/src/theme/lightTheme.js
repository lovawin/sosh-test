import getBaseTheme, { commonColors } from "./theme";

const ThemeColors = {
  light: "#B7B7B7",
  primaryBackgroundGradient: `linear-gradient(90deg, #005BEA 0%, #00C6FB 105.49%),
  linear-gradient(90deg, #02212C -2.59%, #00B0F0 160.54%),
  linear-gradient(96.76deg, #FFA17F -44.56%, #00223E 189.36%);`,
};

const baseTheme = getBaseTheme(ThemeColors);

export const LightTheme = {
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    common: {
      ...baseTheme.palette.common,
      border: {
        ...baseTheme.palette.common.border,
        light: "#b6b6b6",
      },
      card: {
        ...baseTheme.palette.common.card,
        backgroundColor: commonColors.white,
      },
    },
  },
};
