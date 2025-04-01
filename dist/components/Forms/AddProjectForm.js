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
const CustomSelect_1 = __importDefault(require("../Select/CustomSelect"));
const StyledLabel_1 = __importDefault(require("../Label/StyledLabel"));
const StyledInput_1 = require("../Input/StyledInput");
const CustomDatePicker_1 = __importDefault(require("../DatePicker/CustomDatePicker"));
const react_redux_1 = require("react-redux");
const AddProjectForm = ({ formikProps, setFormValue = () => { } }) => {
    const { values, handleChange, handleBlur, errors, touched, resetForm, setTouched } = formikProps;
    const { initialData } = (0, react_redux_1.useSelector)((state) => state.globalDialog.formState);
    (0, react_1.useEffect)(() => {
        if (initialData) {
            const rowData = {
                StartDate: initialData.StartDate || null,
                EndDate: initialData.EndDate || null,
                Owner: initialData.Owner?.name || '',
                AllowOvertime: initialData.AllowOvertime ?? '', // Use nullish coalescing
                Location: initialData.Location || '',
                Manager: initialData.Manager || '',
                Name: initialData.Name || '',
                Type: initialData.Type || '',
                Status: initialData.Status || 'Active',
            };
            setFormValue(rowData);
            formikProps.resetForm({ values: rowData });
            formikProps.setTouched({});
        }
    }, [initialData]);
    const projectTypeOptions = [
        { value: "Key Initiative", label: "Key Initiative" },
        { value: "RTB", label: "RTB (Run-th-business)" },
        { value: "CTB", label: "CTB" },
        { value: "STB", label: "STB" },
        { value: "Ongoing", label: "Ongoing" },
    ];
    const allowOverTimeOptions = [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
    ];
    const statusOptions = [
        { value: "Active", label: "Active" },
        { value: "Proposed", label: "Proposed" },
        { value: "Completed", label: "Completed" },
        { value: "Paused", label: "Paused" },
        { value: "Approved", label: "Approved" },
    ];
    // Error display helper
    const showError = (fieldName) => {
        return touched[fieldName] && errors[fieldName] ? (react_1.default.createElement(material_1.Typography, { color: "error", sx: {
                fontSize: "12px",
                mt: 0.5,
                fontFamily: "Open Sans",
            } }, errors[fieldName])) : null;
    };
    return (react_1.default.createElement(material_1.Box, null,
        react_1.default.createElement(material_1.Box, { sx: { pb: 2 } },
            react_1.default.createElement(StyledLabel_1.default, null,
                "Project Name ",
                react_1.default.createElement("span", { style: { color: "red" } }, "*")),
            react_1.default.createElement(StyledInput_1.StyledInput, { as: material_1.TextField, name: "Name", value: values.Name, onChange: handleChange, onBlur: handleBlur, error: touched.Name && Boolean(errors.Name) }),
            showError("Name")),
        react_1.default.createElement(material_1.Box, { sx: { pb: 2 } },
            react_1.default.createElement(StyledLabel_1.default, null, "Sponsor"),
            react_1.default.createElement(StyledInput_1.StyledInput, { as: material_1.TextField, name: "Owner", value: values.Owner, onChange: handleChange, onBlur: handleBlur, error: touched.Owner && Boolean(errors.Owner) }),
            showError("Owner")),
        react_1.default.createElement(material_1.Box, { sx: { pb: 2 } },
            react_1.default.createElement(StyledLabel_1.default, null, "Project Manager"),
            react_1.default.createElement(StyledInput_1.StyledInput, { as: material_1.TextField, name: "Manager", value: values.Manager, onChange: handleChange, onBlur: handleBlur, error: touched.Manager && Boolean(errors.Manager) }),
            showError("Manager")),
        react_1.default.createElement(material_1.Box, { sx: { pb: 2 } },
            react_1.default.createElement(StyledLabel_1.default, null, "Location"),
            react_1.default.createElement(StyledInput_1.StyledInput, { as: material_1.TextField, name: "Location", value: values.Location, onChange: handleChange, onBlur: handleBlur, error: touched.Location && Boolean(errors.Location) }),
            showError("Location")),
        react_1.default.createElement(material_1.Box, { sx: {
                pb: 2,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
            } },
            react_1.default.createElement(material_1.Box, { sx: { width: "48%" } },
                react_1.default.createElement(StyledLabel_1.default, null,
                    "Project Type ",
                    react_1.default.createElement("span", { style: { color: "red" } }, "*")),
                react_1.default.createElement(CustomSelect_1.default, { name: "Type", options: projectTypeOptions, value: values.Type, onChange: handleChange, onBlur: handleBlur, width: "100%", error: touched.Type && Boolean(errors.Type) }),
                showError("Type")),
            react_1.default.createElement(material_1.Box, { sx: { width: "48%" } },
                react_1.default.createElement(StyledLabel_1.default, null,
                    "Allow Overtime ",
                    react_1.default.createElement("span", { style: { color: "red" } }, "*")),
                react_1.default.createElement(CustomSelect_1.default, { name: "AllowOvertime", options: allowOverTimeOptions, value: values.AllowOvertime, onChange: handleChange, onBlur: handleBlur, width: "100%", error: touched.AllowOvertime && Boolean(errors.AllowOvertime) }),
                showError("AllowOvertime"))),
        react_1.default.createElement(material_1.Box, { sx: {
                pb: 2,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
            } },
            react_1.default.createElement(material_1.Box, { sx: { width: "48%" } },
                react_1.default.createElement(StyledLabel_1.default, null, "Start Date"),
                react_1.default.createElement(CustomDatePicker_1.default, { name: "StartDate", handleChange: handleChange, value: values.StartDate || null, placeholder: "Start Date", formikProps: formikProps, error: touched.StartDate && Boolean(errors.StartDate) }),
                showError("StartDate")),
            react_1.default.createElement(material_1.Box, { sx: { width: "48%" } },
                react_1.default.createElement(StyledLabel_1.default, null, "End Date"),
                react_1.default.createElement(CustomDatePicker_1.default, { name: "EndDate", handleChange: handleChange, value: values.EndDate || null, placeholder: "End Date", formikProps: formikProps, error: touched.EndDate && Boolean(errors.EndDate) }),
                showError("EndDate"))),
        react_1.default.createElement(material_1.Box, { sx: { pb: 2 } },
            react_1.default.createElement(StyledLabel_1.default, null,
                "Status ",
                react_1.default.createElement("span", { style: { color: "red" } }, "*")),
            react_1.default.createElement(CustomSelect_1.default, { name: "Status", options: statusOptions, value: values.Status, onChange: handleChange, onBlur: handleBlur, error: touched.Status && Boolean(errors.Status) }),
            showError("Status"))));
};
exports.default = AddProjectForm;
