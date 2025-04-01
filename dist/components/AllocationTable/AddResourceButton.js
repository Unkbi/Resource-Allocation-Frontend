"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddResourceButton = void 0;
const react_1 = require("react");
const material_1 = require("@mui/material");
const Add_1 = __importDefault(require("@mui/icons-material/Add"));
const CustomAvatar_1 = __importDefault(require("../Avatar/CustomAvatar"));
const react_redux_1 = require("react-redux");
const StyledButton = (0, material_1.styled)(material_1.Button)(({ theme }) => ({
    color: theme.custom.textColor,
    textTransform: 'none',
    fontSize: '12px',
    fontFamily: "'Manrope', serif",
    fontWeight: '600',
    padding: '0 16px',
    '& .MuiSvgIcon-root': {
        fontSize: '16px',
    },
    '&:hover': {
        backgroundColor: 'transparent',
    },
    '& .MuiTouchRipple-root': {
        display: 'none',
    },
}));
const MainBox = (0, material_1.styled)(material_1.Box)(({ theme }) => ({
    position: 'relative',
    width: 'auto',
    margin: '0 -16px',
    '& .MuiInputBase-formControl': {
        padding: '0 !important',
    },
    '& .MuiOutlinedInput-input': {
        height: '51px',
        lineHeight: '32px',
        background: 'rgba(157, 201, 255, 0.3)',
        padding: '10px 16px !important',
        borderRadius: '0',
        fontFamily: "'Manrope', serif",
        fontSize: '12px',
        fontWeight: '600',
        color: '#313F68',
        boxSizing: 'border-box',
        border: '1px solid #298AFF',
        '&::placeholder': {
            color: '#424242',
            opacity: 1,
            fontFamily: "'Manrope', serif",
            fontSize: '12px',
            fontWeight: '600',
        },
    },
    '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
        border: 'none',
        borderRadius: '0',
        padding: '0',
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: 'none',
        borderRadius: '0px',
    },
}));
const StyledPopper = (0, material_1.styled)(material_1.Popper)(({ theme }) => ({
    backgroundColor: '#FFFFFF',
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
    maxHeight: '156px',
    overflow: 'auto',
    '&::-webkit-scrollbar': {
        width: '2px',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#C4CAD4',
    },
    '& .MuiAutocomplete-noOptions': {
        fontFamily: "'Manrope', serif",
        fontSize: '12px',
    },
    '& .MuiAutocomplete-option': {
        padding: '10px !important',
        border: 'none',
        color: '#313F68',
        fontFamily: "'Manrope', serif",
        fontSize: '12px',
        fontWeight: '600',
        alignItems: 'flex-start !important',
    },
    '& .userEamil': {
        color: '#313F68',
        fontFamily: "'Manrope', serif",
        fontSize: '10px',
        fontWeight: '500',
        display: 'block',
    },
    '& .MuiAvatar-root': {
        width: '16px',
        height: '16px',
        marginRight: '8px',
        marginTop: '2px',
    },
}));
const StyledInput = (0, material_1.styled)(material_1.TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        backgroundColor: theme.palette.background.paper,
        borderColor: theme.palette.divider,
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
        },
    },
}));
// const allResources = [
//   { name: 'John Doe', projects: ['Project A'] },
//   { name: 'Jane Smith', projects: ['Project B'] },
//   { name: 'Alice Johnson', projects: ['Project C'] },
// ];
const AddResourceButton = ({ project, handleAddRow, onClick }) => {
    const [isSearchMode, setIsSearchMode] = (0, react_1.useState)(false);
    const { resources, loading, error } = (0, react_redux_1.useSelector)(state => state.resources);
    const dispatch = (0, react_redux_1.useDispatch)();
    const defaultProps = {
        options: resources?.[0]?.result || [],
        getOptionLabel: option => option.FullName,
    };
    const inputRef = (0, react_1.useRef)(null);
    const handleButtonClick = () => {
        setIsSearchMode(true);
        onClick();
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 0);
    };
    return (React.createElement(MainBox, null, isSearchMode && resources.length > 0 ? (React.createElement(material_1.Autocomplete, { ...defaultProps, id: "open-on-focus", onChange: (event, newValue) => {
            if (newValue) {
                handleAddRow(event, newValue);
            }
            setIsSearchMode(false);
        }, onBlur: () => setIsSearchMode(false), popupIcon: null, slots: { popper: StyledPopper }, renderOption: (props, option, { selected }) => {
            const { key, ...optionProps } = props;
            return (React.createElement(material_1.Box, { component: "li", key: key, ...optionProps, sx: {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderBottom: `1px solid ${'#eaecef'}`,
                } },
                React.createElement(CustomAvatar_1.default, { value: option.FullName }),
                React.createElement(material_1.Box, { sx: { flexGrow: 1 } },
                    React.createElement("span", null, option.FullName),
                    React.createElement("span", { className: "userEamil" }, option.Email))));
        }, renderInput: params => (React.createElement(StyledInput, { ...params, inputRef: inputRef })) })) : (React.createElement(StyledButton, { variant: "text", size: "small", startIcon: React.createElement(Add_1.default, null), onClick: handleButtonClick }, "Add Resource"))));
};
exports.AddResourceButton = AddResourceButton;
