"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const formik_1 = require("formik");
const material_1 = require("@mui/material");
const StyledInput_1 = require("../Input/StyledInput");
const AssignAllocationForm = ({ formikProps }) => {
    const { values, handleChange, handleBlur } = formikProps;
    return (react_1.default.createElement(material_1.Box, { sx: { maxWidth: 400, margin: 'auto', padding: 2 } },
        react_1.default.createElement(material_1.FormControl, { fullWidth: true, margin: "normal" },
            react_1.default.createElement(material_1.InputLabel, null, "Team"),
            react_1.default.createElement(formik_1.Field, { as: material_1.Select, name: "team", label: "Team", value: values.team, onChange: handleChange, onBlur: handleBlur },
                react_1.default.createElement(material_1.MenuItem, { value: "Team A" }, "Team A"),
                react_1.default.createElement(material_1.MenuItem, { value: "Team B" }, "Team B"),
                react_1.default.createElement(material_1.MenuItem, { value: "Team C" }, "Team C")),
            react_1.default.createElement(formik_1.ErrorMessage, { name: "team", component: "div" })),
        react_1.default.createElement(material_1.FormControl, { fullWidth: true, margin: "normal" },
            react_1.default.createElement(material_1.InputLabel, null, "Design"),
            react_1.default.createElement(formik_1.Field, { as: material_1.Select, name: "design", label: "Design", value: values.design, onChange: handleChange, onBlur: handleBlur },
                react_1.default.createElement(material_1.MenuItem, { value: "Design 1" }, "Design 1"),
                react_1.default.createElement(material_1.MenuItem, { value: "Design 2" }, "Design 2"),
                react_1.default.createElement(material_1.MenuItem, { value: "Design 3" }, "Design 3")),
            react_1.default.createElement(formik_1.ErrorMessage, { name: "design", component: "div" })),
        react_1.default.createElement(StyledInput_1.StyledInput, { as: material_1.TextField, name: "resource", label: "Resource", fullWidth: true, margin: "normal", value: values.resource, onChange: handleChange, onBlur: handleBlur }),
        react_1.default.createElement(formik_1.ErrorMessage, { name: "resource", component: "div" }),
        react_1.default.createElement(material_1.FormControl, { fullWidth: true, margin: "normal" },
            react_1.default.createElement(material_1.InputLabel, null, "Resource Type"),
            react_1.default.createElement(formik_1.Field, { as: material_1.Select, name: "resourceType", label: "Resource Type", value: values.resourceType, onChange: handleChange, onBlur: handleBlur },
                react_1.default.createElement(material_1.MenuItem, { value: "Type A" }, "Type A"),
                react_1.default.createElement(material_1.MenuItem, { value: "Type B" }, "Type B"),
                react_1.default.createElement(material_1.MenuItem, { value: "Type C" }, "Type C")),
            react_1.default.createElement(formik_1.ErrorMessage, { name: "resourceType", component: "div" })),
        react_1.default.createElement(StyledInput_1.StyledInput, { as: material_1.TextField, name: "project", label: "Project", fullWidth: true, margin: "normal", value: values.project, onChange: handleChange, onBlur: handleBlur }),
        react_1.default.createElement(formik_1.ErrorMessage, { name: "project", component: "div" }),
        react_1.default.createElement(StyledInput_1.StyledInput, { as: material_1.TextField, name: "allocate", label: "Allocate", fullWidth: true, margin: "normal", value: values.allocate, onChange: handleChange, onBlur: handleBlur }),
        react_1.default.createElement(formik_1.ErrorMessage, { name: "allocate", component: "div" }),
        react_1.default.createElement(StyledInput_1.StyledInput, { as: material_1.TextField, name: "week", label: "Week", fullWidth: true, margin: "normal", value: values.week, onChange: handleChange, onBlur: handleBlur }),
        react_1.default.createElement(formik_1.ErrorMessage, { name: "week", component: "div" }),
        react_1.default.createElement(StyledInput_1.StyledInput, { as: material_1.TextField, name: "capacity", label: "Capacity", type: "number", fullWidth: true, margin: "normal", value: values.capacity, onChange: handleChange, onBlur: handleBlur }),
        react_1.default.createElement(formik_1.ErrorMessage, { name: "capacity", component: "div" })));
};
exports.default = AssignAllocationForm;
