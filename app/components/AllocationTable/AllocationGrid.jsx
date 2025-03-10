import { useState, useEffect } from 'react';
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
import { getTeamAllocations } from '@/app/services/teamServices';
import { generateColumnGroupingModel, getStartDate } from './TableHeader';

import CustomToolbar from '../Toolbar/CustomToolbar';

export default function AllocationGrid({ groupBy, columns, data, loading }) {
  const apiRef = useGridApiRef();
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [updatedRows, setUpdatedRows] = useState([]);
  const [rowsState, setRowsState] = useState([]);
  const { open, message, type, position } = useSelector(state => state.toast);
  const startDate = getStartDate();

  const dispatch = useDispatch();
  const { projects } = useSelector(state => state.projects);
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

  const handleCellKeyDown = (params, event) => {
    // Preventing Key Events for Editing.
    if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
    }
  }

  const handleCellUpdate = (newRow, oldRow) => {
    Object.keys(newRow).forEach(key => {
      if (key.startsWith('W')) {
        let formattedCellValue = Math.round(newRow[key] * 10) / 10;

        // API call to update the data, if any changes are made.
        if (newRow[key] && newRow[key] !== oldRow[key]?.value) {
          if (oldRow[key]?.allocationId) {

            // PUT API call to update the data.
            const putPayload = {
              resourceId: oldRow.resourceId,
              allocationId: oldRow[key]?.allocationId,
              putData: {
                'ResourceAllocation.Core/Allocation': {
                  AllocationEntered: formattedCellValue,
                },
              },
            };
            dispatch(updateResourceAllocation(putPayload));
          } else {

            // POST API call to update the data.
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
            dispatch(setResourceAllocation(postPayload));
          }
        }

        newRow[key] = {
          allocationId: oldRow[key]?.allocationId || null,
          value: newRow[key],
        };
      }});
      
    return newRow;
  }

  const handleRowModesModelChange = newRowModesModel => {
    setRowModesModel(newRowModesModel);
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
