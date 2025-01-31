import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Popper from '@mui/material/Popper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import AddIcon from '@mui/icons-material/Add';
import {
  DataGridPremium,
  useGridApiRef,
  useKeepGroupedColumnsHidden,
} from '@mui/x-data-grid-premium';
import { columnGroupingModel, generateWeeklyColumns, getAllColumnsWithWeek } from './TableHeader';
import CustomToolbar from '../Toolbar/CustomToolbar';
import { styled } from '@mui/material';





const AddResourceButton = styled(Button)(({ theme }) => ({
  color: theme.custom.textColor,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "transparent",
  },
}));


// Your data (rows)
export const rows = [
  {
    id: "64df427e-75ed-5be5-8d6f-4a56aef066e1",
    project: "Corn",
    resource: "Augusta Norman",
    role: "Trader",
    totalEffort: 100,
    W1: 10,
    W2: 12,
    W3: 15,
    W4: 20,
    W5: 18,
    W6: 10,
    W7: 5,
    W8: 8,
    W9: 7,
    W10: 9,
    W11: 6,
    W12: 7,
    W13: 6,
    W14: 5,
    W15: 3,
    hasButton: false,
  },
  {
    id: "14af22ff-c624-5ff2-9c97-c7620bf738c3",
    project: "Frozen Concentrated Orange Juice",
    resource: "Flora Dixon",
    role: "Trader",
    totalEffort: 120,
    W1: 14,
    W2: 17,
    W3: 20,
    W4: 25,
    W5: 16,
    W6: 15,
    W7: 7,
    W8: 10,
    W9: 5,
    W10: 7,
    W11: 6,
    W12: 9,
    W13: 7,
    W14: 10,
    W15: 8,
    hasButton: false,
  },
  {
    id: "066b8c25-8bd5-5c9f-9851-31526d96a8e2",
    project: "Sugar No.11",
    resource: "Resource 2",
    role: "Analyst",
    totalEffort: 80,
    W1: 9,
    W2: 19,
    W3: 14,
    W4: 11,
    W5: 12,
    W6: 10,
    W7: 13,
    W8: 14,
    W9: 12,
    W10: 16,
    W11: 11,
    W12: 13,
    W13: 10,
    W14: 12,
    W15: 14,
    hasButton: false,
  },
];

// Predefined list of available resources
const allResources = [
  { name: "John Doe", projects: ["Project A"], totalHours: 30 },
  { name: "Jane Smith", projects: ["Project B"], totalHours: 25 },
  { name: "Alice Johnson", projects: ["Project C"], totalHours: 35 },
];

export default function AllocationGrid(props) {
  const { groupBy, columns } = props;
  const apiRef = useGridApiRef();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedProject, setSelectedProject] = React.useState("");

  // State to manage rows dynamically
  const [rowsState, setRowsState] = React.useState([
    ...rows,
    // Add placeholder rows for each project
    ...Array.from(new Set(rows.map((row) => row.project))).map((project) => ({
      id: `${project}-add-resource`,
      project: project,
      resource: "",
      role: "",
      totalEffort: "",
      hasButton: true, // Marker for the "Add Resource" row
      ...Object.keys(rows[0])
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
      ...Object.keys(rows[0])
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
              <AddResourceButton
                variant="text"
                size="small"
                startIcon={<AddIcon />}
                onClick={(event) => {
                  setSelectedProject(params.row.project);
                  setAnchorEl(event.currentTarget);
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
        slots={{ toolbar: CustomToolbar }}
        hideFooter
        sx={{
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
        }}

      />
    </Box>
  );
}