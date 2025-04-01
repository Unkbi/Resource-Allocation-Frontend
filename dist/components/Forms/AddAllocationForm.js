"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const material_1 = require("@mui/material");
const CustomSelect_1 = __importDefault(require("../Select/CustomSelect"));
const StyledLabel_1 = __importDefault(require("../Label/StyledLabel"));
const StyledInput_1 = require("../Input/StyledInput");
const CustomDatePicker_1 = __importDefault(require("../DatePicker/CustomDatePicker"));
const StyledRadioButton_1 = __importDefault(require("../RadioButton/StyledRadioButton"));
const react_redux_1 = require("react-redux");
const AddAllocationForm = ({ formikProps, setFormValue }) => {
    const { values, handleChange, handleBlur, setFieldValue } = formikProps;
    const [capacityOption, setCapacityOption] = (0, react_1.useState)("");
    const [customCapacity, setCustomCapacity] = (0, react_1.useState)("");
    const [projectOptions, setProjectOptions] = (0, react_1.useState)([]);
    const { projects } = (0, react_redux_1.useSelector)((state) => state.projects);
    const { resources } = (0, react_redux_1.useSelector)((state) => state.resources);
    const { initialData } = (0, react_redux_1.useSelector)(state => state.globalDialog.formState);
    const [multipleResourceError, setMultipleResourceError] = (0, react_1.useState)(false);
    const [multipleProjectError, setMultipleProjectError] = (0, react_1.useState)(false);
    const [closeResourceMenu, setCloseResourceMenu] = (0, react_1.useState)(false);
    const [closeProjectMenu, setCloseProjectMenu] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (initialData) {
            const filteredProject = projects?.result?.filter(project => initialData.Project?.includes(project.Name)).map(projects => projects.Id);
            const filteredResource = resources?.result?.filter(resource => initialData.Resource?.includes(resource.FullName)).map(resource => resource.Id);
            const rowData = {
                Resource: filteredResource || [],
                Project: filteredProject || [],
                StartDate: initialData.StartDate || '',
                EndDate: initialData.EndDate || '',
                AllocationEntered: initialData.AllocationEntered || '',
            };
            setFormValue(rowData);
        }
    }, [initialData, projects]);
    (0, react_1.useEffect)(() => {
        const avaiableProjects = projects?.result?.map((project) => ({
            value: project.Id,
            label: project.Name,
        }));
        setProjectOptions(avaiableProjects);
    }, [projects]);
    const resourceTypeOptions = resources && resources.result.map((resource) => {
        return { value: resource.Id, label: resource.FullName };
    });
    const handleCapacityChange = (event) => {
        const value = event.target.value;
        setCapacityOption(value);
        if (value === "custom") {
            setFieldValue("allocationEntered", Number(customCapacity));
        }
        else {
            setFieldValue("AllocationEntered", Number(value));
        }
    };
    const handleKeyPress = (e) => {
        if (['e', 'E', '+', '-'].includes(e.key)) {
            e.preventDefault();
        }
    };
    const handleCustomCapacityChange = (event) => {
        const value = event.target.value;
        if (/^[0-9]*\.?[0-9]*$/.test(value) || value === "") {
            setCustomCapacity(value);
            setCapacityOption("custom");
            const numValue = value === "" ? "" : Number(value);
            setFieldValue("AllocationEntered", numValue);
        }
    };
    const handleCustomCapacityBlur = (e) => {
        let formattedValue = e.target.value;
        if (formattedValue && !isNaN(formattedValue)) {
            const numValue = Number(formattedValue);
            formattedValue = (Math.round(numValue * 10) / 10).toString();
            if (formattedValue.indexOf('.') === -1 && numValue <= 2) {
                formattedValue = formattedValue + '.0';
            }
            setCustomCapacity(formattedValue);
            setFieldValue("AllocationEntered", Number(formattedValue));
        }
        handleBlur(e);
    };
    const handleResourceDropdownChange = (e) => {
        const selected = e.target.value;
        if (values.Project.length > 1 && selected.length > 1) {
            // Do not allow multiple resources to be selected.
            setMultipleResourceError(true);
            setCloseResourceMenu(true);
            setTimeout(() => {
                setMultipleResourceError(false);
                setCloseResourceMenu(false);
            }, 2000);
            return;
        }
        handleChange(e);
    };
    const handleProjectDropdownChange = (e) => {
        const selected = e.target.value;
        if (values.Resource.length > 1 && selected.length > 1) {
            // Do not allow multiple projects to be selected.
            setMultipleProjectError(true);
            setCloseProjectMenu(true);
            setTimeout(() => {
                setMultipleProjectError(false);
                setCloseProjectMenu(false);
            }, 2000);
            return;
        }
        handleChange(e);
    };
    return (React.createElement(material_1.Box, null,
        React.createElement(material_1.Box, { sx: { pb: 2 } },
            React.createElement(StyledLabel_1.default, null, "Resource"),
            React.createElement(CustomSelect_1.default, { name: "Resource", options: resourceTypeOptions, value: values.Resource || [], onChange: handleResourceDropdownChange, onBlur: handleBlur, multiple: true, error: multipleResourceError, helperText: "Please select only one option.", forceClose: closeResourceMenu })),
        React.createElement(material_1.Box, { sx: { pb: 2 } },
            React.createElement(StyledLabel_1.default, null, "Project"),
            React.createElement(CustomSelect_1.default, { name: "Project", options: projectOptions, value: values.Project || [], onChange: handleProjectDropdownChange, onBlur: handleBlur, multiple: true, error: multipleProjectError, helperText: "Please select only one option.", forceClose: closeProjectMenu })),
        React.createElement(material_1.Box, null,
            React.createElement(material_1.Box, { sx: {
                    background: "rgba(28, 45, 95, 0.05)",
                    height: "33px",
                    width: "340px",
                    p: 1,
                } },
                React.createElement(material_1.Typography, { sx: {
                        color: '#313F68',
                        fontFamily: 'Open Sans',
                        fontSize: '12px',
                        fontStyle: 'normal',
                        fontWeight: '700',
                    } }, "Add Bulk Allocation")),
            React.createElement(material_1.Box, { sx: { pb: 2, pt: 2 } },
                React.createElement(StyledLabel_1.default, null, "Date Range"),
                React.createElement(material_1.Box, { sx: { display: "flex", alignItems: "flex-start", gap: "10px" } },
                    React.createElement(CustomDatePicker_1.default, { name: "StartDate", handleChange: handleChange, value: values.StartDate || "", placeholder: "Start Date", formikProps: formikProps }),
                    React.createElement(CustomDatePicker_1.default, { name: "EndDate", handleChange: handleChange, value: values.EndDate || "", placeholder: "End Date", formikProps: formikProps }))),
            React.createElement(material_1.Box, null,
                React.createElement(material_1.RadioGroup, { row: true, name: "capacity-radio-group", value: capacityOption, onChange: handleCapacityChange, sx: { display: "flex", alignItems: "center", gap: "22px" } },
                    React.createElement(StyledRadioButton_1.default, { value: "1.0", label: "1.0", selectedValue: capacityOption, onChange: handleCapacityChange, backgroundColor: "#e6f7e6", borderColor: "#a3d9a3" }),
                    React.createElement(StyledRadioButton_1.default, { value: "0.5", label: "0.5", selectedValue: capacityOption, onChange: handleCapacityChange, backgroundColor: "#fff8e6", borderColor: "#ffd580" }),
                    React.createElement(StyledRadioButton_1.default, { value: "0.2", label: "0.2", selectedValue: capacityOption, onChange: handleCapacityChange, backgroundColor: "#fde6ef", borderColor: "#f8b3d9" }),
                    React.createElement(material_1.FormControlLabel, { value: "custom", control: React.createElement(material_1.Radio, { sx: { display: "none" } }), label: React.createElement(StyledInput_1.StyledInput, { as: material_1.TextField, name: "AllocationEntered", type: "number", width: "60px", height: "32px", value: customCapacity, onChange: handleCustomCapacityChange, onKeyPress: handleKeyPress, onBlur: handleCustomCapacityBlur, onClick: () => setCapacityOption("custom"), error: formikProps.touched.AllocationEntered && Boolean(formikProps.errors.AllocationEntered) }), sx: { margin: 0 } })),
                formikProps.touched.AllocationEntered && Boolean(formikProps.errors.AllocationEntered) && (React.createElement(StyledInput_1.StyledFormHelperText, null, formikProps.errors.AllocationEntered)))),
        React.createElement(material_1.Box, { sx: { pb: 2, pt: 2 } },
            React.createElement(StyledLabel_1.default, null, "Comment"),
            React.createElement(StyledInput_1.StyledCommentInput, { name: "Comment", value: values.Comment || "", onChange: handleChange, onBlur: handleBlur, multiline: true, rows: 4 }))));
};
exports.default = AddAllocationForm;
