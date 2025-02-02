import clsx from "clsx";

const getStartDate = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust day
  now.setDate(diff);
  now.setDate(now.getDate() - 7); // back to previous week
  return now;
};

const getMonthYear = (date) => {
  return date.toLocaleString("default", { month: "short", year: "numeric" });
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const generateWeeklyColumns = (startDate) => {
  return Array.from({ length: 20 }, (_, i) => {
    const date = addDays(startDate, i * 7);
    return {
      field: `W${i}`,
      headerName: `W${i}`,
      width: 80,
      editable: true,
      type: "number",
      headerClassName: 'weekly-header',
      cellClassName: 'weekly-cell',
      disableColumnMenu: true,
      sortable: false,
    };
  });
};

const generateColumnGroupingModel = (startDate) => {
  const groups = [];
  const currentDate = new Date(startDate);
  let currentMonthYear = getMonthYear(currentDate);
  let weekCounter = 0;

  for (let i = 0; i < 20; i++) {
    const weekDate = addDays(startDate, i * 7);
    const weekMonthYear = getMonthYear(weekDate);

    if (weekMonthYear !== currentMonthYear) {
      groups.push({
        groupId: currentMonthYear,
        children: Array.from({ length: weekCounter }, (_, j) => ({ field: `W${i - weekCounter + j}` })),
      });
      currentMonthYear = weekMonthYear;
      weekCounter = 0;
    }

    weekCounter++;

    if (i === 19) {
      groups.push({
        groupId: currentMonthYear,
        children: Array.from({ length: weekCounter }, (_, j) => ({ field: `W${i - weekCounter + j + 1}` })),
      });
    }
  }

  return groups;
};

const startDate = getStartDate();
export const columns = [...generateWeeklyColumns(startDate)];
export const columnGroupingModel = generateColumnGroupingModel(startDate);
export const getAllColumnsWithWeek = (columns) => {
  return [...columns, ...generateWeeklyColumns(startDate)];
};
