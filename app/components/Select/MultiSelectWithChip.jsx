"use client"

import { useState } from "react"
import { styled } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import Chip from "@mui/material/Chip"
import FormControl from "@mui/material/FormControl"
import CancelIcon from "@mui/icons-material/Cancel"

// Styled components
const Container = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.75),
}))

const Title = styled(Typography)(({ theme }) => ({
  color: "#313f68",
  fontWeight: 600,
  fontSize: "1.25rem",
}))

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 120,
  width: "100%",
}))

const StyledSelect = styled(Select)(({ theme }) => ({
  "& .MuiSelect-select": {
    padding: theme.spacing(0.75, 1.25),
    minHeight: 42,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#d6dce1",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#b1b9c3",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#313f68",
  },
  "& .MuiSelect-icon": {
    color: "#313f68",
  },
}))

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontSize: "12px",
  padding: theme.spacing(0.75, 1.25),
  color: "#313f68",
  "&.Mui-selected": {
    backgroundColor: "rgba(49, 63, 104, 0.04)",
    fontWeight: 600,
  },
  "&.Mui-selected:hover": {
    backgroundColor: "rgba(49, 63, 104, 0.08)",
  },
  "&:hover": {
    backgroundColor: "rgba(49, 63, 104, 0.08)",
  },
}))

const CustomChip = styled(Chip)(({ theme }) => ({
  backgroundColor: "#f2f5fa",
  color: "#313f68",
  borderRadius: theme.shape.borderRadius,
  height: 28,
  fontSize: "12px",
  "& .MuiChip-label": {
    padding: "0 8px",
  },
  "& .MuiChip-deleteIcon": {
    color: "#313f68",
    width: 16,
    height: 16,
    margin: "0 4px 0 -4px",
    "&:hover": {
      color: "#344665",
    },
  },
}))

// Available columns for selection
// const availableColumns = [
//   { id: "team", label: "Team" },
//   { id: "client", label: "Client" },
//   { id: "project", label: "Project" },
//   { id: "status", label: "Status" },
//   { id: "dueDate", label: "Due Date" },
//   { id: "assignee", label: "Assignee" },
// ]

export default function ColumnSelector({list, selected, handleUpdate}) {
  // State for selected columns
  const [selectedColumns, setSelectedColumns] = useState(selected.map(item => item.value) || [])

  // Handle change in selection
  const handleChange = (event) => {
    const { value } = event.target
    setSelectedColumns(value)
    handleUpdate(value)
  }

  // Handle removing a column via chip delete
  const handleDelete = (columnId, event) => {
    event.preventDefault() // Prevent the select from opening
    setSelectedColumns((prev) => prev.filter((id) => id !== columnId))
    handleUpdate(value)
  }

  // Menu props to ensure proper positioning and width
  const menuProps = {
    PaperProps: {
      style: {
        maxHeight: 300,
        width: "auto", // Let it match the parent width
        marginTop: 8,
      },
    },
    MenuListProps: {
      style: {
        padding: "4px 0",
      },
    },
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
    // This ensures the menu is properly positioned
    getContentAnchorEl: null,
    // Ensure the menu is anchored to the select
    disablePortal: true,
  }

  return (
    <Container>
      <StyledFormControl>
        <StyledSelect
          multiple
          value={selectedColumns}
          onChange={handleChange}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {selected.map((columnId) => {
                const column = list.find((col) => col.id === columnId)
                return (
                  <CustomChip
                    key={columnId}
                    label={column?.label}
                    deleteIcon={<CancelIcon onMouseDown={(event) => event.stopPropagation()} />}
                    onDelete={(event) => handleDelete(columnId, event)}
                    size="small"
                  />
                )
              })}
            </Box>
          )}
          MenuProps={menuProps}
        >
          {list.map((column) => (
            <StyledMenuItem key={column.id} value={column.id}>
              {column.label}
            </StyledMenuItem>
          ))}
        </StyledSelect>
      </StyledFormControl>
    </Container>
  )
}

