import clsx from 'clsx';
import {
  getWeekNumber,
  formatDate,
  getStartOfPreviousWeek,
} from '@/app/utils/common';
import {
  DISPLAY_DATE_FORMAT,
  TOTAL_FUTURE_WEEKS,
} from '@/app/constants/constants';
import { showToastAction } from '@/app/redux/actions/toastAction';
import {
  addWeeks,
  differenceInCalendarWeeks,
  differenceInWeeks,
  endOfWeek,
  format,
  isSameWeek,
  parseISO,
  startOfWeek,
} from 'date-fns';

const WEEK_CONFIG = {
  TOTAL_WEEKS: TOTAL_FUTURE_WEEKS + 1,
  COLUMN_WIDTH: 50,
  MAX_VALUE: 2,
  DECIMAL_PRECISION: 1,
};

export const getStartDate = () => getStartOfPreviousWeek(new Date());

const createBaseColumnConfig = (weekDate, isCurrentWeek) => ({
  field: getWeekNumber(weekDate),
  headerName: getWeekNumber(weekDate),
  width: WEEK_CONFIG.COLUMN_WIDTH,
  type: 'number',
  editable: true,
  filterable: false,
  sortable: false,
  disableColumnMenu: true,
  headerClassName: clsx('weekly-header', {
    'current-week-header': isCurrentWeek,
  }),
  cellClassName: params =>
    params.value == null ? 'weeklyCell' : clsx('super-app', 'weeklyCell'),
});

const createValueHandlers = (dispatch, isFormatWithK) => ({
  valueParser: value => {
    const parsed = parseFloat(
      value.replace(/[^0-9.]/g, '').replace(/(?<=\..*)\./g, '')
    );
    return isNaN(parsed) ? null : parsed;
  },

  valueFormatter: value => {
    if (value == null || value === '') return '';
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num)
      ? ''
      : isFormatWithK
        ? `${num.toFixed(1)}k`
        : num.toFixed(1);
  },
  valueGetter: params => {
    return params?.value ?? null;
  },

  preProcessEditCellProps: params => {
    const { props } = params;
    let numericValue = parseFloat(props?.value) || 0;
    const formattedValue = Math.round(numericValue * 10) / 10 || null;
    const hasError = formattedValue > 2;

    let className = props.className || '';
    if (hasError) {
      dispatch(
        showToastAction(
          true,
          'Invalid input. Please enter a number between 0 and 2.',
          'error'
        )
      );
      if (!className) {
        className = clsx(className, 'errorCell');
      }
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
});

export const generateWeeklyColumns = (
  startDate,
  endDate,
  dispatch,
  isFormatWithK
) => {
  const isoStart = parseISO(startDate);
  const isoEnd = parseISO(endDate);
  const currentDate = new Date();

  // calculate start date to the Monday
  const adjustedStart = startOfWeek(isoStart, { weekStartsOn: 1 });
  // calculate end date to the following Sunday
  const adjustedEnd = endOfWeek(isoEnd, { weekStartsOn: 1 });

  // Calculate total weeks between start and end dates
  const totalWeeks = isSameWeek(adjustedEnd, adjustedStart, { weekStartsOn: 1 })
    ? 1
    : differenceInCalendarWeeks(adjustedEnd, adjustedStart, {
        weekStartsOn: 1,
      }) + 1;

  return Array.from({ length: totalWeeks }, (_, i) => {
    const weekStartDate = addWeeks(adjustedStart, i);
    const isCurrentWeek = isSameWeek(weekStartDate, currentDate, {
      weekStartsOn: 1,
    });

    return {
      ...createBaseColumnConfig(weekStartDate, isCurrentWeek),
      ...(dispatch ? createValueHandlers(dispatch, isFormatWithK) : {}),
    };
  });
};

export const generateColumnGroupingModel = (startDate, endDate, allColumns) => {
  const nonWeeklyColumns = allColumns.filter(column => column.primaryColumn);
  const groups = [];
  let currentGroup = null;
  nonWeeklyColumns.forEach(column => {
    groups.push({
      groupId: `empty-group-${column.field}`,
      headerClassName: 'empty-group-header',
      headerName: '',
      children: [{ field: column.field, headerName: '' }],
    });
  });

  // Caculate the weeks difference between start and end dates. For column header grouping ("Apr 2023", "May 2023", etc.)
  const isoStart = parseISO(startDate);
  const isoEnd = parseISO(endDate);

  // calculate start date to the Monday
  const adjustedStart = startOfWeek(isoStart, { weekStartsOn: 1 });
  // calculate end date to the following Sunday
  const adjustedEnd = endOfWeek(isoEnd, { weekStartsOn: 1 });

  // Calculate total weeks between start and end dates
  const totalWeeks = isSameWeek(adjustedEnd, adjustedStart, { weekStartsOn: 1 })
    ? 1
    : differenceInCalendarWeeks(adjustedEnd, adjustedStart, {
        weekStartsOn: 1,
      }) + 1;

  for (let i = 0; i < totalWeeks; i++) {
    const weekDate = addWeeks(isoStart, i);
    const monthYear = formatDate(weekDate, DISPLAY_DATE_FORMAT);

    if (!currentGroup || currentGroup.groupId !== monthYear) {
      currentGroup && groups.push(currentGroup);
      currentGroup = {
        groupId: monthYear,
        headerClassName: 'grouping-header',
        children: [],
      };
    }

    currentGroup.children.push({ field: getWeekNumber(weekDate) });
  }

  currentGroup && groups.push(currentGroup);
  return groups;
};

export const getAllColumnsWithWeek = (
  existingColumns = [],
  dispatch,
  startDate,
  endDate,
  isFormatWithK
) => {
  return [
    ...existingColumns,
    ...generateWeeklyColumns(startDate, endDate, dispatch, isFormatWithK),
  ];
};

export const aggregationModel = (startDate, endDate, isFormatWithK) => {
  return generateWeeklyColumns(startDate, endDate, undefined, isFormatWithK)
    .filter(column => /^W\d+/.test(column.field))
    .reduce((acc, { field }) => ({ ...acc, [field]: 'sum' }), {});
};
