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
    width:"290px !important"
  },
  [`& .${gridClasses.columnHeader}[data-fields="|-__row_group_by_columns_group__-|"]`]: {
    width: "290px !important",
  },
  [`& .${gridClasses.cell}[data-field="__row_group_by_columns_group__"]`]: {
    width:"290px"
  },
 
  [`& .${gridClasses.columnHeader}`]: {
    "&.prime-header": {
      
    },
    "&.secondary-header": {
     
    },
    "&.weekly-header": {
    },
  },
  [`& .${gridClasses.cell}`]: {
    "&.prime-cell": {
      
    },
    "&.secondary-cell": {

    },
    "&.weekly-cell": {
      
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
    borderRight: "1px solid #DDE1E4",
    fontSize: "14px",
    padding: "0 16px",
    color:"#313F68",
    fontFamily: "'Manrope', serif",
    fontWeight: "500",
  },
  "& .MuiDataGrid-columnHeader": {
    borderRight: "1px solid #DDE1E4",
    backgroundColor: "#FBFCFE",
    padding: "0 16px",
    color:"#313F68",
    fontFamily: "'Manrope', serif",
    fontWeight: "500",
  },
  "& .MuiDataGrid-row": {
    "&:hover": {
      backgroundColor: "#FBFCFE",
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
  "& .weekly-cell":{
    textAlign:"center",
    fontFamily: "'Manrope', serif",
    fontWeight: "500",
    fontSize:"14px",
    color:"#212121",
    padding:"3px",
  },
  "& .weekly-header":{
    padding:"3px",
    backgroundColor: "rgba(20, 43, 81, 0.72)",
    "& .MuiDataGrid-columnHeaderTitleContainer":{
      justifyContent: "center",
      "& .MuiDataGrid-columnHeaderTitle":{
      fontFamily: "'Manrope', serif",
      fontWeight: "500",
      fontSize:"12px",
      color:"#fff",
      }
    }
  },
  "& .MuiDataGrid-columnSeparator--resizable":{
    opacity:"0"
  },
  "& .MuiDataGrid-cellEmpty":{
    display:"none"
  },
  "& .MuiDataGrid-cell:focus-within":{
    outline:"none"
  }
}))
export default function AllocationGrid({ groupBy, columns, columnGroupingModel }) {
  const apiRef = useGridApiRef()
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedProject, setSelectedProject] = useState("")
  const [isSearchMode, setIsSearchMode] = useState(false);

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

  const handleAddRow = (e, resource) => {
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
    setIsSearchMode(false)
  }
  const finalColumns = getFinalColumns(columns, groupBy, setSelectedProject, handleAddRow, isSearchMode, setIsSearchMode)

  return (
    <Box sx={{ height: "calc(100vh - 54px)", width: "100%" }}>
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

