import { useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import {
  GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD,
  useGridApiRef,
  useKeepGroupedColumnsHidden,
} from '@mui/x-data-grid-premium';
import {
  calculateTotalEffort,
  generateAllWeeks,
  getMondayOfWeek,
  getWeekNumber,
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
  getCellClassName,
  getInitialRowsState,
} from './AllocationGridUtils';
import { useDispatch, useSelector } from 'react-redux';
import {
  removeResourceAllocation,
  setResourceAllocation,
  updateResourceAllocation,
} from '@/app/redux/actions/resourceAllocationAction';
import { CustomColumnMenu } from './components/CustomColumnMenu';
import { CustomSnackbar } from '../Snackbar/CustomSnackbar';
import { generateColumnGroupingModel, getStartDate } from './TableHeader';
import { setRowState } from '@/app/redux/reducers/dataGridReducer';
import CustomToolbar from '../Toolbar/CustomToolbar';
import { setExpandRowId } from '@/app/redux/reducers/allocationViewReducer';

export default function AllocationGrid({ groupBy, columns, data, loading, selectedTeam, setSelectedTeam, initialState: _initialState }) {
  const apiRef = useGridApiRef();
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [updatedRows, setUpdatedRows] = useState([]);
  const { open, message, type, position } = useSelector(state => state.toast);
  const { rowState } = useSelector(state => state.dataGrid);
  const { expandRowId } = useSelector(state => state.allocationView);
  const startDate = getStartDate();

  const dispatch = useDispatch();
  const { teams, teamAllocations } = useSelector(state => state.teams);
  const [rowModesModel, setRowModesModel] = useState({});

  const normalizeRow = row => {
    return Object.keys(row).reduce((normalized, key) => {
      if (key.startsWith('W')) {
        const weekValue = row[key];
        normalized[key] =
          typeof weekValue === 'object' && weekValue !== null
            ? weekValue
            : { allocationId: null, value: weekValue };
      } else {
        normalized[key] = row[key];
      }
      return normalized;
    }, {});
  };

  useEffect(() => {
    const mapData = groupBy === 'project' || 'teams' ? data : demoRows;
    const updatedRows = mapData.map(row => ({
      ...normalizeRow(row),
      totalEffort: calculateTotalEffort(normalizeRow(row)),
    }));
    setUpdatedRows(updatedRows);
    let new_row_state = getInitialRowsState(updatedRows, groupBy, teams);
    dispatch(setRowState(new_row_state));
  }, [data, groupBy, teams]);

  useEffect(() => {
    try {
      if (groupBy === 'teams' && expandRowId !== null && rowState?.length) {
        apiRef.current.setRowChildrenExpansion(expandRowId, true);
        dispatch(setExpandRowId(null));
      }
    } catch (error) {
      console.warn('Error in setting row expansion', error);
    }
  }, [expandRowId, rowState?.length]);

  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: {
      ...getInitialState(
        groupBy,
        updatedRows,
        GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD
      ),
      ..._initialState,
    },
  });

  const handleAddProject = (e, project, curRow) => {
    const checkEntryExists = (data, resourceId, projectName, projectId) => {
      return data.some(
        item =>
          item.Resource === resourceId &&
          item.ProjectName === projectName &&
          item.Project === projectId
      );
    };

    const allocationsOfAddedResource =
      Array.isArray(teamAllocations?.result) &&
      teamAllocations?.result.filter(
        resource => resource.Resource === selectedResourceId
      );

    const allocationMap = new Map();
    const allWeeks = generateAllWeeks();

    Array.isArray(allocationsOfAddedResource) &&
      allocationsOfAddedResource.forEach(allocation => {
        if (!allocation.Period || allocation.AllocationEntered === 0) return;

        const periodDate = new Date(allocation.Period);
        const weekNumber = getWeekNumber(periodDate);

        const weekObj = {};
        allWeeks.forEach(week => {
          weekObj[week] = null;
        });

        if (allWeeks.includes(weekNumber)) {
          weekObj[weekNumber] = {
            allocationId: allocation.Allocation,
            value: allocation.AllocationEntered || null,
          };
        }

        const key = allocation.Allocation;
        allocationMap.set(key, weekObj);
      });

    if (
      !checkEntryExists(
        teamAllocations?.result,
        selectedResourceId,
        project.Name,
        project.Id
      )
    ) {
      const updatedRows = rowState.map(row => {
        if (
          row.resourceId === selectedResourceId &&
          row.teams === selectedTeam &&
          row.project === '' &&
          row.id === curRow.id
        ) {
          const key = selectedResourceId;
          const allocations = allocationMap.get(key) || {};

          return {
            ...row,
            project: project.Name,
            projectId: project.Id,
            ...allocations,
          };
        }
        return row;
      });
      dispatch(setRowState(updatedRows));
    }
  };
  const finalColumns = getFinalColumns(
    columns,
    groupBy,
    setSelectedTeam,
    handleAddProject,
    setSelectedResourceId,
    dispatch
  );

  const showField = [
    GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD,
    "__row_group_by_columns_group_teams__",
    "__row_group_by_columns_group_resource__",
    ...columns.map(col => col.field),
    ...finalColumns.filter(i => i.field === 'resource' && groupBy==="project").map(col => col.field),
    ...finalColumns.filter(i => i.field === 'project').map(col => col.field),
  ];

  const getTogglableColumns = columns =>
    columns
      .filter(column => column.field !== groupBy)
      .filter(column => showField.includes(column.field))
      .map(column => column.field);

  const handleCellKeyDown = (params, event) => {
    // Preventing Key Events for Editing.
    if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
    }

    // Handling Ctrl+V and Cmd+V (Mac)
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
      const isViewMode =
        rowModesModel && Object.keys(rowModesModel).length === 0;

      if (isViewMode) {
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        return false;
      }
    }

    if (['Tab', 'Enter'].includes(event.key)) {
      const currentCell = apiRef.current.getCellElement(
        params.id,
        params.field
      );
      let nextCell = currentCell.nextElementSibling;

      // Find Next Cell
      while (nextCell?.role !== 'gridcell') {
        if (nextCell.nextElementSibling == null) {
          nextCell = nextCell.parentElement.nextElementSibling.firstChild;
        } else {
          nextCell = nextCell.nextElementSibling;
        }
      }

      // Handling Tab Key Event
      if (
        event.key === 'Tab' &&
        rowModesModel &&
        Object.keys(rowModesModel).length === 0
      ) {
        event.preventDefault();
        nextCell.focus();
      }

      // Handling Enter Key Event
      if (
        event.key === 'Enter' &&
        rowModesModel &&
        Object.keys(rowModesModel).length > 0
      ) {
        event.preventDefault();
        event.stopPropagation();
        apiRef.current.stopRowEditMode({ id: params.id, field: params.field });
      }
    }
  };

  const handleCellUpdate = (newRow, oldRow) => {
    Object.keys(newRow).forEach(key => {
      if (key.startsWith('W')) {
        let formattedCellValue = Math.round(newRow[key] * 10) / 10;
        if (
          newRow[key] === null &&
          formattedCellValue === 0 &&
          oldRow[key]?.allocationId
        ) {
          const deletePayload = {
            resourceId: oldRow.resourceId,
            allocationId: oldRow[key]?.allocationId,
          };
          dispatch(removeResourceAllocation(deletePayload)).then(() => {
            setUpdatedRows(prevRows =>
              prevRows.map(row => (row.id === newRow.id ? newRow : row))
            );
          });
        }

        // API call to update the data, if any changes are made.
        if (newRow[key] && newRow[key] !== oldRow[key]?.value) {
          if (oldRow[key]?.allocationId && newRow[key] !== null) {
            const putPayload = {
              resourceId: oldRow.resourceId,
              allocationId: oldRow[key]?.allocationId,
              putData: {
                'ResourceAllocation.Core/Allocation': {
                  AllocationEntered: formattedCellValue,
                },
              },
            };
            dispatch(updateResourceAllocation(putPayload)).then(() => {
              setUpdatedRows(prevRows =>
                prevRows.map(row => (row.id === newRow.id ? newRow : row))
              );
            });
          } else {
            const postPayload = {
              resourceId: oldRow.resourceId,
              postData: {
                'ResourceAllocation.Core/Allocation': {
                  Resource: oldRow.resourceId,
                  Project: oldRow.projectId,
                  ProjectName: oldRow.project,
                  Period: getMondayOfWeek(key),
                  AllocationEntered: formattedCellValue,
                },
              },
            };
            dispatch(setResourceAllocation(postPayload)).then(() => {
              setUpdatedRows(prevRows =>
                prevRows.map(row => (row.id === newRow.id ? newRow : row))
              );
            });
          }
        }

        newRow[key] = {
          allocationId: oldRow[key]?.allocationId || null,
          value: newRow[key],
        };
      }
    });

    return newRow;
  };

  const onRowClick = useCallback(
    params => {
      const rowNode = apiRef.current.getRowNode(params.id);
      if (
        rowNode &&
        rowNode.type === 'group' &&
        rowNode.groupingField != 'teams'
      ) {
        apiRef.current.setRowChildrenExpansion(
          params.id,
          !rowNode.childrenExpanded
        );
      }
    },
    [apiRef]
  );

  const handleRowModesModelChange = newRowModesModel => {
    setRowModesModel(newRowModesModel);
  };

  const filterColumns = ({ columns }) => {
    return getTogglableColumns(columns);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 54px)', width: '100%' }}>
      <StyledDataGrid
        isCellEditable={params => !params.row.hasButton}
        onCellKeyDown={handleCellKeyDown}
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        processRowUpdate={handleCellUpdate}
        onProcessRowUpdateError={err => {
          console.error('Row update failed:', err);
        }}
        rows={rowState}
        columns={finalColumns}
        rowSelection={true}
        // cellSelection={true}
        // disableMultipleRowSelection={false}
        // onRowSelectionModelChange={(newSelection, params) => {
        //   let x = params.api.getRow(newSelection[0])
        // }}
        onRowClick={groupBy === 'teams' ? onRowClick : () => null}
        apiRef={apiRef}
        loading={loading || !rowState.length}
        disableRowSelectionOnClick
        initialState={initialState}
        rowGroupingColumnMode={groupBy === 'teams' ? 'multiple' : 'single'}
        columnHeaderHeight={30}
        columnGroupHeaderHeight={22}
        columnGroupingModel={generateColumnGroupingModel(
          startDate,
          finalColumns
        )}
        defaultGroupingExpansionDepth={1}
        getRowClassName={params => `super-app-theme--${params.row.status}`}
        disableAutosize
        getCellClassName={params => getCellClassName(params, updatedRows)}
        slots={{
          toolbar: CustomToolbar,
          // columnMenu: CustomColumnMenu
          // columnMenu: props => {
          //   return <CustomColumnMenu {...props} apiRef={apiRef} />;
          // },
        }}
        slotProps={{
          loadingOverlay: {
            variant: 'skeleton',
            noRowsVariant: 'skeleton',
          },
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
              filterColumns,
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
        hideFooter
        editMode="row"
        aggregationRowsCount={params => {
          return params.rowNode.children?.length || 1;
        }}
      />
      <CustomSnackbar
        message={message}
        type={type}
        open={open}
        position={position}
      />
    </Box>
  );
}
