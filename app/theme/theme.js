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
  });
};