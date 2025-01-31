import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Popper from '@mui/material/Popper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {
  DataGridPremium,
  gridClasses,
  useGridApiRef,
  useKeepGroupedColumnsHidden
} from '@mui/x-data-grid-premium';
import { columnGroupingModel, generateWeeklyColumns, getAllColumnsWithWeek } from './TableHeader';
import CustomToolbar from '../Toolbar/CustomToolbar';
import { transformJson } from '@/app/utils/common';
import { demoRows, jsonData } from './data';


const allResources = [
  { name: "John Doe", projects: ["Project A"], totalHours: 30 },
  { name: "Jane Smith", projects: ["Project B"], totalHours: 25 },
  { name: "Alice Johnson", projects: ["Project C"], totalHours: 35 },
];
export default function AllocationGrid(props) {
  const {groupBy, columns} = props;
  
  const [tableData, setTableData] = React.useState([])

  React.useEffect(()=> {
    if(groupBy === 'role'){
      setTableData(transformJson(groupBy,jsonData));
    } else{
      setTableData(demoRows);
    }
  },[groupBy])

  const apiRef = useGridApiRef();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedProject, setSelectedProject] = React.useState("");

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
          acc[week] = "";
          return acc;
        }, {}),
    })),
  ]);

  const allColumns = getAllColumnsWithWeek(columns);

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
          acc[week] = 0; // Initialize weekly hours to 0
          return acc;
        }, {}),
      hasButton: false,
    };
    // Insert the new row before the "Add Resource" row for the project
    setRowsState((prevRows) =>
      prevRows.flatMap((row) =>
        row.id === `${selectedProject}-add-resource`
          ? [newRow, row]
          : [row]
      )
    );
    setAnchorEl(null); // Close the Popper
    setSearchTerm(""); // Reset the search term
  };

  // Filter resources based on the search term
  const filteredResources = allResources.filter((resource) =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        },
      },
      pinnedColumns: { left: [groupBy] },
    },
  });


const showField = columns.map((col)=>col.field)
const getTogglableColumns = (columns) => {
  return columns
    .filter((column) => showField.includes(column.field))
    .map((column) => column.field);
};


  // Final columns array with fallback
  const finalColumns = [
    ...(allColumns || []), // Fallback to an empty array if allColumns is undefined
    {
      field: "resource",
      headerName: "Resource",
      width: 200,
      renderCell: (params) => {
        if (params.row.hasButton) {
          return (
            <div>
              <Button
                variant="contained"
                size="small"
                onClick={(event) => {
                  setSelectedProject(params.row.project);
                  setAnchorEl(event.currentTarget);
                }}
              >
                Add Resource
              </Button>
              <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement="bottom-start">
                <Box sx={{ border: 1, p: 1, bgcolor: "background.paper", minWidth: 200 }}>
                  <TextField
                    autoFocus
                    fullWidth
                    placeholder="Search Resource"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <List>
                    {filteredResources.map((resource, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={() => handleAddRow(resource)}
                      >
                        <ListItemText
                          primary={resource.name}
                          secondary={resource.projects.join(", ")}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Popper>
            </div>
          );
        }
        return <span>{params.value}</span>;
      },
    },
  ];

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
        editMode='row'
        sx={{
          [`.${gridClasses.cell}.negative`]: {
            backgroundColor: '#F6C8C8',
            color: '#1a3e72',
          },
          [`.${gridClasses.cell}.positive`]: {
            backgroundColor: '#C4E5C4',
            borderColor:"#7AB17A"
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
            // Apply specific styling to aggregation columns (like `totalEffort`)
          // '& .MuiDataGrid-cell.aggregated': {
          //   backgroundColor: '#d1e7dd', // Light green background for aggregate columns
          //   fontWeight: 'bold', // Bold font for aggregate values
          //   color: '#2a6d2f', // Dark green text color
          // },

          // // Example of color variation for total effort (just for illustration)
          // '& .MuiDataGrid-cell[data-field="totalEffort"]': {
          //   backgroundColor: '#e0f7fa', // Light cyan background for totalEffort column
          //   fontWeight: '600', // Bold text for total effort
          //   color: '#00796b', // Dark cyan color for the total effort
          // },
          }}
      />
    </Box>
  );
}