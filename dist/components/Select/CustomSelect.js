"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const material_2 = require("@mui/material");
const StyledSelect = (0, material_1.styled)(material_1.Select)(({ theme, width }) => ({
    height: '36px',
    width: width || '340px',
    fontSize: '12px',
    '& .MuiOutlinedInput-root': {
        backgroundColor: '#fff',
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D6DCE1',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D6DCE1',
        },
    },
    '& .MuiSelect-select': {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        paddingTop: '6px',
        paddingBottom: '6px',
        paddingLeft: '12px',
        paddingRight: '32px',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        minHeight: '36px',
    },
}));
const StyledMenuItem = (0, material_1.styled)(material_1.MenuItem)(() => ({
    fontFamily: 'Open Sans',
    fontSize: '12px',
    height: '32px',
    padding: '8px 12px',
    width: '100%',
    margin: 0,
    boxSizing: 'border-box',
}));
const CustomSelect = ({ name, options, value, onChange, onBlur, width, error, helperText, multiple = false, forceClose = false, // close if more than one item selected
 }) => {
    const [open, setOpen] = react_1.default.useState(false);
    react_1.default.useEffect(() => {
        if (forceClose)
            setOpen(false);
    }, [forceClose]);
    const renderValue = (selected) => {
        const selectedLabels = options
            .filter(option => selected.includes(option.value))
            .map(option => option.label);
        const joined = selectedLabels.join(', ');
        return (react_1.default.createElement(material_1.Typography, { component: "span", sx: {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '12px',
            }, title: joined }, joined));
    };
    return (react_1.default.createElement(material_2.FormControl, { style: { width: width || '340px' }, error: error },
        react_1.default.createElement(StyledSelect, { name: name, value: value, onChange: onChange, onBlur: onBlur, open: open, onClose: () => setOpen(false), onOpen: () => setOpen(true), multiple: multiple, displayEmpty: true, renderValue: renderValue, MenuProps: {
                PaperProps: {
                    style: {
                        maxHeight: 200,
                        maxWidth: 340,
                    },
                },
                MenuListProps: {
                    disablePadding: true,
                },
            }, IconComponent: () => (react_1.default.createElement("img", { src: "/images/icons/dropdown-icon.svg", alt: "dropdown", style: {
                    position: 'absolute',
                    right: '10px',
                    bottom: '15px',
                } })) }, options?.map(option => (react_1.default.createElement(StyledMenuItem, { key: option.value, value: option.value, title: option.label, sx: {
                width: '100%',
                padding: '8px 12px',
                margin: 0,
                boxSizing: 'border-box',
            } },
            react_1.default.createElement(material_1.Typography, { sx: {
                    flexGrow: 1,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    fontSize: '12px',
                } }, option.label))))),
        error && (react_1.default.createElement(material_1.FormHelperText, { style: {
                fontSize: '0.75rem',
                marginLeft: '0px',
            } }, helperText))));
};
exports.default = CustomSelect;
