'use client';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/redux/store';
import { GridCellParams } from '@mui/x-data-grid';
import {
  formatDateMMDDYYYY,
  getAllocationManagerFromPath,
  getResourceFromUid,
  isWeekKey,
} from '@/app/utils/common';
import EllipsisNameCell from './EllipsisNameCell';
import CustomToolbar from '../../Toolbar/CustomAllocationToolbar';
import NoRowsOverlay from './NoRowsOverlay';
import { Box } from '@mui/material';
import { AllAllocations, Location } from '@/app/types';
import { useAllocationGrid } from '@/app/hooks/useAllocationGrid';
import { useDataGrid } from '@/app/context/dataGridContext';
import { initSortAllocations } from '@/app/utils/allocationUtils';
import { setLoading } from '@/app/redux/reducers/allAllocationsReducer';
import { CrudPermissions, withRBAC } from '../../HOC/withRBAC';
import {
  compareDateEmptyLast,
  compareNumberEmptyLast,
  compareStringEmptyLast,
  GridComparator,
} from './TeamAllocation';
import { PORTFOLIO_DISPLAY_NAME } from '@/app/constants/constants';

interface ResourceAllocationProps {
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

function ResourceAllocation({
  startDate,
  endDate,
  permissions,
  loadingPermissions,
}: ResourceAllocationProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { teams } = useSelector((state: RootState) => state.teams);
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
  const { setRows, ready } = useAllocationGrid('teamAllocation');
  const { setAllocationMaster, getAllocationMaster } = useDataGrid();
  const { scalarSettings } = useSelector(
    (state: RootState) => state.allSettings
  );
  const { resources } = useSelector((state: RootState) => state.resources);
  const allocationThreshold = useSelector(
    (state: RootState) =>
      state.allocationView.currentView?.allocationThreshold ?? [-0.2, 1.0]
  );
  const maxAllocationError = parseFloat(
    (scalarSettings?.Max_Allocation_Error as string) || '2.0'
  );

  const computeAverageAllocations = (data: AllAllocations[]) => {
    const grouped: Record<string, any[]> = {};
    data.forEach(row => {
      const resource = row.resource;
      if (!resource) return;
      if (!grouped[resource]) grouped[resource] = [];
      grouped[resource].push(row);
    });
    const result: any[] = [];
    Object.entries(grouped).forEach(([, rows]) => {
      let totalAllocation = 0;
      const seenWeeks = new Set<string>();
      rows.forEach(row => {
        Object.keys(row).forEach(key => {
          if (isWeekKey(key) && typeof row[key] === 'object') {
            const value = parseFloat(row[key]?.value ?? 0);
            totalAllocation += value;
            if (!seenWeeks.has(key)) seenWeeks.add(key);
          }
        });
      });
      const avgUtilization =
        seenWeeks.size > 0 ? totalAllocation / seenWeeks.size : 0;
      const avgAvailability = maxAllocationError - avgUtilization;
      rows.forEach(row => {
        result.push({ ...row, _avgPeriodAllocation: avgAvailability });
      });
    });
    return result;
  };

  const applyThresholdFilter = (rows: AllAllocations[]) => {
    const enriched = computeAverageAllocations(rows);
    const [minVal, maxVal] = allocationThreshold;
    const filtered = enriched.filter(row => {
      const normalizedAvailability =
        (row._avgPeriodAllocation ?? 0) - maxAllocationError + 1.0;
      if (minVal < 0) return normalizedAvailability <= maxVal;
      return (
        normalizedAvailability >= minVal && normalizedAvailability <= maxVal
      );
    });
    setRows(filtered);
  };

  // Data loading effect: computes full rows and stores in master store
  useEffect(() => {
    if (loadingPermissions) return;
    if (!permissions['Allocation'].r || !ready) return;

    if (loading) {
      if (!allAllocations) return;
      const formattedRows = (
        initSortAllocations(
          removeResourcesWithNoTeams(allAllocations as AllAllocations[]),
          'resource',
          'project'
        ) ?? []
      ).map(allocation => ({
        ...allocation,
        hasAllocation: (allocation?.totalEffort ?? 0) > 0,
        teamAllocationManager: getAllocationManagerFromPath(
          allocation?.teamAllocationManager,
          _resources || []
        )?.FullName,
      }));
      setAllocationMaster(formattedRows);
      applyThresholdFilter(formattedRows);
      dispatch(setLoading(false));
    } else {
      const master = getAllocationMaster() as AllAllocations[];
      if (master.length > 0) {
        applyThresholdFilter(master);
      } else if (allAllocations) {
        const formattedRows = (
          initSortAllocations(
            removeResourcesWithNoTeams(allAllocations as AllAllocations[]),
            'resource',
            'project'
          ) ?? []
        ).map(allocation => ({
          ...allocation,
          hasAllocation: (allocation?.totalEffort ?? 0) > 0,
          teamAllocationManager: getAllocationManagerFromPath(
            allocation?.teamAllocationManager,
            _resources || []
          )?.FullName,
        }));
        setAllocationMaster(formattedRows);
        applyThresholdFilter(formattedRows);
      }
    }
  }, [ready, allAllocations, loadingPermissions]);

  // Filter-only effect: re-applies slider filter from master store when threshold changes
  useEffect(() => {
    const master = getAllocationMaster() as AllAllocations[];
    if (!master.length) return;
    applyThresholdFilter(master);
  }, [allocationThreshold]);

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

  const resourcesColumnConfig = [
    {
      field: 'teams',
      headerName: 'Team Name',
      width: 201,
      headerClassName: 'prime-header',
      cellClassName: 'prime-cell',
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
          const team1 = DetailsR1?.Team?.Name;
          const r2 = getResource(p2)?.Id;
          const DetailsR2 = allResourcesDetail?.find(
            (item: any) => item.Resource?.Id === r2
          );
          const team2 = DetailsR2?.Team?.Name;
          return compareStringEmptyLast(team1, team2, sortDirection);
        };
      },
      renderCell: (params: GridCellParams) => {
        const { rowNode, api } = params;
        const isGridTreeNode = 'children' in rowNode; // Required for Typescript

        if (isGridTreeNode && rowNode.children) {
          const row = api.getRow(rowNode.children[0]);
          return <EllipsisNameCell value={row.teams as string} />;
        }
        return null;
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
        return <EllipsisNameCell value={locationDetails?.Name || ''} />;
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
              allocation?.projectOvertimeAllowed === true
                ? 'Yes'
                : allocation?.projectOvertimeAllowed === false
                  ? 'No'
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
      width: 130,
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
        const { rowNode, api } = params;
        const isGridTreeNode = 'children' in rowNode; // Required for Typescript

        if (isGridTreeNode && rowNode.children) {
          const row = api.getRow(rowNode.children[0]);
          return <EllipsisNameCell value={row?.teamAllocationManager} />;
        }
        return null;
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
          const r1 = getResource(p1)?.Status ?? '';
          const r2 = getResource(p2)?.Status ?? '';
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
      width: 200,
      type: 'string',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
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
      field: 'portfolioName',
      headerName: scalarSettings?.Portfolio_Name || PORTFOLIO_DISPLAY_NAME,
      width: 148,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
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
      type: 'string',
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
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
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
          groupBy="resource"
          mode="team"
          startDate={startDate}
          endDate={endDate}
          columns={resourcesColumnConfig}
          selectedTeam={selectedTeam}
          toolbarComponent={CustomToolbar}
          setSelectedTeam={setSelectedTeam}
          initialState={{
            columns: {
              columnVisibilityModel: {
                teamAllocationManager: false,
                teamStatus: false,
                __row_group_by_columns_group__: true, // This is the gtouping column for resource
                project: true,
                resourceType: true,
                teams: false,
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
                organisationStatus: false,
                resourceStatus: false,
                portfolioDescription: false,
                portfolioName: false,
                portfolioStatus: false,
              },
            },
          }}
          NoRowsOverlay={NoRowsOverlay}
          viewId="teamAllocation"
          showActuals={showActuals}
          rowGroupingColumnMode="single"
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

export default withRBAC(ResourceAllocation, ['Allocation']);
