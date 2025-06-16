import {
  aggregationModel,
  getAllColumnsWithWeek,
} from '@/app/components/AllocationTable/TableHeader';

import {
  calculateTotalEffort,
  generateDateWeekMath,
  getMondayOfISO,
  getProjectBudgetCategory,
} from '@/app/utils/common';
import { AddRowButton } from './AddRowButton';
import { useSelector, useDispatch } from 'react-redux';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { CustomAddIcon } from './CustomAddIcon';
import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';
import EllipsisNameCell from '../ResourceAllocation/component/EllipsisNameCell';
import ConfirmDialog from '../Dialog/ConfirmDialog';
import { removeResourceAllocation } from '@/app/redux/actions/resourceAllocationAction';
import { setRowState } from '@/app/redux/reducers/dataGridReducer';
import { setExpandRowId } from '@/app/redux/reducers/allocationViewReducer';
import { showToast } from '@/app/redux/reducers/toastReducer';
import { parseISO } from 'date-fns';
import { useAllGridRowsByView } from '@/app/hooks/useAllGridRowsByView';
import { generateEmptyRow } from '@/app/utils/allocationUtils';

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 4,
    boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
    width: '120px',
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(20, 43, 81, 0.70)',
    '& .MuiTypography-root': {
      color: '#FFFFFF',
    },
    '& .MuiListItemIcon-root': {
      color: '#FFFFFF',
    },
  },
  '& .MuiTypography-root': {
    color: '#424242',
  },
  '& .MuiListItemIcon-root': {
    minWidth: 32,
    color: '#1C2D5F',
  },
}));

