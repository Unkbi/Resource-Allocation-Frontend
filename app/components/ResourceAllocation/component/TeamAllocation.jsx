"use client";
import AllocationGrid from "@/app/components/AllocationTable/AllocationGrid";
import { columnGroupingModel } from "../../AllocationTable/TableHeader";

const teamsColumnConfig = [
  {
    field: "teams",
    headerName: "Team Name",
    width: 250,
    headerClassName: "prime-header",
    cellClassName: "prime-cell",
  },
  {
    field: "resource",
    headerName: "Resource",
    width: 200,
    disableColumnMenu: true,
  },
  {
    field: "project",
    headerName: "Project",
    width: 200,
    disableColumnMenu: true,
    headerClassName: "secondary-header",
    cellClassName: "secondary-cell",
  },
  {
    field: "resourceType",
    headerName: "Resource Type",
    width: 200,
    disableColumnMenu: true,
    headerClassName: "secondary-header",
    cellClassName: "secondary-cell",
  },
];

export default function TeamAllocation() {
  return (
    <>
      <AllocationGrid
        groupBy="teams"
        columns={teamsColumnConfig}
        columnGroupingModel={columnGroupingModel}
      />
    </>
  );
}
