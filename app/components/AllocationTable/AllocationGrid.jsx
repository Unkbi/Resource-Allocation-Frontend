import { useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import {
  GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD,
  gridExpandedSortedRowIdsSelector,
  gridVisibleColumnDefinitionsSelector,
  useGridApiRef,
  useKeepGroupedColumnsHidden,
} from '@mui/x-data-grid-premium';
import {
  calculateTotalEffort,
  generateAllWeeks,
  generateDateWeekMath,
  getResourceFromEmail,
  getAllocationManagerFromPath,
  getMondayOfWeek,
  getUpdatedFiltersOnMyProjectsAllProjects,
  getUpdatedFiltersOnMyTeamsAllTeams,
  getWeekNumber,
  isMyProjectsValid,
  isMyTeamsValid,
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
import { aggregationModel, generateColumnGroupingModel } from './TableHeader';
import { setRowState } from '@/app/redux/reducers/dataGridReducer';
import ToolbarMod from '../Toolbar/ToolbarMod';
import {
  setExpandRowId,
  updateCurrentView,
} from '@/app/redux/reducers/allocationViewReducer';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import {
  DATE_FORMAT,
  DEFAULT_PROJECT_WEEK_MINUS,
  DEFAULT_PROJECT_WEEK_PLUS,
} from '@/app/constants/constants';
import CustomToolbar from '../Toolbar/CustomToolbarUpdated';
import SplitTeamToolbar from '../Toolbar/SplitTeamToolbar';
import { updateStartAndEndDate } from '@/app/redux/reducers/teamsReducer';
import { updateProjectStartAndEndDate } from '@/app/redux/reducers/projectsReducer';
import { showToastAction } from '@/app/redux/actions/toastAction';
import { showToast } from '@/app/redux/reducers/toastReducer';

export default function AllocationGrid({
  groupBy,
  columns,
  data,
  loading,
  selectedTeam,
  setSelectedTeam,
  initialState: _initialState,
  startDate,
  endDate,
  toolbarComponent,
  NoRowsOverlay,
  mode,
  columnsFilterable = true,
}) {
  const apiRef = useGridApiRef();
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [updatedRows, setUpdatedRows] = useState([]);
  const { rowState } = useSelector(state => state.dataGrid);
  const {
    expandRowId,
    cellSelectionData,
    view,
    savedViews,
    currentView,
    columns: _columns,
  } = useSelector(state => state.allocationView);

  const dispatch = useDispatch();
  const { teams, teamAllocations } = useSelector(state => state.teams);
  const allocationTheme = useSelector(state => state.settings.allocationTheme);
  const [rowModesModel, setRowModesModel] = useState({});
  const [cellSelectionModel, setCellSelectionModel] = useState({});
  const [filterModel, setFilterModel] = useState({
    items: [],
  });
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(
    {
      ..._initialState?.columns?.columnVisibilityModel, // Initial state
    } ?? {}
  );
  const { isOpen } = useSelector(state => state.globalDialog);
  const { user } = useSelector(state => state.user);
  const { resources } = useSelector(state => state.resources);
  const { projects } = useSelector(state => state.projects);

  const handleKeyUp = e => {
    if (
      cellSelectionModel &&
      Object.keys(cellSelectionModel).length > 0 &&
      apiRef.current.getSelectedCellsAsArray().length >= 2 &&
      !cellSelectionModel['restoreFocus']
    ) {
      const resourcesSelected = [];
      let StartDate, EndDate;
      Object.entries(cellSelectionModel).forEach(([row, weeks]) => {
        const currentRowData = apiRef.current.getRow(row);

        Object.keys(weeks).forEach(weekN => {
          const period = currentRowData?.[weekN]?.period;
          if (period) {
            StartDate = StartDate
              ? isBefore(period, StartDate)
                ? period
                : StartDate
              : period;
            EndDate = EndDate
              ? isAfter(period, EndDate)
                ? period
                : EndDate
              : period;
          }
        });

        if (
          currentRowData?.resource &&
          !resourcesSelected.includes(currentRowData.resource)
        ) {
          resourcesSelected.push(currentRowData.resource);
        }
      });
      const projectsSelected = [
        ...new Set(
          Object.keys(cellSelectionModel).map(
            row => apiRef.current.getRow(row)?.project
          )
        ),
      ];

      dispatch(
        openDialog({
          title: 'Update Allocation',
          submitButtonText: 'Update',
          cancelButtonText: 'Cancel',
          formType: 'add_allocation',
          initialData: {
            Resource: resourcesSelected,
            StartDate,
            EndDate,
            Project: projectsSelected,
          },
        })
      );
    }
  };

  const [aggregation, setAggregation] = useState({
    totalEffort: 'sum',
    ...aggregationModel(startDate, endDate),
  });

  const normalizeRow = row => {
    const allWeeks = generateAllWeeks();
    const normalized = { ...row };

    allWeeks.forEach(weekKey => {
      const period = getMondayOfWeek(weekKey, new Date());
      const value = row[weekKey];

      if (value && typeof value === 'object' && 'value' in value) {
        normalized[weekKey] = {
          allocationId: value.allocationId || null,
          value: value.value,
          period: period,
        };
      } else if (value !== undefined) {
        normalized[weekKey] = {
          allocationId: null,
          value,
          period,
        };
      } else {
        normalized[weekKey] = {
          allocationId: null,
          value: null,
          period,
        };
      }
    });

    return normalized;
  };

  useEffect(() => {
    const mapData = groupBy === 'project' || 'teams' ? data : demoRows;
    const updatedRows = mapData.map(row => ({
      ...normalizeRow(row),
      totalEffort: calculateTotalEffort(normalizeRow(row)),
      hasAllocation: calculateTotalEffort(normalizeRow(row)) > 0,
      teamAllocationManager: getAllocationManagerFromPath(
        row?.teamAllocationManager,
        resources?.result || []
      )?.FullName,
    }));
    setUpdatedRows(updatedRows);
    let new_row_state = getInitialRowsState(updatedRows, groupBy, teams);
    dispatch(setRowState(new_row_state));
  }, [data, groupBy, teams]);

  useEffect(() => {
    try {
      if (groupBy === 'teams' && expandRowId?.length && rowState?.length) {
        expandRowId.forEach(rowId => {
          const row = apiRef.current.getRow(rowId);
          if (row) {
            setTimeout(() => {
              apiRef.current.setRowChildrenExpansion(rowId, true);
            }, 50);
          } else {
            // Row not ready yet, retry after small delay
            setTimeout(() => {
              const delayedRow = apiRef.current.getRow(rowId);
              if (delayedRow) {
                apiRef.current.setRowChildrenExpansion(rowId, true);
              }
            }, 50);
          }
        });
      }
    } catch (error) {
      console.warn('Error in setting row expansion', error);
    }
  }, [expandRowId, rowState?.length, groupBy, apiRef, data]);

  // Use useEffect to add the key-up listener once
  useEffect(() => {
    const handleDocumentKeyUp = e => handleKeyUp(e);

    // Bind keyUp event on component mount
    document.addEventListener('mouseup', handleDocumentKeyUp);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('mouseup', handleDocumentKeyUp);
    };
  }, [cellSelectionModel]);

  useEffect(() => {
    const handleScrollAndFocus = () => {
      if (
        !apiRef.current ||
        (Object.keys(cellSelectionModel).length === 0 &&
          Object.keys(cellSelectionData).length === 0)
      )
        return;
      const [rowId] =
        Object.keys(cellSelectionModel).length > 0
          ? Object.keys(cellSelectionModel)
          : Object.keys(cellSelectionData);

      const field =
        Object.keys(cellSelectionModel).length > 0
          ? Object.keys(cellSelectionModel[rowId])
          : Object.keys(cellSelectionData[rowId]);

      const visibleRowIds = gridExpandedSortedRowIdsSelector(apiRef);
      const visibleColumns = gridVisibleColumnDefinitionsSelector(apiRef);
      const rowIndex = visibleRowIds.indexOf(rowId);
      const colIndex = visibleColumns.findIndex(col =>
        field.includes(col.field)
      );

      if (rowIndex === -1 || colIndex === -1) {
        return;
      }
      apiRef.current.scrollToIndexes({ rowIndex, colIndex });
      setCellSelectionModel(cellSelectionData);
    };
    const timeoutId = setTimeout(handleScrollAndFocus, 1000);
    setExpandRowId(null);
    return () => clearTimeout(timeoutId);
  }, [rowState, apiRef, cellSelectionData, view, data]);

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

  useEffect(() => {
    if (startDate && endDate) {
      setAggregation({
        totalEffort: 'sum',
        ...aggregationModel(startDate, endDate),
      });
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (columnsFilterable && currentView?.ColumnsVisible && groupBy) {
      const updatedModel = {
        ...columnVisibilityModel,
        ..._columns[groupBy === 'teams' ? 'team' : groupBy].reduce(
          (acc, column) => {
            acc[column] = currentView.ColumnsVisible.includes(column);
            return acc;
          },
          {}
        ),
      };
      setColumnVisibilityModel(updatedModel);
    }
  }, [currentView.ColumnsVisible]);

  useEffect(() => {
    if (currentView?.Filters) {
      setFilterModel({
        items:
          currentView?.Filters.map((filter, index) => {
            return {
              ...filter,
              id: index,
            };
          }) ?? [],
      });
    }

    //Check if myTeam is selected, if yes, then check if filters match with myTeam
    // If not, then update myTeam to allTeams
    if (currentView?.Filters !== null && currentView?.MyTeam) {
      const allocationManagerName = getResourceFromEmail(
        user?.Email,
        resources?.result || []
      )?.FullName;

      if (isMyTeamsValid(allocationManagerName, currentView?.Filters)) {
        return;
      }
      dispatch(
        updateCurrentView({
          MyTeam: false,
        })
      );
    }

    // Check if myProjects is selected, if yes, then check if filters match with myProjects
    // If not, then update myProjects to allProjects
    if (currentView?.Filters !== null && currentView?.MyProjects) {
      const projectManager = getResourceFromEmail(
        user?.Email,
        resources?.result || []
      );

      const projectManagerName = projectManager
        ? `${projectManager?.FirstName} ${projectManager?.LastName}`.trim()
        : '';

      if (isMyProjectsValid(projectManagerName, currentView?.Filters)) {
        return;
      }

      dispatch(
        updateCurrentView({
          MyProjects: false,
        })
      );
    }
  }, [currentView?.Filters]);

  useEffect(() => {
    const allocationManagerName = getResourceFromEmail(
      user?.Email,
      resources?.result || []
    )?.FullName;

    if (currentView?.MyTeam) {
      const updatedFilters = getUpdatedFiltersOnMyTeamsAllTeams(
        allocationManagerName,
        currentView?.Filters || [],
        true
      );

      dispatch(
        updateCurrentView({
          Filters: updatedFilters,
        })
      );
    } else {
      const updatedFilters = getUpdatedFiltersOnMyTeamsAllTeams(
        allocationManagerName,
        currentView?.Filters || [],
        false
      );

      dispatch(
        updateCurrentView({
          Filters: updatedFilters,
        })
      );
    }
  }, [currentView?.MyTeam]);

  useEffect(() => {
    const projectManager = getResourceFromEmail(
      user?.Email,
      resources?.result || []
    );

    const projectManagerName = projectManager
      ? `${projectManager?.FirstName} ${projectManager?.LastName}`.trim()
      : '';
    if (currentView?.MyProjects) {
      const updatedFilters = getUpdatedFiltersOnMyProjectsAllProjects(
        projectManagerName,
        currentView?.Filters || [],
        true
      );

      dispatch(
        updateCurrentView({
          Filters: updatedFilters,
        })
      );
    } else {
      const updatedFilters = getUpdatedFiltersOnMyProjectsAllProjects(
        projectManagerName,
        currentView?.Filters || [],
        false
      );

      dispatch(
        updateCurrentView({
          Filters: updatedFilters,
        })
      );
    }
  }, [currentView?.MyProjects]);

  useEffect(() => {
    const isTeams = view === 'Teams';
    const action = isTeams
      ? updateStartAndEndDate
      : updateProjectStartAndEndDate;

    // Fixed Range
    if (
      currentView?.isFixedRange &&
      currentView?.StartDate &&
      currentView?.EndDate
    ) {
      dispatch(
        action({
          startDate: currentView?.StartDate,
          endDate: currentView?.EndDate,
        })
      );
    }
    if (
      currentView?.isDynamicRange &&
      currentView?.WeekMinus &&
      currentView?.WeekPlus
    ) {
      dispatch(
        action({
          startDate: generateDateWeekMath('WEEK_MINUS', currentView?.WeekMinus),
          endDate: generateDateWeekMath('WEEK_PLUS', currentView?.WeekPlus),
        })
      );
    }
  }, [
    currentView?.isFixedRange,
    currentView?.StateDate,
    currentView?.EndDate,
    currentView?.isDynamicRange,
    currentView?.WeekPlus,
    currentView?.WeekMinus,
  ]);

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

        const periodDate = parseISO(allocation.Period);
        const weekNumber = getWeekNumber(periodDate);
        const formattedDate = format(periodDate, DATE_FORMAT);

        const weekObj = {};
        allWeeks.forEach(week => {
          weekObj[week] = null;
        });

        if (allWeeks.includes(weekNumber)) {
          weekObj[weekNumber] = {
            allocationId: allocation.Allocation,
            value: allocation.AllocationEntered || null,
            period: formattedDate,
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
    mode,
    setSelectedTeam,
    handleAddProject,
    setSelectedResourceId,
    dispatch,
    currentView?.isFixedRange
      ? currentView.startDate || startDate
      : generateDateWeekMath('WEEK_MINUS', currentView?.WeekMinus) || startDate,
    currentView?.isFixedRange
      ? currentView.endDate || endDate
      : generateDateWeekMath('WEEK_PLUS', currentView?.WeekPlus) || endDate
  );

  const showField = [
    GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD,
    '__row_group_by_columns_group_teams__',
    '__row_group_by_columns_group_resource__',
    ...columns.map(col => col.field),
    ...finalColumns
      .filter(i => i.field === 'resource' && groupBy === 'project')
      .map(col => col.field),
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
    // Find the changed week
    const changedWeeks = Object.keys(newRow).filter(
      key => key.startsWith('W') && newRow[key] !== oldRow[key]?.value
    );

    if (!changedWeeks) {
      return { ...oldRow };
    }
    const keys = changedWeeks;
    keys.forEach(key => {
      let formattedCellValue = Math.round(newRow[key] * 10) / 10;

      const period = oldRow[key]?.period;
      const value = formattedCellValue;
      const resourceId = oldRow.resourceId;

      // Calculate total allocation for the week across all rows for that resource
      let totalForWeek = 0;
      const allData = apiRef.current
        .getAllRowIds()
        .map(id => apiRef.current.getRow(id));

      allData.forEach(row => {
        if (row.resourceId === resourceId) {
          const val = row[key]?.value || 0;
          totalForWeek += parseFloat(val);
        }
      });

      // Add new value (replace current row’s old value with new one)
      const currentRowOldValue = oldRow[key]?.value || 0;
      totalForWeek = totalForWeek - currentRowOldValue + value;

      if (totalForWeek > 1.5 && totalForWeek <= 2) {
        dispatch(
          showToastAction(
            true,
            `Allocation for ${key} exceeds 1.5 (${totalForWeek.toFixed(2)}).`,
            'warning',
            4000
          )
        );
      } else if (totalForWeek > 2) {
        newRow[key] = oldRow[key]?.value;
        dispatch(
          showToastAction(
            true,
            `Allocation for ${key} exceeds 2.0 (${totalForWeek.toFixed(2)}). Update cancelled.`,
            'error',
            4000
          )
        );
        return;
      }

      if (
        (newRow[key] === null || newRow[key] === undefined) &&
        (formattedCellValue === 0 || isNaN(formattedCellValue)) &&
        oldRow[key]?.allocationId
      ) {
        const deletePayload = {
          resourceId: oldRow.resourceId,
          allocationId: oldRow[key]?.allocationId,
          period: oldRow[key]?.period,
        };
        dispatch(removeResourceAllocation(deletePayload))
          .then(response => {
            if (response.meta.requestStatus === 'rejected') {
              dispatch(
                showToast({
                  open: true,
                  message: `Failed to delete allocation for ${key}.`,
                  type: 'error',
                  position: 'bottom-left',
                  autoHideTimer: 4000,
                })
              );
              return;
            }
            setUpdatedRows(prevRows =>
              prevRows.map(row => (row.id === newRow.id ? newRow : row))
            );
          })
          .catch(e => {
            console.log('Error in removing allocation', e);
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
          dispatch(updateResourceAllocation(putPayload))
            .then(response => {
              if (response.meta.requestStatus === 'rejected') {
                dispatch(
                  showToast({
                    open: true,
                    message: `Failed to update allocation for ${key}.`,
                    type: 'error',
                    position: 'bottom-left',
                    autoHideTimer: 4000,
                  })
                );
                return;
              }
              setUpdatedRows(prevRows =>
                prevRows.map(row => (row.id === newRow.id ? newRow : row))
              );
            })
            .catch(e => {
              console.log('Error in updating allocation', e);
            });
        } else if (formattedCellValue) {
          const postPayload = {
            resourceId: oldRow.resourceId,
            postData: {
              'ResourceAllocation.Core/Allocation': {
                Resource: oldRow.resourceId,
                Project: oldRow.projectId,
                ProjectName: oldRow.project,
                Period: getMondayOfWeek(key, oldRow[key]?.period),
                AllocationEntered: formattedCellValue,
              },
            },
          };
          dispatch(setResourceAllocation(postPayload))
            .then(response => {
              if (response.meta.requestStatus === 'rejected') {
                dispatch(
                  showToast({
                    open: true,
                    message: `Failed to set allocation for ${key}.`,
                    type: 'error',
                    position: 'bottom-left',
                    autoHideTimer: 4000,
                  })
                );
                return;
              }
              setUpdatedRows(prevRows =>
                prevRows.map(row => (row.id === newRow.id ? newRow : row))
              );
            })
            .catch(e => {
              console.log('Error in setting allocation', e);
            });
        }
      }
    });

    Object.keys(oldRow)
      .filter(key => key.startsWith('W'))
      .forEach(key => {
        if (keys.includes(key)) {
          let formattedCellValue = Math.round(newRow[key] * 10) / 10;
          newRow[key] = {
            allocationId: oldRow[key]?.allocationId || null,
            value:
              !isNaN(formattedCellValue) && formattedCellValue !== 0
                ? formattedCellValue
                : null,
            period: oldRow[key]?.period,
          };
        } else {
          newRow[key] = oldRow[key];
        }
      });
    const updatedRow = { ...newRow, totalEffort: calculateTotalEffort(newRow) };
    return updatedRow;
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

  const handleCellSelectionModelChange = useCallback(newModel => {
    // Filter out Rows outside the current group boundary
    const isRowWithinGroup = row => {
      const selectedCells = apiRef.current.getSelectedCellsAsArray();
      if (selectedCells && selectedCells.length > 0) {
        if (groupBy === 'project') {
          // Previously selected project
          const currentProjectSelected = apiRef.current.getRow(
            selectedCells[0].id
          )?.projectId;
          if (row.projectId !== currentProjectSelected) {
            return false;
          }
        }
        if (groupBy === 'teams') {
          // Previously selected team
          const currentResourceSelected = apiRef.current.getRow(
            selectedCells[0].id
          )?.resourceId;
          if (row.resourceId !== currentResourceSelected) {
            return false;
          }
        }
      }
      return true;
    };

    // Get Only Valid Fields, i.e. Fields starting with 'W'
    const getNewModelWithValidFields = row => {
      const newModelWithValidFields = {};
      Object.keys(row).forEach(key => {
        if (key.startsWith('W')) {
          newModelWithValidFields[key] = row[key];
        }
      });
      return newModelWithValidFields;
    };

    let filteredModel = {};
    Object.keys(newModel).forEach(key => {
      if (!key.startsWith('auto-generated')) {
        // Filter out auto-generated rows
        if (isRowWithinGroup(apiRef.current.getRow(key))) {
          const newModelWithValidFields = getNewModelWithValidFields(
            newModel[key]
          );
          if (
            newModelWithValidFields &&
            Object.keys(newModelWithValidFields).length > 0
          ) {
            filteredModel[key] = newModelWithValidFields;
          }
        }
      }
    });
    setCellSelectionModel(filteredModel);
  }, []);

  const getRowClassName = params => {
    const rowNode = apiRef.current.getRowNode(params.id);
    const rowData = apiRef.current.getRow(params.id);
    if (rowNode?.type === 'leaf' && rowData?.hasAllocation === false) {
      return 'child-of-zero-allocation-resource';
    }
    return '';
  };

  const handleFilterModelChange = newModel => {
    // setFilterModel(newModel);

    const filterData = newModel.items.map(item => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    }));
    dispatch(
      updateCurrentView({
        Filters: filterData,
      })
    );
  };

  const handleColumnVisibilityModelChange = newModel => {
    // Do not allow the visibility to change for the necessary columns
    const columnsToKeepVisible = {
      teams: {
        __row_group_by_columns_group_teams__: true,
        __row_group_by_columns_group_resource__: true,
        project: true,
      },
      project: {
        resource: true,
        __row_group_by_columns_group__: true,
      },
    };
    let updatedModel = {
      ...newModel,
      ...columnsToKeepVisible[groupBy],
    };

    // To Handle Show/Hide All.
    if (groupBy === 'teams') {
      updatedModel = {
        ..._columns['team'].reduce((acc, column) => {
          acc[column] = true;
          return acc;
        }, {}),
        ...updatedModel,
      };
    } else if (groupBy === 'project') {
      updatedModel = {
        ..._columns['project'].reduce((acc, column) => {
          acc[column] = true;
          return acc;
        }, {}),
        ...updatedModel,
      };
    }

    setColumnVisibilityModel(updatedModel);
    dispatch(
      updateCurrentView({
        ColumnsVisible: Object.keys(updatedModel).filter(
          columnName => updatedModel[columnName]
        ),
      })
    );
  };

  const toolBarBasedProperties = toolbarComponent
    ? {
        filterModel: filterModel,
        onFilterModelChange: handleFilterModelChange,
        columnVisibilityModel: columnVisibilityModel,
        onColumnVisibilityModelChange: handleColumnVisibilityModelChange,
        localeText: {
          toolbarFilters: '',
          toolbarColumns: '',
        },
      }
    : {};

  return (
    <StyledDataGrid
      cellSelection
      allocationTheme={allocationTheme}
      isCellEditable={params => !params.row.hasButton}
      onCellKeyDown={handleCellKeyDown}
      rowModesModel={rowModesModel}
      onRowModesModelChange={handleRowModesModelChange}
      processRowUpdate={handleCellUpdate}
      onProcessRowUpdateError={err => {
        console.error('Row update failed:', err);
      }}
      rows={mode === 'split' ? data : rowState}
      aggregationModel={aggregation}
      columns={finalColumns}
      rowSelection={true}
      onRowClick={groupBy === 'teams' ? onRowClick : () => null}
      apiRef={apiRef}
      groupBy={groupBy}
      loading={mode === 'split' ? loading : loading || !rowState.length}
      disableRowSelectionOnClick
      initialState={initialState}
      rowGroupingColumnMode={groupBy === 'teams' ? 'multiple' : 'single'}
      columnHeaderHeight={30}
      columnGroupHeaderHeight={22}
      columnGroupingModel={generateColumnGroupingModel(
        startDate,
        endDate,
        finalColumns
      )}
      defaultGroupingExpansionDepth={1}
      disableAutosize
      getCellClassName={params =>
        getCellClassName(params, updatedRows, allocationTheme)
      }
      getRowClassName={params => getRowClassName(params)}
      cellSelectionModel={cellSelectionModel}
      onCellSelectionModelChange={handleCellSelectionModelChange}
      {...toolBarBasedProperties}
      slots={{
        noRowsOverlay: NoRowsOverlay,
        toolbar: toolbarComponent,
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
  );
}
