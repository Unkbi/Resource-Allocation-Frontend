"use client";
import { createTheme } from "@mui/material/styles";
import { themeColors, fontSizeMap, BASE_FONT_SIZE, DEFAULT_COLOR } from "../constants/constants";

export const getTheme = (mode, primaryColor, fontSize) => {
  const selectedColor = primaryColor && themeColors[primaryColor] ? primaryColor : DEFAULT_COLOR;
  const customSettings = themeColors[selectedColor]?.[mode];
 
  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryColor,
      },
    },
    typography: {
      fontSize: BASE_FONT_SIZE + fontSizeMap[fontSize],
      h1: { fontSize: BASE_FONT_SIZE + 16 + fontSizeMap[fontSize] },
      h2: { fontSize: BASE_FONT_SIZE + 12 + fontSizeMap[fontSize] },
      h3: { fontSize: BASE_FONT_SIZE + 8 + fontSizeMap[fontSize] },
      body1: { fontSize: BASE_FONT_SIZE + fontSizeMap[fontSize] },
      caption: { fontSize: BASE_FONT_SIZE - 2 + fontSizeMap[fontSize] },
      button: { fontSize: BASE_FONT_SIZE - 1 + fontSizeMap[fontSize] },
    },
    custom: {
     ...customSettings
    },
  });
};