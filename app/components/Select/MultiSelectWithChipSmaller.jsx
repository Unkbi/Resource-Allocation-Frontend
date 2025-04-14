"use client"

import { useState, useRef, useEffect, use } from "react"
import { styled } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Chip from "@mui/material/Chip"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"

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

const SelectionBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(0.75, 1.25),
  border: "1px solid #d6dce1",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#ffffff",
  cursor: "pointer",
  minHeight: 42, // Reduced height
}))

const ChipsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(0.75),
}))

const CustomChip = styled(Chip)(({ theme }) => ({
  backgroundColor: "#f2f5fa",
  color: "#313f68",
  borderRadius: theme.shape.borderRadius,
  height: 28, // Smaller chip height
  fontSize: "12px", // Smaller font size for chips
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

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    marginTop: theme.spacing(0.5),
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
  },
}))

const StyledMenuItem = styled(MenuItem)(({ theme, selected }) => ({
  padding: theme.spacing(0.75, 1.25),
  color: "#313f68",
  fontSize: "12px", // 12px font size as requested
  fontWeight: selected ? 600 : 400,
  backgroundColor: selected ? "rgba(49, 63, 104, 0.04)" : "transparent",
  minHeight: "auto", // Override default min-height
  "&:hover": {
    backgroundColor: "rgba(49, 63, 104, 0.08)",
  },
}))


export default function MultiSelectWithChips({list, selected, updateSelected}) {
  // State for selected columns
  const [selectedColumns, setSelectedColumns] = useState([])

  // State for dropdown menu
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const selectBoxRef = useRef(null)

  // Handle opening the dropdown
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  // Handle closing the dropdown
  const handleClose = () => {
    setAnchorEl(null)
  }

  // Handle toggling a column selection
  const handleToggleColumn = (e, columnId) => {
    const updatedColumns = selectedColumns.includes(columnId) 
        ? selectedColumns.filter((id) => id !== columnId) 
        : [...selectedColumns, columnId]
    // setSelectedColumns(updatedColumns)
    updateSelected(updatedColumns)
  }

  // Handle removing a column via chip delete
  const handleDelete = (columnId, event) => {
    event.stopPropagation() // Prevent opening the dropdown when deleting a chip
    const updatedColumns = selectedColumns.filter((id) => id !== columnId)
    // setSelectedColumns(updatedColumns)
    updateSelected(updatedColumns)
  }

    useEffect(() => {
        setSelectedColumns(selected.map(item => item.value) || [])
    }, [selected])

  return (
    <Container>
      <SelectionBox onClick={handleClick} ref={selectBoxRef}>
        <ChipsContainer>
          {selectedColumns.map((columnId) => {
            const column = list.find((col) => col.id === columnId)
            return (
              <CustomChip
                key={columnId}
                label={column?.label}
                onDelete={(event) => handleDelete(columnId, event)}
                size="small"
              />
            )
          })}
        </ChipsContainer>
        <ExpandMoreIcon sx={{ color: "#313f68", width: 20, height: 20 }} />
      </SelectionBox>

      <StyledMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        PaperProps={{
          style: {
            width: anchorEl ? anchorEl.clientWidth : undefined,
          },
        }}
      >
        {list.map((column) => {
          const isSelected = selectedColumns.includes(column.id)
          return (
            <StyledMenuItem key={column.id} onClick={(e) => handleToggleColumn(e, column.id)} selected={isSelected} dense>
              {column.label}
            </StyledMenuItem>
          )
        })}
      </StyledMenu>
    </Container>
  )
}

