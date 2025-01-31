import * as React from "react"
import { Box, Button, TextField, Popper, List, ListItem, ListItemText } from "@mui/material"
import { DataGridPremium, gridClasses, useGridApiRef, useKeepGroupedColumnsHidden } from "@mui/x-data-grid-premium"
import { columnGroupingModel, getAllColumnsWithWeek } from "./TableHeader"
import CustomToolbar from "../Toolbar/CustomToolbar"
import { transformJson } from "@/app/utils/common"
import { demoRows, jsonData } from "./data"
import { styled } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';


const allResources = [
  { name: "John Doe", projects: ["Project A"], totalHours: 30 },
  { name: "Jane Smith", projects: ["Project B"], totalHours: 25 },
  { name: "Alice Johnson", projects: ["Project C"], totalHours: 35 },
]

const AddResourceButton = styled(Button)(({ theme }) => ({
  color: theme.custom.textColor,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "transparent",
  },
}));
export default function AllocationGrid(props) {
  const { groupBy, columns } = props

  const [tableData, setTableData] = React.useState([])

  React.useEffect(() => {
    if (groupBy === "role") {
      setTableData(transformJson(groupBy, jsonData))
    } else {
      setTableData(demoRows)
    }
  }, [groupBy])

  const apiRef = useGridApiRef()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedProject, setSelectedProject] = React.useState("")

  // State to manage rows dynamically
  const [rowsState, setRowsState] = React.useState([
    ...demoRows,
    // Add placeholder rows for each project
    ...Array.from(new Set(demoRows.map((row) => row.project))).map((project) => ({
      id: `${project}-add-resource`,
      project: project,
      resource: "",
      role: "",
      totalEffort: "",
      hasButton: true, // Marker for the "Add Resource" row
      ...Object.keys(demoRows[0])
        .filter((key) => key.startsWith("W"))
        .reduce((acc, week) => {
          acc[week] = ""
          return acc
        }, {}),
    })),
  ])

  const allColumns = getAllColumnsWithWeek(columns)

  // Function to handle adding a new row
  const handleAddRow = (resource) => {
    const newRow = {
      id: `${selectedProject}-${resource.name}-${rowsState.length + 1}`,
      project: selectedProject,
      resource: resource.name,
      role: "New Role", // Default role
      totalEffort: resource.totalHours,
      ...Object.keys(demoRows[0])
        .filter((key) => key.startsWith("W"))
        .reduce((acc, week) => {
          acc[week] = 0
          return acc
        }, {}),
      hasButton: false,
    }
    // Insert the new row before the "Add Resource" row for the project
    setRowsState((prevRows) =>
      prevRows.flatMap((row) => (row.id === `${selectedProject}-add-resource` ? [newRow, row] : [row])),
    )
    setAnchorEl(null) // Close the Popper
    setSearchTerm("") // Reset the search term
  }

  // Filter resources based on the search term
  const filteredResources = allResources.filter((resource) =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: {
      rowGrouping: {
        model: [groupBy],
      },
      sorting: {
        sortModel: [{ field: groupBy, sort: "asc" }],
      },
      aggregation: {
        model: {
          totalEffort: "sum",
          ...Object.keys(demoRows[0])
            .filter((key) => key.startsWith("W"))
            .reduce((acc, week) => {
              acc[week] = "sum"
              return acc
            }, {}),
        },
      },
      pinnedColumns: { left: [groupBy] },
      // columns: {
      //   columnVisibilityModel: {
      //     ...Object.keys(demoRows[0])
      //       .filter((key) => key.startsWith("W"))
      //       .reduce((acc, week) => {
      //         acc[week] = true
      //         return acc
      //       }, {}),
      //     totalEffort: true,
      //   },
      // },
    },
  })

  const showField = columns.map((col) => col.field)
  const getTogglableColumns = (columns) => {
    return columns.filter((column) => showField.includes(column.field)).map((column) => column.field)
  }

  // Final columns array with fallback
  const finalColumns = [
    ...(allColumns || []),
    {
      field: "resource",
      headerName: "Resource",
      width: 200,
      renderCell: (params) => {
        if (params.row.hasButton) {
          return (
            <div>
              <AddResourceButton
                variant="text"
                size="small"
                startIcon={<AddIcon />}
                onClick={(event) => {
                  setSelectedProject(params.row.project)
                  setAnchorEl(event.currentTarget)
                }}
              >
                Add Resource
              </AddResourceButton>
              <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement="bottom-start">
                <Box sx={{ p: 1, bgcolor: "background.paper", minWidth: 200 }}>
                  <TextField
                    fullWidth
                    placeholder="Search Resource"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ border: 0 }}
                  />
                  <List>
                    {filteredResources.map((resource, index) => (
                      <ListItem key={index} button onClick={() => handleAddRow(resource)}>
                        <ListItemText primary={resource.name} secondary={resource.projects.join(", ")} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Popper>
            </div>
          )
        }
        return <span>{params.value}</span>
      },
    },
  ]

  const processRowUpdate = (newRow) => {
    const weeklyTotal = Object.keys(newRow)
      .filter((key) => key.startsWith("W"))
      .reduce((sum, week) => sum + (Number(newRow[week]) || 0), 0)

    return { ...newRow, totalEffort: weeklyTotal }
  }

  return (
    <Box sx={{ height: 520, width: "100%" }}>
      <DataGridPremium
        rows={rowsState}
        columns={finalColumns}
        apiRef={apiRef}
        loading={false}
        disableRowSelectionOnClick
        initialState={initialState}
        columnGroupingModel={columnGroupingModel}
        defaultGroupingExpansionDepth={1}
        getRowClassName={(params) => `super-app-theme--${params.row.status}`}
        slots={{ toolbar: CustomToolbar }}
        slotProps={{
          columnsManagement: {
            getTogglableColumns,
          },
        }}
        hideFooter
        editMode="row"
        // processRowUpdate={processRowUpdate}
        sx={{
            [`.${gridClasses.cell}`]: {
              "& input[type='number']": {
                appearance: "textfield",
                margin: 0,
              },
              "& input[type='number']::-webkit-outer-spin-button, & input[type='number']::-webkit-inner-spin-button": {
                display: "none",
              },
            },
          // [`.${gridClasses.cell}.less-occupancy`]: {
          //   backgroundColor: "#F6C8C8",
          //   color: "#1a3e72",
          // },
          // [`.${gridClasses.cell}.average-occupancy`]: {
          //   backgroundColor: "#C4E5C4",
          //   borderColor: "#7AB17A",
          // },
          // [`.${gridClasses.cell}.fully-occupied`]: {
          //   backgroundColor: "#C4E5C4",
          //   borderColor: "#7AB17A",
          // },
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
            display: "none", // Hides the aggregation label
          },
        }}

      />
    </Box>
  )
}

