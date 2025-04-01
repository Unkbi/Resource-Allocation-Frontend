"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AllocationGrid;
const react_1 = require("react");
const material_1 = require("@mui/material");
const x_data_grid_premium_1 = require("@mui/x-data-grid-premium");
const common_1 = require("@/app/utils/common");
const data_1 = require("./data");
const StyledDataGrid_1 = require("./styles/StyledDataGrid");
require("./styles/AllocationGrid.css");
const AllocationGridUtils_1 = require("./AllocationGridUtils");
const react_redux_1 = require("react-redux");
const resourceAllocationAction_1 = require("@/app/redux/actions/resourceAllocationAction");
const CustomColumnMenu_1 = require("./components/CustomColumnMenu");
const CustomSnackbar_1 = require("../Snackbar/CustomSnackbar");
const TableHeader_1 = require("./TableHeader");
const dataGridReducer_1 = require("@/app/redux/reducers/dataGridReducer");
const CustomToolbar_1 = __importDefault(require("../Toolbar/CustomToolbar"));
const allocationViewReducer_1 = require("@/app/redux/reducers/allocationViewReducer");
const dialogReducer_1 = require("@/app/redux/reducers/dialogReducer");
const date_fns_1 = require("date-fns");
const constants_1 = require("@/app/constants/constants");
function AllocationGrid({ groupBy, columns, data, loading, selectedTeam, setSelectedTeam, initialState: _initialState, startDate, endDate }) {
    const apiRef = (0, x_data_grid_premium_1.useGridApiRef)();
    const [filterButtonEl, setFilterButtonEl] = (0, react_1.useState)(null);
    const [selectedResourceId, setSelectedResourceId] = (0, react_1.useState)('');
    const [updatedRows, setUpdatedRows] = (0, react_1.useState)([]);
    const { open, message, type, position } = (0, react_redux_1.useSelector)(state => state.toast);
    const { rowState } = (0, react_redux_1.useSelector)(state => state.dataGrid);
    const { expandRowId } = (0, react_redux_1.useSelector)(state => state.allocationView);
    const dispatch = (0, react_redux_1.useDispatch)();
    const { teams, teamAllocations } = (0, react_redux_1.useSelector)(state => state.teams);
    const [rowModesModel, setRowModesModel] = (0, react_1.useState)({});
    const [cellSelectionModel, setCellSelectionModel] = (0, react_1.useState)({});
    const { isOpen } = (0, react_redux_1.useSelector)((state) => state.globalDialog);
    const handleKeyUp = (e) => {
        if (cellSelectionModel && Object.keys(cellSelectionModel).length > 0 && apiRef.current.getSelectedCellsAsArray().length >= 2) {
            const resourcesSelected = [];
            let StartDate, EndDate;
            Object.entries(cellSelectionModel).forEach(([row, weeks]) => {
                const currentRowData = apiRef.current.getRow(row);
                Object.keys(weeks).forEach((weekN) => {
                    const period = currentRowData?.[weekN]?.period;
                    if (period) {
                        StartDate = StartDate ? ((0, date_fns_1.isBefore)(period, StartDate) ? period : StartDate) : period;
                        EndDate = EndDate ? ((0, date_fns_1.isAfter)(period, EndDate) ? period : EndDate) : period;
                    }
                });
                if (currentRowData?.resource && !resourcesSelected.includes(currentRowData.resource)) {
                    resourcesSelected.push(currentRowData.resource);
                }
            });
            const projectsSelected = [...new Set(Object.keys(cellSelectionModel).map(row => apiRef.current.getRow(row)?.project))];
            dispatch((0, dialogReducer_1.openDialog)({
                title: "Add Allocation",
                submitButtonText: 'Add',
                cancelButtonText: 'Cancel',
                formType: "add_allocation",
                initialData: {
                    Resource: resourcesSelected,
                    StartDate,
                    EndDate,
                    Project: projectsSelected,
                },
            }));
        }
    };
    const [aggregation, setAggregation] = (0, react_1.useState)({
        totalEffort: 'sum',
        ...(0, TableHeader_1.aggregationModel)(startDate, endDate),
    });
    const normalizeRow = row => {
        return Object.keys(row).reduce((normalized, key) => {
            if (key.startsWith('W')) {
                const weekValue = row[key];
                normalized[key] =
                    typeof weekValue === 'object' && weekValue !== null
                        ? weekValue
                        : { allocationId: null, value: weekValue };
            }
            else {
                normalized[key] = row[key];
            }
            return normalized;
        }, {});
    };
    (0, react_1.useEffect)(() => {
        const mapData = groupBy === 'project' || 'teams' ? data : data_1.demoRows;
        const updatedRows = mapData.map(row => ({
            ...normalizeRow(row),
            totalEffort: (0, common_1.calculateTotalEffort)(normalizeRow(row)),
        }));
        setUpdatedRows(updatedRows);
        let new_row_state = (0, AllocationGridUtils_1.getInitialRowsState)(updatedRows, groupBy, teams);
        dispatch((0, dataGridReducer_1.setRowState)(new_row_state));
    }, [data, groupBy, teams]);
    (0, react_1.useEffect)(() => {
        try {
            if (groupBy === 'teams' && expandRowId !== null && rowState?.length) {
                apiRef.current.setRowChildrenExpansion(expandRowId, true);
                dispatch((0, allocationViewReducer_1.setExpandRowId)(null));
            }
        }
        catch (error) {
            console.warn('Error in setting row expansion', error);
        }
    }, [expandRowId, rowState?.length]);
    // Use useEffect to add the key-up listener once
    (0, react_1.useEffect)(() => {
        const handleDocumentKeyUp = (e) => handleKeyUp(e);
        // Bind keyUp event on component mount
        document.addEventListener('mouseup', handleDocumentKeyUp);
        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener('mouseup', handleDocumentKeyUp);
        };
    }, [cellSelectionModel]);
    (0, react_1.useEffect)(() => {
        if (!isOpen) {
            setCellSelectionModel({});
        }
    }, [isOpen]);
    const initialState = (0, x_data_grid_premium_1.useKeepGroupedColumnsHidden)({
        apiRef,
        initialState: {
            ...(0, AllocationGridUtils_1.getInitialState)(groupBy, updatedRows, x_data_grid_premium_1.GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD),
            ..._initialState
        },
    });
    (0, react_1.useEffect)(() => {
        if (startDate && endDate) {
            setAggregation({
                totalEffort: 'sum',
                ...(0, TableHeader_1.aggregationModel)(startDate, endDate),
            });
        }
    }, [startDate, endDate]);
    const handleAddProject = (e, project, curRow) => {
        const checkEntryExists = (data, resourceId, projectName, projectId) => {
            return data.some(item => item.Resource === resourceId &&
                item.ProjectName === projectName &&
                item.Project === projectId);
        };
        const allocationsOfAddedResource = Array.isArray(teamAllocations?.result) &&
            teamAllocations?.result.filter(resource => resource.Resource === selectedResourceId);
        const allocationMap = new Map();
        const allWeeks = (0, common_1.generateAllWeeks)();
        Array.isArray(allocationsOfAddedResource) &&
            allocationsOfAddedResource.forEach(allocation => {
                if (!allocation.Period || allocation.AllocationEntered === 0)
                    return;
                const periodDate = (0, date_fns_1.parseISO)(allocation.Period);
                const weekNumber = (0, common_1.getWeekNumber)(periodDate);
                const formattedDate = (0, date_fns_1.format)(periodDate, constants_1.DATE_FORMAT);
                const weekObj = {};
                allWeeks.forEach(week => {
                    weekObj[week] = null;
                });
                if (allWeeks.includes(weekNumber)) {
                    weekObj[weekNumber] = {
                        allocationId: allocation.Allocation,
                        value: allocation.AllocationEntered || null,
                        period: formattedDate
                    };
                }
                const key = allocation.Allocation;
                allocationMap.set(key, weekObj);
            });
        if (!checkEntryExists(teamAllocations?.result, selectedResourceId, project.Name, project.Id)) {
            const updatedRows = rowState.map(row => {
                if (row.resourceId === selectedResourceId &&
                    row.teams === selectedTeam &&
                    row.project === '' &&
                    row.id === curRow.id) {
                    const key = selectedResourceId;
                    const allocations = allocationMap.get(key) || {};
                    return {
                        ...row,
                        project: project.Name,
                        projectId: project.Id,
                        ...allocations,
                    };
                }
                return row;
            });
            dispatch((0, dataGridReducer_1.setRowState)(updatedRows));
        }
    };
    const finalColumns = (0, AllocationGridUtils_1.getFinalColumns)(columns, groupBy, setSelectedTeam, handleAddProject, setSelectedResourceId, dispatch, startDate, endDate);
    const showField = [
        x_data_grid_premium_1.GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD,
        "__row_group_by_columns_group_teams__",
        "__row_group_by_columns_group_resource__",
        ...columns.map(col => col.field),
        ...finalColumns.filter(i => i.field === 'resource' && groupBy === "project").map(col => col.field),
        ...finalColumns.filter(i => i.field === 'project').map(col => col.field),
    ];
    const getTogglableColumns = columns => columns
        .filter(column => column.field !== groupBy)
        .filter(column => showField.includes(column.field))
        .map(column => column.field);
    const handleCellKeyDown = (params, event) => {
        // Preventing Key Events for Editing.
        if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
        }
        // Handling Ctrl+V and Cmd+V (Mac)
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
            const isViewMode = rowModesModel && Object.keys(rowModesModel).length === 0;
            if (isViewMode) {
                event.preventDefault();
                event.stopPropagation();
                event.nativeEvent.stopImmediatePropagation();
                return false;
            }
        }
        if (['Tab', 'Enter'].includes(event.key)) {
            const currentCell = apiRef.current.getCellElement(params.id, params.field);
            let nextCell = currentCell.nextElementSibling;
            // Find Next Cell
            while (nextCell?.role !== 'gridcell') {
                if (nextCell.nextElementSibling == null) {
                    nextCell = nextCell.parentElement.nextElementSibling.firstChild;
                }
                else {
                    nextCell = nextCell.nextElementSibling;
                }
            }
            // Handling Tab Key Event
            if (event.key === 'Tab' &&
                rowModesModel &&
                Object.keys(rowModesModel).length === 0) {
                event.preventDefault();
                nextCell.focus();
            }
            // Handling Enter Key Event
            if (event.key === 'Enter' &&
                rowModesModel &&
                Object.keys(rowModesModel).length > 0) {
                event.preventDefault();
                event.stopPropagation();
                apiRef.current.stopRowEditMode({ id: params.id, field: params.field });
            }
        }
    };
    const handleCellUpdate = (newRow, oldRow) => {
        Object.keys(newRow).forEach(key => {
            if (key.startsWith('W')) {
                let formattedCellValue = Math.round(newRow[key] * 10) / 10;
                if ((newRow[key] === null || newRow[key] === undefined) &&
                    (formattedCellValue === 0 || isNaN(formattedCellValue)) &&
                    oldRow[key]?.allocationId) {
                    const deletePayload = {
                        resourceId: oldRow.resourceId,
                        allocationId: oldRow[key]?.allocationId,
                        period: oldRow[key]?.period
                    };
                    dispatch((0, resourceAllocationAction_1.removeResourceAllocation)(deletePayload)).then(() => {
                        setUpdatedRows(prevRows => prevRows.map(row => (row.id === newRow.id ? newRow : row)));
                    });
                }
                // API call to update the data, if any changes are made.
                if (newRow[key] && newRow[key] !== oldRow[key]?.value) {
                    if (oldRow[key]?.allocationId && newRow[key] !== null) {
                        const putPayload = {
                            resourceId: oldRow.resourceId,
                            allocationId: oldRow[key]?.allocationId,
                            putData: {
                                'ResourceAllocation.Core/Allocation': {
                                    AllocationEntered: formattedCellValue,
                                },
                            },
                        };
                        dispatch((0, resourceAllocationAction_1.updateResourceAllocation)(putPayload)).then(() => {
                            setUpdatedRows(prevRows => prevRows.map(row => (row.id === newRow.id ? newRow : row)));
                        });
                    }
                    else if (formattedCellValue) {
                        const postPayload = {
                            resourceId: oldRow.resourceId,
                            postData: {
                                'ResourceAllocation.Core/Allocation': {
                                    Resource: oldRow.resourceId,
                                    Project: oldRow.projectId,
                                    ProjectName: oldRow.project,
                                    Period: (0, common_1.getMondayOfWeek)(key, oldRow[key]?.period),
                                    AllocationEntered: formattedCellValue,
                                },
                            },
                        };
                        dispatch((0, resourceAllocationAction_1.setResourceAllocation)(postPayload)).then(() => {
                            setUpdatedRows(prevRows => prevRows.map(row => (row.id === newRow.id ? newRow : row)));
                        });
                    }
                }
                newRow[key] = {
                    allocationId: oldRow[key]?.allocationId || null,
                    value: (formattedCellValue !== 0 && !isNaN(formattedCellValue)) ? formattedCellValue : null,
                    period: oldRow[key]?.period
                };
            }
        });
        return newRow;
    };
    const onRowClick = (0, react_1.useCallback)(params => {
        const rowNode = apiRef.current.getRowNode(params.id);
        if (rowNode &&
            rowNode.type === 'group' &&
            rowNode.groupingField != 'teams') {
            apiRef.current.setRowChildrenExpansion(params.id, !rowNode.childrenExpanded);
        }
    }, [apiRef]);
    const handleRowModesModelChange = newRowModesModel => {
        setRowModesModel(newRowModesModel);
    };
    const filterColumns = ({ columns }) => {
        return getTogglableColumns(columns);
    };
    const handleCellSelectionModelChange = (0, react_1.useCallback)((newModel) => {
        // Filter out Rows outside the current group boundary
        const isRowWithinGroup = (row) => {
            const selectedCells = apiRef.current.getSelectedCellsAsArray();
            if (selectedCells && selectedCells.length > 0) {
                if (groupBy === 'project') {
                    // Previously selected project
                    const currentProjectSelected = apiRef.current.getRow(selectedCells[0].id)?.projectId;
                    if (row.projectId !== currentProjectSelected) {
                        return false;
                    }
                }
                if (groupBy === 'teams') {
                    // Previously selected team
                    const currentResourceSelected = apiRef.current.getRow(selectedCells[0].id)?.resourceId;
                    if (row.resourceId !== currentResourceSelected) {
                        return false;
                    }
                }
            }
            return true;
        };
        // Get Only Valid Fields, i.e. Fields starting with 'W'
        const getNewModelWithValidFields = (row) => {
            const newModelWithValidFields = {};
            Object.keys(row).forEach((key) => {
                if (key.startsWith('W')) {
                    newModelWithValidFields[key] = row[key];
                }
            });
            return newModelWithValidFields;
        };
        let filteredModel = {};
        Object.keys(newModel).forEach((key) => {
            if (!key.startsWith('auto-generated')) { // Filter out auto-generated rows
                if (isRowWithinGroup(apiRef.current.getRow(key))) {
                    const newModelWithValidFields = getNewModelWithValidFields(newModel[key]);
                    if (newModelWithValidFields && Object.keys(newModelWithValidFields).length > 0) {
                        filteredModel[key] = newModelWithValidFields;
                    }
                }
            }
        });
        setCellSelectionModel(filteredModel);
    }, []);
    return (React.createElement(material_1.Box, { sx: { height: 'calc(100vh - 54px)', width: '100%' } },
        React.createElement(StyledDataGrid_1.StyledDataGrid, { cellSelection: true, isCellEditable: params => !params.row.hasButton, onCellKeyDown: handleCellKeyDown, rowModesModel: rowModesModel, onRowModesModelChange: handleRowModesModelChange, processRowUpdate: handleCellUpdate, onProcessRowUpdateError: err => {
                console.error('Row update failed:', err);
            }, rows: rowState, aggregationModel: aggregation, columns: finalColumns, rowSelection: true, 
            // cellSelection={true}
            // disableMultipleRowSelection={false}
            // onRowSelectionModelChange={(newSelection, params) => {
            //   let x = params.api.getRow(newSelection[0])
            // }}
            onRowClick: groupBy === 'teams' ? onRowClick : () => null, apiRef: apiRef, loading: loading || !rowState.length, disableRowSelectionOnClick: true, initialState: initialState, rowGroupingColumnMode: groupBy === 'teams' ? 'multiple' : 'single', columnHeaderHeight: 30, columnGroupHeaderHeight: 22, columnGroupingModel: (0, TableHeader_1.generateColumnGroupingModel)(startDate, finalColumns), defaultGroupingExpansionDepth: 1, getRowClassName: params => `super-app-theme--${params.row.status}`, disableAutosize: true, getCellClassName: params => (0, AllocationGridUtils_1.getCellClassName)(params, updatedRows), cellSelectionModel: cellSelectionModel, onCellSelectionModelChange: handleCellSelectionModelChange, slots: {
                toolbar: CustomToolbar_1.default,
                // columnMenu: CustomColumnMenu
                columnMenu: props => {
                    return React.createElement(CustomColumnMenu_1.CustomColumnMenu, { ...props, apiRef: apiRef });
                },
            }, slotProps: {
                loadingOverlay: {
                    variant: 'skeleton',
                    noRowsVariant: 'skeleton',
                },
                panel: {
                    anchorEl: filterButtonEl,
                    className: 'parent-grid-panel',
                },
                columnsManagement: {
                    getTogglableColumns,
                },
                toolbar: {
                    setFilterButtonEl,
                },
                columnsPanel: {
                    className: 'styleColumnMenu',
                    sx: StyledDataGrid_1.ColumnManagementStyles,
                },
                filterPanel: {
                    columnsSort: 'asc',
                    className: 'filterPopup',
                    filterFormProps: {
                        filterColumns,
                        columnInputProps: {
                            size: 'small',
                            sx: { mt: 'auto' },
                        },
                        operatorInputProps: {
                            size: 'small',
                            sx: { mt: 'auto' },
                        },
                        valueInputProps: {
                            InputComponentProps: {
                                size: 'small',
                            },
                        },
                        deleteIconProps: {
                            sx: {
                                '& .MuiSvgIcon-root': { color: '#d32f2f' },
                            },
                        },
                    },
                    sx: StyledDataGrid_1.FilterPanelStyles,
                },
            }, getAggregationPosition: groupNode => groupNode.depth === -1 ? null : 'inline', hideFooter: true, editMode: "row", aggregationRowsCount: params => {
                return params.rowNode.children?.length || 1;
            } }),
        React.createElement(CustomSnackbar_1.CustomSnackbar, { message: message, type: type, open: open, position: position })));
}
