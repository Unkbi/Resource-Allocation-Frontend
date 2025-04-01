"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInitialRowsState = exports.getCellClassName = exports.getGroupingColDef = exports.groupPage = exports.getFinalColumns = exports.getInitialState = void 0;
const TableHeader_1 = require("@/app/components/AllocationTable/TableHeader");
const CustomAvatar_1 = __importDefault(require("../Avatar/CustomAvatar"));
const common_1 = require("@/app/utils/common");
const AddRowButton_1 = require("./AddRowButton");
const react_redux_1 = require("react-redux");
const dialogReducer_1 = require("@/app/redux/reducers/dialogReducer");
const CustomAddIcon_1 = require("./CustomAddIcon");
const getInitialState = (groupBy, updatedRows, GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD) => ({
    rowGrouping: {
        model: groupBy === 'teams' ? [groupBy, 'resource'] : [groupBy],
    },
    sorting: {
        sortModel: [
            { field: GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD, sort: 'asc' },
        ],
    },
    pinnedColumns: { left: [GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD, "__row_group_by_columns_group_teams__"] },
});
exports.getInitialState = getInitialState;
const getFinalColumns = (columns, groupBy, setSelectedTeam, handleAddProject, setSelectedResourceId, dispatch, startDate, endDate) => {
    const { teamAllocations } = (0, react_redux_1.useSelector)(state => state.teams);
    const { projects } = (0, react_redux_1.useSelector)(state => state.projects);
    const allColumns = (0, TableHeader_1.getAllColumnsWithWeek)(columns, dispatch, startDate, endDate);
    const handleAddClick = (params) => {
        dispatch((0, dialogReducer_1.openDialog)({
            title: "Add Allocation",
            submitButtonText: 'Add',
            cancelButtonText: 'Cancel',
            formType: "add_allocation",
            initialData: {
                Resource: params.value
            },
        }));
    };
    if (groupBy === 'organization') {
        return allColumns || [];
    }
    else if (groupBy === 'teams') {
        return [
            ...(allColumns?.slice(0, 1) || []),
            {
                field: 'resource',
                headerName: 'Resource',
                width: 200,
                headerClassName: 'secondary-header',
                cellClassName: 'secondary-cell',
                sortable: false,
                primaryColumn: true,
                renderCell: params => {
                    if (params.value) {
                        return React.createElement(React.Fragment, null,
                            React.createElement(CustomAvatar_1.default, { value: params.value, showFullName: true }),
                            React.createElement(CustomAddIcon_1.CustomAddIcon, { onClick: () => handleAddClick(params) }));
                    }
                },
            },
            {
                field: 'project',
                headerName: 'Project',
                width: 200,
                headerClassName: 'secondary-header',
                cellClassName: 'secondary-cell',
                sortable: groupBy == 'project' ? true : false,
                primaryColumn: true,
                renderCell: params => {
                    const allocationsOfAddedResource = Array.isArray(teamAllocations.result) &&
                        teamAllocations.result.filter(resource => resource.Resource === params.row.resourceId);
                    const uniqueProjectNames = [
                        ...new Set((Array.isArray(allocationsOfAddedResource) &&
                            allocationsOfAddedResource.map(item => item.ProjectName)) ||
                            []),
                    ];
                    const isGroupExpanded = params.rowNode.childrenExpanded;
                    if (params.row.hasProject && !params.row.project) {
                        return (React.createElement(AddRowButton_1.AddRowButton, { row: params.row, teamsId: params.row.teamsId, project: params.row.project, handleAddRow: handleAddProject, buttonName: "Add Project", resourceProjects: projects?.result.filter(item => !uniqueProjectNames?.includes(item.Name)), onClick: event => {
                                setSelectedTeam(params.row.teams),
                                    setSelectedResourceId(params.row.resourceId);
                            } }));
                    }
                    if (params.value)
                        return params.value;
                    const projects_set = [
                        ...new Set(params?.rowNode?.children?.map(child => params.api.getRow(child)?.project)),
                    ].filter(Boolean);
                    if (projects_set.length > 1) {
                        const cell_value = projects_set?.[0]?.length > 18
                            ? projects_set?.[0]?.slice(0, 15) + '...'
                            : projects_set?.[0];
                        return (React.createElement("div", null,
                            !isGroupExpanded && cell_value,
                            !isGroupExpanded && React.createElement("span", { style: {
                                    backgroundColor: '#E9EFF8',
                                    color: '#000',
                                    paddingRight: 4,
                                    paddingLeft: 4,
                                    marginLeft: 8,
                                    fontSize: 12,
                                    borderRadius: 2,
                                } },
                                "+",
                                projects_set?.length - 1)));
                    }
                    return projects_set.length
                        ? `${projects_set[0]}${projects_set.length > 1 ? ` +${projects_set.length - 1}` : ''}`
                        : '';
                },
            },
            ...(allColumns?.slice(1) || []),
        ];
    }
    else if (groupBy === 'project') {
        return [
            ...(allColumns?.slice(0, 1) || []),
            {
                field: 'resource',
                headerName: 'Resource',
                width: 200,
                headerClassName: 'secondary-header',
                cellClassName: 'secondary-cell',
                sortable: false,
                primaryColumn: true,
                renderCell: params => {
                    if (params.value) {
                        return React.createElement(CustomAvatar_1.default, { value: params.value, showFullName: true });
                    }
                },
            },
            ...(allColumns?.slice(1) || []),
        ];
    }
};
exports.getFinalColumns = getFinalColumns;
const groupPage = groupBy => {
    const groupPages = {
        project: 'Project Name',
        teams: 'Team Name',
        organization: 'Organization Name',
    };
    return groupPages[groupBy];
};
exports.groupPage = groupPage;
const getGroupingColDef = groupBy => ({
    headerName: (0, exports.groupPage)(groupBy),
    renderHeader: () => (0, exports.groupPage)(groupBy),
    renderCell: params => params.value,
    filterable: false,
    isEditable: false,
    headerClassName: 'prime-header',
});
exports.getGroupingColDef = getGroupingColDef;
const getCellClassName = (params, updatedRows) => {
    if (params && params.field && typeof params.field === 'string') {
        if (params &&
            params.field &&
            typeof params.field === 'string' &&
            params.field.startsWith('W') &&
            params.rowNode?.type === 'group' &&
            (params.rowNode?.groupingField === 'teams' ||
                params.rowNode?.groupingField === 'resource')) {
            const projectName = params.rowNode.groupingKey;
            let projectRows = [];
            if (params.rowNode?.groupingField === 'teams') {
                projectRows = updatedRows.filter(row => row.teams === projectName);
            }
            else if (params.rowNode?.groupingField === 'resource') {
                projectRows = updatedRows.filter(row => row.resource === projectName);
            }
            const uniqueProjectRows = new Set(projectRows.map(item => item.resourceId));
            const totalRows = uniqueProjectRows.size;
            const aggregatedValue = projectRows.reduce((sum, row) => {
                const weekValue = row[params.field];
                const numericValue = typeof weekValue === 'object' && weekValue !== null
                    ? parseFloat(weekValue.value || 0)
                    : parseFloat(weekValue || 0);
                return sum + numericValue;
            }, 0);
            let percentage;
            if (params.rowNode?.groupingField === 'resource') {
                percentage = (aggregatedValue / 1) * 100;
            }
            else {
                percentage = (aggregatedValue / totalRows) * 100;
            }
            if (params.rowNode?.groupingField === 'teams') {
                if (percentage === 0) {
                    return 'firstGroupsRow';
                }
                else if (percentage <= 50) {
                    return 'poor-allocation';
                }
                else if (percentage > 50 && percentage <= 80) {
                    return 'average-allocation';
                }
                else if (percentage > 80 && percentage <= 110) {
                    return 'fully-occupied';
                }
                else if (percentage > 110) {
                    return 'over-occupied';
                }
            }
            else {
                if (percentage === 0) {
                    return 'firstGroupsRow';
                }
                else if (percentage <= 50) {
                    return 'poor-allocation-secondGroup';
                }
                else if (percentage > 50 && percentage <= 80) {
                    return 'average-allocation-secondGroup';
                }
                else if (percentage > 80 && percentage <= 110) {
                    return 'fully-occupied-secondGroup';
                }
                else if (percentage > 110) {
                    return 'over-occupied-secondGroup';
                }
            }
        }
    }
    if (params.rowNode?.type === 'group') {
        return params.rowNode?.groupingField === 'teams'
            ? 'firstGroupsRow'
            : 'secondGroupsRow';
    }
    return '';
};
exports.getCellClassName = getCellClassName;
const getInitialRowsState = (updatedRows, groupBy, teams) => {
    const rowsWithTotalEffort = updatedRows.map(row => ({
        ...row,
        totalEffort: (0, common_1.calculateTotalEffort)(row),
    }));
    if (groupBy === 'project') {
        return rowsWithTotalEffort;
    }
    else if (groupBy === 'teams') {
        // Get unique teams for teams and teamsId to avoid duplicate teams
        let unique_teams = {};
        let teams_with_name = {};
        teams?.result?.forEach(team => {
            teams_with_name[team?.Name] = team?.Id;
        });
        rowsWithTotalEffort.forEach(row => {
            if (row.teamsId && !unique_teams[row.teamsId])
                unique_teams[row.teamsId] = row.teams;
            else if (!unique_teams[row.teamsId] && teams_with_name?.[row?.teams]) {
                unique_teams[teams_with_name[row.teams]] = row.teams;
            }
        });
        return rowsWithTotalEffort;
    }
    else {
        return updatedRows;
    }
};
exports.getInitialRowsState = getInitialRowsState;
