"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TeamAllocation;
const AllocationGrid_1 = __importDefault(require("@/app/components/AllocationTable/AllocationGrid"));
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const fetchTeamsAction_1 = require("@/app/redux/actions/fetchTeamsAction");
const teamsReducer_1 = require("@/app/redux/reducers/teamsReducer");
const material_1 = require("@mui/material");
function TeamAllocation() {
    const [selectedTeam, setSelectedTeam] = (0, react_1.useState)('');
    const dispatch = (0, react_redux_1.useDispatch)();
    const { teams, resources, loading, dataProcessing, calendarDate } = (0, react_redux_1.useSelector)(state => state.teams);
    const { startDate, endDate } = calendarDate || {};
    (0, react_1.useEffect)(() => {
        if (!teams?.result?.length) {
            dispatch((0, fetchTeamsAction_1.fetchAllTeams)());
        }
    }, []);
    (0, react_1.useEffect)(() => {
        if (teams?.result.length && startDate && endDate) {
            dispatch((0, teamsReducer_1.resetResources)());
            dispatch((0, fetchTeamsAction_1.fetchResourcesAgainstTeams)(teams.result, null, startDate, endDate));
        }
    }, [teams, calendarDate]);
    const getTeam = (params) => {
        if (params.rowNode.type === 'group' && params.rowNode.groupingField === 'teams') {
            // Find the team by name in the teams array
            const teamName = params.rowNode.groupingKey;
            const team = teams?.result?.find(t => t.Name === teamName);
            return team;
        }
        return null;
    };
    const teamsColumnConfig = [
        {
            field: 'teams',
            headerName: 'Teams Name',
            width: 200,
            headerClassName: 'prime-header',
            cellClassName: 'prime-cell',
            primaryColumn: true,
            renderCell: (params) => {
                const resource_count = [
                    ...new Set(params?.rowNode?.children?.map(child => params.api.getRow(child))),
                ];
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
                    React.createElement("div", { style: {
                            display: 'flex',
                            width: '100%',
                            minWidth: 0,
                        } },
                        React.createElement("span", { style: {
                                flex: '1 1 auto',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            } }, params.value),
                        React.createElement("span", { style: {
                                flex: '0 0 auto',
                            } },
                            "(",
                            resource_count.length,
                            ")"))));
            }
        },
        {
            field: 'teamStatus',
            headerName: 'Status',
            width: 100,
            type: 'string',
            isEditable: false,
            renderCell: (params) => {
                const team = getTeam(params);
                return team ? (React.createElement("span", null, team?.Status ?? "N/A")) : null;
            }
        },
        {
            field: 'teamAllocationManager',
            headerName: 'Allocation Manager',
            width: 150,
            type: 'string',
            isEditable: false,
            renderCell: (params) => {
                const team = getTeam(params);
                return team ? (React.createElement("span", null, team?.AllocationManager ?? "N/A")) : null;
            }
        },
        {
            field: 'resourceType',
            headerName: 'Resource Type',
            width: 200,
            sortable: false,
            headerClassName: 'secondary-header',
            cellClassName: 'secondary-cell',
            primaryColumn: true,
            renderCell: (params) => {
                if (params.value) {
                    return params.value;
                }
                else {
                    const uniqueResourceTypes = [
                        ...new Set(params?.rowNode?.children?.map(child => params.api.getRow(child)?.resourceType))
                    ].filter(Boolean);
                    return uniqueResourceTypes.length
                        ? uniqueResourceTypes.length > 1
                            ? `${uniqueResourceTypes[0]} +${uniqueResourceTypes.length - 1}`
                            : uniqueResourceTypes[0]
                        : '';
                }
            }
        },
    ];
    return (React.createElement(React.Fragment, null,
        React.createElement(AllocationGrid_1.default, { loading: loading || dataProcessing, groupBy: "teams", startDate: startDate, endDate: endDate, columns: teamsColumnConfig, selectedTeam: selectedTeam, setSelectedTeam: setSelectedTeam, initialState: {
                columns: {
                    columnVisibilityModel: {
                        teamAllocationManager: false,
                        teamStatus: false,
                    },
                },
            }, data: resources }),
        !resources && !loading && (React.createElement("div", { style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '90vh',
            } },
            React.createElement("div", null, "No Data")))));
}
