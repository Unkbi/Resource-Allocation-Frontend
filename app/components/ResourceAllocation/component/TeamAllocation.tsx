'use client';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { AppDispatch, RootState } from '@/app/redux/store';
import { GridCellParams } from '@mui/x-data-grid';
import {
  formatDateMMDDYYYY,
  getAllocationManagerFromPath,
  getResourceFromUid,
} from '@/app/utils/common';
import EllipsisNameCell from './EllipsisNameCell';
// import CustomToolbar from '../../Toolbar/CustomToolbarUpdated';
import CustomToolbar from '../../Toolbar/CustomAllocationToolbar';
import NoRowsOverlay from './NoRowsOverlay';
import { Box } from '@mui/material';
import { AllAllocations, Location } from '@/app/types';
import { useAllocationGrid } from '@/app/hooks/useAllocationGrid';
import {
  initSortAllocations,
  injectBlankRows,
  normalizeRow,
} from '@/app/utils/allocationUtils';
import { setLoading } from '@/app/redux/reducers/allAllocationsReducer';
import { useAllGridRowsByView } from '@/app/hooks/useAllGridRowsByView';
import { CrudPermissions, withRBAC } from '../../HOC/withRBAC';
import { PORTFOLIO_DISPLAY_NAME } from '@/app/constants/constants';

interface TeamAllocationProps {
  startDate: string;
  endDate: string;
  permissions: Record<string, CrudPermissions>;
  loadingPermissions: boolean;
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

export type GridComparatorArgs<T = string> = {
  v1: T | null;
  v2: T | null;
  p1: GridCellParams;
  p2: GridCellParams;
};

export type GridComparator<T = string> = (
  args: GridComparatorArgs<T>
) => number;

export const compareNumberEmptyLast = (
  a?: number | any,
  b?: number | any,
  direction: 'asc' | 'desc' = 'asc'
) => {
  const aEmpty = a === null || a === undefined || Number.isNaN(a);
  const bEmpty = b === null || b === undefined || Number.isNaN(b);
  if (aEmpty && !bEmpty) return 1;
  if (!aEmpty && bEmpty) return -1;
  if (aEmpty && bEmpty) return 0;

  const result = a - b;
  return direction === 'asc' ? result : -result;
};

export const compareStringEmptyLast = (
  a?: string | null,
  b?: string | null,
  direction: 'asc' | 'desc' = 'asc'
) => {
  const aVal = a?.trim() ?? '';
  const bVal = b?.trim() ?? '';
  const aEmpty = !aVal;
  const bEmpty = !bVal;
  if (aEmpty && !bEmpty) return 1;
  if (!aEmpty && bEmpty) return -1;
  if (aEmpty && bEmpty) return 0;
  const result = aVal.localeCompare(bVal);
  return direction === 'asc' ? result : -result;
};

export const compareDateEmptyLast = (
  a?: string | null,
  b?: string | null,
  direction: 'asc' | 'desc' = 'asc'
) => {
  const aTime = a ? new Date(a).getTime() : NaN;
  const bTime = b ? new Date(b).getTime() : NaN;

  const aEmpty = Number.isNaN(aTime);
  const bEmpty = Number.isNaN(bTime);

  if (aEmpty && !bEmpty) return 1;
  if (!aEmpty && bEmpty) return -1;
  if (aEmpty && bEmpty) return 0;
  const result = aTime - bTime;
  return direction === 'asc' ? result : -result;
};

function TeamAllocation({
  startDate,
  endDate,
  permissions,
  loadingPermissions,
}: TeamAllocationProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { teams, teamsResources } = useSelector(
    (state: RootState) => state.teams
  );
  const { allResourcesDetail } = useSelector(
    (state: RootState) => state.allResourcesDetail
  );
  const _resources = useSelector(
    (state: RootState) => state.resources.resources
  );
  const { location } = useSelector((state: RootState) => state.allSettings);
  const showActuals = useSelector(
    (state: RootState) => state.allocationView.currentView?.showActuals ?? false
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
  const { getAllRowsForView, setRowsForView } = useAllGridRowsByView();
  const { scalarSettings } = useSelector(
    (state: RootState) => state.allSettings
  );
  const { resources } = useSelector((state: RootState) => state.resources);

  useEffect(() => {
    if (loadingPermissions) return;
    if (permissions['Allocation'].r && ready) {
      let filteredResources;
      const allTempRows = getAllRowsForView('teamAllocationtemp');
      if (!loading && allTempRows?.length > 0) {
        setRows(initSortAllocations(allTempRows as AllAllocations[]) || []);
        setRowsForView('teamAllocationtemp', []);
      } else {
        const projectViewRows = getAllProjectViewRows();
        if (!loading && projectViewRows.length > 0) {
          filteredResources = initSortAllocations(
            removeResourcesWithNoTeams(
              injectBlankRows(
                projectViewRows as AllAllocations[],
                teams || [],
                // @ts-ignore
                teamsResources,
                allResourcesDetail,
                location,
                startDate,
                endDate
              )
            )
          );
        } else if (allAllocations) {
          filteredResources = initSortAllocations(
            removeResourcesWithNoTeams(allAllocations || [])
          );
          dispatch(setLoading(false));
        }

        const formattedResources = filteredResources?.map(allocation => ({
          ...allocation,
          // commenting old total effort calculation
          // totalEffort: calculateTotalEffort(normalizeRow(allocation))
          // hasAllocation: calculateTotalEffort(normalizeRow(allocation)) > 0,
          hasAllocation: (allocation?.totalEffort ?? 0) > 0,
          teamAllocationManager: getAllocationManagerFromPath(
            allocation?.teamAllocationManager,
            _resources || []
          )?.FullName,
        }));

        setRows(formattedResources || []);
      }
      // Sahadev : Reset temp View for Project Related Views, Currently ProjectsView and ProtfolioView.
      setRowsForView('projectAllocationtemp', []);
    }
  }, [ready, allAllocations, loadingPermissions]);

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
      const team = teams?.find(t => t.Name === teamName);
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
      const resource = (_resources as Resource[])?.find(
        r => r.FullName === resourceName
      );
      return resource || null;
    }
    return null;
  };

