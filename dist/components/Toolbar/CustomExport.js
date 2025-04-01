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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const export_to_csv_1 = require("export-to-csv");
const x_data_grid_premium_1 = require("@mui/x-data-grid-premium");
const material_1 = require("@mui/material");
const react_redux_1 = require("react-redux");
const GridToolbarExport = () => {
    const view = (0, react_redux_1.useSelector)(state => state.allocationView.view);
    const apiRef = (0, x_data_grid_premium_1.useGridApiContext)();
    const isGroupedByTeams = view != 'Projects';
    const currentDate = new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '-');
    const csvConfig = (0, export_to_csv_1.mkConfig)({ useKeysAsHeaders: true,
        filename: `${view === 'Projects' ? 'Allocation_Projects' : 'Allocation_Teams'}_${currentDate}`
    });
    const excelPostProcess = (wb) => {
        const ws = wb.worksheet;
        const rows = ws.getRows(1, ws.rowCount);
        let team = '';
        let resource = '';
        if (isGroupedByTeams) {
            rows.forEach((row) => {
                if (row.getCell(1).value) {
                    team = row.getCell(1).value;
                }
                else if (team) {
                    row.getCell(1).value = team;
                }
                if (row.getCell(2).value) {
                    resource = row.getCell(2).value;
                }
                else if (resource) {
                    row.getCell(2).value = resource;
                }
            });
            for (let i = 1; i <= ws.rowCount; i++) {
                if (ws.getRow(i).getCell(3).value === '' || ws.getRow(i).getCell(3).value === null) {
                    ws.spliceRows(i, 1);
                    i--;
                }
            }
        }
        else {
            rows.forEach((row) => {
                if (row.getCell(1).value) {
                    team = row.getCell(1).value;
                }
                else if (team) {
                    row.getCell(1).value = team;
                }
            });
            for (let i = 1; i <= ws.rowCount; i++) {
                if (ws.getRow(i).getCell(2).value === '' || ws.getRow(i).getCell(2).value === null) {
                    ws.spliceRows(i, 1);
                    i--;
                }
            }
        }
        return wb;
    };
    const getRowsWithoutGroups = () => {
        let csv_data_array = apiRef.current.getDataAsCsv()?.split('\n');
        if (!csv_data_array)
            return '';
        let team = '';
        let resource = '';
        if (isGroupedByTeams) {
            csv_data_array?.forEach((row, index) => {
                if (index < 2)
                    return;
                let row_array = row?.split(',');
                if (row_array?.[0] && !row_array?.[1])
                    team = row_array?.[0];
                else if (team && !row_array?.[0]) {
                    row_array[0] = team;
                }
                if (row_array?.[1])
                    resource = row_array?.[1];
                else
                    row_array[1] = resource;
                csv_data_array[index] = row_array?.join(',');
            });
            csv_data_array = csv_data_array?.filter((row, index) => index < 1 || row.split(',')[2] !== '');
        }
        else {
            csv_data_array?.forEach((row, index) => {
                if (index < 2)
                    return;
                let row_array = row?.split(',');
                if (row_array?.[0] && !row_array?.[1])
                    team = row_array?.[0];
                else if (team && !row_array?.[0] && row_array?.[1] != '') {
                    row_array[0] = team;
                }
                csv_data_array[index] = row_array?.join(',');
            });
            csv_data_array = csv_data_array?.filter((row, index) => index < 1 || row.split(',')[1] !== '');
        }
        return csv_data_array?.join('\n');
    };
    const handleExport = () => {
        (0, export_to_csv_1.download)(csvConfig)(getRowsWithoutGroups());
    };
    const CustomCsvMenuItem = (0, material_1.styled)(material_1.MenuItem)(() => ({
        justifyContent: 'flex-start',
        textTransform: 'none',
        color: 'rgba(0, 0, 0, 0.87)',
        width: '100%',
        padding: '8px 16px',
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
    }));
    const CsvExportMenuItem = ({ hideMenu, ...props }) => {
        return (react_1.default.createElement(CustomCsvMenuItem, { ...props, onClick: handleExport }, "Download as CSV"));
    };
    return (react_1.default.createElement(x_data_grid_premium_1.GridToolbarExportContainer, null,
        react_1.default.createElement(x_data_grid_premium_1.GridExcelExportMenuItem, { options: { exceljsPostProcess: excelPostProcess,
                fileName: `${view === 'Projects' ? 'Allocation_Projects' : 'Allocation_Teams'}_${currentDate}`
            } }),
        react_1.default.createElement(CsvExportMenuItem, null)));
};
exports.default = (0, react_1.memo)(GridToolbarExport);
