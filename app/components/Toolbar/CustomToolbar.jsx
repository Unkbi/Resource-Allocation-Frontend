import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import {
  GridView,
  ViewWeek,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { performChangeView } from "@/app/redux/actions/allocationViewAction";
import {
  GridToolbarColumnsButton,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarContainer,
} from "@mui/x-data-grid";

export default function CustomToolbar() {
  const dispatch = useDispatch();
  const view = useSelector((state) => state.allocationView.view);
  const viewOptions = ["Organization","Project", "Teams"];

  const handleViewChange = (event) => {
    const newView = event.target.value;
    dispatch(performChangeView(newView));
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 16px",
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Box sx={{ display: "flex", gap: 1 }}>
        <FormControl
          size="small"
          sx={{ minWidth: 100, border: "none", boxShadow: "none" }}
        >
          <Select
            value={"Project"}
            onChange={handleViewChange}
            sx={{
              padding: 0,
              border: "none",
              boxShadow: "none",
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            }}
            defaultValue="Project"
          >
            {viewOptions.map((option, index) => (
              <MenuItem key={index} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box
          sx={{
            display: "flex",
          }}
        >
          <Button
            size="small"
            sx={{
              padding: 0,
              minWidth: 0,
              "& .MuiButton-startIcon": { padding: 0 },
            }}
            startIcon={<GridView />}
          />
          <Button
            size="small"
            sx={{
              padding: 0,
              minWidth: 0,
              "& .MuiButton-startIcon": { padding: 0 },
            }}
            startIcon={<ViewWeek />}
          />
          <Button
            size="small"
            sx={{
              padding: 0,
              minWidth: 0,
              "& .MuiButton-startIcon": { padding: 0 },
            }}
          >
            $
          </Button>
        </Box>
      </Box>
      <Divider orientation="vertical" flexItem sx={{ marginX: 2 }} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <GridToolbarColumnsButton
              slotProps={{
                tooltip: { title: "Columns" },
                button: {
                  variant: "outlined",
                  sx: { color: "#555", borderColor: "#ddd" },
                },
              }}
            />
            <GridToolbarExport
              slotProps={{
                tooltip: { title: "Export data" },
                button: {
                  variant: "outlined",
                  sx: { color: "#555", borderColor: "#ddd" },
                },
              }}
            />
            <GridToolbarFilterButton
              slotProps={{
                tooltip: { title: "Filter" },
                button: {
                  variant: "outlined",
                  sx: { color: "#555", borderColor: "#ddd" },
                },
              }}
            />
          </Box>
        </Box>
      </Box>
      <Divider orientation="vertical" flexItem sx={{ marginX: 2 }} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            display: "flex",
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <Button size="small" sx={{ borderRadius: 0 }}>
            Day
          </Button>
          <Button size="small" sx={{ borderRadius: 0 }}>
            Week
          </Button>
          <Button
            size="small"
            sx={{
              borderRadius: 0,
              backgroundColor: "#f0f0f0",
            }}
          >
            Month
          </Button>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            size="small"
            sx={{
              border: "1px solid #ddd", 
              borderRadius: "50%",
              padding: "4px",
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
          >
            <KeyboardArrowLeft sx={{ fontSize: 18 }} />
          </IconButton>
          <Button
            size="small"
            sx={{
              border: "1px solid #ddd", 
              borderRadius: "4px", 
              padding: "4px 12px", 
              "&:hover": {
                backgroundColor: "#f0f0f0", 
              },
            }}
          >
            Today
          </Button>

          <IconButton
            size="small"
            sx={{
              border: "1px solid #ddd",
              borderRadius: "50%", 
              padding: "4px", 
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
          >
            <KeyboardArrowRight sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
