import * as React from 'react';
import Box from '@mui/material/Box';
import {
  DataGridPremium,
  gridClasses,
  useGridApiRef,
  useKeepGroupedColumnsHidden
} from '@mui/x-data-grid-premium';
import { columnGroupingModel,generateWeeklyColumns, getAllColumnsWithWeek } from './TableHeader';
import CustomToolbar from '../Toolbar/CustomToolbar';
import { transformJson } from '@/app/utils/common';
import { demoRows, jsonData } from './data';

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


const showField = columns.map((col)=>col.field)
const getTogglableColumns = (columns) => {
  return columns
    .filter((column) => showField.includes(column.field))
    .map((column) => column.field);
};


  return (
    <Box sx={{ height: 520, width: '100%' }}>
      <DataGridPremium
        rows={tableData}
        columns={allColumns}
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