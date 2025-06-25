'use client';
import { Box } from '@mui/material';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import type { GridColDef } from '@mui/x-data-grid-pro';

const organizationColumnConfig: GridColDef[] = [
  { field: 'teams', headerName: 'Organizaion Name', width: 240 },
  {
    field: 'project',
    headerName: 'Project',
    width: 200,
    disableColumnMenu: true,
  },
  {
    field: 'resourceType',
    headerName: 'Total Effort',
    width: 150,
    disableColumnMenu: true,
  },
];

export default function OrganizationAllocation() {
  return (
    <>
      <Box sx={{ height: 'calc(100vh - 54px)', width: '100%' }}>
        <AllocationGrid
          groupBy="organization"
          columns={organizationColumnConfig}
          loading={false}
          selectedTeam={null}
          setSelectedTeam={() => {}}
          initialState={{}}
          startDate={new Date()}
          endDate={new Date()}
          toolbarComponent={null}
          NoRowsOverlay={null}
          mode="view"
        />
      </Box>
    </>
  );
}
