import {
  aggregationModel,
  getAllColumnsWithWeek,
} from '@/app/components/AllocationTable/TableHeader';
import CustomAvatar from '../Avatar/CustomAvatar';
import { calculateTotalEffort } from '@/app/utils/common';
import { AddRowButton } from './AddRowButton';
import { useSelector } from 'react-redux';

export const getInitialState = (
  groupBy,
  updatedRows,
  GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD
) => ({
  rowGrouping: {
    model: [groupBy],
  },
  sorting: {
    sortModel: [
      { field: GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD, sort: 'asc' },
    ],
  },
  aggregation: {
    model: {
      totalEffort: 'sum',
      ...aggregationModel,
    },
  },
  pinnedColumns: { left: [GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD] },
});

export const getFinalColumns = (
  columns,
  groupBy,
  setSelectedProject,
  handleAddRow,
  setSelectedTeam,
  handleAddProject,
  setSelectedResourceId,
  dispatch
) => {
  const { teamAllocations } = useSelector(state => state.teams);
  const { projects } = useSelector(state => state.projects);
  const allColumns = getAllColumnsWithWeek(columns, dispatch);
  if (groupBy === 'organization') {
    return allColumns || [];
  } else if (groupBy === 'teams') {
    return [
      ...(allColumns?.slice(0, 1) || []),
      {
        field: 'resource',
        headerName: 'Resource',
        width: 200,
        headerClassName: 'secondary-header',
        cellClassName: 'secondary-cell',
        sortable: false,
        renderCell: params => {
          if (params.row.hasButton) {
            return (
              <AddRowButton
                project={params.row.project}
                handleAddRow={handleAddRow}
                teamsId={params.row.teamsId}
                buttonName={
                  groupBy === 'teams' ? 'Assign Allocation' : 'Add Resource'
                }
                onClick={event => {
                  setSelectedProject(params.row.project),
                    setSelectedTeam(params.row.teams);
                }}
              />
            );
          }
          if (params.value) {
            return <CustomAvatar value={params.value} showFullName={true} />;
          }
        },
      },
      {
        field: 'project',
        headerName: 'Project',
        width: 200,
        headerClassName: 'secondary-header',
        cellClassName: 'secondary-cell',
        sortable: groupBy == 'project' ? true : false,
        renderCell: params => {
          const allocationsOfAddedResource = Array.isArray(teamAllocations.result) && teamAllocations.result.filter(
            resource => resource.Resource === params.row.resourceId
          );
          const uniqueProjectNames = [
            ...new Set(
              allocationsOfAddedResource.map(item => item.ProjectName)
            ),
          ];

          if (params.row.hasProject && !params.row.project) {
            return (
              <AddRowButton
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
            return params.value;
          }
          return null;
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
        renderCell: params => {
          if (params.row.hasButton) {
            return (
              <AddRowButton
                project={params.row.project}
                handleAddRow={handleAddRow}
                buttonName={
                  groupBy === 'teams' ? 'Assign Allocation' : 'Add Resource'
                }
                onClick={event => {
                  setSelectedProject(params.row.project),
                    setSelectedTeam(params.row.teams);
                }}
              />
            );
          }
          if (params.value) {
            return <CustomAvatar value={params.value} showFullName={true} />;
          }
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
  headerClassName: 'prime-header',
});

export const getCellClassName = (params, updatedRows) => {
  if (params && params.field && typeof params.field === 'string') {
    if (
      params &&
      params.field &&
      typeof params.field === 'string' &&
      params.field.startsWith('W') &&
      params.rowNode?.type === 'group' &&
      params.rowNode?.groupingField === 'teams'
    ) {
      const projectName = params.rowNode.groupingKey;

      const projectRows = updatedRows.filter(row => row.teams === projectName);
      const totalRows = projectRows.length;

      const aggregatedValue = projectRows.reduce((sum, row) => {
        const weekValue = row[params.field];
        const numericValue =
          typeof weekValue === 'object' && weekValue !== null
            ? parseFloat(weekValue.value || 0)
            : parseFloat(weekValue || 0);
        return sum + numericValue;
      }, 0);

      const percentage = (aggregatedValue / totalRows) * 100;

      if (percentage === 0) {
        return 'firstGroupsRow';
      } else if (percentage <= 20) {
        return 'poor-allocation';
      } else if (percentage > 20 && percentage <= 50) {
        return 'average-allocation';
      } else if (percentage > 50) {
        return 'fully-occupied';
      }
    }
  }
  if (params.rowNode?.type === 'group') {
    return 'firstGroupsRow';
  }
  return '';
};

export const getInitialRowsState = (updatedRows, groupBy) => {
  const rowsWithTotalEffort = updatedRows.map(row => ({
    ...row,
    totalEffort: calculateTotalEffort(row),
  }));

  if (groupBy === 'project') {
    return [
      ...rowsWithTotalEffort,
      ...Array.from(new Set(rowsWithTotalEffort?.map(row => row.project))).map(
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
    ];
  } else if (groupBy === 'teams') {
    // Get unique teams for teams and teamsId to avoid duplicate teams
    let unique_teams = {};
    rowsWithTotalEffort.forEach(row => {
      if (row.teamsId && !unique_teams[row.teamsId])
        unique_teams[row.teamsId] = row.teams;
      else if (!unique_teams[row.teamsId]) unique_teams[row.teams] = row.teams;
    });

    return [
      ...rowsWithTotalEffort,
      ...Array.from(new Set(Object.keys(unique_teams))).map(
        teams => ({
          id: `${unique_teams?.[teams]}-add-resource`,
          project: '',
          teams: unique_teams?.[teams],
          teamsId: teams,
          resource: '',
          role: '',
          totalEffort: '',
          resourceId: '',
          hasButton: true,
          ...Object.keys(updatedRows[0])
            .filter(key => key.startsWith('W'))
            .reduce((acc, week) => {
              acc[week] = '';
              return acc;
            }, {}),
        })
      ),
    ];
  } else {
    return updatedRows;
  }
};
