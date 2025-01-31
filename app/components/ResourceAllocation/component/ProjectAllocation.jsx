"use client"
import AllocationGrid from "@/app/components/AllocationTable/AllocationGrid";

const projectColumnConfig = [
    { field: "project", headerName: "Project Name", width: 250 },
    { field: "resource", headerName: "Resource", width: 200, disableColumnMenu: true },
    { field: "teams", headerName: "Teams", width: 200, disableColumnMenu: true },
    {
        field: "totalEffort",
        headerName: "Total Effort",
        width: 150,
        disableColumnMenu: true,
        type: "number",
        // valueGetter: (params) => {
        //     console.log('params: ', params)
        //     return Object.keys(params)
        //         .filter((key) => key.startsWith("W"))
        //         .reduce((sum, week) => sum + (Number(params[week]) || 0), 0)
        // },
    },
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
