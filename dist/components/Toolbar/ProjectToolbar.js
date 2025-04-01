"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const react_1 = require("react");
const x_data_grid_1 = require("@mui/x-data-grid");
const commonButtonStyles = {
    backgroundColor: 'rgba(242, 245, 250, 0.3)',
    border: '1px solid rgb(214, 220, 225)',
    borderRadius: '4px',
    height: '32px',
    padding: '5px 12px',
    fontSize: '13px',
    color: 'rgb(33, 33, 33)',
    fontFamily: 'Manrope, serif',
    fontWeight: '600',
    textTransform: 'none',
};
const StyledGridToolbarColumnsButton = (0, material_1.styled)(x_data_grid_1.GridToolbarColumnsButton)({
    "& .MuiButton-startIcon": {
        marginRight: 0,
    },
    "& .MuiButton-endIcon": {
        display: "none",
    },
    "& .MuiButton-text": {
        fontSize: 0,
        width: 0,
        padding: 0,
        overflow: "hidden",
    },
    '& .filterColBlock': {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        '& button': commonButtonStyles,
    },
    '& .columns-button': {
        textTransform: 'none',
    },
});
const ProjectToolbar = ({ setFilterButtonEl }) => {
    const [value, setValue] = (0, react_1.useState)('project');
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    return (React.createElement(material_1.Box, { style: { display: "flex", justifyContent: "space-between", marginTop: "12px" } },
        React.createElement(material_1.Tabs, { value: value, onChange: handleChange, textColor: "primary", indicatorColor: "primary", "aria-label": "secondary tabs example" },
            React.createElement(material_1.Tab, { value: "project", label: "Project" }),
            React.createElement(material_1.Tab, { value: "businessImpact", label: "Business Impact" })),
        React.createElement(material_1.Box, null,
            React.createElement(material_1.Box, { className: "filterColBlock" },
                React.createElement(x_data_grid_1.GridToolbarContainer, { ref: setFilterButtonEl },
                    React.createElement(StyledGridToolbarColumnsButton, { slotProps: {
                            tooltip: { title: 'Columns' },
                            button: {
                                variant: 'outlined',
                                startIcon: (React.createElement("img", { src: "/images/icons/columns.svg", alt: "columns" })),
                                className: 'columns-button',
                                sx: commonButtonStyles,
                            },
                        } }),
                    React.createElement(x_data_grid_1.GridToolbarFilterButton, { slotProps: {
                            tooltip: { title: 'Filter' },
                            button: {
                                variant: 'outlined',
                                sx: { color: '#555', borderColor: '#ddd' },
                                startIcon: (React.createElement("img", { src: "/images/icons/filter.svg", alt: "filter" })),
                                className: 'columns-button',
                                sx: commonButtonStyles,
                            },
                        } }))))));
};
exports.default = ProjectToolbar;
