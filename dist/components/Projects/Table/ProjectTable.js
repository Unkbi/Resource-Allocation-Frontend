"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const StyledDataGrid_1 = require("../../AllocationTable/styles/StyledDataGrid");
const x_data_grid_premium_1 = require("@mui/x-data-grid-premium");
const ProjectToolbar_1 = __importDefault(require("../../Toolbar/ProjectToolbar"));
const react_1 = require("react");
function CustomColumnMenu(props) {
    return (React.createElement(x_data_grid_premium_1.GridColumnMenu, { ...props, slots: {
            columnMenuAggregationItem: null,
            columnMenuGroupingItem: null,
        } }));
}
const ProjectTable = ({ columns, rows, loading }) => {
    const apiRef = (0, x_data_grid_premium_1.useGridApiRef)();
    const [filterButtonEl, setFilterButtonEl] = (0, react_1.useState)(null);
    return (React.createElement(StyledDataGrid_1.StyledDataGrid, { apiRef: apiRef, columns: columns, rows: rows, hideFooter: true, loading: loading, initialState: {
            columns: {
                columnVisibilityModel: {
                    Owner: false,
                    Manager: false,
                    Location: false,
                },
            },
        }, slots: {
            toolbar: ProjectToolbar_1.default,
            columnMenu: CustomColumnMenu
        }, sx: {
            height: '95vh',
            '& .MuiDataGrid-cell': {
                borderRight: 'none', // This removes the vertical borders between cells
            },
            '& .MuiDataGrid-columnHeader': {
                padding: '0 16px',
                borderRight: 'none',
            }
        }, slotProps: {
            loadingOverlay: {
                variant: 'skeleton',
                noRowsVariant: 'skeleton',
            },
            panel: {
                anchorEl: filterButtonEl,
                className: 'parent-grid-panel',
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
        } }));
};
exports.default = ProjectTable;
