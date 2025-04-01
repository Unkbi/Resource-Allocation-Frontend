"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRowIcon = exports.AddRowButton = void 0;
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
        width: 200,
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
    '& ul': {
        maxHeight: '156px',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            width: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#C4CAD4',
        },
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
const AddRowButton = ({ row, project, handleAddRow, teamsId, onClick, buttonName = 'Add Resource', resourceProjects, }) => {
    const [isSearchMode, setIsSearchMode] = (0, react_1.useState)(false);
    const [selectedResources, setSelectedResources] = (0, react_1.useState)([]);
    const { teamsResources } = (0, react_redux_1.useSelector)((state) => state.teams);
    const { resources } = (0, react_redux_1.useSelector)((state) => state.resources);
    const { allocations } = (0, react_redux_1.useSelector)((state) => state.projects);
    const { view } = (0, react_redux_1.useSelector)((state) => state.allocationView);
    // Resources already allocated to the current project
    const resourcesForCurrentProject = allocations.filter((row) => row.project === project).map((row) => row.resourceId);
    // Merging current selected resources with the already allocated resources
    const mergedResources = [...new Set([...selectedResources, ...resourcesForCurrentProject])];
    const defaultProps = {
        options: buttonName === 'Add Project'
            ? resourceProjects
            : view === 'Projects'
                ? resources.result.filter((resource) => !mergedResources.includes(resource.Id)) || []
                : teamsResources?.[teamsId]?.length
                    ? teamsResources?.[teamsId]
                    : resources?.result || [],
        getOptionLabel: option => buttonName === 'Add Project' ? option.Name : option.FullName,
    };
    // In teams tab, we are setting the options to the resources array from the redux store for the selected team, else we are setting the options to all the resources.
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
    const handleKeyDown = event => {
        if (isSearchMode && ['ArrowUp', 'ArrowDown', 'e', 'E'].includes(event.key)) {
            event.stopPropagation();
        }
    };
    const handleResourceSelect = (event, newValue) => {
        if (newValue) {
            // Add the new resource to the selected list
            setSelectedResources((prev) => [...prev, newValue.Id]);
            handleAddRow(event, newValue, row);
            setIsSearchMode(false);
        }
    };
    return (React.createElement(MainBox, { onKeyDown: handleKeyDown }, isSearchMode && resources?.result.length > 0 ? (React.createElement(material_1.Autocomplete, { ...defaultProps, id: "open-on-focus", onChange: handleResourceSelect, onBlur: () => setIsSearchMode(false), open: true, popupIcon: null, slots: { popper: StyledPopper }, renderOption: (props, option, { selected }) => {
            const { key, id, ...optionProps } = props;
            return (React.createElement(material_1.Box, { component: "li", key: `${key}${id}`, ...optionProps, sx: {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderBottom: `1px solid ${'#eaecef'}`,
                } },
                buttonName !== 'Add Project' && (React.createElement(CustomAvatar_1.default, { value: option.FullName })),
                React.createElement(material_1.Box, { sx: { flexGrow: 1 } },
                    React.createElement("span", null, buttonName === 'Add Project'
                        ? option.Name
                        : option.FullName),
                    buttonName !== 'Add Project' && (React.createElement("span", { className: "userEamil" }, option.Email)))));
        }, renderInput: params => (React.createElement(StyledInput, { ...params, inputRef: inputRef })) })) : (React.createElement(StyledButton, { variant: "text", size: "small", startIcon: React.createElement(Add_1.default, null), onClick: handleButtonClick }, buttonName))));
};
exports.AddRowButton = AddRowButton;
const AddRowIcon = ({ handleAddRow, team_name, onClick, buttonName = 'Add Resource', resourceProjects = [], }) => {
    const [isSearchMode, setIsSearchMode] = (0, react_1.useState)(false);
    const { teams, teamsResources } = (0, react_redux_1.useSelector)(state => state.teams);
    const { resources } = (0, react_redux_1.useSelector)(state => state.resources);
    let teamsId = teams?.result?.find(team => team_name == team.Name)?.Id;
    const defaultProps = {
        options: buttonName === 'Add Project'
            ? resourceProjects
            : teamsResources?.[teamsId]?.length ?
                teamsResources?.[teamsId] :
                resources?.result || [],
        getOptionLabel: option => buttonName === 'Add Project' ? option.Name : option.FullName,
    };
    // In teams tab, we are setting the options to the resources array from the redux store for the selected team, else we are setting the options to all the resources.
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
    const handleKeyDown = event => {
        if (isSearchMode && ['ArrowUp', 'ArrowDown'].includes(event.key)) {
            event.stopPropagation();
        }
    };
    return (React.createElement(MainBox, { sx: {
            position: 'absolute',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            width: 210,
            margin: '-36px -30px',
        }, onKeyDown: handleKeyDown }, isSearchMode && resources?.result.length > 0 ? (React.createElement(material_1.Autocomplete, { ...defaultProps, id: "open-on-focus", sx: {
            marginTop: -2
        }, onChange: (event, newValue) => {
            if (newValue) {
                handleAddRow(event, newValue);
            }
            setIsSearchMode(false);
        }, onBlur: () => setIsSearchMode(false), open: true, popupIcon: null, slots: { popper: StyledPopper }, renderOption: (props, option, { selected }) => {
            const { key, id, ...optionProps } = props;
            return (React.createElement(material_1.Box, { component: "li", key: `${key}${id}`, ...optionProps, sx: {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderBottom: `1px solid ${'#eaecef'}`,
                } },
                buttonName !== 'Add Project' && (React.createElement(CustomAvatar_1.default, { value: option.FullName })),
                React.createElement(material_1.Box, { sx: { flexGrow: 1 } },
                    React.createElement("span", null, buttonName === 'Add Project'
                        ? option.Name
                        : option.FullName),
                    buttonName !== 'Add Project' && (React.createElement("span", { className: "userEamil" }, option.Email)))));
        }, renderInput: params => (React.createElement(StyledInput, { ...params, inputRef: inputRef })) })) : (React.createElement(Add_1.default, { onClick: handleButtonClick, sx: {
            backgroundColor: '#1C2D5F',
            color: '#fff',
            fontSize: 20,
            marginRight: 1,
            borderRadius: '2px',
            cursor: 'pointer',
        } }))));
};
exports.AddRowIcon = AddRowIcon;
