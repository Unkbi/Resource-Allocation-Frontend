'use client';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { AppDispatch, RootState } from '@/app/redux/store';
import { GridCellParams } from '@mui/x-data-grid';
import {
  calculateTotalEffort,
  getAllocationManagerFromPath,
} from '@/app/utils/common';
import EllipsisNameCell from './EllipsisNameCell';
import CustomToolbar from '../../Toolbar/CustomToolbarUpdated';
import NoRowsOverlay from './NoRowsOverlay';
import { Box } from '@mui/material';
import { AllAllocations } from '@/app/types';
import { useAllocationGrid } from '@/app/hooks/useAllocationGrid';
import {
  getCombinedAllocation,
  injectBlankRows,
  normalizeRow,
} from '@/app/utils/allocationUtils';
import { setLoading } from '@/app/redux/reducers/allAllocationsReducer';

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
export interface Project {
  result: any;
  Name: string;
  id: string;
  projectOvertimeAllowed: string;
  Cost: number | null;
  CostCurrency: string;
  Description: string;
  EndDate: string;
  Location: string;
  ProjectSponsor: string;
  ProjectManager: string;
  StartDate: string;
  Status: string;
  Type: string;
}

export default function TeamAllocation({
  startDate,
  endDate,
}: TeamAllocationProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { teams, teamsResources } = useSelector(
    (state: RootState) => state.teams
  );
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
  const { allAllocations, loading, dataProcessing } = useSelector(
    (state: RootState) => state.allAllocations
  );
  const {
    setRows,
    ready,
    getAllRows: getAllTeamViewRows,
  } = useAllocationGrid('teamAllocation');
  const { getAllRows: getAllProjectViewRows } =
    useAllocationGrid('projectAllocation');

  useEffect(() => {
    if (ready) {
      let filteredResources;
      if (!loading && getAllProjectViewRows().length > 0) {
        filteredResources = removeResourcesWithNoTeams(
          injectBlankRows(
            getAllProjectViewRows() as AllAllocations[],
            teams?.result || [],
            // @ts-ignore
            teamsResources,
            startDate,
            endDate
          )
        );
      } else if (loading && allAllocations) {
        filteredResources = removeResourcesWithNoTeams(allAllocations || []);
        dispatch(setLoading(false));
      }

      const formattedResources = filteredResources?.map(allocation => ({
        ...allocation,
        totalEffort: calculateTotalEffort(normalizeRow(allocation)),
        hasAllocation: calculateTotalEffort(normalizeRow(allocation)) > 0,
        teamAllocationManager: getAllocationManagerFromPath(
          allocation?.teamAllocationManager,
          _resources?.result || []
        )?.FullName,
      }));

      setRows(formattedResources || []);
    }
  }, [ready, allAllocations]);

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
      headerName: 'Organization',
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
      width: 100,
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
      width: 160,
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
      width: 190,
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
      width: 195,
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
      width: 260,
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
      field: 'projectOvertimeAllowed',
      headerName: 'Allow Overtime',
      width: 140,
      type: 'string',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return (
          <EllipsisNameCell
            value={
              allocation?.projectOvertimeAllowed === true
                ? 'True'
                : allocation?.projectOvertimeAllowed === false
                  ? 'False'
                  : ''
            }
          />
        );
      },
    },
    {
      field: 'projectCost',
      headerName: 'Project Budget',
      width: 140,
      type: 'string',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const cost = allocation?.projectCost;
        return <EllipsisNameCell value={cost ? `$ ${cost}` : ''} />;
      },
    },
    {
      field: 'projectCurrency',
      headerName: 'Project Currency',
      width: 150,
      type: 'string',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.projectCurrency || ''} />;
      },
    },
    {
      field: 'Description',
      headerName: 'Project Description',
      width: 180,
      type: 'string',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.Description || ''} />;
      },
    },
    {
      field: 'projectLocation',
      headerName: 'Project Location',
      width: 160,
      type: 'string',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.projectLocation || ''} />;
      },
    },
    {
      field: 'projectStartDate',
      headerName: 'Project Start Date',
      width: 160,
      type: 'string',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.projectStartDate || ''} />;
      },
    },
    {
      field: 'projectEndDate',
      headerName: 'Project End Date',
      width: 160,
      type: 'string',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.projectEndDate || ''} />;
      },
    },
    {
      field: 'ProjectSponsor',
      headerName: 'Project Sponsor',
      width: 160,
      type: 'string',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.projectSponsor || ''} />;
      },
    },
    {
      field: 'ProjectManager',
      headerName: 'Project Manager',
      width: 160,
      type: 'string',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.projectManager || ''} />;
      },
    },
    {
      field: 'Status',
      headerName: 'Project Status',
      width: 130,
      type: 'string',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.projectStatus || ''} />;
      },
    },
    {
      field: 'Type',
      headerName: 'Project Type',
      width: 130,
      type: 'string',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.projectType || ''} />;
      },
    },
    {
      field: 'teamAllocationManager',
      headerName: 'Allocation Manager',
      width: 170,
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
    return allocations.filter(
      allocation =>
        allocation.teams &&
        (_resources?.result?.find(res => res.Id === allocation.resourceId)
          ?.EndDate
          ? new Date(
              _resources?.result?.find(
                res => res.Id === allocation.resourceId
              )?.EndDate
            ) >= new Date(startDate)
          : true) &&
        (_resources?.result?.find(res => res.Id === allocation.resourceId)
          ?.StartDate
          ? new Date(
              _resources?.result?.find(
                res => res.Id === allocation.resourceId
              )?.StartDate
            ) <= new Date(endDate)
          : true)
    );
  };

  return (
    <>
      <Box sx={{ height: 'calc(100vh - 54px)', width: '100%' }}>
        <AllocationGrid
          loading={dataProcessing}
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
                projectOvertimeAllowed: false,
                projectCost: false,
                projectCurrency: false,
                Description: false,
                projectLocation: false,
                ProjectManager: false,
                projectSponsor: false,
                projectEndDate: false,
                projectStartDate: false,
                Status: false,
                Type: false,
              },
            },
          }}
          NoRowsOverlay={NoRowsOverlay}
          viewId="teamAllocation"
        />
        {!allAllocations && !dataProcessing && (
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
