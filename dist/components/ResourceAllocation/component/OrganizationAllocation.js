"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OrganizationAllocation;
const AllocationGrid_1 = __importDefault(require("@/app/components/AllocationTable/AllocationGrid"));
const organizationColumnConfig = [
    { field: "teams", headerName: "Organizaion Name", width: 240 },
    { field: "project", headerName: "Project", width: 200, disableColumnMenu: true },
    { field: "resourceType", headerName: "Total Effort", width: 150, disableColumnMenu: true },
];
function OrganizationAllocation() {
    return (React.createElement(React.Fragment, null,
        React.createElement(AllocationGrid_1.default, { groupBy: "organization", columns: organizationColumnConfig })));
}
