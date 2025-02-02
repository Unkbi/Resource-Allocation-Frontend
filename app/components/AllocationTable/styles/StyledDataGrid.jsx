import { styled } from "@mui/material"
import { DataGridPremium, gridClasses } from "@mui/x-data-grid-premium"

export const StyledDataGrid = styled(DataGridPremium)(({ theme }) => ({
    [`& .${gridClasses.columnHeader}[data-field="__row_group_by_columns_group__"]`]: {
      backgroundColor: "#d3d3d3",
    },
    [`& .${gridClasses.cell}[data-field="__row_group_by_columns_group__"]`]: {
      backgroundColor: "#f0f0f0",
    },
    [`& .${gridClasses.columnHeader}`]: {
      "&.prime-header": {
        backgroundColor: "#fff8dc",
        fontWeight: "bold",
      },
      "&.secondary-header": {
        backgroundColor: "#fff8dc",
        fontWeight: "bold",
      },
      "&.weekly-header": {
        backgroundColor: "#f5f5f5",
        fontWeight: "normal",
      },
    },
    [`& .${gridClasses.cell}`]: {
      "&.prime-cell": {
        backgroundColor: "#e6f7ff",
      },
      "&.secondary-cell": {
        backgroundColor: "#fff3cd",
      },
      "&.weekly-cell": {
        backgroundColor: "#fafafa",
      },
    },
    [`.${gridClasses.cell}`]: {
      "& input[type='number']": {
        appearance: "textfield",
        margin: 0,
      },
      "& input[type='number']::-webkit-outer-spin-button, & input[type='number']::-webkit-inner-spin-button": {
        display: "none",
      },
    },
    "& .MuiDataGrid-cell": {
      borderRight: "1px solid #e0e0e0",
      fontSize: "14px",
      padding: "0 16px",
    },
    "& .MuiDataGrid-columnHeader": {
      borderRight: "1px solid #e0e0e0",
      backgroundColor: "#f5f5f5",
      padding: "0 16px",
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: "600",
      fontSize: "14px",
    },
    "& .MuiDataGrid-row": {
      "&:hover": {
        backgroundColor: "#f5f5f5",
      },
    },
    border: "none",
    "& .MuiDataGrid-cell:focus": {
      outline: "none",
    },
    "& .MuiDataGrid-columnHeader:focus": {
      outline: "none",
    },
    "& .MuiDataGrid-groupingCriteriaCellToggle button": {
      display: "none",
    },
    "& .MuiDataGrid-groupingCriteriaCell": {
      padding: "0",
    },
    "& .MuiDataGrid-cellContent": {
      paddingLeft: "8px",
    },
    "& .MuiDataGrid-groupingCriteriaCellToggle": {
      display: "none",
    },
    "& .MuiDataGrid-aggregationColumnHeaderLabel": {
      display: "none",
    },
  }))
