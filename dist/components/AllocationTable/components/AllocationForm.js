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
const formik_1 = require("formik");
const react_redux_1 = require("react-redux");
const CustomDialog_1 = __importDefault(require("../../Dialog/CustomDialog"));
const AddProjectForm_1 = __importDefault(require("../../Forms/AddProjectForm"));
const AddResourceForm_1 = __importDefault(require("../../Forms/AddResourceForm"));
const AddAllocationForm_1 = __importDefault(require("../../Forms/AddAllocationForm"));
const AssignAllocationForm_1 = __importDefault(require("../../Forms/AssignAllocationForm"));
const ValidationSchema_1 = require("../../Forms/ValidationSchema");
const projectServices_1 = require("@/app/services/projectServices");
const dialogReducer_1 = require("@/app/redux/reducers/dialogReducer");
const common_1 = require("@/app/utils/common");
const resourceAllocationAction_1 = require("@/app/redux/actions/resourceAllocationAction");
const fetchTeamsAction_1 = require("@/app/redux/actions/fetchTeamsAction");
const allocationViewReducer_1 = require("@/app/redux/reducers/allocationViewReducer");
const material_1 = require("@mui/material");
const fetchProjectsAction_1 = require("@/app/redux/actions/fetchProjectsAction");
const navigation_1 = require("next/navigation");
const initialValuesMap = {
    add_project: {
        StartDate: '',
        EndDate: '',
        Name: '',
        Owner: '',
        AllowOvertime: '',
        Location: '',
        Manager: '',
        Status: "",
        Type: ""
    },
    add_resource: {
        Resource: '',
        Type: '',
        Skills: '',
    },
    add_allocation: {
        Resource: [],
        Project: [],
        StartDate: '',
        EndDate: '',
        AllocationEntered: '',
    },
    assign_allocation: {
        Resource: '',
        Project: '',
        StartDate: '',
        EndDate: '',
        Hours: '',
    },
};
const AllocationForm = () => {
    const { formType } = (0, react_redux_1.useSelector)((state) => state.globalDialog.formState);
    const [formValue, setFormValue] = (0, react_1.useState)(initialValuesMap[formType] || initialValuesMap.add_project);
    const dispatch = (0, react_redux_1.useDispatch)();
    const { initialData } = (0, react_redux_1.useSelector)((state) => state.globalDialog.formState);
    const { projects } = (0, react_redux_1.useSelector)((state) => state.projects);
    const { teams, teamsResources, calendarDate } = (0, react_redux_1.useSelector)(state => state.teams);
    const { startDate, endDate } = calendarDate || {};
    const { allocations } = (0, react_redux_1.useSelector)(state => state.dataGrid);
    const { rowState } = (0, react_redux_1.useSelector)(state => state.dataGrid);
    const { view } = (0, react_redux_1.useSelector)(state => state.allocationView);
    const router = (0, navigation_1.useRouter)();
    const pathname = (0, navigation_1.usePathname)();
    (0, react_1.useEffect)(() => {
        setFormValue(initialValuesMap[formType] || initialValuesMap.add_project);
    }, [formType]);
    const getValidationSchema = (formType) => {
        switch (formType) {
            case 'add_project':
                return (0, ValidationSchema_1.addProjectValidationSchema)(projects);
            case 'add_resource':
                return ValidationSchema_1.addResourceValidationSchema;
            case 'add_allocation':
                return ValidationSchema_1.addAllocationValidationSchema;
            case 'assign_allocation':
                return ValidationSchema_1.assignAllocationValidationSchema;
            default:
                return null;
        }
    };
    const handleOnAdd = (team, resource) => {
        let row_id = `auto-generated-row-teams/${team}-resource/${resource}`;
        dispatch((0, allocationViewReducer_1.setExpandRowId)(row_id));
    };
    const getTeamByResourceId = (resourceId) => {
        let new_user = null;
        Object.keys(teamsResources)?.forEach((team) => {
            teamsResources?.[team]?.forEach((resource) => {
                if (resource?.Id == resourceId) {
                    new_user = { ...resource, teamId: team };
                }
            });
        });
        teams?.result?.forEach((team) => {
            if (team?.Id == new_user?.teamId) {
                new_user = { team: team, ...new_user };
            }
        });
        return new_user;
    };
    const getAllocationPresent = (project, resource, period) => {
        for (let i = 0; i < rowState?.length; i++) {
            if (rowState[i]?.projectId === project && rowState[i]?.resourceId === resource) {
                return rowState[i][(0, common_1.getWeekNumber)(new Date(period))];
            }
        }
        return false;
    };
    const handleSubmit = async (values, { setSubmitting, setErrors, validateForm }) => {
        const errors = await validateForm(values);
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            setSubmitting(false);
            return;
        }
        const allMondays = (0, common_1.generateAllMondays)(values.StartDate, values.EndDate);
        let postData = {};
        switch (formType) {
            case 'add_project':
                postData = {
                    "ResourceAllocation.Core/Project": {
                        ...values,
                        Description: "string",
                    },
                };
                try {
                    dispatch((0, projectServices_1.addProject)(postData))
                        .then(() => {
                        // After successfully adding the project, route to Projects page
                        if (pathname !== '/project') {
                            router.replace('/project');
                        }
                    })
                        .catch((error) => {
                        console.error("Failed to add project:", error);
                    });
                    if (pathname !== '/project') {
                        router.replace('/project');
                    }
                }
                catch (e) {
                    console.log(e);
                }
                break;
            case 'edit_project':
                postData = {
                    "ResourceAllocation.Core/Project": {
                        ...values,
                        Description: "string",
                    },
                };
                try {
                    dispatch((0, projectServices_1.updateProject)({ postData, projectId: initialData.Id }));
                }
                catch (e) {
                    console.log(e);
                }
                break;
            case 'add_allocation':
                try {
                    const filteredProjects = projects?.result?.filter((project) => values.Project.includes(project.Id)) || [];
                    const allocationPromises = allMondays.flatMap((monday) => {
                        return values.Resource.flatMap(resource => {
                            return filteredProjects.map(project => {
                                const allocation = getAllocationPresent(project.Id, resource, monday);
                                if (allocation && allocation?.allocationId && allocation?.value) {
                                    if (allocation?.value !== values.AllocationEntered) {
                                        const putPayload = {
                                            resourceId: resource,
                                            allocationId: allocation?.allocationId,
                                            putData: {
                                                'ResourceAllocation.Core/Allocation': {
                                                    AllocationEntered: values.AllocationEntered,
                                                },
                                            },
                                        };
                                        return dispatch((0, resourceAllocationAction_1.updateResourceAllocation)(putPayload));
                                    }
                                }
                                else {
                                    const postPayload = {
                                        resourceId: resource,
                                        postData: {
                                            'ResourceAllocation.Core/Allocation': {
                                                Resource: resource,
                                                Project: project.Id,
                                                ProjectName: project.Name,
                                                Period: monday,
                                                AllocationEntered: values.AllocationEntered,
                                                Notes: values.Comment || "",
                                            },
                                        },
                                    };
                                    return dispatch((0, resourceAllocationAction_1.setResourceAllocation)(postPayload));
                                }
                            });
                        });
                    });
                    if (!allocationPromises?.length) {
                        return;
                    }
                    await Promise.all(allocationPromises)
                        .then(async () => {
                        let new_resources = values.Resource.map(resource => getTeamByResourceId(resource));
                        const teams = [...new Set(new_resources.map(resource => resource?.team))];
                        dispatch((0, dialogReducer_1.closeDialog)());
                        if (view === 'Teams') {
                            return dispatch((0, fetchTeamsAction_1.fetchResourcesAgainstTeams)(teams, allocations, startDate, endDate))
                                .then(() => {
                                new_resources.forEach((resource) => {
                                    handleOnAdd(resource?.team?.Name, resource?.FullName);
                                });
                            });
                        }
                        else if (view === 'Projects') {
                            return dispatch((0, fetchProjectsAction_1.fetchAllProjectAllocations)(filteredProjects, startDate, endDate))
                                .then(() => {
                                // Code For Scroll to Row to be added.
                            });
                        }
                    });
                }
                catch (e) {
                    console.error('Error creating allocations:', e);
                }
                break;
            default:
                return;
        }
        setSubmitting(false);
    };
    const getFormComponent = (formType, formikProps) => {
        switch (formType) {
            case 'add_project':
                return react_1.default.createElement(AddProjectForm_1.default, { formikProps: formikProps });
            case 'edit_project':
                return react_1.default.createElement(AddProjectForm_1.default, { formikProps: formikProps, setFormValue: setFormValue });
            case 'add_resource':
                return react_1.default.createElement(AddResourceForm_1.default, { formikProps: formikProps });
            case 'add_allocation':
                return react_1.default.createElement(AddAllocationForm_1.default, { formikProps: formikProps, setFormValue: setFormValue });
            case 'assign_allocation':
                return react_1.default.createElement(AssignAllocationForm_1.default, { formikProps: formikProps });
            default:
                return react_1.default.createElement("div", null, "No form selected");
        }
    };
    const FormErrorMessage = ({ name }) => (react_1.default.createElement(formik_1.ErrorMessage, { name: name }, (msg) => (react_1.default.createElement(material_1.Typography, { color: "error", sx: {
            fontSize: '12px',
            mt: 0.5,
            fontFamily: 'Open Sans'
        } }, msg))));
    return (react_1.default.createElement(formik_1.Formik, { enableReinitialize: true, initialValues: formValue, validationSchema: getValidationSchema(formType), onSubmit: handleSubmit, validateOnChange: true, validateOnBlur: true }, (formikProps) => (react_1.default.createElement(CustomDialog_1.default, { onSubmit: formikProps.handleSubmit, isSubmitting: formikProps.isSubmitting, isValid: formikProps.isValid },
        react_1.default.createElement(material_1.Box, null,
            getFormComponent(formType, {
                ...formikProps,
                FormErrorMessage
            }),
            formikProps.status && (react_1.default.createElement(material_1.Typography, { color: "error", sx: {
                    fontSize: '14px',
                    mt: 2,
                    textAlign: 'center',
                    fontFamily: 'Open Sans',
                    fontWeight: 600
                } }, formikProps.status)))))));
};
exports.default = AllocationForm;
