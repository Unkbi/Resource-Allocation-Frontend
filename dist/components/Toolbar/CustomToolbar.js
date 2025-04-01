"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const react_redux_1 = require("react-redux");
const allocationViewAction_1 = require("@/app/redux/actions/allocationViewAction");
const x_data_grid_1 = require("@mui/x-data-grid");
const CustomExport_1 = __importDefault(require("./CustomExport"));
const common_1 = require("@/app/utils/common");
const teamsReducer_1 = require("@/app/redux/reducers/teamsReducer");
const projectsReducer_1 = require("@/app/redux/reducers/projectsReducer");
const constants_1 = require("@/app/constants/constants");
const date_fns_1 = require("date-fns");
const ToolBox1 = (0, material_1.styled)(material_1.Box)(({ theme }) => ({
    display: 'flex',
    width: '240px',
    padding: '7px 14px 5px 14px',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRight: '#DDE1E4 solid 1px',
    '& .viewFilterBlock': {
        backgroundColor: '#FFFFFF',
        border: '1px solid #D6DCE1',
        borderRadius: '4px',
        boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.02)',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        '& button': {
            padding: '3px 5px',
            borderLeft: '1px solid #D6DCE1',
            height: '100%',
            borderRadius: '0',
            minWidth: '34px',
            '&.selected': {
                backgroundColor: '#344665',
                borderRadius: '4px',
                margin: '-1px',
                position: 'relative',
                zIndex: '1',
                height: '32px',
                color: '#fff',
            },
            '&:first-child': {
                border: 'none',
            },
            '& span': {
                margin: '0',
            },
        },
    },
    '& .projectDropdown': {
        color: '#313F68',
        fontFamily: "'Manrope', serif",
        fontWeight: '800',
        fontSize: '15px',
        '& .MuiSelect-select': {
            paddingLeft: '0',
        },
    },
}));
const ToolBox2 = (0, material_1.styled)(material_1.Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '7px 14px 5px 14px',
    '& .filterColBlock': {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        '& button': {
            backgroundColor: 'rgba(242, 245, 250, 0.3)',
            border: '1px solid #D6DCE1',
            borderRadius: '4px',
            height: '32px',
            padding: '5px 12px',
            fontSize: '13px',
            color: '#212121',
            fontFamily: "'Manrope', serif",
            fontWeight: '600',
            textTransform: 'none',
        },
    },
    '& .dayWeekBlock': {
        backgroundColor: 'rgba(242, 245, 250, 0.3)',
        border: '1px solid #D6DCE1',
        borderRadius: '4px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        '& button': {
            color: '#757575',
            fontFamily: "'Manrope', serif",
            fontWeight: '500',
            fontSize: '13px',
            lineHeight: '16px',
            textAlign: 'center',
            textTransform: 'none',
            height: '100%',
            '&.selected': {
                color: '#212121',
                fontWeight: '600',
                backgroundColor: '#fff',
                borderLeft: '1px solid #D6DCE1',
                borderRight: '1px solid #D6DCE1',
                borderRadius: '4px',
            },
        },
    },
    '& .projectIcon': {
        backgroundColor: 'rgba(242, 245, 250, 0.3)',
        border: '1px solid #D6DCE1',
        borderRadius: '4px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        '& button': {
            color: '#757575',
            fontFamily: "'Manrope', serif",
            fontWeight: '500',
            fontSize: '13px',
            lineHeight: '16px',
            textAlign: 'center',
            textTransform: 'none',
            borderLeft: '1px solid #D6DCE1',
            width: '36px',
            minWidth: '36px',
            height: '100%',
            borderRadius: '0',
            '& .MuiSvgIcon-fontSize18': {
                fontSize: '18px',
            },
            '& svg': {
                fontSize: '24px',
            },
            '&.selected': {
                color: '#212121',
                fontWeight: '600',
                backgroundColor: '#fff',
                borderRadius: '0',
            },
        },
    },
    '& .selectedDate': {
        backgroundColor: '#FFFFFF',
        border: '1px solid #D6DCE1',
        borderRadius: '4px',
        height: '32px',
        color: '#212121',
        fontFamily: "'Manrope', serif",
        fontWeight: '600',
        fontSize: '12px',
        lineHeight: '14px',
        textAlign: 'center',
        textTransform: 'none',
    },
    '& .nextPrevIcon': {
        backgroundColor: 'rgba(242, 245, 250, 0.3)',
        border: '1px solid #D6DCE1',
        borderRadius: '4px',
        height: '32px',
    },
}));
const StyledMenuItem = (0, material_1.styled)(material_1.MenuItem)(({ theme }) => ({
    padding: '10px 12px',
    color: '#212121',
    fontFamily: "'Manrope', serif",
    fontWeight: '400',
    fontSize: '13px',
    '&:hover': {
        backgroundColor: 'rgb(52 70 101 / 2%) !important',
    },
    '&.Mui-selected': {
        backgroundColor: 'rgb(52 70 101 / 2%) !important',
        fontWeight: '600',
    },
}));
const CustomToolbar = react_1.default.memo(({ setFilterButtonEl }) => {
    const dispatch = (0, react_redux_1.useDispatch)();
    const view = (0, react_redux_1.useSelector)(state => state.allocationView.view);
    const { calendarDate: teamsCalendar } = (0, react_redux_1.useSelector)(state => state.teams);
    const { calendarDate: projectsCalendar } = (0, react_redux_1.useSelector)(state => state.projects);
    const { startDate, endDate } = (0, common_1.getStartAndEndDateForView)(view, projectsCalendar, teamsCalendar);
    const viewOptions = [
        'Teams',
        'Projects',
        // 'Organizations'
    ];
    const [active, setActive] = (0, react_1.useState)(false);
    const first = (0, common_1.generateFirstAndLastMonthYear)((0, date_fns_1.parseISO)(startDate), 'MMM yy', true);
    const last = (0, common_1.generateFirstAndLastMonthYear)((0, date_fns_1.parseISO)(endDate), 'MMM yy', true);
    const handleViewChange = (0, react_1.useCallback)(event => {
        dispatch((0, allocationViewAction_1.performChangeView)(event.target.value));
    }, [dispatch]);
    const handleClick = () => {
        setActive(prev => !prev);
    };
    const changeCalendarDate = (type) => {
        const isTeams = view === 'Teams';
        const isNext = type === 'next';
        const action = isTeams ? teamsReducer_1.updateStartAndEndDate : projectsReducer_1.updateProjectStartAndEndDate;
        const startKey = (0, common_1.generateFirstAndLastMonthYear)((0, date_fns_1.parseISO)(startDate), constants_1.DATE_FORMAT, false, !isNext, true);
        const endKey = (0, common_1.generateFirstAndLastMonthYear)((0, date_fns_1.parseISO)(endDate), constants_1.DATE_FORMAT, false, !isNext, true);
        dispatch(action({ startDate: startKey, endDate: endKey }));
    };
    return (react_1.default.createElement(material_1.Box, { display: 'flex', height: '60px', boxShadow: '0 1px 0 0 #DDE1E4', position: 'relative', zIndex: 1 },
        react_1.default.createElement(ToolBox1, null,
            react_1.default.createElement(material_1.FormControl, { size: "small", sx: { minWidth: 100, border: 'none', boxShadow: 'none' } },
                react_1.default.createElement(material_1.Select, { value: view || 'Teams', onChange: handleViewChange, className: "projectDropdown", sx: {
                        padding: 0,
                        border: 'none',
                        boxShadow: 'none',
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                        },
                    }, defaultValue: "Teams", IconComponent: icons_material_1.KeyboardArrowDown, MenuProps: {
                        PaperProps: {
                            sx: {
                                backgroundColor: '#FFFFFF',
                                boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
                                padding: '0',
                            },
                        },
                    } }, viewOptions.map((option, index) => (react_1.default.createElement(StyledMenuItem, { key: index, value: option }, option)))))),
        react_1.default.createElement(ToolBox2, { flex: 1, className: "filterTopRow" },
            react_1.default.createElement(material_1.Box, { className: "filterColBlock" },
                react_1.default.createElement(x_data_grid_1.GridToolbarContainer, { ref: setFilterButtonEl },
                    react_1.default.createElement(x_data_grid_1.GridToolbarColumnsButton, { slotProps: {
                            tooltip: { title: 'Columns' },
                            button: {
                                variant: 'outlined',
                                startIcon: (react_1.default.createElement("img", { src: "/images/icons/columns.svg", alt: "columns" })),
                            },
                        } }),
                    react_1.default.createElement(CustomExport_1.default, null),
                    react_1.default.createElement(x_data_grid_1.GridToolbarFilterButton, { slotProps: {
                            tooltip: { title: 'Filters' },
                            button: {
                                variant: 'outlined',
                                sx: { color: '#555', borderColor: '#ddd',
                                    ".MuiButton-startIcon": { marginRight: '5px' },
                                    "& .MuiBadge-root span": { top: '-12px', right: '3px' },
                                    "& .MuiBadge-root svg": { display: "none" },
                                },
                                component: (props) => (react_1.default.createElement(material_1.Button, { ...props, startIcon: react_1.default.createElement("img", { src: "/images/icons/filter.svg", alt: "filter" }) }, props.children)),
                            },
                        } }))),
            react_1.default.createElement(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 } },
                react_1.default.createElement(material_1.Divider, { orientation: "vertical", flexItem: true }),
                react_1.default.createElement(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 } },
                    react_1.default.createElement(material_1.IconButton, { onClick: () => changeCalendarDate('prev'), size: "medium", className: "nextPrevIcon" },
                        react_1.default.createElement("img", { src: '/images/icons/left-arrow.svg', alt: "left-arrow" })),
                    react_1.default.createElement(material_1.Button, { className: "selectedDate" }, `${first} - ${last}`),
                    react_1.default.createElement(material_1.IconButton, { onClick: () => changeCalendarDate('next'), size: "medium", className: "nextPrevIcon" },
                        react_1.default.createElement("img", { src: '/images/icons/right-arrow.svg', alt: "right-arrow" })))))));
});
CustomToolbar.displayName = 'CustomToolbar';
exports.default = CustomToolbar;
