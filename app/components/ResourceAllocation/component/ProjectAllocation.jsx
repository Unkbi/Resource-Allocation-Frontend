"use client"
import AllocationGrid from "@/app/components/AllocationTable/AllocationGrid";

const projectColumnConfig =[
    { field: "project", headerName: "Project Name", width: 250 },
    { field: "resource", headerName: "Resource", width: 200, disableColumnMenu: true },
    { field: "role", headerName: "Role", width: 200, disableColumnMenu: true },
    { field: "totalEffort", headerName: "Total Effort", width: 150, disableColumnMenu: true },
    ];

export default function ProjectAllocation() {
    return (
        <>
         <AllocationGrid 
            groupBy="project"
            columns={projectColumnConfig}
         />
        </>
    );
}
