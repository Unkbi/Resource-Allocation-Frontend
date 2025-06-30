'use client';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';

const organizationColumnConfig = [
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
        />
      </Box>
    </>
  );
}
