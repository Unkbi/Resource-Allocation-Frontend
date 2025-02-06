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

// export const processRowUpdate = (newRow) => {
//   const weeklyTotal = Object.keys(newRow)
//     .filter((key) => key.startsWith("W"))
//     .reduce((sum, week) => sum + (Number(newRow[week]) || 0), 0)

//   return { ...newRow, totalEffort: weeklyTotal }
// }

export const getCellClassName = params => {
  console.log('params.formattedValue', params);

  if (params && params.field && typeof params.field === 'string') {
    if (
      params.field.startsWith('W') &&
      params.rowNode.type === 'group' &&
      params.rowNode.groupingField === 'project'
    ) {
      if (params.formattedValue === 0.2) {
        return 'poor-allocation';
      } else if (params.formattedValue >= 0.5) {
        return 'average-allocation';
      } else if (params.formattedValue < 0.9) {
        return 'fully-occupied';
      } else if (params.formattedValue === 0 && params.formattedValue === '') {
        return '';
      } else {
        return '';
      }
    }
  }
  return '';
};
