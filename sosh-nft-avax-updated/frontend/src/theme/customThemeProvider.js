import React from "react";
import PropTypes from "prop-types";
import { ThemeProvider } from "styled-components";
import { useSelector } from "react-redux";
import { SUPPORTED_THEMES } from "constants/appConstants";
import { DarkTheme, LightTheme } from "theme";

function CustomThemeProvider({ children }) {
  const { theme } = useSelector((state) => state.common);

  return (
    <ThemeProvider
      theme={theme === SUPPORTED_THEMES.dark ? DarkTheme : LightTheme}
    >
      {children}
    </ThemeProvider>
  );
}

export default CustomThemeProvider;

CustomThemeProvider.propTypes = {
  children: PropTypes.node,
};
