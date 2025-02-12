import clsx from 'clsx';
import { getWeekNumber } from '@/app/utils/common';
import { TOTAL_FUTURE_WEEKS } from '@/app/constants/constants';

const WEEK_COUNT = TOTAL_FUTURE_WEEKS + 2;
const getStartDate = () => {
  const now = new Date();
  const day = now.getDay();
  // Adjust starting day of the week
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  now.setDate(diff);
  now.setDate(now.getDate() - 7);
  return now;
};

const getMonthYear = date => {
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
const getCurrentWeekIndex = startDate => {
  const today = new Date();
  const diffTime = today - startDate;
  return Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
};
const generateWeeklyColumns = startDate => {
  const currentWeekIndex = getCurrentWeekIndex(startDate);
  return Array.from({ length: WEEK_COUNT }, (_, i) => {
    const date = addDays(startDate, i * 7);
    const isCurrentWeek = i === currentWeekIndex;
    return {
      field: getWeekNumber(addDays(startDate, i * 7)),
      headerName: getWeekNumber(addDays(startDate, i * 7)),
      width: 50,
      valueGetter: params => {
        if (
          params?.value &&
          typeof params === 'object' &&
          params?.value !== undefined
        ) {
          return params.value;
        } else {
          return params;
        }
      },
      editable: true,
      type: 'number',
      filterable: false,
      headerClassName: clsx('weekly-header', {
        'current-week-header': isCurrentWeek,
      }),
      cellClassName: params => {
        if (params.value == null) {
          return '';
        }

        return clsx('super-app', {
          weeklyCell: 'weeklyCell',
          negative: params.value < 0,
          positive: params.value > 0,
        });
      },
      disableColumnMenu: true,
      sortable: false,
    };
  });
};

const generateColumnGroupingModel = startDate => {
  const groups = [];
  const currentDate = new Date(startDate);
  let currentMonthYear = getMonthYear(currentDate);
  let weekFields = [];

  for (let i = 0; i < WEEK_COUNT; i++) {
    const weekDate = addDays(startDate, i * 7);
    const weekMonthYear = getMonthYear(weekDate);

    if (weekMonthYear !== currentMonthYear) {
      if (weekFields.length > 0) {
        groups.push({
          groupId: currentMonthYear,
          children: weekFields.map(field => ({ field })),
        });
      }
      currentMonthYear = weekMonthYear;
      weekFields = [];
    }

    weekFields.push(getWeekNumber(addDays(startDate, i * 7)));
    if (i + 1 === WEEK_COUNT) {
      groups.push({
        groupId: currentMonthYear,
        children: weekFields.map(field => ({ field })),
      });
    }
  }

  return groups;
};

const startDate = getStartDate();
export const columns = [...generateWeeklyColumns(startDate)];
export const columnGroupingModel = generateColumnGroupingModel(startDate);
export const getAllColumnsWithWeek = columns => {
  return [...columns, ...generateWeeklyColumns(startDate)];
};
