"use client";
import { createTheme } from "@mui/material/styles";

export const getTheme = (mode, primaryColor, fontSize) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryColor,
      },
    },
    typography: {
      fontSize: Number(fontSize),
    },
    custom: {
      hoverBackground: mode === 'dark' ? '#555' : '#0057a4',
      backgroundColor: mode === 'dark' ? '#333' : primaryColor,
    },
  });
};