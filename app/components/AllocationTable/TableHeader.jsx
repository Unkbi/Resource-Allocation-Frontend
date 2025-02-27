import clsx from 'clsx';
import {
  getWeekNumber,
  addWeeks,
  formatDate,
  getStartOfPreviousWeek,
  getWeeksDifference,
} from '@/app/utils/common';
import {
  TOTAL_FUTURE_WEEKS,
  VALIDATION_LIMITS,
} from '@/app/constants/constants';
import { showToastAction } from '@/app/redux/actions/toastAction';

const WEEK_CONFIG = {
  TOTAL_WEEKS: TOTAL_FUTURE_WEEKS + 2,
  COLUMN_WIDTH: 50,
  MAX_VALUE: 2,
  DECIMAL_PRECISION: 1,
};

const getStartDate = () => getStartOfPreviousWeek(new Date());

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
    return isNaN(parsed) ? 0 : parsed;
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

  preProcessEditCellProps: params => {
    const { props } = params;
    let numericValue = parseFloat(props.value) || 0;
    const formattedValue = Math.round(numericValue * 10) / 10;
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
      value: formattedValue !== 0 ? formattedValue : null,
      className: className,
    };
  },
});

export const generateWeeklyColumns = (startDate, dispatch) => {
  const currentWeekIndex = getWeeksDifference(startDate, new Date());

  return Array.from({ length: WEEK_CONFIG.TOTAL_WEEKS }, (_, i) => {
    const weekDate = addWeeks(startDate, i);
    return {
      ...createBaseColumnConfig(weekDate, i === currentWeekIndex),
      ...(dispatch ? createValueHandlers(dispatch) : {}),
    };
  });
};

const generateColumnGroupingModel = startDate => {
  const groups = [];
  let currentGroup = null;

  for (let i = 0; i < WEEK_CONFIG.TOTAL_WEEKS; i++) {
    const weekDate = addWeeks(startDate, i);
    const monthYear = formatDate(weekDate, 'MMM yyyy');

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

const startDate = getStartDate();

export const columns = generateWeeklyColumns(startDate);
export const columnGroupingModel = generateColumnGroupingModel(startDate);

export const getAllColumnsWithWeek = (existingColumns = [], dispatch) => [
  ...existingColumns,
  ...generateWeeklyColumns(startDate, dispatch),
];

export const aggregationModel = columns
  .filter(column => column.field.startsWith('W'))
  .reduce((acc, { field }) => ({ ...acc, [field]: 'sum' }), {});
