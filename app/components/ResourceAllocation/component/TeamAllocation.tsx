'use client';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { AppDispatch, RootState } from '@/app/redux/store';
import { GridCellParams } from '@mui/x-data-grid';
import { getAllocationManagerFromPath } from '@/app/utils/common';
import EllipsisNameCell from './EllipsisNameCell';
import CustomToolbar from '../../Toolbar/CustomToolbarUpdated';
import NoRowsOverlay from './NoRowsOverlay';
import { Box } from '@mui/material';
import { AllAllocations } from '@/app/types';

interface TeamAllocationProps {
  startDate: string;
  endDate: string;
}
interface Resource {
  Id: string;
  Email: string;
  PhoneNumber: string;
  Department: string;
  [key: string]: any;
}
export default function TeamAllocation({
  startDate,
  endDate,
}: TeamAllocationProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { teams } = useSelector((state: RootState) => state.teams);
  const _resources = useSelector(
    (state: RootState) => state.resources.resources
  ) as {
    result?: Resource[];
    loading?: boolean;
    error?: string;
  };
  const { currentView } = useSelector(
    (state: RootState) => state.allocationView
  );
  const { allAllocations, calendarDate, loading, dataProcessing } = useSelector(
    (state: RootState) => state.allAllocations
  );

  const handleAddClick = (params: GridCellParams) => {
    dispatch(
      openDialog({
        title: 'Add Allocation',
        submitButtonText: 'Add',
        cancelButtonText: 'Cancel',
        formType: 'add_allocation',
        initialData: {
          Project: params.value,
        },
      })
    );
  };

  const getTeam = (params: GridCellParams) => {
    if (
      params.rowNode.type === 'group' &&
      params.rowNode.groupingField === 'teams'
    ) {
      // Find the team by name in the teams array
      const teamName = params.rowNode.groupingKey;
      const team = teams?.result?.find(t => t.Name === teamName);
      return team;
    }
    return null;
  };

  const getResource = (params: GridCellParams): Resource | null => {
    if (
      params.rowNode.type === 'group' &&
      params.rowNode.groupingField === 'resource'
    ) {
      const resourceName = params.rowNode.groupingKey;
      const resource = _resources?.result?.find(
        r => r.FullName === resourceName
      );
      return resource || null;
    }
    return null;
  };

  const teamsColumnConfig = [
    {
      field: 'teams',
      headerName: 'Team Name',
      width: 201,
      headerClassName: 'prime-header',
      cellClassName: 'prime-cell',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const { rowNode, api, value = '' } = params;
        const isGridTreeNode = 'children' in rowNode; // Required for Typescript
        let resource_count: any[] = [];
        if (isGridTreeNode && rowNode.children) {
          resource_count = [
            ...new Set(rowNode?.children?.map(child => api.getRow(child))),
          ];
        }
        return (
          <EllipsisNameCell
            value={value as string}
            resourceCount={resource_count.length}
            onAddClick={() => handleAddClick(params)}
            showAddIcon
            showAddButton={false}
          />
        );
      },
    },
    {
      field: 'Email',
      headerName: 'Email',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: 'false',
      primaryColumn: true,
      headerClassName: 'prime-header',
      cellClassName: 'secondary-cell',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.Email || ''} />;
      },
    },
    {
      field: 'PhoneNumber',
      headerName: 'Phone Number',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.PhoneNumber || ''} />;
      },
    },
    {
      field: 'Department',
      headerName: 'Organisation',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.Department || ''} />;
      },
    },
    {
      field: 'HRLevel',
      headerName: 'HR Level',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.HRLevel || ''} />;
      },
    },
    {
      field: 'Role',
      headerName: 'Role',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.Role || ''} />;
      },
    },
    {
      field: 'WorkLocation',
      headerName: 'Work Location',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.WorkLocation || ''} />;
      },
    },
    {
      field: 'StartDate',
      headerName: 'Resource Start Date',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.StartDate || ''} />;
      },
    },
    {
      field: 'EndDate',
      headerName: 'Resource End Date',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.EndDate || ''} />;
      },
    },
    {
      field: 'LocationCategory',
      headerName: 'Location Category',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.LocationCategory || ''} />;
      },
    },
    {
      field: 'AverageWeeklyHours',
      headerName: 'Average Weekly Hours',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.AverageWeeklyHours || ''} />;
      },
    },
    {
      field: 'ContractorHourlyRate',
      headerName: 'Contractor Hourly Rate',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return (
          <EllipsisNameCell value={resource?.ContractorHourlyRate || ''} />
        );
      },
    },
    {
      field: 'ContractorHourlyRateCurrency',
      headerName: 'Contractor Hourly Rate Currency',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return (
          <EllipsisNameCell
            value={resource?.ContractorHourlyRateCurrency || ''}
          />
        );
      },
    },
    {
      field: 'resourceType',
      headerName: 'Resource Type',
      width: 135,
      sortable: false,
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'secondary-cell',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.Type || ''} />;
      },
    },
    {
      field: 'teamStatus',
      headerName: 'Team Status',
      width: 130,
      type: 'string',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const team = getTeam(params);
        return team ? <EllipsisNameCell value={team?.Status ?? 'N/A'} /> : null;
      },
    },
    {
      field: 'teamAllocationManager',
      headerName: 'Allocation Manager',
      width: 180,
      type: 'string',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const team = getTeam(params);
        return team && _resources && 'result' in _resources ? (
          <EllipsisNameCell
            value={
              getAllocationManagerFromPath(
                team?.AllocationManager,
                _resources?.result || []
              )?.FullName ?? 'N/A'
            }
          />
        ) : null;
      },
    },
  ];

  const removeResourcesWithNoTeams = (allocations: AllAllocations[]) => {
    return allocations.filter(allocation => allocation.teams);
  };

  return (
    <>
      <Box sx={{ height: 'calc(100vh - 54px)', width: '100%' }}>
        <AllocationGrid
          loading={loading || dataProcessing}
          groupBy="teams"
          mode="team"
          startDate={startDate}
          endDate={endDate}
          columns={teamsColumnConfig}
          selectedTeam={selectedTeam}
          toolbarComponent={CustomToolbar}
          setSelectedTeam={setSelectedTeam}
          initialState={{
            columns: {
              columnVisibilityModel: {
                teamAllocationManager: false,
                teamStatus: false,
                __row_group_by_columns_group_teams__: true, // This is the grouping column for teams
                __row_group_by_columns_group_resource__: true, // This is the gtouping column for resource
                project: true,
                resourceType: true,
                teams: false, // This column has to always be false, as we are using grouping.
                resource: false, // This column has to always be false, as we are using grouping.
                Email: false,
                PhoneNumber: false,
                Department: false,
                HRLevel: false,
                Role: false,
                WorkLocation: false,
                StartDate: false,
                EndDate: false,
                LocationCategory: false,
                AverageWeeklyHours: false,
                ContractorHourlyRate: false,
                ContractorHourlyRateCurrency: false,
              },
            },
          }}
          NoRowsOverlay={NoRowsOverlay}
          data={removeResourcesWithNoTeams(allAllocations || []) ?? []}
        />
        {!allAllocations && !loading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '90vh',
            }}
          >
            <div>No Data</div>
          </div>
        )}
      </Box>
    </>
  );
}
