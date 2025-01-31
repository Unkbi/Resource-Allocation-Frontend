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
  styled,
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
  const viewOptions = ["Teams","Project","Organization"];

  const handleViewChange = (event) => {
    const newView = event.target.value;
    dispatch(performChangeView(newView));
  };

  const ToolBox1 = styled(Box)(({ theme }) => ({
    display:"flex",
    width:"364px",
    padding:"14px",
    justifyContent: "space-between",
    alignItems: "center",
    borderRight: "#DDE1E4 solid 1px",
    "& .viewFilterBlock":{
      backgroundColor: "#FFFFFF",
      border: "1px solid #D6DCE1",
      borderRadius: "4px",
      boxShadow: "0 0 2px 0 rgba(0, 0, 0, 0.02)",
      height: "32px",
      display:"flex",
      alignItems:"center",
      "& button":{
        padding:"3px 5px",
        borderLeft: "1px solid #D6DCE1",
        height:"100%",
        borderRadius:"0",
        minWidth:"34px",
        "&.selected":{
          backgroundColor: "#344665",
          borderRadius: "4px",
          margin: "-1px",
          position: "relative",
          zIndex: "1",
          height: "32px",
          color:"#fff"
        },
        "&:first-child":{
          border:"none"
        },
        "& span":{
          margin:"0"
        }
      }
    }
  }));

  const ToolBox2 = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding:"14px",
    "& .filterColBlock":{
      display:"flex",
      alignItems:"center",
      gap:"12px",
      "& button":{
        backgroundColor: "rgba(242, 245, 250, 0.3)",
        border: "1px solid #D6DCE1",
        borderRadius: "4px",
        height: "32px",
        padding: "5px 12px",
        fontSize:"13px",
        color:"#212121",
        fontFamily: "'Manrope', serif",
        fontWeight: "600",
        textTransform:"none"
      }
    },
    "& .dayWeekBlock":{
      backgroundColor: "rgba(242, 245, 250, 0.3)",
      border: "1px solid #D6DCE1",
      borderRadius: "4px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      "& button":{
        color: "#757575",
        fontFamily: "'Manrope', serif",
        fontWeight: "500",
        fontSize: "13px",
        lineHeight: "16px",
        textAlign: "center",
        textTransform: "none",
        height: "100%",
        "&.selected":{
          color:"#212121",
          fontWeight:"600",
          backgroundColor:"#fff",
          borderLeft: "1px solid #D6DCE1",
          borderRight: "1px solid #D6DCE1",
          borderRadius: "4px"
        }
      }
    },
    "& .selectedDate":{
      backgroundColor: "#FFFFFF",
      border: "1px solid #D6DCE1",
      borderRadius: "4px",
      height: "32px",
      color: "#212121",
      fontFamily: "'Manrope', serif",
      fontWeight: "600",
      fontSize: "12px",
      lineHeight: "14px",
      textAlign: "center",
      textTransform: "none"
    },
    "& .nextPrevIcon":{
      backgroundColor: "rgba(242, 245, 250, 0.3)",
      border: "1px solid #D6DCE1",
      borderRadius: "4px",
      height: "32px"
    }
  }));

  return (
    <Box display={"flex"}>
      <ToolBox1>
        <FormControl
          size="small"
          sx={{ minWidth: 100, border: "none", boxShadow: "none" }}
        >
          <Select
            value={view || "Project"}
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
        <Box className='viewFilterBlock'>
          <Button
            size="small"
            startIcon={<GridView />}
            className="selected"
          />
          <Button
            size="small"
            startIcon={<ViewWeek />}
          />
          <Button
            size="small"
          >
            $
          </Button>
        </Box>
      </ToolBox1>

      <ToolBox2 flex={1} className="filterTopRow">        
        <Box className="filterColBlock">
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box className="dayWeekBlock">
            <Button>
              Day
            </Button>
            <Button className="selected">
              Week
            </Button>
            <Button>
              Month
            </Button>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="medium"
              className="nextPrevIcon"
            >
              <KeyboardArrowLeft sx={{ fontSize: 18 }} />
            </IconButton>
            <Button className="selectedDate">
              Today
            </Button>

            <IconButton
              size="medium"
              className="nextPrevIcon"
            >
              <KeyboardArrowRight sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </ToolBox2>
    </Box>
  );
}
