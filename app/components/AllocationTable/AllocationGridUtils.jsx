import {
  aggregationModel,
  getAllColumnsWithWeek,
} from '@/app/components/AllocationTable/TableHeader';
import CustomAvatar from '../Avatar/CustomAvatar';
import { calculateTotalEffort } from '@/app/utils/common';
import { AddRowButton } from './AddRowButton';
import { useSelector } from 'react-redux';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { CustomAddIcon } from './CustomAddIcon';
import { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ResourceCellWithMenu = ({ params, handleAddClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = event => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            alert('Clone');
          }}
        >
          Clone
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <CustomAddIcon
      value={<CustomAvatar value={params.value} showFullName={true} />}
      onClick={() => handleAddClick(params)}
      menu={menu}
    />
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
  setSelectedTeam,
  handleAddProject,
  setSelectedResourceId,
  dispatch,
  startDate,
  endDate
) => {
  const { teamAllocations } = useSelector(state => state.teams);
  const { projects } = useSelector(state => state.projects);
  const allColumns = getAllColumnsWithWeek(
    columns,
    dispatch,
    startDate,
    endDate
  );
  const handleAddClick = params => {
    dispatch(
      openDialog({
        title: 'Update Allocation',
        submitButtonText: 'Update',
        cancelButtonText: 'Cancel',
        formType: 'add_allocation',
        initialData: {
          Resource: params.value,
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
          return params.value ? (
            <ResourceCellWithMenu
              params={params}
              handleAddClick={handleAddClick}
              columnType="resource"
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
          if (params.value) return params.value;

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
                  width: '100%',
                  minWidth: 0,
                }}
              >
                {!isGroupExpanded && (
                  <span
                    style={{
                      flex: '1 1 auto',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                    title={firstProject}
                  >
                    {firstProject}
                  </span>
                )}
                {!isGroupExpanded && (
                  <span
                    style={{
                      flex: '0 0 auto',
                      backgroundColor: '#E9EFF8',
                      color: '#000',
                      paddingRight: 4,
                      paddingLeft: 4,
                      marginLeft: 8,
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

          return projects_set.length
            ? `${projects_set[0]}${
                projects_set.length > 1 ? ` +${projects_set.length - 1}` : ''
              }`
            : '';
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
            <ResourceCellWithMenu
              params={params}
              handleAddClick={handleAddClick}
              columnType="resource"
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

export const getCellClassName = (params, updatedRows) => {
  if (params?.field === 'totalEffort') {
    return 'total-effort-cell';
  }
  // if (params.rowNode?.groupingField === 'project') {
  //   return 'project-view-projectName';
  // }
  if (params && params.field && typeof params.field === 'string') {
    if (
      params &&
      params.field &&
      typeof params.field === 'string' &&
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

      let percentage;
      if (params.rowNode?.groupingField === 'resource') {
        percentage = (aggregatedValue / 1) * 100;
      } else {
        percentage = (aggregatedValue / totalRows) * 100;
      }
      if (params.rowNode?.groupingField === 'teams') {
        if (percentage === 0) {
          return 'firstGroupsRow';
        } else if (percentage <= 50) {
          return 'poor-allocation';
        } else if (percentage > 50 && percentage <= 80) {
          return 'average-allocation';
        } else if (percentage > 80 && percentage <= 110) {
          return 'fully-occupied';
        } else if (percentage > 110) {
          return 'over-occupied';
        }
      } else {
        if (percentage === 0) {
          return 'firstGroupsRow';
        } else if (percentage <= 50) {
          return 'poor-allocation-secondGroup';
        } else if (percentage > 50 && percentage <= 80) {
          return 'average-allocation-secondGroup';
        } else if (percentage > 80 && percentage <= 110) {
          return 'fully-occupied-secondGroup';
        } else if (percentage > 110) {
          return 'over-occupied-secondGroup';
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
