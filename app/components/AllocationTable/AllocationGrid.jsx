import { useState, lazy } from 'react';
import { Box } from '@mui/material';
import {
  GridColumnMenuPinningItem,
  useGridApiRef,
  useKeepGroupedColumnsHidden,
} from '@mui/x-data-grid-premium';
import { calculateTotalEffort } from '@/app/utils/common';
import { demoRows } from './data';
// import { StyledDataGrid } from "./styles/StyledDataGrid"
import { styled } from '@mui/material';
import { DataGridPremium, gridClasses } from '@mui/x-data-grid-premium';
import {
  getInitialState,
  getFinalColumns,
  getTogglableColumns,
  getGroupingColDef,
  groupPage,
} from './AllocationGridUtils';

const CustomToolbar = lazy(() => import('../Toolbar/CustomToolbar'));
const ResourcePopper = lazy(() => import('./components/ResourcePopper'));
const StyledDataGrid = styled(DataGridPremium)(({ theme }) => ({
  [`& .${gridClasses.columnHeader}[data-field="__row_group_by_columns_group__"]`]:
    {
      width: '290px !important',
    },
  [`& .${gridClasses.columnHeader}[data-fields="|-__row_group_by_columns_group__-|"]`]:
    {
      width: '290px !important',
    },
  [`& .${gridClasses.cell}[data-field="__row_group_by_columns_group__"]`]: {
    width: '290px',
  },

  [`& .${gridClasses.columnHeader}`]: {
    '&.prime-header': {},
    '&.secondary-header': {},
    '&.weekly-header': {},
  },
  [`& .${gridClasses.cell}`]: {
    '&.prime-cell': {},
    '&.secondary-cell': {},
    '&.weeklyCell': {},
  },
  [`.${gridClasses.cell}`]: {
    "& input[type='number']": {
      appearance: 'textfield',
      margin: 0,
    },
    "& input[type='number']::-webkit-outer-spin-button, & input[type='number']::-webkit-inner-spin-button":
      {
        display: 'none',
      },
  },
  '& .MuiDataGrid-cell': {
    borderRight: '1px solid #DDE1E4',
    fontSize: '14px',
    padding: '0 16px',
    color: '#313F68',
    fontFamily: "'Manrope', serif",
    fontWeight: '500',
  },
  '& .MuiDataGrid-columnHeader': {
    borderRight: '1px solid #DDE1E4',
    backgroundColor: '#FBFCFE',
    padding: '0 16px',
    color: '#313F68',
    fontFamily: "'Manrope', serif",
    fontWeight: '500',
  },
  '& .MuiDataGrid-row': {
    '&:hover': {
      backgroundColor: '#FBFCFE',
    },
  },
  border: 'none',
  '& .MuiDataGrid-cell:focus': {
    outline: 'none',
  },
  '& .MuiDataGrid-columnHeader:focus': {
    outline: 'none',
  },
  '& .MuiDataGrid-groupingCriteriaCellToggle button': {
    display: 'none',
  },
  '& .MuiDataGrid-groupingCriteriaCell': {
    padding: '0',
  },
  '& .MuiDataGrid-cellContent': {
    paddingLeft: '8px',
  },
  '& .MuiDataGrid-groupingCriteriaCellToggle': {
    display: 'none',
  },
  '& .MuiDataGrid-aggregationColumnHeaderLabel': {
    display: 'none',
  },
  '& .weeklyCell': {
    textAlign: 'center',
    fontFamily: "'Manrope', serif",
    fontWeight: '500',
    fontSize: '14px',
    color: '#212121',
    padding: '0',
    '&.MuiDataGrid-cell--editing:focus-within': {
      outline: 'none',
    },
    '&.MuiDataGrid-cell.MuiDataGrid-cell--editing': {
      padding: '0',
    },
    '& .MuiDataGrid-editInputCell': {},
    '& input': {
      fontFamily: "'Manrope', serif",
      fontWeight: '500',
      color: '#313F68',
      fontSize: '14px',
      padding: '3px',
      textAlign: 'center',
      border: '1px solid transparent',
      boxSizing: 'border-box',
      '&:focus': {
        backgroundColor: 'rgba(157, 201, 255, 0.3)',
        border: '1px solid #298AFF',
      },
    },
  },
  '& .weekly-header': {
    padding: '3px',
    backgroundColor: 'rgba(20, 43, 81, 0.72)',
    '& .MuiDataGrid-columnHeaderTitleContainer': {
      justifyContent: 'center',
      '& .MuiDataGrid-columnHeaderTitle': {
        fontFamily: "'Manrope', serif",
        fontWeight: '500',
        fontSize: '12px',
        color: '#fff',
      },
    },
  },
  '& .current-week-header': {
    backgroundColor: 'rgb(43 102 199 / 72%)',
  },
  '& .MuiDataGrid-columnSeparator--resizable': {
    opacity: '0',
  },
  '& .MuiDataGrid-cellEmpty': {
    display: 'none',
  },
  '& .MuiDataGrid-cell:focus-within': {
    outline: 'none',
  },
  '& .MuiDataGrid-row--editing': {
    boxShadow: 'none',
  },
}));

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

  const mapData = groupBy === 'project' ? data : demoRows;
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
          },
          columnsManagement: {
            getTogglableColumns,
          },
          toolbar: {
            setFilterButtonEl,
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
      {/* <Suspense fallback={<div>Loading...</div>}>
        <ResourcePopper anchorEl={anchorEl} onClose={() => setAnchorEl(null)} onAddResource={handleAddRow} />
      </Suspense> */}
    </Box>
  );
}
