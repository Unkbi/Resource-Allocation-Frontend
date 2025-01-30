"use client"
import AllocationGrid from "@/app/components/AllocationTable/AllocationGrid";

const teamsColumnConfig = [
    { field: "project", headerName: "Teams Name", width: 250 },
    { field: "resource", headerName: "Resource", width: 200, disableColumnMenu: true },
    { field: "project", headerName: "Projects", width: 200, disableColumnMenu: true },
    { field: "totalEffort", headerName: "Resource Type", width: 200, disableColumnMenu: true },
    ];

export default function TeamAllocation() {
    return (
        <>
         <AllocationGrid 
            groupBy="resource"
            columns={teamsColumnConfig}
         />
        </>
    );
}
