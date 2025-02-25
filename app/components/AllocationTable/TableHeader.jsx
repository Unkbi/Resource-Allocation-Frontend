import clsx from 'clsx';
import { getWeekNumber } from '@/app/utils/common';
import { TOTAL_FUTURE_WEEKS } from '@/app/constants/constants';
import { showToastAction } from '@/app/redux/actions/toastAction';

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

export const generateWeeklyColumns = (startDate, dispatch) => {
  const currentWeekIndex = getCurrentWeekIndex(startDate);
  return Array.from({ length: WEEK_COUNT }, (_, i) => {
    const isCurrentWeek = i === currentWeekIndex;
    return {
      field: getWeekNumber(addDays(startDate, i * 7)),
      headerName: getWeekNumber(addDays(startDate, i * 7)),
      width: 50,
      type: 'number',
      valueParser: value => {
        let parsedValue = value
          .replace(/[^0-9.]/g, '')
          .replace(/(?<=\..*)\./g, '');
        let numericValue = parseFloat(parsedValue) || null;
        return numericValue;
      },
      preProcessEditCellProps: params => {
        const { props } = params;
        let numericValue = parseFloat(props.value) || 0;
        const formattedValue = Math.round(numericValue * 10) / 10;
        const hasError = formattedValue > 2;
        if (hasError) {
          dispatch(
            showToastAction(
              true,
              'Invalid input. Please enter a number between 0 and 2.',
              'error'
            )
          );
        }
        let className = props.className || '';
        if (hasError) {
          className = clsx(className, 'errorCell');
        } else if (formattedValue < 2) {
          className = className.replace('errorCell', '').trim();
        } else {
          className = '';
        }

        return {
          ...props,
          value: formattedValue,
          className: className,
        };
      },
      valueFormatter: params => {
        const value = Number(params);
        return value !== 0 ? Math.round(value * 10) / 10 : '';
      },
      valueGetter: params => {
        if (
          params?.value &&
          typeof params === 'object' &&
          params?.value !== undefined
        ) {
          return Math.round(params.value * 10) / 10;
        } else {
          return null;
        }
      },
      editable: true,
      filterable: false,
      headerClassName: clsx('weekly-header', {
        'current-week-header': isCurrentWeek,
      }),
      cellClassName: params => {
        if (params.value == null) {
          return 'weeklyCell';
        }

        return clsx('super-app', {
          weeklyCell: 'weeklyCell',
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
          headerClassName: 'grouping-header',
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
        headerClassName: 'grouping-header',
        children: weekFields.map(field => ({ field })),
      });
    }
  }

  return groups;
};

const startDate = getStartDate();
export const columns = [...generateWeeklyColumns(startDate)];
export const columnGroupingModel = generateColumnGroupingModel(startDate);
export const getAllColumnsWithWeek = (columns, dispatch) => {
  return [...columns, ...generateWeeklyColumns(startDate, dispatch)];
};

const allWeekColumns = generateWeeklyColumns(startDate);

export const aggregationModel = allWeekColumns
  .filter(column => column.field.startsWith('W'))
  .reduce((acc, column) => {
    acc[column.field] = 'sum';
    return acc;
  }, {});
