import { getAllColumnsWithWeek } from "@/app/components/AllocationTable/TableHeader"
import { AddResourceButton } from "@/app/components/AllocationTable/AddResourceButton"

export const getInitialState = (groupBy, updatedRows) => ({
  rowGrouping: {
    model: [groupBy],
  },
  sorting: {
    sortModel: [{ field: groupBy, sort: "asc" }],
  },
  aggregation: {
    model: {
      totalEffort: "sum",
      ...Object.keys(updatedRows[0])
        .filter((key) => key.startsWith("W"))
        .reduce((acc, week) => {
          acc[week] = "sum"
          return acc
        }, {}),
    },
  },
  pinnedColumns: { left: [groupBy] },
})

export const getTogglableColumns = (columns, groupBy) => {
  const showField = columns.map((col) => col.field)
  return columns.filter((column) => showField.includes(column.field) && column.field !== groupBy).map((column) => column.field)
}

export const getFinalColumns = (columns, groupBy, setSelectedProject, handleAddRow) => {

  const allColumns = getAllColumnsWithWeek(columns)
  if(groupBy === 'teams') {
    return allColumns || []
  } else if(groupBy === "organization") {
    return allColumns || []
  } else {
    return [
      ...(allColumns?.slice(0, 1) || []),
      {
        field: "resource",
        headerName: "Resource",
        width: 200,
        headerClassName: "secondary-header",
        cellClassName: "secondary-cell",
        renderCell: (params) => {
          if (params.row.hasButton) {
            return (
              <AddResourceButton
                project={params.row.project}
                handleAddRow = {handleAddRow}
                onClick={(event)=>{setSelectedProject(params.row.project)}}
              />
            )
          }
          return <span>{params.value}</span>
        },
      },
      ...(allColumns?.slice(1) || []),
    ]
  }
}

export const groupPage = (groupBy) => {
  const groupPages = {
    project: "Project",
    teams: "Teams",
    organization: "Organization"
  };
  return groupPages[groupBy];
};

export const getGroupingColDef = (groupBy) => ({
  headerName: groupPage(groupBy),
  renderHeader: () => groupPage(groupBy),
  renderCell: (params) => params.value,
});

// export const processRowUpdate = (newRow) => {
//   const weeklyTotal = Object.keys(newRow)
//     .filter((key) => key.startsWith("W"))
//     .reduce((sum, week) => sum + (Number(newRow[week]) || 0), 0)

//   return { ...newRow, totalEffort: weeklyTotal }
// }

