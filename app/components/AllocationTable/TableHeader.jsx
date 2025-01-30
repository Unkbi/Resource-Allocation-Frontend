const getStartDate = () => {
  const now = new Date()
  now.setDate(now.getDate() - now.getDay() - 7) // Set to the start of the previous week (Sunday)
  return now
}

const getMonthYear = (date) => {
  return date.toLocaleString("default", { month: "short", year: "numeric" })
}

const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const generateWeeklyColumns = (startDate) => {
  return Array.from({ length: 20 }, (_, i) => {
    const date = addDays(startDate, i * 7)
    return {
      field: `W${i}`,
      headerName: `W${i}`,
      width: 80,
      editable: true,
    }
  })
}

const generateColumnGroupingModel = (startDate) => {
  const groups = []
  const currentDate = new Date(startDate)
  let currentMonthYear = getMonthYear(currentDate)
  let weekCounter = 0

  for (let i = 0; i < 20; i++) {
    const weekDate = addDays(startDate, i * 7)
    const weekMonthYear = getMonthYear(weekDate)

    if (weekMonthYear !== currentMonthYear) {
      groups.push({
        groupId: currentMonthYear,
        children: Array.from({ length: weekCounter }, (_, j) => ({ field: `W${i - weekCounter + j}` })),
      })
      currentMonthYear = weekMonthYear
      weekCounter = 0
    }

    weekCounter++

    // Handle the last month
    if (i === 19) {
      groups.push({
        groupId: currentMonthYear,
        children: Array.from({ length: weekCounter }, (_, j) => ({ field: `W${i - weekCounter + j + 1}` })),
      })
    }
  }

  return groups
}

const startDate = getStartDate()

export const columns = [
  // { field: "project", headerName: "Project Name", width: 250 },
  // { field: "resource", headerName: "Resource", width: 200, disableColumnMenu: true },
  // { field: "role", headerName: "Role", width: 200, disableColumnMenu: true },
  // { field: "totalEffort", headerName: "Total Effort", width: 150, disableColumnMenu: true },
  ...generateWeeklyColumns(startDate),
]

export const columnGroupingModel = generateColumnGroupingModel(startDate)

export const getAllColumnsWithWeek = (columns)=>{
  return [...columns, ...generateWeeklyColumns(startDate)]
}