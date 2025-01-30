"use client"
import AllocationGrid from "@/app/components/AllocationTable/AllocationGrid";

const organizationColumnConfig =[
    { field: "project", headerName: "Organizaion Name", width: 250 },
    { field: "resource", headerName: "Resource", width: 200, disableColumnMenu: true },
    { field: "role", headerName: "Role", width: 200, disableColumnMenu: true },
    { field: "totalEffort", headerName: "Total Effort", width: 150, disableColumnMenu: true },
    ];

export default function OrganizationAllocation() {
    return (
        <>
         <AllocationGrid 
            groupBy="role"
            columns={organizationColumnConfig}
         />
        </>
    );
}
