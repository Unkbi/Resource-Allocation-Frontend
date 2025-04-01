"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ResourcePopper;
const react_1 = require("react");
const material_1 = require("@mui/material");
const allResources = [
    { name: "John Doe", projects: ["Project A"], totalHours: 30 },
    { name: "Jane Smith", projects: ["Project B"], totalHours: 25 },
    { name: "Alice Johnson", projects: ["Project C"], totalHours: 35 },
];
function ResourcePopper({ anchorEl, onClose, onAddResource }) {
    const [searchTerm, setSearchTerm] = (0, react_1.useState)("");
    const filteredResources = allResources.filter((resource) => resource.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return (React.createElement(material_1.Popper, { open: Boolean(anchorEl), anchorEl: anchorEl, placement: "bottom-start" },
        React.createElement(material_1.Box, { sx: { p: 1, bgcolor: "background.paper", minWidth: 200 } },
            React.createElement(material_1.TextField, { fullWidth: true, placeholder: "Search Resource", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), sx: { border: 0 } }),
            React.createElement(material_1.List, null, filteredResources.map((resource, index) => (React.createElement(material_1.ListItem, { key: index, button: true, onClick: () => onAddResource(resource) },
                React.createElement(material_1.ListItemText, { primary: resource.name, secondary: resource.projects.join(", ") }))))))));
}
