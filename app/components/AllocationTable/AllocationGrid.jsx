import { useState, lazy, Suspense } from "react"
import { Box } from "@mui/material"
import { useGridApiRef, useKeepGroupedColumnsHidden } from "@mui/x-data-grid-premium"
import { calculateTotalEffort } from "@/app/utils/common"
import { demoRows } from "./data"
// import { StyledDataGrid } from "./styles/StyledDataGrid"
import { styled } from "@mui/material"
import { DataGridPremium, gridClasses } from "@mui/x-data-grid-premium"
import { getInitialState, getFinalColumns, getTogglableColumns, getGroupingColDef, processRowUpdate, groupPage } from "./AllocationGridUtils"

const CustomToolbar = lazy(() => import("../Toolbar/CustomToolbar"))
const ResourcePopper = lazy(() => import("./components/ResourcePopper"))
const StyledDataGrid = styled(DataGridPremium)(({ theme }) => ({
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
export default function AllocationGrid({ groupBy, columns, columnGroupingModel }) {
  const apiRef = useGridApiRef()
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedProject, setSelectedProject] = useState("")

  const updatedRows = demoRows.map((row) => ({
    ...row,
    totalEffort: calculateTotalEffort(row),
  }))

  const [rowsState, setRowsState] = useState([
    ...updatedRows,
    ...Array.from(new Set(updatedRows.map((row) => row.project))).map((project) => ({
      id: `${project}-add-resource`,
      project: project,
      resource: "",
      role: "",
      totalEffort: "",
      hasButton: true,
      ...Object.keys(updatedRows[0])
        .filter((key) => key.startsWith("W"))
        .reduce((acc, week) => {
          acc[week] = ""
          return acc
        }, {}),
    })),
  ])

  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: getInitialState(groupBy, updatedRows),
  })

  const handleAddRow = (resource) => {
    const newRow = {
      id: `${selectedProject}-${resource.name}-${rowsState.length + 1}`,
      project: selectedProject,
      resource: resource.name,
      role: "New Role",
      totalEffort: resource.totalHours,
      ...Object.keys(updatedRows[0])
        .filter((key) => key.startsWith("W"))
        .reduce((acc, week) => {
          acc[week] = ""
          return acc
        }, {}),
      hasButton: false,
    }
    setRowsState((prevRows) =>
      prevRows.flatMap((row) => (row.id === `${selectedProject}-add-resource` ? [newRow, row] : [row])),
    )
    setAnchorEl(null)
  }

  const finalColumns = getFinalColumns(columns, groupBy, setSelectedProject, setAnchorEl)

  return (
    <Box sx={{ height: 520, width: "100%" }}>
      <StyledDataGrid
        rows={rowsState}
        columns={finalColumns}
        apiRef={apiRef}
        loading={false}
        disableRowSelectionOnClick
        initialState={initialState}
        columnGroupingModel={columnGroupingModel}
        defaultGroupingExpansionDepth={1}
        getRowClassName={(params) => `super-app-theme--${params.row.status}`}
        slots={{
          toolbar: (props) => (
            <Suspense fallback={<div>Loading...</div>}>
              <CustomToolbar {...props} />
            </Suspense>
          ),
        }}
        slotProps={{
          columnsPanel: {
            getTogglableColumns: getTogglableColumns(columns, groupBy),
          },
        }}
        getAggregationPosition={(groupNode) => (groupNode.depth === -1 ? null : "inline")}
        groupingColDef={getGroupingColDef(groupBy)}
        treeDataGroupingHeaderName={groupPage(groupBy)}
        hideFooter
        editMode="row"
        processRowUpdate={processRowUpdate}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <ResourcePopper anchorEl={anchorEl} onClose={() => setAnchorEl(null)} onAddResource={handleAddRow} />
      </Suspense>
    </Box>
  )
}

