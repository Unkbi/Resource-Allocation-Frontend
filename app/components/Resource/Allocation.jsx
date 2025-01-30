"use client"

import React, { useState } from "react"
import { Box, Button, IconButton, Avatar, Typography, Chip, ToggleButtonGroup, ToggleButton } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { KeyboardArrowDown, KeyboardArrowRight, FilterList, Download, ViewColumn } from "@mui/icons-material"
import { blue } from "@mui/material/colors"

const months = ["Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025"]

const initialRows = [
  {
    id: 1,
    project: "SOX FY Compliance",
    resourceCount: 4,
    totalEffort: 36.0,
    isGroup: true,
    children: [
      {
        id: 11,
        name: "Amit Sharma",
        initials: "AS",
        role: "Senior Product Manager",
        totalEffort: 11.0,
        color: "#E9D5FF",
        w1: 1.0,
        w2: 1.0,
        w3: 1.0,
        w4: 1.0,
        w5: 1.0,
        w6: 1.0,
        w7: 1.0,
        w8: 1.0,
        w9: 1.0,
        w10: 1.0,
        w11: 1.0,
      },
      // Add other team members similar to the image
    ],
  },
  {
    id: 2,
    project: "Website Revamp",
    resourceCount: 3,
    totalEffort: 25.0,
    isGroup: true,
    children: [
      // Add team members similar to the image
    ],
  },
]

const CustomToolbar = () => (
  <Box
    sx={{
      p: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid #e0e0e0",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Button variant="outlined" startIcon={<KeyboardArrowDown />} sx={{ textTransform: "none", fontWeight: 600 }}>
        Projects
      </Button>
      <Box sx={{ display: "flex", gap: 1 }}>
        <IconButton size="small" sx={{ border: "1px solid #e0e0e0" }}>
          <ViewColumn fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ border: "1px solid #e0e0e0" }}>
          <Download fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ border: "1px solid #e0e0e0" }}>
          <FilterList fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Chip label={`Resources 7`} onDelete={() => {}} sx={{ borderRadius: 1 }} />
        <Chip label={`Value 2`} onDelete={() => {}} sx={{ borderRadius: 1 }} />
      </Box>
      <Button
        variant="contained"
        size="small"
        sx={{
          bgcolor: blue[50],
          color: blue[600],
          "&:hover": { bgcolor: blue[100] },
        }}
      >
        Save
      </Button>
      <Button variant="text" size="small" sx={{ color: "text.secondary" }}>
        Clear all
      </Button>
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <ToggleButtonGroup size="small">
        <ToggleButton value="day">Day</ToggleButton>
        <ToggleButton value="week" selected>
          Week
        </ToggleButton>
        <ToggleButton value="month">Month</ToggleButton>
      </ToggleButtonGroup>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton size="small">
          <KeyboardArrowRight sx={{ transform: "rotate(180deg)" }} />
        </IconButton>
        <Typography variant="body2">Jan 25 - Dec 25</Typography>
        <IconButton size="small">
          <KeyboardArrowRight />
        </IconButton>
      </Box>
    </Box>
  </Box>
)

export default function AllocationTable() {
  const [expandedGroups, setExpandedGroups] = useState(new Set([1, 2]))

  const columns = [
    {
      field: "project",
      headerName: "Project Name",
      width: 250,
      renderCell: (params) => {
        if (params.row.isGroup) {
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => {
                  const newExpandedGroups = new Set(expandedGroups)
                  if (newExpandedGroups.has(params.row.id)) {
                    newExpandedGroups.delete(params.row.id)
                  } else {
                    newExpandedGroups.add(params.row.id)
                  }
                  setExpandedGroups(newExpandedGroups)
                }}
              >
                {expandedGroups.has(params.row.id) ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
              </IconButton>
              <Typography sx={{ fontWeight: 600 }}>
                {params.row.project} ({params.row.resourceCount})
              </Typography>
            </Box>
          )
        }
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 4 }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: params.row.color,
                fontSize: "0.75rem",
              }}
            >
              {params.row.initials}
            </Avatar>
            <Typography>{params.row.name}</Typography>
          </Box>
        )
      },
    },
    {
      field: "role",
      headerName: "Role",
      width: 200,
    },
    {
      field: "totalEffort",
      headerName: "Total Effort",
      width: 120,
      align: "right",
      headerAlign: "right",
    },
    ...Array.from({ length: 15 }, (_, i) => ({
      field: `w${i + 1}`,
      headerName: `W${i + 1}`,
      width: 70,
      align: "right",
      headerAlign: "right",
      editable: true,
    })),
  ]

  const getRowsWithGroups = () => {
    return initialRows.reduce((acc, group) => {
      acc.push(group)
      if (expandedGroups.has(group.id) && group.children) {
        acc.push(...group.children)
      }
      return acc
    }, [])
  }

  return (
    <Box sx={{ height: "100vh", width: "100%", bgcolor: "background.paper" }}>
      <DataGrid
        rows={getRowsWithGroups()}
        columns={columns}
        hideFooter
        disableColumnMenu
        disableRowSelectionOnClick
        slots={{
          toolbar: CustomToolbar,
        }}
        sx={{
          border: "none",
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "#f8f9fa",
            borderBottom: "1px solid #e0e0e0",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #e0e0e0",
            borderRight: "1px solid #e0e0e0",
            "&:focus": {
              outline: "none",
            },
          },
          "& .MuiDataGrid-columnHeader": {
            borderRight: "1px solid #e0e0e0",
            "&:focus": {
              outline: "none",
            },
          },
        }}
      />
    </Box>
  )
}

