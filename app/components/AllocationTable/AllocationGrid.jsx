import { useState, useEffect, useCallback,useRef } from 'react';
import { Box, Tooltip } from '@mui/material';
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
  getTeamForResource,
  isCurrentOrPastWeek,
  isCurrentWeek,
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
// import CustomToolbar from '../Toolbar/CustomToolbarUpdated';
import CustomToolbar from '../Toolbar/CustomAllocationToolbar';
import { updateStartAndEndDate } from '@/app/redux/reducers/teamsReducer';
import { updateProjectStartAndEndDate } from '@/app/redux/reducers/projectsReducer';
import { showToastAction } from '@/app/redux/actions/toastAction';
import { showToast } from '@/app/redux/reducers/toastReducer';
import { useDataGrid } from '@/app/context/dataGridContext';
import { useAllocationGrid } from '@/app/hooks/useAllocationGrid';
import { getFormattedAllocationsForUpdate } from '@/app/utils/allocationUtils';
import { useAllGridRowsByView } from '@/app/hooks/useAllGridRowsByView';
import { Menu, MenuItem } from '@mui/material';
import { startOfWeek, addDays, isValid } from 'date-fns';
import { isCellEditableUtils } from '@/app/utils/common';
import { CommentTooltip } from './components/AllocationCommentTooltip';
import AllocationCellWithActuals from './components/AllocationCellWithActuals';
import { formatAPIResponse, getUserAttributes } from '@/app/utils/authUtils';
import { withRBAC } from '../HOC/withRBAC';

