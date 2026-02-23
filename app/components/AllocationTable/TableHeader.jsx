import clsx from 'clsx';
import {
  getWeekNumber,
  isWeekKey,
  formatDate,
  getStartOfPreviousWeek,
} from '@/app/utils/common';
import {
  DATE_FORMAT,
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
  getWeek,
  getMonth,
  getYear,
  isSameWeek,
  parseISO,
  startOfWeek,
} from 'date-fns';
import {
  formatMin1Max2,
  normalizeAllocationValue,
} from '@/app/utils/actualsUtils';

const WEEK_CONFIG = {
  TOTAL_WEEKS: TOTAL_FUTURE_WEEKS + 1,
  COLUMN_WIDTH: 50,
  MAX_VALUE: 2,
  DECIMAL_PRECISION: 2,
};

export const getStartDate = () => getStartOfPreviousWeek(new Date());

const createBaseColumnConfig = (weekDate, isCurrentWeek) => ({
  field: getWeekNumber(weekDate),
  // Keep the visible header short (legacy format like "W1") while the
  // internal `field` remains canonical (e.g. "W1-2026"). This prevents the
  // UI label from showing the ISO-year while preserving canonical keys.
  headerName: String(getWeekNumber(weekDate)).split('-')[0],
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

const createValueHandlers = (
  dispatch,
  isFormatWithK,
  scalarSettings = null
) => ({
  valueParser: value => {
    const parsed = parseFloat(
      value.replace(/[^0-9.]/g, '').replace(/(?<=\..*)\./g, '')
    );
    return isNaN(parsed) ? null : parsed;
  },

  valueFormatter: value => {
    if (value == null || value === '') return '';

    const num =
      typeof value === 'number'
        ? normalizeAllocationValue(value)
        : normalizeAllocationValue(parseFloat(value));

    if (isNaN(num)) return '';

    return isFormatWithK ? `${formatMin1Max2(num)}k` : formatMin1Max2(num);
  },
  valueGetter: params => {
    return params?.value ?? null;
  },

  preProcessEditCellProps: params => {
    const { props } = params;
    const rawValue = props?.value;

    let className = props?.className || '';

    // Preserve empty values
    if (rawValue === '' || rawValue === null || rawValue === undefined) {
      return {
        ...props,
        value: null,
        className: className.replace('errorCell', '').trim(),
      };
    }

    const numericValue = parseFloat(rawValue);

    // If invalid number, keep it empty
    if (isNaN(numericValue)) {
      return {
        ...props,
        value: null,
        className: className.replace('errorCell', '').trim(),
      };
    }

    const formattedValue = normalizeAllocationValue(numericValue);
    const hasError =
      formattedValue > Number(scalarSettings?.Max_Allocation_Error || '2.0');

    if (hasError) {
      dispatch(
        showToastAction(
          true,
          `Invalid input. Please enter a number between 0 and ${scalarSettings?.Max_Allocation_Error || '2.0'}.`,
          'error'
        )
      );

      className = clsx(className, 'errorCell');
    } else {
      className = className.replace('errorCell', '').trim();
    }

    return {
      ...props,
      value: formattedValue,
      className,
    };
  },
});

export const generateWeeklyColumns = (
  startDate,
  endDate,
  dispatch,
  isFormatWithK,
  scalarSettings = null
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
      ...(dispatch
        ? createValueHandlers(dispatch, isFormatWithK, scalarSettings)
        : {}),
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
    const weekDate = addWeeks(adjustedStart, i);
    const weekNum = getWeek(weekDate, { weekStartsOn: 1 });
    const weekMonth = getMonth(weekDate); // 0-11, where 11 = December
    const weekYear = getYear(weekDate);

    // If Week 1 starts in December, it belongs to January of the next year
    let monthYear;
    if (weekNum === 1 && weekMonth === 11) {
      // Week 1 in December belongs to January of next year
      const nextYearDate = new Date(weekYear + 1, 0, 1); // January 1st of next year
      monthYear = formatDate(nextYearDate, DISPLAY_DATE_FORMAT);
    } else {
      monthYear = formatDate(weekDate, DISPLAY_DATE_FORMAT);
    }

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
  isFormatWithK,
  scalarSettings
) => {
  return [
    ...existingColumns,
    ...generateWeeklyColumns(
      startDate,
      endDate,
      dispatch,
      isFormatWithK,
      scalarSettings
    ),
  ];
};

export const aggregationModel = (startDate, endDate, isFormatWithK) => {
  return generateWeeklyColumns(startDate, endDate, undefined, isFormatWithK)
    .filter(column => isWeekKey(column.field))
    .reduce((acc, { field }) => ({ ...acc, [field]: 'sum' }), {});
};
