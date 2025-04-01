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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const ColumnManagementPopper = ({ handleColumnVisibilityChange, handlePopperToggle, popperOpen, allColumns, }) => {
    const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [showAll, setShowAll] = (0, react_1.useState)(true);
    const handleClose = () => {
        setAnchorEl(null);
        handlePopperToggle();
    };
    // Filter columns based on search term
    const filteredColumns = allColumns?.filter(column => (column.headerName || column.field)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()));
    const handleReset = () => {
        const allColumns = apiRef.current.getAllColumns(); // Get all columns again
        // setColumns(allColumns);
        setShowAll(allColumns.every(col => !col.hide));
        allColumns.forEach(col => {
            apiRef.current.setColumnVisibility(col.field, !col.hide);
        });
    };
    const handleShowHideAll = () => {
        const newShowAll = !showAll;
        setShowAll(newShowAll);
    };
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(material_1.Popper, { open: popperOpen, anchorEl: anchorEl, placement: "bottom-start", style: { zIndex: 1300 } },
            react_1.default.createElement(material_1.Paper, { elevation: 3, sx: { width: 320, maxHeight: 480 } },
                react_1.default.createElement(material_1.TextField, { fullWidth: true, size: "small", placeholder: "Search columns", value: searchTerm, onChange: e => setSearchTerm(e.target.value), InputProps: {
                        startAdornment: (react_1.default.createElement(material_1.InputAdornment, { position: "start" },
                            react_1.default.createElement(icons_material_1.Search, { fontSize: "small" }))),
                        endAdornment: searchTerm && (react_1.default.createElement(material_1.InputAdornment, { position: "end" },
                            react_1.default.createElement(material_1.IconButton, { size: "small", onClick: () => setSearchTerm('') },
                                react_1.default.createElement(icons_material_1.Close, { fontSize: "small" })))),
                    }, sx: { p: 2, borderBottom: '1px solid #DDE1E4' } }),
                react_1.default.createElement(material_1.Box, { sx: { maxHeight: 320, overflowY: 'auto' } }, filteredColumns.length > 0 ? (filteredColumns.map(column => {
                    const isVisible = !column.hide; // Column is visible if `hide` is false
                    return (react_1.default.createElement(material_1.MenuItem, { key: column.field, onClick: () => handleColumnVisibilityChange(column.field), sx: { py: 1, px: 2 } },
                        react_1.default.createElement(material_1.Checkbox, { checked: isVisible, size: "small" }),
                        react_1.default.createElement(material_1.ListItemText, { primary: column.headerName || column.field })));
                })) : (react_1.default.createElement(material_1.Typography, { variant: "body2", sx: { p: 2, color: '#999', textAlign: 'center' } }, "No columns available"))),
                react_1.default.createElement(material_1.Box, { sx: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 2,
                        py: 1,
                        borderBottom: '1px solid #DDE1E4',
                    } },
                    react_1.default.createElement(material_1.Box, { sx: { display: 'flex', alignItems: 'center' } },
                        react_1.default.createElement(material_1.Typography, { variant: "body2", sx: { mr: 1 } }, "Show/Hide All"),
                        react_1.default.createElement(material_1.Switch, { size: "small", checked: showAll, onChange: handleShowHideAll })),
                    react_1.default.createElement(material_1.Button, { size: "small", onClick: handleReset, sx: {
                            color: '#2B66C7',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'transparent',
                                textDecoration: 'underline',
                            },
                        } }, "Reset"))))));
};
exports.default = ColumnManagementPopper;