function AllocationGrid({
  groupBy,
  columns,
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
  type = '',
  viewId = 'main',
  showActuals = false,
  rowGroupingColumnMode = 'single',
  permissions = null,
  loadingPermissions = true,
}) {
  const apiRef = useGridApiRef();
  const { setApiRef, getApiRef } = useDataGrid();
  const mainAllocationGrid = useAllocationGrid('main');
  const teamAllocationGrid = useAllocationGrid('teamAllocation');
  const projectAllocationGrid = useAllocationGrid('projectAllocation');
  const topProjectAllocationGrid = useAllocationGrid('topProject');
  const bottomTeamAllocationGrid = useAllocationGrid('bottomTeam');

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

  const [contextMenu, setContextMenu] = useState(null);
  // const contextMenuRef = useRef(null);

  const dispatch = useDispatch();
  const { teams, teamsResources, teamAllocations } = useSelector(
    state => state.teams
  );
  const { scalarSettings } = useSelector(state => state.allSettings);
  const { allResourcesDetail } = useSelector(state => state.allResourcesDetail);
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
  const { user } = useSelector(state => state.user);
  const { email = '' } = getUserAttributes(user, []) || {};
  const { resources } = useSelector(state => state.resources);
  const { projects } = useSelector(state => state.projects);
  const { portfolios } = useSelector(state => state.portfolios);
  const { splitView, splitViewCurrentProject } = useSelector(
    state => state.allocationView
  );
  let max_allocation_error = scalarSettings?.Max_Allocation_Error || '2.0';
  let max_allocation_warning = scalarSettings?.Max_Allocation_Warning || '1.5';
  const { getAllRowsForView, setRowsForView } = useAllGridRowsByView();
  const handleKeyUp = e => {
    if (
      cellSelectionModel &&
      Object.keys(cellSelectionModel).length > 0 &&
      apiRef.current.getSelectedCellsAsArray().length >= 2 &&
      !cellSelectionModel['restoreFocus']
    ) {
      // handle key up event for cell selection
      const resourcesSelected = [];
      const projectsSelected = [];
      let StartDate, EndDate;

      Object.entries(cellSelectionModel).forEach(([row, weeks]) => {
        let currentRowData = apiRef.current.getRow(row);
        if (row.startsWith('auto-generated')) {
          currentRowData = apiRef.current.getRowNode(row);
        } else {
          currentRowData = apiRef.current.getRow(row);
        }

        Object.keys(weeks).forEach(weekN => {
          let rowDetails = null;
          if (row.startsWith('auto-generated')) {
            rowDetails = apiRef.current.getRow(currentRowData?.children[0]);
          } else {
            rowDetails = currentRowData;
          }
          const period = rowDetails?.[weekN]?.period;
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

        // Append the resource
        if (row.startsWith('auto-generated')) {
          if (
            currentRowData.groupingField === 'resource' &&
            !resourcesSelected.includes(currentRowData.groupingKey) // groupingKey is the resource name.
          ) {
            resourcesSelected.push(currentRowData.groupingKey);
          }
        } else if (
          currentRowData?.resource &&
          !resourcesSelected.includes(currentRowData.resource)
        ) {
          resourcesSelected.push(currentRowData.resource);
        }

        // Append the project
        if (row.startsWith('auto-generated')) {
          if (
            currentRowData.groupingField === 'project' &&
            !projectsSelected.includes(currentRowData.groupingKey) // groupingKey is the project name.
          ) {
            projectsSelected.push(currentRowData.groupingKey);
          } else if (
            currentRowData.groupingField === 'resource' &&
            splitViewCurrentProject
          ) {
            projectsSelected.push(splitViewCurrentProject.Name);
          }
        } else if (
          currentRowData?.project &&
          !projectsSelected.includes(currentRowData.project)
        ) {
          projectsSelected.push(currentRowData.project);
        }
      });

      setCellSelectionModel({ ...cellSelectionModel, restoreFocus: true });
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
    ...aggregationModel(startDate, endDate, type === 'cost'),
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
          notes: value.notes || '',
          actuals: value.actuals || null,
        };
      } else if (value !== undefined) {
        normalized[weekKey] = {
          allocationId: null,
          value,
          period,
          notes: '',
          actuals: null,
        };
      } else {
        normalized[weekKey] = {
          allocationId: null,
          value: null,
          period,
          notes: '',
          actuals: null,
        };
      }
    });

    return normalized;
  };

  // Set the apiRef in the context when it's available
  useEffect(() => {
    if (apiRef.current) {
      setApiRef(viewId || 'main', apiRef.current);
    }

    return () => {
      if (getApiRef(viewId)) {
        setApiRef(viewId + 'temp', getApiRef(viewId)); // This is to keep inSync if other views are using the same apiRef
      }
    };
  }, [apiRef, setApiRef, viewId]);

  useEffect(() => {
    const mapData = getAllRowsForView(viewId);
    const updatedRows = mapData.map(row => ({
      ...normalizeRow(row),
      totalEffort: calculateTotalEffort(normalizeRow(row)),
      hasAllocation: calculateTotalEffort(normalizeRow(row)) > 0,
      teamAllocationManager: getAllocationManagerFromPath(
        row?.teamAllocationManager,
        resources || []
      )?.FullName,
    }));
    setUpdatedRows(updatedRows);
    let new_row_state = getInitialRowsState(updatedRows, groupBy, teams);
    setRowsForView(viewId, new_row_state);
  }, [apiRef.current, groupBy, teams]);

  useEffect(() => {
    try {
      if (
        (groupBy === 'teams' ||
          groupBy === 'organisationName' ||
          groupBy === 'portfolioName') &&
        expandRowId?.length
      ) {
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
  }, [expandRowId, groupBy, apiRef]);

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
    const timeoutId = setTimeout(handleScrollAndFocus, 50);
    setExpandRowId(null);
    return () => clearTimeout(timeoutId);
  }, [apiRef, cellSelectionData]);

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
        ...aggregationModel(startDate, endDate, type === 'cost'),
      });
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (columnsFilterable && currentView?.ColumnsVisible && groupBy) {
      const updatedModel = {
        ...columnVisibilityModel,
        ..._columns[groupBy === 'teams' ? 'team' : groupBy]?.reduce(
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
    if (email && resources) {
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
          email,
          resources || []
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
        const projectManager = getResourceFromEmail(email, resources || []);

        const projectManagerName = projectManager
          ? `${projectManager?.FullName}`.trim()
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
    }
  }, [currentView?.Filters, user, email, resources]);

  useEffect(() => {
    if (email && resources) {
      const allocationManagerName = getResourceFromEmail(
        email,
        resources || []
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
    }
  }, [currentView?.MyTeam, user, email, resources]);

  useEffect(() => {
    const projectManager = getResourceFromEmail(email, resources || []);

    const projectManagerName = projectManager
      ? `${projectManager?.FullName}`.trim()
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
      Array.isArray(teamAllocations?.result) && // Sahadev : Unsure of this
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
  // const finalColumns = getFinalColumns(
  //   columns,
  //   groupBy,
  //   mode,
  //   setSelectedTeam,
  //   handleAddProject,
  //   setSelectedResourceId,
  //   dispatch,
  //   currentView?.isFixedRange
  //     ? currentView.startDate || startDate
  //     : generateDateWeekMath('WEEK_MINUS', currentView?.WeekMinus) || startDate,
  //   currentView?.isFixedRange
  //     ? currentView.endDate || endDate
  //     : generateDateWeekMath('WEEK_PLUS', currentView?.WeekPlus) || endDate,
  //   type === 'cost'
  // ).map(column => {
  //   if (column.field.startsWith('W')) {
  //     return {
  //       ...column,
  //       renderCell: params => {
  //         const editable = isCellEditable(params);
  //         const cellClass = getCellClassName(
  //           params,
  //           getAllRowsForView(viewId),
  //           allocationTheme,
  //           type,
  //           projects,
  //           isCellEditable
  //         );
  //         const showTooltip =
  //           cellClass.split(' ').includes('non-editable-cell') ||
  //           cellClass.split(' ').includes('non-editable-darker');

  //         const value = params.formattedValue ?? '';
  //         const cellData = params.row[params.field];
  //         const notes = cellData?.notes || '';
  //         const actuals = cellData?.actuals || null;
  //         const period = cellData?.period;
  //         const isFutureWeek =
  //           period &&
  //           !isCurrentWeek(parseISO(period)) &&
  //           !isCurrentOrPastWeek(parseISO(period));
  //         const cellContent = (() => {
  //           if (showTooltip) {
  //             return (
  //               <Tooltip
  //                 title="This resource is inactive for this period. Allocation not allowed."
  //                 arrow
  //                 placement="top"
  //               >
  //                 <span
  //                   style={{
  //                     display: 'inline-block',
  //                     width: '100%',
  //                     cursor: 'not-allowed',
  //                   }}
  //                 >
  //                   {'' || <>&nbsp;</>}
  //                 </span>
  //               </Tooltip>
  //             );
  //           }
  //           if (isFutureWeek || !editable) {
  //             return <span>{value}</span>;
  //           }
  //           return (
  //             <Box
  //               sx={{
  //                 width: '100%',
  //                 height: '100%',
  //                 display: 'flex',
  //                 alignItems: 'stretch',
  //                 justifyContent: 'center',
  //                 position: 'relative',
  //               }}
  //             >
  //               {showActuals && params.rowNode?.type !== 'group' ? (
  //                 <AllocationCellWithActuals params={cellData} />
  //               ) : (
  //                 <span>{value}</span>
  //               )}
  //             </Box>
  //           );
  //         })();
  //         return (
  //           <CommentTooltip notes={notes} actuals={actuals}>
  //             {cellContent}
  //           </CommentTooltip>
  //         );
  //       },
  //     };
  //   }
  //   return column;
  // });

  const isCellEditable = useCallback(
    params => isCellEditableUtils(params, type, resources),
    [type, resources]
  );

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
      : generateDateWeekMath('WEEK_PLUS', currentView?.WeekPlus) || endDate,
    type === 'cost'
  ).map(column => {
    if (column.field.startsWith('W')) {
      return {
        ...column,
        renderCell: params => {
          console.log(params, 'param');

          const editable = isCellEditable(params);
          const cellClass = getCellClassName(
            params,
            getAllRowsForView(viewId),
            allocationTheme,
            type,
            projects,
            isCellEditable
          );
          const showTooltip =
            cellClass.split(' ').includes('non-editable-cell') ||
            cellClass.split(' ').includes('non-editable-darker');

          const value = params.formattedValue ?? '';
          const cellData = params.row[params.field];
          const notes = cellData?.notes || '';
          const actuals = cellData?.actuals || null;
          const period = cellData?.period;
          const isFutureWeek =
            period &&
            !isCurrentWeek(parseISO(period)) &&
            !isCurrentOrPastWeek(parseISO(period));

          // 🔹 Build the cell content logic
          const cellContent = (() => {
            if (showTooltip) {
              return (
                <Tooltip
                  title="This resource is inactive for this period. Allocation not allowed."
                  arrow
                  placement="top"
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '100%',
                      cursor: 'not-allowed',
                    }}
                  >
                    {'' || <>&nbsp;</>}
                  </span>
                </Tooltip>
              );
            }

            if (isFutureWeek || !editable) {
              return <span>{value}</span>; 
            }

            return (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'stretch',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {showActuals && params.rowNode?.type !== 'group' ? (
                  <AllocationCellWithActuals params={cellData} />
                ) : (
                  <span>{value}</span>
                )}
              </Box>
            );
          })();

          return (
            <CommentTooltip notes={notes} actuals={actuals}>
              {cellContent}
            </CommentTooltip>
          );
        },
      };
    }

    return column;
  });


  const showField = [
    GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD,
    '__row_group_by_columns_group_teams__',
    '__row_group_by_columns_group_organisationName__',
    '__row_group_by_columns_group_resource__',
    '__row_group_by_columns_group_project__',
    '__row_group_by_columns_group_portfolioName__',
    ...columns.map(col => col.field),
    ...finalColumns
      .filter(
        i =>
          i.field === 'resource' &&
          (groupBy === 'project' || groupBy === 'portfolioName')
      )
      .map(col => col.field),
    ...finalColumns
      .filter(
        i =>
          i.field === 'project' &&
          (groupBy === 'teams' ||
            groupBy === 'organisationName' ||
            groupBy === 'resource')
      )
      .map(col => col.field),
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

  const handleCellUpdate = async (newRow, oldRow) => {
    try {
      setCellSelectionModel({});
      // Find the changed week
      const changedWeeks = Object.keys(newRow).filter(
        key => /^W\d+/.test(key) && newRow[key] !== oldRow[key]?.value
      );

      if (!changedWeeks || changedWeeks.length === 0) {
        return { ...oldRow };
      }
      const keys = changedWeeks;
      const deleteList = [];
      const updateList = [];
      let allUpdatedRows = [];
      const projectOvertimeAllowed = oldRow.projectOvertimeAllowed;

      keys.map(key => {
        // Handle Delete Case
        if (
          (newRow[key] === null ||
            newRow[key] === undefined ||
            newRow[key] === 0 ||
            isNaN(newRow[key])) &&
          oldRow[key]?.allocationId
        ) {
          deleteList.push({
            Id: oldRow[key]?.allocationId,
            Resource: oldRow.resourceId,
            Project: oldRow.projectId,
            ProjectName: oldRow.project,
            Period: oldRow[key]?.period,
            AllocationEntered: null,
          });
        }

        if (!projectOvertimeAllowed && newRow[key] > 1.0) {
          newRow[key] = oldRow[key]?.value;
          dispatch(
            showToastAction(
              true,
              `Project ${oldRow.project} does not allow overtime. Max allocation is 1.0.`,
              'error',
              4000
            )
          );
          return;
        }

        // Verify Updated Values total allocation for resource is not greater than Max_Allocation_Error
        let formattedCellValue = Math.round(newRow[key] * 10) / 10;

        const period = oldRow[key]?.period;
        const value = formattedCellValue;
        const resourceId = oldRow.resourceId;

        // Calculate total allocation for the week across all rows for that resource
        let totalForWeek = 0;

        const allData = getAllRowsForView(viewId);

        allData.forEach(row => {
          if (row.resourceId === resourceId) {
            const val = row[key]?.value || 0;
            totalForWeek += parseFloat(val);
          }
        });

        // Add new value (replace current row’s old value with new one)
        const currentRowOldValue = oldRow[key]?.value || 0;
        totalForWeek = totalForWeek - currentRowOldValue + value;

        if (
          totalForWeek > Number(max_allocation_warning) &&
          totalForWeek <= Number(max_allocation_error)
        ) {
          dispatch(
            showToastAction(
              true,
              `Allocation for ${key} exceeds ${max_allocation_warning} (${totalForWeek.toFixed(2)}).`,
              'warning',
              4000
            )
          );
        } else if (totalForWeek > 2) {
          newRow[key] = oldRow[key]?.value;
          dispatch(
            showToastAction(
              true,
              `Allocation for ${key} exceeds ${max_allocation_error} (${totalForWeek.toFixed(2)}). Update cancelled.`,
              'error',
              4000
            )
          );
          return;
        }

        // API call to update the data, if any changes are made.
        if (newRow[key] && newRow[key] !== oldRow[key]?.value) {
          if (oldRow[key]?.allocationId && newRow[key] !== null) {
            // Add to update list
            updateList.push({
              Id: oldRow[key]?.allocationId,
              Resource: oldRow.resourceId,
              Project: oldRow.projectId,
              ProjectName: oldRow.project,
              Period: oldRow[key]?.period,
              AllocationEntered: formattedCellValue,
              // Notes: 'This is an allocation 1', // To Be Impemented
            });
          } else if (formattedCellValue) {
            updateList.push({
              Resource: oldRow.resourceId,
              Project: oldRow.projectId,
              ProjectName: oldRow.project,
              Period: oldRow[key]?.period,
              AllocationEntered: formattedCellValue,
              // Notes: 'This is an allocation 1', // To Be Impemented
            });
          }
        }
      });

      if (deleteList.length === 0 && updateList.length === 0) {
        return oldRow;
      }

      const formatedDeleteList = deleteList.reduce((acc, allocation) => {
        if (acc[allocation.Resource]) {
          acc[allocation.Resource] = [
            ...acc[allocation.Resource],
            allocation.Id,
          ];
        } else {
          acc[allocation.Resource] = [allocation.Id];
        }
        return acc;
      }, {});

      const formatedUpdate = updateList.reduce((acc, allocation) => {
        if (acc[allocation.Resource]) {
          acc[allocation.Resource] = [...acc[allocation.Resource], allocation];
        } else {
          acc[allocation.Resource] = [allocation];
        }
        return acc;
      }, {});

      const deletePromises = Object.keys(formatedDeleteList).map(resourceId => {
        return new Promise((resolve, reject) =>
          dispatch({
            type: 'DELETE_BULK_ALLOCATIONS',
            payload: {
              resourceId,
              allocList: formatedDeleteList[resourceId],
              resolve,
              reject,
            },
          })
        );
      });

      const allocationPromises = Object.keys(formatedUpdate).map(resourceId => {
        return new Promise((resolve, reject) =>
          dispatch({
            type: 'UPDATE_BULK_ALLOCATIONS',
            payload: {
              resourceId,
              allocList: formatedUpdate[resourceId],
              resolve,
              reject,
            },
          })
        );
      });

      dispatch(
        showToastAction(
          true,
          `Updating allocation for ${newRow.resource}...`,
          'info'
        )
      );

      await Promise.all([...allocationPromises, ...deletePromises]).then(
        async response => {
          if (response && response[0].length > 0) {
            response = response[0];
            response = formatAPIResponse('Allocation', response);
            let allocationsUpdated = [];
            // handle for bulk Delete different responce
            if (deleteList.length > 0) {
              allocationsUpdated = deleteList;
            } else {
              allocationsUpdated = response.reduce((arr, res) => {
                // Check if result exists and is an array before spreading
                if (res && Array.isArray(res)) {
                  return [...arr, ...res];
                }
                // If it's not an array but has a value you want to include
                else if (res !== undefined) {
                  return [...arr, res];
                }
                // Otherwise just return the accumulator unchanged
                return arr;
              }, []);
            }

            const formateUpdate = getFormattedAllocationsForUpdate(
              allocationsUpdated,
              teams,
              teamsResources,
              allResourcesDetail,
              portfolios,
              projects,
              resources,
              splitView,
              bottomTeamAllocationGrid,
              teamAllocationGrid,
              startDate,
              endDate
            );
            allUpdatedRows = Object.values(formateUpdate);
          }
        }
      );

      dispatch(
        showToastAction(
          true,
          `Successfully updated allocation for ${newRow.resource}...`,
          'success'
        )
      );

      if (allUpdatedRows?.length > 0) {
        if (viewId === 'topProject') {
          bottomTeamAllocationGrid.updateRows([allUpdatedRows[0]]);
        } else if (viewId === 'bottomTeam') {
          topProjectAllocationGrid.updateRows([allUpdatedRows[0]]);
        } else if (viewId === 'teamAllocation') {
          projectAllocationGrid.updateRows([allUpdatedRows[0]]);
        } else if (viewId === 'projectAllocation') {
          teamAllocationGrid.updateRows([allUpdatedRows[0]]);
        }
        return allUpdatedRows[0];
      }
    } catch (e) {
      console.error('Error creating allocations:', e);
    }

    if (viewId === 'topProject') {
      bottomTeamAllocationGrid.updateRows([oldRow]);
    } else if (viewId === 'bottomTeam') {
      topProjectAllocationGrid.updateRows([oldRow]);
    }
    return oldRow;
  };

  const onRowClick = useCallback(
    params => {
      const rowNode = apiRef.current.getRowNode(params.id);
      if (
        rowNode &&
        rowNode.type === 'group'
        // Commenting to allow expansion of teams groups as well on click anywhere on row Teams View
        // && rowNode.groupingField != 'teams'
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
    // If no Create or Edit permission to Allocation then do not allow rowMode to change from View to Edit.
    if (!permissions['Allocation'].c && !permissions['Allocation'].u) {
      if (Object.keys(rowModesModel).length) {
        setRowModesModel({});
      }
    } else {
      setRowModesModel(newRowModesModel);
    }
  };

  const filterColumns = ({ columns }) => {
    return getTogglableColumns(columns);
  };

  const handleCellSelectionModelChange = useCallback(
    newModel => {
      // Cost Screens are readOnly, no selections.
      if (type === 'cost') return;

      // When Updates are not permitted, no selections.
      if (!permissions['Allocation']?.u && !permissions['Allocation']?.c)
        return;

      // Cell Selection Model should have a value only for minimum of 2 cells
      // If only one cell is selected, then clear the selection
      const rowIds = Object.keys(newModel);
      if (
        Object.keys(newModel).length === 0 ||
        (Object.keys(newModel).length === 1 &&
          Object.keys(newModel[Object.keys(newModel)[0]]).length <= 1)
      ) {
        setCellSelectionModel({});
        return;
      }
      const isCellEditableInRow = (rowId, field) => {
        const row = apiRef.current.getRow(rowId);
        if (!row) return false;
        const params = {
          id: rowId,
          field: field,
          row: row,
        };
        return isCellEditable(params);
      };

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
          if (
            groupBy === 'teams' ||
            groupBy === 'organisationName' ||
            groupBy === 'resource'
          ) {
            // Previously selected team
            const currentResourceSelected = apiRef.current.getRow(
              selectedCells[0].id
            )?.resourceId;
            if (row?.resourceId !== currentResourceSelected) {
              return false;
            }
          }
        }
        return true;
      };

      // Get Only Valid Fields, i.e. Fields starting with 'W\d'
      const getNewModelWithValidFields = row => {
        const newModelWithValidFields = {};
        Object.keys(row).forEach(key => {
          if (/^W\d+/.test(key)) {
            newModelWithValidFields[key] = row[key];
          }
        });
        return newModelWithValidFields;
      };

      let filteredModel = {};
      if (Object.keys(newModel)[0].startsWith('auto-generated')) {
        if (
          apiRef.current.getRowNode(Object.keys(newModel)[0])?.groupingField ===
            'teams' ||
          apiRef.current.getRowNode(Object.keys(newModel)[0])?.groupingField ===
            'organisationName'
        ) {
          setCellSelectionModel({});
          return;
        }
        if (Object.keys(newModel).length > 1) {
          filteredModel = cellSelectionModel;
        } else {
          const key = Object.keys(newModel)[0];
          const newModelWithValidFields = getNewModelWithValidFields(
            newModel[key]
          );
          filteredModel = {
            [key]: newModelWithValidFields,
          };
        }
      }

      rowIds.forEach(rowId => {
        if (!rowId.startsWith('auto-generated')) {
          const row = apiRef.current.getRow(rowId);
          if (isRowWithinGroup(row)) {
            const editableFields = Object.keys(newModel[rowId]).filter(
              field => {
                return /^W\d+/.test(field) && isCellEditableInRow(rowId, field);
              }
            );

            if (editableFields.length > 0) {
              filteredModel[rowId] = {};
              editableFields.forEach(field => {
                filteredModel[rowId][field] = true;
              });
            }
          }
        }
      });
      setCellSelectionModel(filteredModel);
    },
    [apiRef, type, isCellEditable, setCellSelectionModel, groupBy]
  );

  const getRowClassName = params => {
    const rowNode = apiRef.current.getRowNode(params.id);
    const rowData = apiRef.current.getRow(params.id);
    if (rowNode?.type === 'group') {
      // Check if all children are non-editable for this week
      const children = apiRef.current.getRowGroupChildren({
        groupId: params.id,
        applySorting: true,
      });
      const allChildrenNonEditable = children.every(childRow => {
        const childParams = {
          ...params,
          row: childRow,
          id: childRow.id,
        };
        return !isCellEditable(childParams);
      });
      if (allChildrenNonEditable) {
        return 'group-row-non-editable';
      }
    }
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
      organisationName: {
        __row_group_by_columns_group_organisationName__: true,
        __row_group_by_columns_group_resource__: true,
        project: true,
      },
      resource: {
        __row_group_by_columns_group__: true,
        project: true,
      },
      project: {
        resource: true,
        __row_group_by_columns_group__: true,
      },
      portfolioName: {
        __row_group_by_columns_group_portfolioName__: true,
        __row_group_by_columns_group_project__: true,
        resource: true,
      },
      '': {
        organisationName: true,
        teams: true,
        resource: true,
        project: true,
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
    } else {
      updatedModel = {
        ..._columns[groupBy].reduce((acc, column) => {
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
          toolbarExport: '',
        },
      }
    : {};
    const handleContextMenu = event => {
      event.preventDefault();
      event.stopPropagation();
      setContextMenu(
        contextMenu === null
          ? { mouseX: event.clientX, mouseY: event.clientY }
          : null
      );
    };
    
    
    const handleClose = () => {
      setContextMenu(null);
    };
  

  return (
    <>
      <div onContextMenu={handleContextMenu}>
        <StyledDataGrid
          cellSelection
          allocationTheme={allocationTheme}
          isCellEditable={isCellEditable}
          onCellKeyDown={handleCellKeyDown}
          type={type}
          getRowHeight={params => {
            if (params?.model?.projectId === '') {
              // Sahadev: really small value, it doesnt accept 0
              // New solution for hiding empty rows
              return 0.000000000001;
            }
            return 52;
          }}
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          processRowUpdate={handleCellUpdate}
          onProcessRowUpdateError={err => {
            console.error('Row update failed:', err);
          }}
          aggregationModel={aggregation}
          columns={finalColumns}
          rowSelection={true}
          onRowClick={onRowClick}
          apiRef={apiRef}
          groupBy={groupBy}
          loading={loading || loadingPermissions}
          disableRowSelectionOnClick
          initialState={initialState}
          rowGroupingColumnMode={rowGroupingColumnMode}
          columnHeaderHeight={30}
          columnGroupHeaderHeight={22}
          columnGroupingModel={generateColumnGroupingModel(
            startDate,
            endDate,
            finalColumns
          )}
          defaultGroupingExpansionDepth={1}
          disableAutosize
          getCellClassName={params => {
            if (
              (viewId === 'topProject' && !topProjectAllocationGrid.ready) ||
              (viewId === 'bottomTeam' && !bottomTeamAllocationGrid.ready) ||
              (viewId === 'teamAllocation' && !teamAllocationGrid.ready) ||
              (viewId === 'projectAllocation' &&
                !projectAllocationGrid.ready) ||
              (viewId === 'main' && !mainAllocationGrid.ready)
            ) {
              return '';
            }
            const originalClass = getCellClassName(
              params,
              getAllRowsForView(viewId),
              allocationTheme,
              type,
              projects,
              isCellEditable,
              groupBy
            );
            // const editable = isCellEditable(params);
            // if (!editable) {
            //   return originalClass ? `${originalClass}` : 'non-editable-cell';
            // }
            return originalClass || '';
          }}
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
      </div>
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleClose}>Copy</MenuItem>
        <MenuItem onClick={handleClose}>Print</MenuItem>
        <MenuItem onClick={handleClose}>Highlight</MenuItem>
        <MenuItem onClick={handleClose}>Email</MenuItem>
      </Menu>
    </>
  );
}

export default withRBAC(AllocationGrid, ['Allocation']);
