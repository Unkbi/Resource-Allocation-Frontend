"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregationModel = exports.getAllColumnsWithWeek = exports.generateColumnGroupingModel = exports.generateWeeklyColumns = exports.getStartDate = void 0;
const clsx_1 = __importDefault(require("clsx"));
const common_1 = require("@/app/utils/common");
const constants_1 = require("@/app/constants/constants");
const toastAction_1 = require("@/app/redux/actions/toastAction");
const date_fns_1 = require("date-fns");
const WEEK_CONFIG = {
    TOTAL_WEEKS: constants_1.TOTAL_FUTURE_WEEKS + 1,
    COLUMN_WIDTH: 50,
    MAX_VALUE: 2,
    DECIMAL_PRECISION: 1,
};
const getStartDate = () => (0, common_1.getStartOfPreviousWeek)(new Date());
exports.getStartDate = getStartDate;
const createBaseColumnConfig = (weekDate, isCurrentWeek) => ({
    field: (0, common_1.getWeekNumber)(weekDate),
    headerName: (0, common_1.getWeekNumber)(weekDate),
    width: WEEK_CONFIG.COLUMN_WIDTH,
    type: 'number',
    editable: true,
    filterable: false,
    sortable: false,
    disableColumnMenu: true,
    headerClassName: (0, clsx_1.default)('weekly-header', {
        'current-week-header': isCurrentWeek,
    }),
    cellClassName: params => params.value == null ? 'weeklyCell' : (0, clsx_1.default)('super-app', 'weeklyCell'),
});
const createValueHandlers = dispatch => ({
    valueParser: value => {
        const parsed = parseFloat(value.replace(/[^0-9.]/g, '').replace(/(?<=\..*)\./g, ''));
        return isNaN(parsed) ? null : parsed;
    },
    valueFormatter: (value) => {
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
            dispatch((0, toastAction_1.showToastAction)(true, 'Invalid input. Please enter a number between 0 and 2.', 'error'));
            if (!className) {
                className = (0, clsx_1.default)(className, 'errorCell');
            }
        }
        else if (formattedValue < 2) {
            className = className.replace('errorCell', '').trim();
        }
        else {
            className = '';
        }
        return {
            ...props,
            value: formattedValue,
            className: className,
        };
    },
});
const generateWeeklyColumns = (startDate, endDate, dispatch) => {
    const isoStart = (0, date_fns_1.parseISO)(startDate);
    const isoEnd = (0, date_fns_1.parseISO)(endDate);
    const currentWeekIndex = (0, date_fns_1.differenceInWeeks)(isoStart, isoEnd);
    return Array.from({ length: WEEK_CONFIG.TOTAL_WEEKS }, (_, i) => {
        const weekDate = (0, date_fns_1.addWeeks)(isoStart, i);
        return {
            ...createBaseColumnConfig(weekDate, i === currentWeekIndex),
            ...(dispatch ? createValueHandlers(dispatch) : {}),
        };
    });
};
exports.generateWeeklyColumns = generateWeeklyColumns;
const generateColumnGroupingModel = (startDate, allColumns) => {
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
        const weekDate = (0, date_fns_1.addWeeks)(startDate, i);
        const monthYear = (0, common_1.formatDate)(weekDate, constants_1.DISPLAY_DATE_FORMAT);
        if (!currentGroup || currentGroup.groupId !== monthYear) {
            currentGroup && groups.push(currentGroup);
            currentGroup = {
                groupId: monthYear,
                headerClassName: 'grouping-header',
                children: [],
            };
        }
        currentGroup.children.push({ field: (0, common_1.getWeekNumber)(weekDate) });
    }
    currentGroup && groups.push(currentGroup);
    return groups;
};
exports.generateColumnGroupingModel = generateColumnGroupingModel;
const getAllColumnsWithWeek = (existingColumns = [], dispatch, startDate, endDate) => [
    ...existingColumns,
    ...(0, exports.generateWeeklyColumns)(startDate, endDate, dispatch),
];
exports.getAllColumnsWithWeek = getAllColumnsWithWeek;
const aggregationModel = (startDate, endDate) => {
    return (0, exports.generateWeeklyColumns)(startDate, endDate)
        .filter(column => column.field.startsWith('W'))
        .reduce((acc, { field }) => ({ ...acc, [field]: 'sum' }), {});
    ;
};
exports.aggregationModel = aggregationModel;
