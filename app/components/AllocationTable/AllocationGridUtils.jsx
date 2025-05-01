import {
  aggregationModel,
  getAllColumnsWithWeek,
} from '@/app/components/AllocationTable/TableHeader';

import { calculateTotalEffort } from '@/app/utils/common';
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
  const rowState = useSelector(state => state.dataGrid.rowState);
  const { view } = useSelector(state => state.allocationView);

  const handleDeleteClick = params => {
    setDeleteParams(params);
    setShowDeleteDialog(true);
    setAnchorEl(null);
  };

  const handleConfirmDelete = async () => {
    const row = deleteParams.row;
    const resourceId = row?.resourceId;

    const allocationIds = Object.values(row)
      .filter(cell => cell?.allocationId)
      .map(cell => cell.allocationId);

    const deletePayloads = allocationIds.map(allocationId => ({
      resourceId,
      allocationId,
    }));

    await Promise.all(
      deletePayloads.map(payload => dispatch(removeResourceAllocation(payload)))
    );

    const updatedRows = rowState.filter(r => r.id !== row.id);
    dispatch(setRowState(updatedRows));

    const fullResource = allResources.find(r => r.Id === resourceId);
    const team = allTeams.find(team => team.Name === row.teams);

    if (fullResource && team) {
      const rowId = `auto-generated-row-teams/${team.Name}-resource/${fullResource.FullName}`;
      dispatch(setExpandRowId([rowId]));
    }

    const itemName =
      view === 'Project'
        ? deleteParams?.row?.resource
        : deleteParams?.row?.project;

    dispatch(
      showToast({
        open: true,
        message: `${itemName} has been successfully deleted.`,
        type: 'success',
        position: 'bottom-right',
        autoHideTimer: 4000,
      })
    );

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
            showAvatar={true}
          />
        }
        onClick={() => handleAddClick(params)}
        menu={menu}
      />
      <ConfirmDialog
        open={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Alert"
      >
        Are you sure you want to delete:{' '}
        {view === 'Project'
          ? deleteParams?.row?.resource
          : deleteParams?.row?.project}
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
  endDate
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
    endDate
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
            Project: splitViewCurrentProject.Name,
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
            Project: params.row.project || params.value,
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
              >
                <EllipsisNameCell
                  value={params.value}
                  showAddIcon
                  onAddClick={() => handleAddClick(params)}
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
                  <EllipsisNameCell value={firstProject} showAddIcon={false} />
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

export const getCellClassName = (params, updatedRows, allocationTheme = []) => {
  if (params?.field === 'totalEffort') {
    return 'total-effort-cell';
  }

  if (params && params.field && typeof params.field === 'string') {
    if (
      params.field.startsWith('W') &&
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