const CellWithMenu = ({
  params,
  handleAddClick,
  handleCloneClick,
  handleTranferClick,
  isFormatWithK,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteParams, setDeleteParams] = useState(null);
  const allTeams = useSelector(state => state.teams.teams?.result || []);
  const allResources = useSelector(
    state => state.resources.resources?.result || []
  );
  const allProjects = useSelector(
    state => state.projects.projects?.result || []
  );
  const { teamsResources } = useSelector(state => state.teams);
  const rowState = useSelector(state => state.dataGrid.rowState);
  const { view } = useSelector(state => state.allocationView);
  const { currentView, splitView } = useSelector(state => state.allocationView);
  const { getAllRowsForView, setRowsForView, updateRowsForView } =
    useAllGridRowsByView();

  const handleDeleteClick = params => {
    setDeleteParams(params);
    setShowDeleteDialog(true);
    setAnchorEl(null);
  };

  const handleConfirmDelete = async () => {
    let row;
    let allocationIds;
    let childrenRows;

    // Check if its an aggregation row, if so, get all children rows allocationIds
    if (
      deleteParams.rowNode?.type === 'group' &&
      deleteParams.rowNode?.children
    ) {
      childrenRows = deleteParams.rowNode.children.map(child =>
        params.api.getRow(child)
      );
      row = childrenRows[0];

      allocationIds = childrenRows.reduce(
        (allAllocationId, childRow) => [
          ...allAllocationId,
          ...Object.values(childRow)
            .filter(cell => cell?.allocationId)
            .map(cell => cell.allocationId),
        ],
        []
      );
    } else {
      row = deleteParams.row;

      allocationIds = Object.values(row)
        .filter(cell => cell?.allocationId)
        .map(cell => cell.allocationId);
    }

    if (!allocationIds || allocationIds.length === 0) {
      dispatch(
        showToast({
          open: true,
          message: 'No allocations found to delete.',
          type: 'error',
          position: 'bottom-right',
          autoHideTimer: 4000,
        })
      );
      return;
    }

    dispatch(
      showToast({
        open: true,
        message: 'Deleting allocations...',
        type: 'info',
        position: 'bottom-right',
        autoHideTimer: 4000,
      })
    );

    // Perform delete.
    new Promise((resolve, reject) =>
      dispatch({
        type: 'DELETE_BULK_ALLOCATIONS',
        payload: {
          resourceId: row.resourceId,
          allocList: allocationIds,
          resolve,
          reject,
        },
      })
    )
      .then(response => {
        if (!response?.result) {
          dispatch(
            showToast({
              open: true,
              message: 'Failed to delete allocation.',
              type: 'error',
              position: 'bottom-right',
              autoHideTimer: 4000,
            })
          );
          return;
        }
        if (childrenRows) {
          // Update rows for view to delete all children rows
          updateRowsForView(
            'teamAllocation',
            childrenRows.map(r => ({ ...r, _action: 'delete' }))
          );
          updateRowsForView(
            'projectAllocation',
            childrenRows.map(r => ({ ...r, _action: 'delete' }))
          );
          updateRowsForView(
            'topProject',
            childrenRows.map(r => ({ ...r, _action: 'delete' }))
          );
          updateRowsForView(
            'bottomTeam',
            childrenRows.map(r => ({ ...r, _action: 'delete' }))
          );

          dispatch(
            showToast({
              open: true,
              message: `Allocation for ${row?.resource} has successfully been deleted.`,
              type: 'success',
              position: 'bottom-right',
              autoHideTimer: 4000,
            })
          );
        } else {
          // Update rows for view to delete the specific row
          updateRowsForView(
            'teamAllocation',
            getAllRowsForView('teamAllocation')
              .filter(r => r.id === row.id)
              .map(r => ({ ...r, _action: 'delete' }))
          );
          updateRowsForView(
            'projectAllocation',
            getAllRowsForView('projectAllocation')
              .filter(r => r.id === row.id)
              .map(r => ({ ...r, _action: 'delete' }))
          );
          updateRowsForView(
            'topProject',
            getAllRowsForView('topProject')
              .filter(r => r.id === row.id)
              .map(r => ({ ...r, _action: 'delete' }))
          );
          updateRowsForView(
            'bottomTeam',
            getAllRowsForView('bottomTeam')
              .filter(r => r.id === row.id)
              .map(r => ({ ...r, _action: 'delete' }))
          );

          dispatch(
            showToast({
              open: true,
              message: `Allocation for ${deleteParams?.row?.resource} in ${deleteParams?.row?.project} has successfully been deleted.`,
              type: 'success',
              position: 'bottom-right',
              autoHideTimer: 4000,
            })
          );
        }

        const resourceExistsOnAllicationTable = getAllRowsForView(
          'teamAllocation'
        ).find(r => r.resourceId === row.resourceId);

        // If resource does not exist on allocation table, add empty row for resource, for Team Allocation view
        if (!resourceExistsOnAllicationTable) {
          // Add empty for resource
          const emptyRow = generateEmptyRow(
            currentView?.isDynamicRange
              ? generateDateWeekMath('WEEK_MINUS', currentView?.WeekMinus)
              : currentView?.isFixedRange
                ? currentView?.StartDate
                : '',
            currentView?.isDynamicRange
              ? generateDateWeekMath('WEEK_PLUS', currentView?.WeekPlus)
              : currentView?.isFixedRange
                ? currentView?.EndDate
                : '',
            allTeams,
            teamsResources,
            null,
            allResources.filter(resource => resource.Id === row.resourceId),
            {
              ProjectName: row?.project || '',
              Id: '',
              ProjectManager: row?.projectManager || '',
              Period: '',
              Resource: row?.resourceId || '',
              Duration: '',
              ResourceName: row?.resource || '',
              AllocationEntered: null,
              Project: row?.projectId || '',
            }
          );

          updateRowsForView(
            'teamAllocation',
            [emptyRow].map(r => ({
              ...r,
              project: null,
              projectId: null,
              hasAllocation: false,
            }))
          );
        }
      })
      .catch(error => {
        console.error('Error deleting allocations:', error);
        dispatch(
          showToast({
            open: true,
            message: 'Failed to delete allocation.',
            type: 'error',
            position: 'bottom-right',
            autoHideTimer: 4000,
          })
        );
      });

    setShowDeleteDialog(false);
    setDeleteParams(null);
    setAnchorEl(null);
  };

  const handleMenuOpen = event => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    {
      label: 'Clone',
      icon: <ContentCopyIcon fontSize="small" />,
      func: () => handleCloneClick(params),
    },
    {
      label: 'Transfer',
      icon: <SwapHorizIcon fontSize="small" />,
      func: () => handleTranferClick(params),
    },
    { label: 'History', icon: <HistoryIcon fontSize="small" /> },
    {
      label: 'Delete',
      icon: <DeleteIcon fontSize="small" />,
      func: () => handleDeleteClick(params),
    },
  ];

  const menu = (
    <>
      <IconButton
        size="small"
        disableRipple
        disableFocusRipple
        onClick={handleMenuOpen}
        sx={{
          ml: 0.3,
          padding: '0px',
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
      >
        <MoreVertIcon sx={{ fontSize: 22 }} />
      </IconButton>
      <StyledMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {menuItems.map(item => (
          <StyledMenuItem
            key={item.label}
            onClick={() => {
              item.func && item.func(params);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  sx={{
                    color: ' #424242',
                    fontFamily: 'Manrope',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '600',
                    lineHeight: ' 18px',
                  }}
                >
                  {item.label}
                </Typography>
              }
            />
          </StyledMenuItem>
        ))}
      </StyledMenu>
    </>
  );
  const columnType = params.colDef.field;
  const showAvatar = columnType !== 'project';
  return (
    <>
      <CustomAddIcon
        value={
          <EllipsisNameCell
            value={params.value}
            showAddIcon={false}
            showAvatar={showAvatar}
            isFormatWithK={isFormatWithK}
          />
        }
        onClick={() => handleAddClick(params)}
        menu={menu}
        isFormatWithK={isFormatWithK}
      />
      <ConfirmDialog
        open={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Alert"
      >
        Are you sure you want to delete{' '}
        {deleteParams?.rowNode?.type === 'group' &&
        deleteParams?.rowNode?.children ? (
          <>
            All Allocations for{' '}
            {params.api.getRow(deleteParams?.rowNode?.children[0]).resource}
          </>
        ) : (
          <>
            {deleteParams?.row?.project} Allocations for{' '}
            {deleteParams?.row?.resource}
          </>
        )}
        ?
      </ConfirmDialog>
    </>
  );
};

export const getInitialState = (
  groupBy,
  updatedRows,
  GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD
) => ({
  rowGrouping: {
    model: groupBy === 'teams' ? [groupBy, 'resource'] : [groupBy],
  },
  sorting: {
    sortModel: [
      { field: GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD, sort: 'asc' },
    ],
  },
  pinnedColumns: {
    left: [
      GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD,
      '__row_group_by_columns_group_teams__',
    ],
  },
});

export const getFinalColumns = (
  columns,
  groupBy,
  mode,
  setSelectedTeam,
  handleAddProject,
  setSelectedResourceId,
  dispatch,
  startDate,
  endDate,
  isFormatWithK
) => {
  const { teamAllocations } = useSelector(state => state.teams);
  const { projects } = useSelector(state => state.projects);
  const { splitViewCurrentProject } = useSelector(
    state => state.allocationView
  );
  const allColumns = getAllColumnsWithWeek(
    columns,
    dispatch,
    startDate,
    endDate,
    isFormatWithK
  );

  const handleAddClick = params => {
    if (mode === 'split' && splitViewCurrentProject) {
      dispatch(
        openDialog({
          title: 'Add Allocation',
          submitButtonText: 'Update',
          cancelButtonText: 'Cancel',
          formType: 'add_allocation',
          initialData: {
            Resource: params.value,
            Project: [splitViewCurrentProject.Name],
          },
        })
      );
    } else {
      dispatch(
        openDialog({
          title: 'Update Allocation',
          submitButtonText: 'Update',
          cancelButtonText: 'Cancel',
          formType: 'add_allocation',
          initialData: {
            Resource: params.row.resource || params.value,
            ResourceId: params.row.resourceId,
            Project: [params.row.project || params.value],
            Team: params.row.teams,
          },
        })
      );
    }
  };

  const handleCloneClick = params => {
    dispatch(
      openDialog({
        title: 'Clone Resource',
        submitButtonText: 'Clone',
        cancelButtonText: 'Cancel',
        formType: 'clone_resource',
        initialData: {
          Resource: params.row.resource,
          Project: params.row.project,
        },
      })
    );
  };

  const handleTranferClick = params => {
    dispatch(
      openDialog({
        title: 'Transfer Resource',
        submitButtonText: 'Transfer',
        cancelButtonText: 'Cancel',
        formType: 'transfer_resource',
        initialData: {
          Resource: params.row.resource,
          Project: params.row.project,
        },
      })
    );
  };

  if (groupBy === 'organization') {
    return allColumns || [];
  } else if (groupBy === 'teams') {
    return [
      ...(allColumns?.slice(0, 1) || []),
      {
        field: 'resource',
        headerName: 'Resource',
        width: 201,
        headerClassName: 'secondary-header',
        cellClassName: 'secondary-cell',
        sortable: false,
        primaryColumn: true,
        renderCell: params => {
          const value = params.value;
          const resourceCount = params.row?.resource_count?.length || 0;
          return value ? (
            <CellWithMenu
              params={params}
              handleAddClick={handleAddClick}
              isFormatWithK={isFormatWithK}
              // handleCloneClick={handleCloneClick}
              // handleTranferClick={handleTranferClick}
            />
          ) : null;
        },
      },
      {
        field: 'project',
        headerName: 'Project',
        width: 200,
        headerClassName: 'secondary-header',
        cellClassName: 'secondary-cell',
        sortable: groupBy == 'project' ? true : false,
        primaryColumn: true,
        renderCell: params => {
          const allocationsOfAddedResource =
            Array.isArray(teamAllocations.result) &&
            teamAllocations.result.filter(
              resource => resource.Resource === params.row.resourceId
            );
          const uniqueProjectNames = [
            ...new Set(
              (Array.isArray(allocationsOfAddedResource) &&
                allocationsOfAddedResource.map(item => item.ProjectName)) ||
                []
            ),
          ];
          const isGroupExpanded = params.rowNode.childrenExpanded;
          if (params.row.hasProject && !params.row.project) {
            return (
              <AddRowButton
                row={params.row}
                teamsId={params.row.teamsId}
                project={params.row.project}
                handleAddRow={handleAddProject}
                buttonName="Add Project"
                resourceProjects={projects?.result.filter(
                  item => !uniqueProjectNames?.includes(item.Name)
                )}
                onClick={event => {
                  setSelectedTeam(params.row.teams),
                    setSelectedResourceId(params.row.resourceId);
                }}
              />
            );
          }
          if (params.value) {
            return (
              <CellWithMenu
                params={params}
                handleAddClick={handleAddClick}
                handleCloneClick={handleCloneClick}
                handleTranferClick={handleTranferClick}
                isFormatWithK={isFormatWithK}
              >
                <EllipsisNameCell
                  value={params.value}
                  showAddIcon
                  onAddClick={() => handleAddClick(params)}
                  isFormatWithK={isFormatWithK}
                />
              </CellWithMenu>
            );
          }

          const projects_set = [
            ...new Set(
              params?.rowNode?.children?.map(
                child => params.api.getRow(child)?.project
              )
            ),
          ].filter(Boolean);

          if (projects_set.length > 1) {
            const firstProject = projects_set?.[0];

            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 0,
                  width: '100%',
                  gap: 8,
                }}
              >
                {!isGroupExpanded && (
                  <EllipsisNameCell
                    value={firstProject}
                    showAddIcon={false}
                    isFormatWithK={isFormatWithK}
                  />
                )}
                {!isGroupExpanded && (
                  <span
                    style={{
                      flexShrink: 0,
                      backgroundColor: '#E9EFF8',
                      color: '#000',
                      paddingRight: 4,
                      paddingLeft: 4,
                      fontSize: 12,
                      borderRadius: 4,
                      lineHeight: 1.6,
                    }}
                  >
                    +{projects_set.length - 1}
                  </span>
                )}
              </div>
            );
          }

          return projects_set.length ? (
            <EllipsisNameCell value={projects_set[0]} showAddIcon={false} />
          ) : (
            ''
          );
        },
      },
      ...(allColumns?.slice(1) || []),
    ];
  } else if (groupBy === 'project') {
    return [
      ...(allColumns?.slice(0, 1) || []),
      {
        field: 'resource',
        headerName: 'Resource',
        width: 200,
        headerClassName: 'secondary-header',
        cellClassName: 'secondary-cell',
        sortable: false,
        primaryColumn: true,
        cellClassName: () =>
          groupBy === 'project' ? 'common-NonEditableCells' : '',
        renderCell: params => {
          return params.value ? (
            <CellWithMenu
              params={params}
              handleAddClick={handleAddClick}
              handleCloneClick={handleCloneClick}
              handleTranferClick={handleTranferClick}
              isFormatWithK={isFormatWithK}
            />
          ) : null;
        },
      },
      ...(allColumns?.slice(1) || []),
    ];
  }
};
export const groupPage = groupBy => {
  const groupPages = {
    project: 'Project Name',
    teams: 'Team Name',
    organization: 'Organization Name',
  };
  return groupPages[groupBy];
};

