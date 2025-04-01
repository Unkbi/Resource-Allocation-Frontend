"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProjectAllocation;
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const AllocationGrid_1 = __importDefault(require("@/app/components/AllocationTable/AllocationGrid"));
const fetchProjectsAction_1 = require("@/app/redux/actions/fetchProjectsAction");
const projectsReducer_1 = require("@/app/redux/reducers/projectsReducer");
const material_1 = require("@mui/material");
const dialogReducer_1 = require("@/app/redux/reducers/dialogReducer");
const CustomAddIcon_1 = require("../../AllocationTable/CustomAddIcon");
function ProjectAllocation() {
    const [rowsState, setRowsState] = (0, react_1.useState)([]);
    const [selectedTeam, setSelectedTeam] = (0, react_1.useState)('');
    const { projects, allocations, loading, dataProcessing, calendarDate } = (0, react_redux_1.useSelector)(state => state.projects);
    const { startDate, endDate } = calendarDate || {};
    const dispatch = (0, react_redux_1.useDispatch)();
    (0, react_1.useEffect)(() => {
        if (projects?.result?.length && startDate && endDate) {
            dispatch((0, projectsReducer_1.resetAllocations)());
            dispatch((0, fetchProjectsAction_1.fetchAllProjectAllocations)(projects.result, startDate, endDate));
        }
    }, [projects, calendarDate]);
    const handleAddClick = (params) => {
        dispatch((0, dialogReducer_1.openDialog)({
            title: "Add Allocation",
            submitButtonText: 'Add',
            cancelButtonText: 'Cancel',
            formType: "add_allocation",
            initialData: {
                Project: params.value
            },
        }));
    };
    const getFirstChild = (params) => {
        if (params.rowNode.children && params.rowNode.children.length > 0) {
            const firstChildId = params.rowNode.children[0];
            const firstChildRow = params.api.getRow(firstChildId);
            return firstChildRow;
        }
        return null;
    };
    const projectColumnConfig = [
        {
            field: 'project',
            headerName: 'Project Name',
            width: 200,
            headerClassName: 'prime-header',
            cellClassName: 'prime-cell',
            primaryColumn: true,
            filterable: false,
            isEditable: false,
            renderCell: (params) => {
                const resource_count = params?.rowNode?.children?.length || "";
                return (React.createElement(material_1.Tooltip, { title: params.value, variant: "solid", placement: "right", arrow: true, slotProps: {
                        popper: {
                            modifiers: [
                                {
                                    name: "offset",
                                    options: { offset: [0, 10] },
                                },
                            ],
                        }
                    } },
                    React.createElement(CustomAddIcon_1.CustomAddIcon, { value: params.value, count: resource_count, onClick: () => handleAddClick(params) })));
            }
        },
        {
            field: 'projectSponsor',
            headerName: 'Project Sponsor',
            width: 148,
            type: 'string',
            headerClassName: 'secondary-header',
            cellClassName: 'secondary-cell',
            isEditable: false,
            primaryColumn: true,
            renderCell: (params) => {
                const firstChild = getFirstChild(params);
                return firstChild ? (React.createElement("span", null, firstChild.projectSponsor ?? 'N/A')) : null;
            },
        },
        {
            field: 'projectManager',
            headerName: 'Project Manager',
            width: 148,
            type: 'string',
            headerClassName: 'secondary-header',
            cellClassName: 'secondary-cell',
            isEditable: false,
            primaryColumn: true,
            renderCell: (params) => {
                const firstChild = getFirstChild(params);
                return firstChild ? (React.createElement("span", null, firstChild.projectManager ?? 'N/A')) : null;
            },
        },
        { field: 'projectStatus',
            headerName: 'Status',
            width: 84,
            type: 'string',
            headerClassName: 'secondary-header',
            cellClassName: 'secondary-cell',
            isEditable: false,
            renderCell: (params) => {
                const firstChild = getFirstChild(params);
                return firstChild ? (React.createElement("span", null, firstChild.projectStatus ?? 'N/A')) : null;
            },
        },
        {
            field: 'projectLocation',
            headerName: 'Location',
            width: 92,
            type: 'string',
            headerClassName: 'secondary-header',
            cellClassName: 'secondary-cell',
            isEditable: false,
            primaryColumn: true,
            renderCell: (params) => {
                const firstChild = getFirstChild(params);
                return firstChild ? (React.createElement("span", null, firstChild.projectLocation ?? 'N/A')) : null;
            },
        },
        {
            field: 'projectType',
            headerName: 'Project Type',
            width: 116,
            type: 'string',
            headerClassName: 'secondary-header',
            cellClassName: 'secondary-cell',
            isEditable: false,
            primaryColumn: true,
            renderCell: (params) => {
                const firstChild = getFirstChild(params);
                return firstChild ? (React.createElement("span", null, firstChild.projectType ?? 'N/A')) : null;
            },
        },
        {
            field: "projectOvertimeAllowed",
            headerName: "Overtime?",
            width: 102, // min-width without eliding.
            type: 'boolean',
            headerClassName: 'secondary-header',
            cellClassName: 'secondary-cell',
            isEditable: false,
            primaryColumn: true,
            renderCell: (params) => {
                const firstChild = getFirstChild(params);
                return firstChild ? (React.createElement("span", null, firstChild?.projectOvertimeAllowed ? 'Yes' : 'No')) : null;
            },
        },
        {
            field: "projectCost",
            headerName: "Cost",
            width: 90,
            type: 'string ',
            headerClassName: 'secondary-header',
            cellClassName: 'secondary-cell',
            isEditable: false,
            primaryColumn: true,
            renderCell: (params) => {
                const firstChild = getFirstChild(params);
                return firstChild ? (React.createElement("span", null, firstChild.projectCost ?? 'N/A')) : null;
            },
        },
        {
            field: "projectCurrency",
            headerName: "Currency",
            width: 100,
            type: 'string',
            headerClassName: 'secondary-header',
            cellClassName: 'secondary-cell',
            isEditable: false,
            primaryColumn: true,
            renderCell: (params) => {
                const firstChild = getFirstChild(params);
                return firstChild ? (React.createElement("span", null, firstChild.projectCurrency ?? 'N/A')) : null;
            },
        },
        {
            field: 'projectStartDate',
            headerName: 'Start Date',
            width: 100,
            type: 'string',
            headerClassName: 'secondary-header',
            cellClassName: 'secondary-cell',
            isEditable: false,
            primaryColumn: true,
            renderCell: (params) => {
                const firstChild = getFirstChild(params);
                return firstChild ? (React.createElement("span", null, firstChild.projectStartDate ?? 'N/A')) : null;
            },
        },
        {
            field: 'projectEndDate',
            headerName: 'End Date',
            width: 100,
            type: 'string',
            headerClassName: 'secondary-header',
            cellClassName: 'secondary-cell',
            isEditable: false,
            primaryColumn: true,
            renderCell: (params) => {
                const firstChild = getFirstChild(params);
                return firstChild ? (React.createElement("span", null, firstChild.projectEndDate ?? 'N/A')) : null;
            },
        },
        {
            field: 'totalEffort',
            headerName: 'Total Effort',
            width: 106,
            type: 'number',
            sortable: false,
            headerClassName: 'secondary-header',
            cellClassName: 'secondary-cell',
            headerAlign: 'left',
            primaryColumn: true,
            renderCell: (params) => {
                const value = Number(params.value);
                const formattedValue = value && typeof value === 'number' && value !== 0
                    ? Math.round(value * 10) / 10
                    : null;
                return React.createElement("span", { style: { fontWeight: 'bold' } }, formattedValue);
            },
        },
    ];
    return (React.createElement(React.Fragment, null,
        React.createElement(AllocationGrid_1.default, { groupBy: "project", columns: projectColumnConfig, rowsState: rowsState, startDate: startDate, endDate: endDate, setRowsState: setRowsState, selectedTeam: selectedTeam, setSelectedTeam: setSelectedTeam, initialState: {
                columns: {
                    columnVisibilityModel: {
                        projectSponsor: false,
                        projectManager: false,
                        projectStatus: false,
                        projectLocation: false,
                        projectType: false,
                        projectOvertimeAllowed: false,
                        projectCost: false,
                        projectCurrency: false,
                        projectStartDate: false,
                        projectEndDate: false,
                    },
                },
            }, data: allocations, loading: loading || dataProcessing })));
}
