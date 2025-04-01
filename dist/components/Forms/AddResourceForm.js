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
const react_1 = __importDefault(require("react"));
const formik_1 = require("formik");
const Yup = __importStar(require("yup"));
const material_1 = require("@mui/material");
const ValidationSchema_1 = require("./ValidationSchema");
const initialValues = {
    team: '',
    design: '',
    resource: '',
    resourceType: '',
    project: '',
    allocate: '',
    week: '',
    capacity: '',
};
const AddResourceForm = ({ onSubmit }) => {
    const handleSubmit = values => {
        console.log('Form Data:', values);
        // Handle form submission (e.g., API call)
    };
    return (react_1.default.createElement(material_1.Box, { sx: { maxWidth: 400, margin: 'auto', padding: 2 } },
        react_1.default.createElement(formik_1.Formik, { initialValues: initialValues, validationSchema: ValidationSchema_1.addResourceValidationSchema, onSubmit: handleSubmit }, ({ values, handleChange, handleBlur }) => (react_1.default.createElement(formik_1.Form, null,
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
            react_1.default.createElement(formik_1.Field, { as: material_1.TextField, name: "resource", label: "Resource", fullWidth: true, margin: "normal", value: values.resource, onChange: handleChange, onBlur: handleBlur }),
            react_1.default.createElement(formik_1.ErrorMessage, { name: "resource", component: "div" }),
            react_1.default.createElement(material_1.FormControl, { fullWidth: true, margin: "normal" },
                react_1.default.createElement(material_1.InputLabel, null, "Resource Type"),
                react_1.default.createElement(formik_1.Field, { as: material_1.Select, name: "resourceType", label: "Resource Type", value: values.resourceType, onChange: handleChange, onBlur: handleBlur },
                    react_1.default.createElement(material_1.MenuItem, { value: "Type A" }, "Type A"),
                    react_1.default.createElement(material_1.MenuItem, { value: "Type B" }, "Type B"),
                    react_1.default.createElement(material_1.MenuItem, { value: "Type C" }, "Type C")),
                react_1.default.createElement(formik_1.ErrorMessage, { name: "resourceType", component: "div" })),
            react_1.default.createElement(formik_1.Field, { as: material_1.TextField, name: "project", label: "Project", fullWidth: true, margin: "normal", value: values.project, onChange: handleChange, onBlur: handleBlur }),
            react_1.default.createElement(formik_1.ErrorMessage, { name: "project", component: "div" }),
            react_1.default.createElement(formik_1.Field, { as: material_1.TextField, name: "allocate", label: "Allocate", fullWidth: true, margin: "normal", value: values.allocate, onChange: handleChange, onBlur: handleBlur }),
            react_1.default.createElement(formik_1.ErrorMessage, { name: "allocate", component: "div" }),
            react_1.default.createElement(formik_1.Field, { as: material_1.TextField, name: "week", label: "Week", fullWidth: true, margin: "normal", value: values.week, onChange: handleChange, onBlur: handleBlur }),
            react_1.default.createElement(formik_1.ErrorMessage, { name: "week", component: "div" }),
            react_1.default.createElement(formik_1.Field, { as: material_1.TextField, name: "capacity", label: "Capacity", type: "number", fullWidth: true, margin: "normal", value: values.capacity, onChange: handleChange, onBlur: handleBlur }),
            react_1.default.createElement(formik_1.ErrorMessage, { name: "capacity", component: "div" }),
            react_1.default.createElement(material_1.Button, { type: "submit", variant: "contained", color: "primary", fullWidth: true, sx: { mt: 2 } }, "Add Allocation"))))));
};
exports.default = AddResourceForm;
