import { getAllColumnsWithWeek } from '@/app/components/AllocationTable/TableHeader';
import { AddResourceButton } from '@/app/components/AllocationTable/AddResourceButton';
import CustomAvatar from '../Avatar/CustomAvatar';

export const getInitialState = (groupBy, updatedRows) => ({
  rowGrouping: {
    model: [groupBy],
  },
  sorting: {
    sortModel: [{ field: groupBy, sort: 'asc' }],
  },
  aggregation: {
    model: {
      totalEffort: 'sum',
      ...Object.keys(updatedRows[0])
        .filter(key => key.startsWith('W'))
        .reduce((acc, week) => {
          acc[week] = 'sum';
          return acc;
        }, {}),
    },
  },
  pinnedColumns: { left: [groupBy] },
});

export const getFinalColumns = (
  columns,
  groupBy,
  setSelectedProject,
  handleAddRow
) => {
  const allColumns = getAllColumnsWithWeek(columns);
  if (groupBy === 'teams') {
    return allColumns || [];
  } else if (groupBy === 'organization') {
    return allColumns || [];
  } else {
    return [
      ...(allColumns?.slice(0, 1) || []),
      {
        field: 'resource',
        headerName: 'Resource',
        width: 200,
        headerClassName: 'secondary-header',
        cellClassName: 'secondary-cell',
        renderCell: params => {
          if (params.row.hasButton) {
            return (
              <AddResourceButton
                project={params.row.project}
                handleAddRow={handleAddRow}
                onClick={event => {
                  setSelectedProject(params.row.project);
                }}
              />
            );
          }
          if (params.value) {
            return <CustomAvatar value={params.value} showFullName={true} />;
          }
          // if (params.value?.value !== undefined) {
          //   return params.value.value;
          // }
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
});

export const getCellClassName = (params, updatedRows) => {
  if (params && params.field && typeof params.field === 'string') {
    if (
      params &&
      params.field &&
      typeof params.field === 'string' &&
      params.field.startsWith('W') &&
      params.rowNode?.type === 'group' &&
      params.rowNode?.groupingField === 'project'
    ) {
      const projectName = params.rowNode.groupingKey;

      const projectRows = updatedRows.filter(
        row => row.project === projectName
      );

      const totalRows = projectRows.length;

      const aggregatedValue = projectRows.reduce((sum, row) => {
        return sum + (row[params.field] || 0);
      }, 0);

      const percentage = (aggregatedValue / totalRows) * 100;

      if (percentage === 0) {
        return '';
      } else if (percentage <= 20) {
        return 'poor-allocation';
      } else if (percentage > 20 && percentage <= 50) {
        return 'average-allocation';
      } else if (percentage > 50) {
        return 'fully-occupied';
      }
    }
  }
  return '';
};
