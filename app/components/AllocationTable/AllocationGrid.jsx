import { useState, lazy } from 'react';
import { Box } from '@mui/material';
import {
  GridColumnMenuPinningItem,
  useGridApiRef,
  useKeepGroupedColumnsHidden,
} from '@mui/x-data-grid-premium';
import {
  calculateTotalEffort,
  getMondayOfWeek,
  getProjectIdByName,
  isResourceInProject,
} from '@/app/utils/common';
import { demoRows } from './data';
import {
  ColumnManagementStyles,
  FilterPanelStyles,
  StyledDataGrid,
} from './styles/StyledDataGrid';
import './styles/AllocationGrid.css';
import {
  getInitialState,
  getFinalColumns,
  getGroupingColDef,
  groupPage,
  getCellClassName,
} from './AllocationGridUtils';
import { useDispatch, useSelector } from 'react-redux';
import {
  setResourceAllocation,
  updateResourceAllocation,
} from '@/app/redux/actions/resourceAllocationAction';

const CustomToolbar = lazy(() => import('../Toolbar/CustomToolbar'));

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
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedAllocationId, setSelectedAllocationId] = useState(null);

  const mapData = groupBy === 'project' || 'teams' ? data : demoRows;
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

  const dispatch = useDispatch();
  const { projects } = useSelector(state => state.projects);

  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: getInitialState(groupBy, updatedRows),
  });

  const handleAddRow = (e, resource) => {
    const newRow = {
      id: `${selectedProject}-${resource.FullName}-${rowsState.length + 1}`,
      resourceId: resource.Id,
      project: selectedProject,
      projectId: getProjectIdByName(projects[0]?.result, selectedProject),
      resource: resource.FullName,
      role: resource.Role,
      totalEffort: resource.totalHours,
      ...Object.keys(updatedRows[0])
        .filter(key => key.startsWith('W'))
        .reduce((acc, week) => {
          acc[week] = '';
          return acc;
        }, {}),
      hasButton: false,
    };
    if (!isResourceInProject(rowsState, selectedProject, resource.FullName)) {
      setRowsState(prevRows =>
        prevRows.flatMap(row =>
          row.id === `${selectedProject}-add-resource` ? [newRow, row] : [row]
        )
      );
    }
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

  const handleDoubleClick = params => {
    setSelectedCell(params.field);
    const { field, formattedValue, row } = params || {};
    if (formattedValue) {
      const allocationData = row[field];
      setSelectedAllocationId(allocationData.allocationId);
    }
  };

  const handleCellUpdate = updated => {
    try {
      const { project, projectId, id } = updated || {};

      let resourceId = updated?.resourceId;

      if (selectedAllocationId) {
        const putPayload = {
          resourceId: resourceId,
          allocationId: selectedAllocationId,
          putData: {
            'ResourceAllocation.Core/Allocation': {
              AllocationEntered: updated[selectedCell],
            },
          },
        };
        dispatch(updateResourceAllocation(putPayload));
      } else {
        const postPayload = {
          resourceId: resourceId,
          postData: {
            'ResourceAllocation.Core/Allocation': {
              Resource: resourceId,
              Project: projectId,
              ProjectName: project,
              Period: getMondayOfWeek(selectedCell),
              AllocationEntered: updated[selectedCell],
            },
          },
        };
        dispatch(setResourceAllocation(postPayload));
      }
    } catch (err) {
      console.error('Cell update failed:', err);
    } finally {
      setSelectedAllocationId(null);
      setSelectedCell(null);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 54px)', width: '100%' }}>
      <StyledDataGrid
        onCellDoubleClick={params => {
          handleDoubleClick(params);
        }}
        processRowUpdate={newRow => {
          handleCellUpdate(newRow);
        }}
        onProcessRowUpdateError={err => {
          console.error('Row update failed:', err);
        }}
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
        getCellClassName={params => getCellClassName(params, updatedRows)}
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
            sx: ColumnManagementStyles,
          },
          filterPanel: {
            columnsSort: 'asc',
            className: 'filterPopup',
            filterFormProps: {
              columnInputProps: {
                size: 'small',
                sx: { mt: 'auto' },
              },
              operatorInputProps: {
                size: 'small',
                sx: { mt: 'auto' },
              },
              valueInputProps: {
                InputComponentProps: {
                  size: 'small',
                },
              },
              deleteIconProps: {
                sx: {
                  '& .MuiSvgIcon-root': { color: '#d32f2f' },
                },
              },
            },
            sx: FilterPanelStyles,
          },
        }}
        getAggregationPosition={groupNode =>
          groupNode.depth === -1 ? null : 'inline'
        }
        groupingColDef={getGroupingColDef(groupBy)}
        treeDataGroupingHeaderName={groupPage(groupBy)}
        hideFooter
        editMode="cell"
        // aggregationRowsCount={
        //   (params) => {
        //     return params.rowNode.children?.length || 1;
        //   }
        // }
      />
    </Box>
  );
}
