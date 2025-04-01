"use client"

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Popover,
  styled,
} from "@mui/material";
import {
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Palette as PaletteIcon,
  Dashboard as DashboardIcon,
  Close as CloseIcon,
  Add as AddIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@mui/icons-material";
import { HexColorPicker } from "react-colorful";

const ColorBox = styled(Box)(({ theme }) => ({
  width: 20,
  height: 20,
  borderRadius: 2,
  marginRight: theme.spacing(1),
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

const InputRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: "16px",
  "& .MuiTypography-root": {
    fontSize: "14px",
    color: "#333333",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    height: "36px",
    fontSize: "14px",
    "& fieldset": {
      borderColor: "#e0e0e0",
    },
    "&:hover fieldset": {
      borderColor: "#b0b0b0",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1976d2",
    },
  },
  "& .MuiInputBase-input": {
    padding: "8px 14px",
  },
}));

const AddButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  color: "#1976d2",
  fontWeight: "normal",
  fontSize: "14px",
  padding: "6px 8px",
  "&:hover": {
    backgroundColor: "rgba(25, 118, 210, 0.04)",
  },
}));

export const AllocationTheme = () => {
  const [formatType, setFormatType] = useState("decimal");
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeInputId, setActiveInputId] = useState(null);
  const [colorRanges, setColorRanges] = useState([
    { id: 1, from: 0.0, to: 0.4, color: "#48BF47" },
    { id: 2, from: 0.5, to: 0.9, color: "#F5B544" },
    { id: 3, from: 1, to: 1, color: "#277F20" },
    { id: 4, from: 1.1, to: 2.0, color: "#E6521F" },
  ]);
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
  const [currentColorRange, setCurrentColorRange] = useState(null);

  const handleFormatSelect = (format) => {
    setFormatType(format);
    handleFormatMenuClose();
  };

  const handleInputChange = (id, field, value) => {
    const numValue = Number.parseFloat(value) || 0;
    const updatedRanges = colorRanges.map((range) =>
      range.id === id ? { ...range, [field]: numValue } : range
    );
    setColorRanges(updatedRanges);
  };

  const handleRemoveRange = (id) => {
    const updatedRanges = colorRanges.filter((range) => range.id !== id);
    setColorRanges(updatedRanges);
  };

  const handleAddColorRange = () => {
    const lastRange = colorRanges[colorRanges.length - 1];
    const newId = colorRanges.length > 0 ? Math.max(...colorRanges.map((r) => r.id)) + 1 : 1;

    const newRange = {
      id: newId,
      from: lastRange ? lastRange.to + 0.1 : 0,
      to: lastRange ? lastRange.to + 0.2 : 0,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    };

    setColorRanges([...colorRanges, newRange]);
  };

  const handleFormatMenuOpen = (event, inputId) => {
    setAnchorEl(event.currentTarget);
    setActiveInputId(inputId);
  };

  const handleFormatMenuClose = () => {
    setAnchorEl(null);
    setActiveInputId(null);
  };

  const formatValue = (value) => {
    if (formatType === "percentage") {
      return (value * 100).toFixed(0);
    }
    return value;
  };

  // Color picker handlers
  const handleColorBoxClick = (event, range) => {
    setCurrentColorRange(range);
    setColorPickerAnchor(event.currentTarget);
  };

  const handleColorPickerClose = () => {
    setColorPickerAnchor(null);
    setCurrentColorRange(null);
  };

  const handleColorChange = (newColor) => {
    if (currentColorRange) {
      const updatedRanges = colorRanges.map((range) =>
        range.id === currentColorRange.id ? { ...range, color: newColor } : range
      );
      setColorRanges(updatedRanges);
    }
  };

  const openColorPicker = Boolean(colorPickerAnchor);

  return (
    <React.Fragment>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: "medium",
          mb: 2,
          fontSize: "16px",
          color: "#333333",
        }}
      >
        Range
      </Typography>

      {colorRanges.map((range) => (
        <InputRow key={range.id}>
          <Typography variant="body2" sx={{ width: 50 }}>
            FROM
          </Typography>
          <StyledTextField
            size="small"
            value={formatValue(range.from)}
            onChange={(e) =>
              handleInputChange(
                range.id,
                "from",
                formatType === "percentage" ? e.target.value / 100 : e.target.value
              )
            }
            sx={{ width: 100 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={(e) => handleFormatMenuOpen(e, `from-${range.id}`)}
                    edge="end"
                  >
                    <ArrowDropDownIcon fontSize="small" />
                  </IconButton>
                  {formatType === "percentage" && "%"}
                </InputAdornment>
              ),
            }}
          />

          <Typography variant="body2" sx={{ width: 30, ml: 2 }}>
            TO
          </Typography>
          <StyledTextField
            size="small"
            value={formatValue(range.to)}
            onChange={(e) =>
              handleInputChange(
                range.id,
                "to",
                formatType === "percentage" ? e.target.value / 100 : e.target.value
              )
            }
            sx={{ width: 100 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={(e) => handleFormatMenuOpen(e, `to-${range.id}`)}
                    edge="end"
                  >
                    <ArrowDropDownIcon fontSize="small" />
                  </IconButton>
                  {formatType === "percentage" && "%"}
                </InputAdornment>
              ),
            }}
          />

          <Typography variant="body2" sx={{ width: 60, ml: 2 }}>
            COLOR
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", width: 120 }}>
            <ColorBox
              sx={{ backgroundColor: range.color }}
              onClick={(e) => handleColorBoxClick(e, range)}
            />
            <Typography variant="body2" sx={{ color: "#333333" }}>
              {range.color.toUpperCase()}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={() => handleRemoveRange(range.id)}
            sx={{
              padding: "4px",
              color: "#666666",
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </InputRow>
      ))}

      <AddButton startIcon={<AddIcon />} onClick={handleAddColorRange} sx={{ mt: 1, mb: 4 }}>
        Add Color Range
      </AddButton>

      {/* Format selection menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFormatMenuClose}
        PaperProps={{
          sx: {
            boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
            borderRadius: "4px",
          },
        }}
      >
        <MenuItem
          onClick={() => handleFormatSelect("decimal")}
          sx={{
            fontSize: "14px",
            minHeight: "36px",
            "&:hover": { backgroundColor: "#f5f5f5" },
          }}
        >
          Decimal
        </MenuItem>
        <MenuItem
          onClick={() => handleFormatSelect("percentage")}
          sx={{
            fontSize: "14px",
            minHeight: "36px",
            "&:hover": { backgroundColor: "#f5f5f5" },
          }}
        >
          Percentage
        </MenuItem>
      </Menu>

      {/* Color Picker Popover */}
      <Popover
        open={openColorPicker}
        anchorEl={colorPickerAnchor}
        onClose={handleColorPickerClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2 }}>
          <HexColorPicker color={currentColorRange?.color} onChange={handleColorChange} />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleColorPickerClose}
              sx={{ textTransform: "none" }}
            >
              OK
            </Button>
          </Box>
        </Box>
      </Popover>
    </React.Fragment>
  );
};