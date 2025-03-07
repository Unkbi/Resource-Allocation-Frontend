import { useState, lazy, useEffect, useCallback } from 'react';
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
  getProjectOrTeamIdByName,
  getWeekNumber,
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
  getCellClassName,
  getInitialRowsState,
} from './AllocationGridUtils';
import { useDispatch, useSelector } from 'react-redux';
import {
  setResourceAllocation,
  updateResourceAllocation,
} from '@/app/redux/actions/resourceAllocationAction';
import { addResourceToTeam } from '@/app/redux/actions/fetchTeamsAction';
import { CustomColumnMenu } from './components/CustomColumnMenu';
import { CustomSnackbar } from '../Snackbar/CustomSnackbar';
import { showToastAction } from '@/app/redux/actions/toastAction';
import { getTeamAllocations } from '@/app/services/teamServices';
import { generateColumnGroupingModel, getStartDate } from './TableHeader';

const CustomToolbar = lazy(() => import('../Toolbar/CustomToolbar'));

export default function AllocationGrid({ groupBy, columns, data, loading }) {
  const apiRef = useGridApiRef();
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedAllocationId, setSelectedAllocationId] = useState(null);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [updatedRows, setUpdatedRows] = useState([]);
  const [rowsState, setRowsState] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const { open, message, type, position } = useSelector(state => state.toast);
  const startDate = getStartDate();

  const dispatch = useDispatch();
  const { projects } = useSelector(state => state.projects);
  const { teams, teamAllocations } = useSelector(state => state.teams);
  const [dataFetched, setDataFetched] = useState(false);

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
    setRowsState(() => getInitialRowsState(updatedRows, groupBy, teams));
  }, [data, groupBy, teams]);

  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: getInitialState(
      groupBy,
      updatedRows,
      GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD
    ),
  });

  const handleAddRow = async (e, resource) => {
    const newRowForProject = {
      id: `${selectedProject}-${resource.FullName}-${rowsState.length + 1}`,
      resourceId: resource.Id,
      project: selectedProject,
      projectId: getProjectOrTeamIdByName(projects?.result, selectedProject),
      resource: resource.FullName,
      role: resource.Role,
      totalEffort: resource.totalHours,
      hasButton: false,
    };
    const newRowForTeams = {
      id: `${selectedTeam}-${resource.FullName}-${rowsState.length + 1}`,
      resourceId: resource.Id,
      project: '',
      teamsId: getProjectOrTeamIdByName(teams?.result, selectedTeam),
      resource: resource.FullName,
      teams: selectedTeam,
      role: resource.Role,
      totalEffort: resource.totalHours,
      hasButton: false,
      hasProject: true,
    };
    if (groupBy === 'project') {
      if (!isResourceInProject(rowsState, selectedProject, resource.FullName)) {
        setRowsState(prevRows =>
          prevRows.flatMap(row =>
            row.id === `${selectedProject}-add-resource`
              ? [newRowForProject, row]
              : [row]
          )
        );
      }
    } else if (groupBy === 'teams') {
      setRowsState(prevRows =>
        prevRows.flatMap(row =>
          row.id === `${selectedTeam}-add-resource`
            ? [newRowForTeams, row]
            : [row]
        )
      );

      try {
        await new Promise((resolve, reject) => {
          const obj = {
            Team: `:ResourceAllocation.Core/Team,${newRowForTeams.teamsId}`,
            Resource: `:ResourceAllocation.Core/Resource,${newRowForTeams.resourceId}`,
          };
          dispatch(addResourceToTeam(obj.Team, obj.Resource))
            .then(resolve)
            .catch(reject);
        });

        const teamAllocationPostData = {
          'ResourceAllocation.Core/GetTeamAllocations': {
            TeamId: newRowForTeams.teamsId,
          },
        };

        dispatch(getTeamAllocations(teamAllocationPostData));
      } catch (error) {
        console.error('Error in handleAddRow:', error);
      }
    }

    setIsSearchMode(false);
  };

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
      setRowsState(prevRows => {
        const updatedRows = prevRows.map(row => {
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
        return updatedRows;
      });
    }
  };
  const finalColumns = getFinalColumns(
    columns,
    groupBy,
    setSelectedProject,
    handleAddRow,
    setSelectedTeam,
    handleAddProject,
    setSelectedResourceId,
    dispatch
  );

  const showField = [
    GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD,
    ...columns.map(col => col.field),
    ...finalColumns.filter(i => i.field === 'resource').map(col => col.field),
  ];

  const getTogglableColumns = columns =>
    columns
      .filter(column => column.field !== groupBy)
      .filter(column => showField.includes(column.field))
      .map(column => column.field);

  const handleDoubleClick = params => {
    if (params.rowNode.type === 'group' || !params.isEditable) {
      return;
    }
    if (params?.cellMode === 'view') {
      apiRef.current.startRowEditMode({ id: params.id });
    }
    setSelectedCell(params.field);
    const { field, formattedValue, row } = params || {};
    if (formattedValue) {
      const allocationData = row[field];
      setSelectedAllocationId(allocationData?.allocationId);
    }
  };

  const handleCellUpdate = useCallback(
    async (newRow, oldRow) => {
      const newValue = newRow[selectedCell];
      const oldValue = oldRow[selectedCell]?.value;
      if (newValue !== oldValue) {
        try {
          const { project, projectId, id } = newRow || {};
          let formattedCellValue = Math.round(newRow[selectedCell] * 10) / 10;
          let resourceId = newRow?.resourceId;
          if (formattedCellValue > 2) return;
          if (!selectedAllocationId && formattedCellValue === 0) return;

          if (selectedAllocationId) {
            const putPayload = {
              resourceId: resourceId,
              allocationId: selectedAllocationId,
              putData: {
                'ResourceAllocation.Core/Allocation': {
                  AllocationEntered: formattedCellValue,
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
                  AllocationEntered: formattedCellValue,
                },
              },
            };
            dispatch(setResourceAllocation(postPayload));
          }
          setRowsState(prevRows =>
            prevRows.map(row =>
              row.id === id
                ? {
                    ...row,
                    [selectedCell]: {
                      allocationId: row[selectedCell]?.allocationId || null,
                      value: formattedCellValue,
                    },
                    totalEffort: calculateTotalEffort({
                      ...row,
                      [selectedCell]: {
                        allocationId: row[selectedCell]?.allocationId || null,
                        value: formattedCellValue,
                      },
                    }),
                  }
                : row
            )
          );
          setDataFetched(true);
        } catch (err) {
          console.error('Cell update failed:', err);
        } finally {
          setSelectedAllocationId(null);
          setSelectedCell(null);
        }
      }
    },
    [selectedCell, selectedAllocationId, dispatch]
  );

  const handleCellKeyDown = (params, event) => {
    const { field, formattedValue, row } = params || {};
    if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
    }
    if (params.rowNode.type === 'group' || !params.isEditable) {
      return;
    }
    const mode = apiRef.current.getRowMode(params.id);
    setSelectedCell(params.field);
    if (formattedValue) {
      const allocationData = row[field];
      setSelectedAllocationId(allocationData?.allocationId);
    }
    const visibleColumns = apiRef.current.getVisibleColumns();
    const currentIndex = visibleColumns.findIndex(
      c => c.field === params.field
    );
    const nextIndex = currentIndex + 1;
    if (event.key === 'Enter') {
      event.preventDefault();
      if (nextIndex < visibleColumns.length) {
        const nextField = visibleColumns[nextIndex].field;
        apiRef.current.setCellFocus(params.id, nextField);
      }
    }
    if (event.key === 'Tab' || event.key === 'ArrowRight') {
      // event.preventDefault();
      if (nextIndex < visibleColumns.length) {
        const nextField = visibleColumns[nextIndex].field;
        if (mode === 'edit') {
          apiRef.current.stopRowEditMode({ id: params.id });
        }
        apiRef.current.setCellFocus(params.id, nextField);
      }
    }
    if (event.key === 'ArrowLeft') {
      // event.preventDefault();
      if (mode === 'edit') {
        apiRef.current.stopRowEditMode({ id: params.id });
      }
      const editableColumm = visibleColumns.filter(c => c.editable);
      const currentIndex = editableColumm.findIndex(
        c => c.field === params.field
      );
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        const prevField = editableColumm[prevIndex].field;
        apiRef.current.setCellFocus(params.id, prevField);
      }
    }
  };

  useEffect(() => {
    const handleCellFocusOut = params => {
      if (params.rowNode.type === 'group' || !params.isEditable) {
        return;
      }
      const rowId = params.id;
      if (apiRef.current.getRowMode(rowId) === 'edit') {
        apiRef.current.stopRowEditMode({ id: rowId });
      }
    };

    apiRef.current.subscribeEvent('cellFocusOut', handleCellFocusOut);
  }, [apiRef, selectedCell]);
  return (
    <Box sx={{ height: 'calc(100vh - 54px)', width: '100%' }}>
      <StyledDataGrid
        key={refreshKey}
        isCellEditable={params => !params.row.hasButton}
        onCellKeyDown={handleCellKeyDown}
        onCellClick={params => {
          handleDoubleClick(params);
        }}
        processRowUpdate={handleCellUpdate}
        onProcessRowUpdateError={err => {
          console.error('Row update failed:', err);
        }}
        rows={rowsState}
        columns={finalColumns}
        apiRef={apiRef}
        loading={loading || !rowsState.length}
        disableRowSelectionOnClick
        initialState={initialState}
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
          columnMenu: props => {
            return <CustomColumnMenu {...props} apiRef={apiRef} />;
          },
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
