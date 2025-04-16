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
  format,
  isSameWeek,
  parseISO,
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

const createValueHandlers = dispatch => ({
  valueParser: value => {
    const parsed = parseFloat(
      value.replace(/[^0-9.]/g, '').replace(/(?<=\..*)\./g, '')
    );
    return isNaN(parsed) ? null : parsed;
  },

  valueFormatter: value => {
    if (!value) {
      return value;
    }
    if (typeof value === 'number') {
      return value.toFixed(1);
    }
    return value;
  },
  valueGetter: params => {
    return params?.value ?? null;
  },

  preProcessEditCellProps: params => {
    const { props } = params;
    let numericValue = parseFloat(props.value) || 0;
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

export const generateWeeklyColumns = (startDate, endDate, dispatch) => {
  const isoStart = parseISO(startDate);
  const isoEnd = parseISO(endDate);
  const currentDate = new Date();

  const totalWeeks = differenceInCalendarWeeks(isoEnd, isoStart) + 1; // inclusive

  return Array.from({ length: totalWeeks }, (_, i) => {
    const weekDate = addWeeks(isoStart, i);
    const isCurrentWeek = isSameWeek(weekDate, currentDate, {
      weekStartsOn: 1,
    });

    return {
      ...createBaseColumnConfig(weekDate, isCurrentWeek),
      ...(dispatch ? createValueHandlers(dispatch) : {}),
    };
  });
};

export const generateColumnGroupingModel = (startDate, allColumns) => {
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

  for (let i = 0; i < WEEK_CONFIG.TOTAL_WEEKS; i++) {
    const weekDate = addWeeks(startDate, i);
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
  endDate
) => {
  return [
    ...existingColumns,
    ...generateWeeklyColumns(startDate, endDate, dispatch),
  ];
};

export const aggregationModel = (startDate, endDate) => {
  return generateWeeklyColumns(startDate, endDate)
    .filter(column => column.field.startsWith('W'))
    .reduce((acc, { field }) => ({ ...acc, [field]: 'sum' }), {});
};
