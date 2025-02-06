import { useState, lazy } from 'react';
import { Box } from '@mui/material';
import {
  GridColumnMenuPinningItem,
  useGridApiRef,
  useKeepGroupedColumnsHidden,
} from '@mui/x-data-grid-premium';
import { calculateTotalEffort } from '@/app/utils/common';
import { demoRows } from './data';
import { StyledDataGrid } from './styles/StyledDataGrid';
import './styles/AllocationGrid.css';
import {
  getInitialState,
  getFinalColumns,
  getGroupingColDef,
  groupPage,
} from './AllocationGridUtils';

const CustomToolbar = lazy(() => import('../Toolbar/CustomToolbar'));
const ResourcePopper = lazy(() => import('./components/ResourcePopper'));

export default function AllocationGrid({
  groupBy,
  columns,
  columnGroupingModel,
  data,
}) {
  const apiRef = useGridApiRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [filterButtonEl, setFilterButtonEl] = useState(null);

  const mapData = groupBy === 'teams' ? demoRows : data;
  const updatedRows = mapData.map(row => ({
    ...row,
    totalEffort: calculateTotalEffort(row),
  }));

  const [rowsState, setRowsState] = useState(() => [
    ...updatedRows,
    ...Array.from(new Set(updatedRows.map(row => row.project))).map(
      project => ({
        id: `${project}-add-resource`,
        project: project,
        resource: '',
        role: '',
        totalEffort: '',
        hasButton: true,
        ...Object.keys(updatedRows[0])
          .filter(key => key.startsWith('W'))
          .reduce((acc, week) => {
            acc[week] = '';
            return acc;
          }, {}),
      })
    ),
  ]);

  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: getInitialState(groupBy, updatedRows),
  });

  const handleAddRow = (e, resource) => {
    const newRow = {
      id: `${selectedProject}-${resource.name}-${rowsState.length + 1}`,
      project: selectedProject,
      resource: resource.name,
      role: 'New Role',
      totalEffort: resource.totalHours,
      ...Object.keys(updatedRows[0])
        .filter(key => key.startsWith('W'))
        .reduce((acc, week) => {
          acc[week] = '';
          return acc;
        }, {}),
      hasButton: false,
    };
    setRowsState(prevRows =>
      prevRows.flatMap(row =>
        row.id === `${selectedProject}-add-resource` ? [newRow, row] : [row]
      )
    );
    setIsSearchMode(false);
  };
  const finalColumns = getFinalColumns(
    columns,
    groupBy,
    setSelectedProject,
    handleAddRow,
    isSearchMode,
    setIsSearchMode
  );

  const showField = [
    ...columns.map(col => col.field),
    ...finalColumns.filter(i => i.field === 'resource').map(col => col.field),
  ];

  const getTogglableColumns = columns =>
    columns
      .filter(column => showField.includes(column.field))
      .map(column => column.field);

  return (
    <Box sx={{ height: 'calc(100vh - 54px)', width: '100%' }}>
      <StyledDataGrid
        rows={rowsState}
        columns={finalColumns}
        apiRef={apiRef}
        loading={false}
        disableRowSelectionOnClick
        initialState={initialState}
        columnGroupingModel={columnGroupingModel}
        defaultGroupingExpansionDepth={1}
        getRowClassName={params => `super-app-theme--${params.row.status}`}
        disableAutosize
        slots={{
          toolbar: CustomToolbar,
          columnMenu: props => {
            return <GridColumnMenuPinningItem {...props} />;
          },
        }}
        slotProps={{
          panel: {
            anchorEl: filterButtonEl,
            className: 'parent-grid-panel',
          },
          columnsManagement: {
            getTogglableColumns,
          },
          toolbar: {
            setFilterButtonEl,
          },
          columnsPanel: {
            className: 'styleColumnMenu',
            sx: {
              '& .MuiDataGrid-columnsManagement': {
                color: 'red',
              },
            },
          },
          filterPanel: {
            columnsSort: 'asc',
            className: 'filterPopup',
            filterFormProps: {
              columnInputProps: {
                variant: 'outlined',
                size: 'small',
                sx: { mt: 'auto' },
              },
              operatorInputProps: {
                variant: 'outlined',
                size: 'small',
                sx: { mt: 'auto' },
              },
              valueInputProps: {
                InputComponentProps: {
                  variant: 'outlined',
                  size: 'small',
                },
              },
              deleteIconProps: {
                sx: {
                  '& .MuiSvgIcon-root': { color: '#d32f2f' },
                },
              },
            },
            sx: {
              // Customize inputs using css selectors
              '& .MuiDataGrid-filterForm': { p: 2 },
              '& .MuiDataGrid-filterForm:nth-child(even)': {
                backgroundColor: theme =>
                  theme.palette.mode === 'dark' ? '#444' : '#f5f5f5',
              },
              '& .MuiDataGrid-filterFormLogicOperatorInput': { mr: 2 },
              '& .MuiDataGrid-filterFormColumnInput': { mr: 2, width: 150 },
              '& .MuiDataGrid-filterFormOperatorInput': { mr: 2 },
              '& .MuiDataGrid-filterFormValueInput': { width: 200 },
            },
          },
        }}
        getAggregationPosition={groupNode =>
          groupNode.depth === -1 ? null : 'inline'
        }
        groupingColDef={getGroupingColDef(groupBy)}
        treeDataGroupingHeaderName={groupPage(groupBy)}
        hideFooter
        editMode="row"
      />
    </Box>
  );
}
