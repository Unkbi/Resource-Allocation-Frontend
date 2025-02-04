"use client";
import AllocationGrid from "@/app/components/AllocationTable/AllocationGrid";
import { columnGroupingModel } from "../../AllocationTable/TableHeader";

const projectColumnConfig = [
  {
    field: "project",
    headerName: "Project Name",
    width: 200,
    headerClassName: "prime-header",
    cellClassName: "prime-cell",
  },
  {
    field: "teams",
    headerName: "Team",
    width: 200,
    disableColumnMenu: true,
    headerClassName: "secondary-header",
    cellClassName: "secondary-cell",
  },
  {
    field: "totalEffort",
    headerName: "Total Effort",
    width: 150,
    disableColumnMenu: true,
    type: "number",
    headerClassName: "secondary-header",
    cellClassName: "secondary-cell",
  },
];

export default function ProjectAllocation() {
  return (
    <>
      <AllocationGrid
        groupBy="project"
        columns={projectColumnConfig}
        columnGroupingModel={columnGroupingModel}
      />
    </>
  );
}