export const getGroupingColDef = groupBy => ({
  headerName: groupPage(groupBy),
  renderHeader: () => groupPage(groupBy),
  renderCell: params => params.value,
  filterable: false,
  isEditable: false,
  headerClassName: 'prime-header',
});

export const getCellClassName = (
  params,
  updatedRows,
  allocationTheme = [],
  type = 'allocation',
  allProjects = []
) => {
  if (params?.field === 'totalEffort') {
    if (
      type === 'cost' &&
      params.rowNode?.type === 'group' &&
      params.rowNode?.groupingField === 'project' &&
      params?.field === 'totalEffort'
    ) {
      const project = allProjects.find(
        row => row.Name === params.rowNode.groupingKey
      );
      const projectCategory = getProjectBudgetCategory(
        project?.Budget || 0,
        params?.value || 0
      );
      return `total-effort-cell project-budget-${projectCategory}`;
    }
    return 'total-effort-cell';
  }

  if (params && params.field && typeof params.field === 'string') {
    if (
      /^W\d+/.test(params.field) &&
      type !== 'cost' &&
      params.rowNode?.type === 'group' &&
      (params.rowNode?.groupingField === 'teams' ||
        params.rowNode?.groupingField === 'resource')
    ) {
      const projectName = params.rowNode.groupingKey;
      let projectRows = [];

      if (params.rowNode?.groupingField === 'teams') {
        projectRows = updatedRows.filter(row => row.teams === projectName);
      } else if (params.rowNode?.groupingField === 'resource') {
        projectRows = updatedRows.filter(row => row.resource === projectName);
      }

      const uniqueProjectRows = new Set(
        projectRows.map(item => item.resourceId)
      );
      const totalRows = uniqueProjectRows.size;
      const aggregatedValue = projectRows.reduce((sum, row) => {
        const weekValue = row[params.field];
        const numericValue =
          typeof weekValue === 'object' && weekValue !== null
            ? parseFloat(weekValue.value || 0)
            : parseFloat(weekValue || 0);
        return sum + numericValue;
      }, 0);

      const allocationValue =
        params.rowNode?.groupingField === 'resource'
          ? Math.round(aggregatedValue * 10) / 10
          : Math.round((aggregatedValue / totalRows) * 10) / 10;

      const sortedTheme = [...allocationTheme].sort(
        (a, b) => parseFloat(a.From) - parseFloat(b.From)
      );

      // Find the matching range in the theme
      let matchingRange;
      for (const range of sortedTheme) {
        const from = parseFloat(range.From);
        const to = parseFloat(range.To);
        if (allocationValue >= from && allocationValue <= to) {
          matchingRange = range;
          break;
        }
      }

      // If no matching range found and value exceeds max range, use the last theme
      if (!matchingRange && sortedTheme.length > 0) {
        const firstRange = sortedTheme[0];
        const lastRange = sortedTheme[sortedTheme.length - 1];
        matchingRange =
          allocationValue < parseFloat(firstRange.From) ? lastRange : lastRange;
      }

      if (matchingRange) {
        if (params.rowNode?.groupingField === 'teams') {
          return `allocation-theme-${matchingRange.id}`;
        } else {
          return `allocation-theme-${matchingRange.id}-secondGroup`;
        }
      }
    } else if (
      params.rowNode?.type === 'group' &&
      params.rowNode?.groupingField === 'project' &&
      /^W\d+/.test(params.field)
    ) {
      const project = allProjects.find(
        row => row.Name === params.rowNode.groupingKey
      );

      const currentWeekData = updatedRows.find(
        row => row.projectId === project?.Id
      )?.[params.field];
      if (project && currentWeekData && currentWeekData?.period) {
        const isWithinProjectDateRange =
          project &&
          project.StartDate &&
          project.EndDate &&
          parseISO(project.StartDate) <= parseISO(currentWeekData?.period) &&
          parseISO(project.EndDate) >= parseISO(currentWeekData?.period);
        if (isWithinProjectDateRange && project.Type) {
          return `firstGroupsRow project-type-${project.Type.toLowerCase().split(' ').join('_')}`;
        }
      }
    }
  }

  if (params.rowNode?.type === 'group') {
    return params.rowNode?.groupingField === 'teams' ||
      params.rowNode?.groupingField === 'project'
      ? 'firstGroupsRow'
      : 'secondGroupsRow';
  }

  return '';
};

export const getInitialRowsState = (updatedRows, groupBy, teams) => {
  const rowsWithTotalEffort = updatedRows.map(row => ({
    ...row,
    totalEffort: calculateTotalEffort(row),
  }));

  if (groupBy === 'project') {
    return rowsWithTotalEffort;
  } else if (groupBy === 'teams') {
    // Get unique teams for teams and teamsId to avoid duplicate teams
    let unique_teams = {};
    let teams_with_name = {};
    teams?.result?.forEach(team => {
      teams_with_name[team?.Name] = team?.Id;
    });

    rowsWithTotalEffort.forEach(row => {
      if (row.teamsId && !unique_teams[row.teamsId])
        unique_teams[row.teamsId] = row.teams;
      else if (!unique_teams[row.teamsId] && teams_with_name?.[row?.teams]) {
        unique_teams[teams_with_name[row.teams]] = row.teams;
      }
    });

    return rowsWithTotalEffort;
  } else {
    return updatedRows;
  }
};