  const resourceTypeComparator: GridComparator = ({ p1, p2 }) => {
    const r1 = getResource(p1)?.Type ?? '';
    const r2 = getResource(p2)?.Type ?? '';
    return r1.localeCompare(r2);
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
      field: 'email',
      headerName: 'Email',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      headerClassName: 'prime-header',
      cellClassName: 'secondary-cell',
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const e1 = getResource(p1)?.Email;
          const e2 = getResource(p2)?.Email;
          return compareStringEmptyLast(e1, e2, sortDirection);
        };
      },
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.Email || ''} />;
      },
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone Number',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const raw1 = getResource(p1)?.PhoneNumber;
          const raw2 = getResource(p2)?.PhoneNumber;
          const n1 =
            raw1 === null || raw1 === undefined || raw1.trim() === ''
              ? null
              : Number(raw1);
          const n2 =
            raw2 === null || raw2 === undefined || raw2.trim() === ''
              ? null
              : Number(raw2);
          return compareNumberEmptyLast(n1, n2, sortDirection);
        };
      },
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.PhoneNumber || ''} />;
      },
    },
    {
      field: 'organisationName',
      headerName: 'Organization Name',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const r1 = getResource(p1)?.Id;
          const DetailsR1 = allResourcesDetail?.find(
            (item: any) => item.Resource?.Id === r1
          );
          const org1 = DetailsR1?.Organization?.Name;

          const r2 = getResource(p2)?.Id;
          const DetailsR2 = allResourcesDetail?.find(
            (item: any) => item.Resource?.Id === r2
          );
          const org2 = DetailsR2?.Organization?.Name;
          return compareStringEmptyLast(org1, org2, sortDirection);
        };
      },
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const resourceDetails = allResourcesDetail?.find(
          (item: any) => item.Resource?.Id === resource?.Id
        );
        const organizationName = resourceDetails?.Organization?.Name || '';

        return <EllipsisNameCell value={organizationName || ''} />;
      },
    },
    {
      field: 'hrLevel',
      headerName: 'HR Level',
      width: 100,
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const raw1 = getResource(p1)?.HRLevel;
          const raw2 = getResource(p2)?.HRLevel;
          const h1 =
            raw1 === null || raw1 === undefined || raw1 === ''
              ? null
              : Number(raw1);
          const h2 =
            raw2 === null || raw2 === undefined || raw2 === ''
              ? null
              : Number(raw2);
          return compareNumberEmptyLast(h1, h2, sortDirection);
        };
      },
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.HRLevel || ''} />;
      },
    },
    {
      field: 'role',
      headerName: 'Title',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const r1 = getResource(p1)?.Role ?? '';
          const r2 = getResource(p2)?.Role ?? '';
          return compareStringEmptyLast(r1, r2, sortDirection);
        };
      },
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.Role || ''} />;
      },
    },
    {
      field: 'workLocation',
      headerName: 'Work Location',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const r1 = getResource(p1)?.WorkLocation ?? '';
          const r2 = getResource(p2)?.WorkLocation ?? '';
          return compareStringEmptyLast(r1, r2, sortDirection);
        };
      },
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const locationDetails = location?.find(
          (l: Location) => l.Id === resource?.WorkLocation
        );
        return <EllipsisNameCell value={locationDetails?.Name as string} />;
      },
    },
    {
      field: 'resourceStartDate',
      headerName: 'Resource Start Date',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const d1 = getResource(p1)?.StartDate ?? null;
          const d2 = getResource(p2)?.StartDate ?? null;
          return compareDateEmptyLast(d1, d2, sortDirection);
        };
      },
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return (
          <EllipsisNameCell
            value={formatDateMMDDYYYY(resource?.StartDate) || ''}
          />
        );
      },
    },
    {
      field: 'resourceEndDate',
      headerName: 'Resource End Date',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const d1 = getResource(p1)?.EndDate ?? null;
          const d2 = getResource(p2)?.EndDate ?? null;
          return compareDateEmptyLast(d1, d2, sortDirection);
        };
      },
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return (
          <EllipsisNameCell
            value={formatDateMMDDYYYY(resource?.EndDate) || ''}
          />
        );
      },
    },
    {
      field: 'resourceLocationCategory',
      headerName: 'Location Category',
      width: 160,
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const r1 = getResource(p1)?.LocationCategory ?? '';
          const r2 = getResource(p2)?.LocationCategory ?? '';
          return compareStringEmptyLast(r1, r2, sortDirection);
        };
      },
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.LocationCategory || ''} />;
      },
    },
    {
      field: 'averageWeeklyHours',
      headerName: 'Average Weekly Hours',
      width: 190,
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const raw1 = getResource(p1)?.AverageWeeklyHours;
          const raw2 = getResource(p2)?.AverageWeeklyHours;
          const h1 =
            raw1 === null || raw1 === undefined || raw1 === ''
              ? null
              : Number(raw1);
          const h2 =
            raw2 === null || raw2 === undefined || raw2 === ''
              ? null
              : Number(raw2);
          return compareNumberEmptyLast(h1, h2, sortDirection);
        };
      },
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.AverageWeeklyHours || ''} />;
      },
    },
    {
      field: 'contractorHourlyRate',
      headerName: 'Contractor Hourly Rate',
      width: 195,
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const raw1 = getResource(p1)?.ContractorHourlyRate;
          const raw2 = getResource(p2)?.ContractorHourlyRate;
          const r1 =
            raw1 === null || raw1 === undefined || raw1 === ''
              ? null
              : Number(raw1);
          const r2 =
            raw2 === null || raw2 === undefined || raw2 === ''
              ? null
              : Number(raw2);
          return compareNumberEmptyLast(r1, r2, sortDirection);
        };
      },
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return (
          <EllipsisNameCell value={resource?.ContractorHourlyRate || ''} />
        );
      },
    },
    {
      field: 'contractorHourlyRateCurrency',
      headerName: 'Contractor Hourly Rate Currency',
      width: 260,
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const r1 = getResource(p1)?.ContractorHourlyRateCurrency ?? '';
          const r2 = getResource(p2)?.ContractorHourlyRateCurrency ?? '';
          return compareStringEmptyLast(r1, r2, sortDirection);
        };
      },
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
      sortable: true,
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'secondary-cell',
      sortComparator: (_v1: any, _v2: any, p1: any, p2: any) =>
        resourceTypeComparator({ v1: _v1, v2: _v2, p1, p2 }),
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
      sortable: true,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const team = getTeam(params);
        return team ? <EllipsisNameCell value={team?.Status || ''} /> : null;
      },
    },
    {
      field: 'projectOvertimeAllowed',
      headerName: 'Allow Overtime',
      width: 140,
      type: 'string',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return (
          <EllipsisNameCell
            value={
              allocation?.projectOvertimeAllowed
                ? allocation?.projectOvertimeAllowed
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
      sortable: true,
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
      sortable: true,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.projectCurrency || ''} />;
      },
    },
    {
      field: 'projectDescription',
      headerName: 'Project Description',
      width: 180,
      type: 'string',
      isEditable: false,
      sortable: true,
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
      sortable: true,
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
      sortable: true,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return (
          <EllipsisNameCell
            value={formatDateMMDDYYYY(allocation?.projectStartDate) || ''}
          />
        );
      },
    },
    {
      field: 'projectEndDate',
      headerName: 'Project End Date',
      width: 160,
      type: 'string',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return (
          <EllipsisNameCell
            value={formatDateMMDDYYYY(allocation?.projectEndDate) || ''}
          />
        );
      },
    },
    {
      field: 'projectSponsor',
      headerName: 'Project Sponsor',
      width: 160,
      type: 'string',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.projectSponsor || ''} />;
      },
    },
    {
      field: 'projectManager',
      headerName: 'Project Manager',
      width: 160,
      type: 'string',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.projectManager || ''} />;
      },
    },
    {
      field: 'projectStatus',
      headerName: 'Project Status',
      width: 130,
      type: 'string',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.projectStatus || ''} />;
      },
    },
    {
      field: 'projectType',
      headerName: 'Project Type',
      width: 130,
      type: 'string',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.projectType || ''} />;
      },
    },
    {
      field: 'projectTypeGroup',
      headerName: 'Project Type Group',
      width: 150,
      type: 'string',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.projectTypeGroup || ''} />;
      },
    },
    {
      field: 'teamAllocationManager',
      headerName: 'Allocation Manager',
      width: 170,
      type: 'string',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const team = getTeam(params);

        return team && _resources ? (
          <EllipsisNameCell
            value={
              getAllocationManagerFromPath(
                team?.AllocationManager,
                _resources || []
              )?.FullName || ''
            }
          />
        ) : null;
      },
    },
    {
      field: 'manager',
      headerName: 'Manager', // Resource page manager detail
      width: 130,
      type: 'string',
      isEditable: false,
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const r1 = getResource(p1)?.Manager;
          const m1 = getResourceFromUid(r1, resources);
          const n1 = m1?.FullName;
          const r2 = getResource(p2)?.Manager ?? '';
          const m2 = getResourceFromUid(r2, resources);
          const n2 = m2?.FullName;
          return compareStringEmptyLast(n1, n2, sortDirection);
        };
      },
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const resourceDetails = allResourcesDetail?.find(
          (item: any) => item.Resource?.Id === resource?.Manager
        );
        const Manager = resourceDetails?.Resource?.FullName || '';
        return resource ? <EllipsisNameCell value={Manager || ''} /> : null;
      },
    },
    {
      field: 'resourceStatus',
      headerName: 'Resource Status',
      width: 130,
      type: 'string',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const r1 = getResource(p1)?.Department ?? '';
          const r2 = getResource(p2)?.Department ?? '';
          return compareStringEmptyLast(r1, r2, sortDirection);
        };
      },
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return resource ? (
          <EllipsisNameCell value={resource?.Status || ''} />
        ) : null;
      },
    },
    {
      field: 'organisationStatus',
      headerName: 'Organisation Status',
      width: 130,
      type: 'string',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const r1 = getResource(p1)?.Department ?? '';
          const r2 = getResource(p2)?.Department ?? '';
          return compareStringEmptyLast(r1, r2, sortDirection);
        };
      },

      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const resourceDetails = allResourcesDetail?.find(
          (item: any) => item.Resource?.Id === resource?.Id
        );
        const organizationStatus = resourceDetails?.Organization?.Status || '';
        return resource ? (
          <EllipsisNameCell value={organizationStatus || ''} />
        ) : null;
      },
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const r1 = getResource(p1)?.Department ?? '';
          const r2 = getResource(p2)?.Department ?? '';
          return compareStringEmptyLast(r1, r2, sortDirection);
        };
      },
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.Department || ''} />;
      },
    },
    {
      field: 'portfolioName',
      headerName: scalarSettings?.Portfolio_Name || PORTFOLIO_DISPLAY_NAME,
      width: 148,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      sortable: true,
      renderCell: (params: GridCellParams) => {
        const value =
          typeof params.value === 'string' && params.value !== 'zzzzz'
            ? params.value
            : '';
        return <EllipsisNameCell value={value} />;
      },
    },
    {
      field: 'portfolioStatus',
      headerName: 'Portfolio Status',
      width: 180,
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.portfolioStatus || ''} />;
      },
    },
    {
      field: 'portfolioDescription',
      headerName: 'Portfolio Description',
      width: 180,
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      getSortComparator: (sortDirection: 'asc' | 'desc') => {
        return (
          _v1: string | null,
          _v2: string | null,
          p1: GridCellParams,
          p2: GridCellParams
        ) => {
          const r1 = getResource(p1)?.portfolioDescription ?? '';
          const r2 = getResource(p2)?.portfolioDescription ?? '';
          return compareStringEmptyLast(r1, r2, sortDirection);
        };
      },
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return (
          <EllipsisNameCell value={allocation?.portfolioDescription || ''} />
        );
      },
    },
  ];

  const removeResourcesWithNoTeams = (allocations: AllAllocations[]) => {
    return allocations.filter(
      allocation =>
        allocation.teams &&
        ((_resources as Resource[])?.find(
          res => res.Id === allocation.resourceId
        )?.EndDate
          ? new Date(
              (_resources as Resource[])?.find(
                res => res.Id === allocation.resourceId
              )?.EndDate
            ) >= new Date(startDate)
          : true) &&
        ((_resources as Resource[])?.find(
          res => res.Id === allocation.resourceId
        )?.StartDate
          ? new Date(
              (_resources as Resource[])?.find(
                res => res.Id === allocation.resourceId
              )?.StartDate
            ) <= new Date(endDate)
          : true)
    );
  };

  return (
    <>
      <Box
        sx={{ height: 'calc(100vh - 31px)', width: '100%', paddingTop: '0px' }}
      >
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
                email: false,
                phoneNumber: false,
                department: false,
                hrLevel: false,
                role: false,
                workLocation: false,
                resourceStartDate: false,
                resourceEndDate: false,
                resourceLocationCategory: false,
                averageWeeklyHours: false,
                contractorHourlyRate: false,
                contractorHourlyRateCurrency: false,
                projectOvertimeAllowed: false,
                projectCost: false,
                projectCurrency: false,
                projectDescription: false,
                projectLocation: false,
                projectManager: false,
                projectSponsor: false,
                projectEndDate: false,
                projectStartDate: false,
                projectStatus: false,
                projectType: false,
                projectTypeGroup: false,
                organisationName: false,
                manager: false,
                resourceStatus: false,
                organisationStatus: false,
                portfolioName: false,
                portfolioStatus: false,
                portfolioDescription: false,
              },
            },
          }}
          NoRowsOverlay={NoRowsOverlay}
          viewId="teamAllocation"
          showActuals={showActuals}
          rowGroupingColumnMode="multiple"
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

export default withRBAC(TeamAllocation, ['Allocation']);
