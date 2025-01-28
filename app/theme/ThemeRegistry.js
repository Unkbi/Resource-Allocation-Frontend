"use client";
import React,{createContext, useState} from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { NextAppDirEmotionCacheProvider } from "./EmotionCache";
import { getTheme } from "./theme";

export const ThemeContext = createContext(null);

export default function ThemeRegistry({ children }) {
  const [mode, setMode] = useState('light'); 
  const [primaryColor, setPrimaryColor] = useState('#1976d2'); 
  const [fontSize, setFontSize] = useState(14);

  const theme = getTheme(mode, primaryColor, fontSize);

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  const changePrimaryColor = (color) => setPrimaryColor(color);
  const changeFontSize = (size) => setFontSize(size);

  return (
    <NextAppDirEmotionCacheProvider options={{ key: "mui" }}>
      <ThemeContext.Provider value={{ toggleMode, changePrimaryColor, changeFontSize, mode, primaryColor, fontSize }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
      </ThemeContext.Provider>
    </NextAppDirEmotionCacheProvider>
  );
}