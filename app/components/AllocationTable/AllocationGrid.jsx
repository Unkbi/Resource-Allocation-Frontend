import * as React from 'react';
import Box from '@mui/material/Box';
import {
  DataGridPremium,
  useGridApiRef,
  useKeepGroupedColumnsHidden,
} from '@mui/x-data-grid-premium';
import { columnGroupingModel,generateWeeklyColumns, getAllColumnsWithWeek } from './TableHeader';
import CustomToolbar from '../Toolbar/CustomToolbar';

// Your data (rows)
export const rows = [
  {
    "id": "64df427e-75ed-5be5-8d6f-4a56aef066e1",
    "project": "Corn",
    "resource": "Augusta Norman",
    "role": "Trader",
    "totalEffort": 100, // Add total effort for the object
    "W1": 10,
    "W2": 12,
    "W3": 15,
    "W4": 20,
    "W5": 18,
    "W6": 10,
    "W7": 5,
    "W8": 8,
    "W9": 7,
    "W10": 9,
    "W11": 6,
    "W12": 7,
    "W13": 6,
    "W14": 5,
    "W15": 3,
    "hasButton": false, // Optional button flag
  },
  {
    "id": "14af22ff-c624-5ff2-9c97-c7620bf738c3",
    "project": "Frozen Concentrated Orange Juice",
    "resource": "Flora Dixon",
    "role": "Trader",
    "totalEffort": 120, // Add total effort for the object
    "W1": 14,
    "W2": 17,
    "W3": 20,
    "W4": 25,
    "W5": 16,
    "W6": 15,
    "W7": 7,
    "W8": 10,
    "W9": 5,
    "W10": 7,
    "W11": 6,
    "W12": 9,
    "W13": 7,
    "W14": 10,
    "W15": 8,
    "hasButton": false, // Optional button flag
  },
  {
    "id": "066b8c25-8bd5-5c9f-9851-31526d96a8e2",
    "project": "Sugar No.11",
    "resource": "Resource 2",
    "role": "Analyst",
    "totalEffort": 80, // Total effort
    "W1": 9,
    "W2": 19,
    "W3": 14,
    "W4": 11,
    "W5": 12,
    "W6": 10,
    "W7": 13,
    "W8": 14,
    "W9": 12,
    "W10": 16,
    "W11": 11,
    "W12": 13,
    "W13": 10,
    "W14": 12,
    "W15": 14,
    "hasButton": false,
  }
];


export default function AllocationGrid(props) {
  const {groupBy, columns} = props;
  const apiRef = useGridApiRef();

  const allColumns = getAllColumnsWithWeek(columns)

  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    // Grouping rows by dynamic row"
    initialState: {
      rowGrouping: {
        model: [groupBy],
      },
      // Sort by dynamic  initially
      sorting: {
        sortModel: [{ field: groupBy, sort: 'asc' }], 
      },
      // Aggregating the total effort
      aggregation: {
        model: {
          totalEffort: 'sum', 
        },
      },
      pinnedColumns: { left: [groupBy]} 
    },
  });

  return (
    <Box sx={{ height: 520, width: '100%' }}>
      <DataGridPremium
        rows={rows}
        columns={allColumns}
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