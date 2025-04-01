"use client";

import { useState } from "react";
import { Close } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function LayoutTheme() {
  // State for logo
  const [logo, setLogo] = useState({
    name: "CIO_Logo.jpeg",
    url: "/placeholder.svg?height=50&width=50",
  });

  // State for font size
  const [fontSize, setFontSize] = useState("md");

  // State for theme mode
  const [themeMode, setThemeMode] = useState("light");

  // Handle logo removal
  const handleRemoveLogo = () => {
    setLogo(null);
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo({
        name: file.name,
        url: URL.createObjectURL(file),
      });
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Set your layout color theme as per your brand
        </Typography>

        {/* Logo upload */}
        <Box sx={{ mb: 3 }}>
          {logo ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                width: "fit-content",
              }}
            >
              <Box
                component="img"
                src={logo.url || "/placeholder.svg"}
                alt="Logo"
                sx={{ width: 24, height: 24 }}
              />
              <Typography variant="body2">{logo.name}</Typography>
              <IconButton size="small" onClick={handleRemoveLogo}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box>
              <label htmlFor="logo-upload">
                <Button component="span" variant="outlined" fullWidth>
                  Click to upload logo
                </Button>
                <VisuallyHiddenInput
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </label>
            </Box>
          )}
        </Box>

        {/* Global Font Size */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Global Font Size
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant={fontSize === "sm" ? "contained" : "outlined"}
              size="small"
              sx={{ width: 48 }}
              onClick={() => setFontSize("sm")}
            >
              SM
            </Button>
            <Button
              variant={fontSize === "md" ? "contained" : "outlined"}
              size="small"
              sx={{ width: 48 }}
              onClick={() => setFontSize("md")}
            >
              MD
            </Button>
            <Button
              variant={fontSize === "lg" ? "contained" : "outlined"}
              size="small"
              sx={{ width: 48 }}
              onClick={() => setFontSize("lg")}
            >
              LG
            </Button>
            <Button
              variant={fontSize === "xl" ? "contained" : "outlined"}
              size="small"
              sx={{ width: 48 }}
              onClick={() => setFontSize("xl")}
            >
              XL
            </Button>
          </Box>
        </Box>

        {/* Theme Mode */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Theme Mode
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Paper
                elevation={themeMode === "light" ? 3 : 1}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  border: themeMode === "light" ? "2px solid" : "1px solid",
                  borderColor: themeMode === "light" ? "primary.main" : "divider",
                }}
                onClick={() => setThemeMode("light")}
              >
                <Box
                  sx={{
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    p: 2,
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 4,
                      bgcolor: "grey.400",
                      mb: 1,
                    }}
                  />
                  <Box
                    sx={{
                      width: 24,
                      height: 4,
                      bgcolor: "grey.400",
                    }}
                  />
                </Box>
                <Typography variant="body2" align="center">
                  Light
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={4}>
              <Paper
                elevation={themeMode === "dark" ? 3 : 1}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  border: themeMode === "dark" ? "2px solid" : "1px solid",
                  borderColor: themeMode === "dark" ? "primary.main" : "divider",
                }}
                onClick={() => setThemeMode("dark")}
              >
                <Box
                  sx={{
                    bgcolor: "grey.800",
                    borderRadius: 1,
                    p: 2,
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 4,
                      bgcolor: "grey.600",
                      mb: 1,
                    }}
                  />
                  <Box
                    sx={{
                      width: 24,
                      height: 4,
                      bgcolor: "grey.600",
                    }}
                  />
                </Box>
                <Typography variant="body2" align="center">
                  Dark
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={4}>
              <Paper
                elevation={themeMode === "system" ? 3 : 1}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  border: themeMode === "system" ? "2px solid" : "1px solid",
                  borderColor: themeMode === "system" ? "primary.main" : "divider",
                }}
                onClick={() => setThemeMode("system")}
              >
                <Box
                  sx={{
                    background: "linear-gradient(to right, #f5f5f5, #424242)",
                    borderRadius: 1,
                    p: 2,
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 4,
                      bgcolor: "grey.500",
                      mb: 1,
                    }}
                  />
                  <Box
                    sx={{
                      width: 24,
                      height: 4,
                      bgcolor: "grey.500",
                    }}
                  />
                </Box>
                <Typography variant="body2" align="center">
                  System
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}