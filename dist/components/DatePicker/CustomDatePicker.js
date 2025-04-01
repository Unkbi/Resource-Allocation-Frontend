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
exports.default = CustomDatePicker;
const React = __importStar(require("react"));
const dayjs_1 = __importDefault(require("dayjs"));
const LocalizationProvider_1 = require("@mui/x-date-pickers/LocalizationProvider");
const AdapterDayjs_1 = require("@mui/x-date-pickers/AdapterDayjs");
const DatePicker_1 = require("@mui/x-date-pickers/DatePicker");
const material_1 = require("@mui/material");
const system_1 = require("@mui/system");
const x_date_pickers_1 = require("@mui/x-date-pickers");
const material_2 = require("@mui/material");
require("dayjs/locale/en-gb");
const updateLocale_1 = __importDefault(require("dayjs/plugin/updateLocale"));
const constants_1 = require("@/app/constants/constants");
dayjs_1.default.extend(updateLocale_1.default);
dayjs_1.default.updateLocale(constants_1.DEFAULT_LOCALE, { weekStart: 1 });
const StyledPickersLayout = (0, system_1.styled)(x_date_pickers_1.PickersLayout)({
    '.MuiDateCalendar-root': {
        borderRadius: '0px',
        borderWidth: '0px',
        border: '0px solid',
        width: '300px',
    },
});
const CustomTextField = (0, system_1.styled)(material_1.TextField)({
    height: '36px',
    width: '160px',
    '& .MuiInputBase-root': {
        height: '36px',
        fontFamily: 'Open Sans',
        fontSize: '12px',
        fontWeight: 500,
        '&::placeholder': {
            color: '#757575',
            opacity: 1,
        },
    },
    '& .MuiIconButton-root': {
        backgroundColor: 'transparent !important',
        '&:hover': {
            backgroundColor: 'transparent !important',
        },
    },
});
function CustomDatePicker({ name, value, placeholder, formikProps, error, helperText, }) {
    const { setFieldValue } = formikProps;
    const handleDateChange = (newValue) => {
        const formattedDate = newValue ? (0, dayjs_1.default)(newValue).format('YYYY-MM-DD') : null;
        setFieldValue(name, formattedDate);
    };
    return (React.createElement(material_2.FormControl, { style: {
            width: '160px',
        }, error: error },
        React.createElement(LocalizationProvider_1.LocalizationProvider, { dateAdapter: AdapterDayjs_1.AdapterDayjs, adapterLocale: constants_1.DEFAULT_LOCALE },
            React.createElement(DatePicker_1.DatePicker, { displayWeekNumber: true, value: value ? (0, dayjs_1.default)(value) : null, onChange: handleDateChange, slots: {
                    layout: StyledPickersLayout,
                    textField: CustomTextField,
                    openPickerIcon: () => (React.createElement("img", { src: "/images/icons/calendar.svg", alt: "Calendar", style: {
                            width: '13px',
                            height: '14.4px',
                        } })),
                }, slotProps: {
                    textField: {
                        placeholder: placeholder,
                    },
                } })),
        error && (React.createElement(material_1.FormHelperText, { style: {
                fontSize: '0.75rem',
                marginLeft: '0px',
            } }, helperText))));
}
