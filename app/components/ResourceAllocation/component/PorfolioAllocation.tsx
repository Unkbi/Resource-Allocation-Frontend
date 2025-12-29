'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { Box } from '@mui/material';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { getCellClassName } from '../../AllocationTable/AllocationGridUtils';
import { AppDispatch, RootState } from '@/app/redux/store';
import { GridCellParams } from '@mui/x-data-grid';
import EllipsisNameCell from './EllipsisNameCell';
import CustomToolbar from '../../Toolbar/CustomAllocationToolbar';
import NoRowsOverlay from './NoRowsOverlay';
import { AllAllocations, Location } from '@/app/types';
import {
  calculateTotalEffort,
  getAllocationManagerFromPath,
} from '@/app/utils/common';
import { useAllocationGrid } from '@/app/hooks/useAllocationGrid';
import { getFirstChild, initSortAllocations, normalizeRow } from '@/app/utils/allocationUtils';
import { setLoading } from '@/app/redux/reducers/allAllocationsReducer';
import {
  PORTFOLIO_BLANK,
  PORTFOLIO_DISPLAY_NAME,
} from '@/app/constants/constants';
import { useAllGridRowsByView } from '@/app/hooks/useAllGridRowsByView';
import { CrudPermissions, withRBAC } from '../../HOC/withRBAC';

interface PortfolioAllocationProps {
  startDate: string | null;
  endDate: string | null;
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

function PortfolioAllocation({
  startDate,
  endDate,
  permissions,
  loadingPermissions,
}: PortfolioAllocationProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const { allAllocations, loading, dataProcessing } = useSelector(
    (state: RootState) => state.allAllocations
  );
  const _resources = useSelector(
    (state: RootState) => state.resources.resources
  );
  const { location } = useSelector((state: RootState) => state.allSettings);
  const { scalarSettings } = useSelector(
    (state: RootState) => state.allSettings
  );
  const dispatch: AppDispatch = useDispatch();
  const { setRows, ready } = useAllocationGrid('projectAllocation');
  const { getAllRows: getAllTeamViewRows } =
    useAllocationGrid('teamAllocation');
  const { getAllRowsForView, setRowsForView } = useAllGridRowsByView();

  const { showActuals } = useSelector(
    (state: RootState) => state.allocationView
  );

  useEffect(() => {
    if (loadingPermissions) return;
    if (permissions['Allocation'].r && ready) {
      let filteredResources;
      const allTempRows = getAllRowsForView('projectAllocationtemp');
      if (!loading && allTempRows?.length > 0) {
        setRows(initSortAllocations(allTempRows as AllAllocations[] , 'portfolioName') || []);
        setRowsForView('projectAllocationtemp', []);
      } else {
        if (!loading && getAllTeamViewRows().length > 0) {
          filteredResources = initSortAllocations(removeResourcesWithNoProjects(
            (getAllTeamViewRows() as AllAllocations[]) || []
          ) ,   'portfolioName');
          setRows(
            removeResourcesWithNoProjects(
              getAllTeamViewRows() as AllAllocations[]
            )
          );
        } else if (allAllocations) {
          filteredResources = initSortAllocations(removeResourcesWithNoProjects(
            allAllocations || []
          ), 'portfolioName');
          dispatch(setLoading(false));
        }

        const formattedResources = filteredResources?.map(allocation => ({
          ...allocation,
          totalEffort: calculateTotalEffort(normalizeRow(allocation)),
          hasAllocation: calculateTotalEffort(normalizeRow(allocation)) > 0,
          teamAllocationManager: getAllocationManagerFromPath(
            allocation?.teamAllocationManager,
            _resources || []
          )?.FullName,
        }));

        setRows(formattedResources || []);
      }
    }
  }, [ready && allAllocations, loadingPermissions]);

  const handleAddClick = (params: GridCellParams) => {
    dispatch(
      openDialog({
        title: 'Update Allocation',
        submitButtonText: 'Update',
        cancelButtonText: 'Cancel',
        formType: 'add_allocation',
        initialData: {
          Project: params.value,
        },
      })
    );
  };

  const getResource = (params: GridCellParams): Resource | null => {
    const { rowNode } = params;
    const isGridTreeNode = 'children' in rowNode;
    if (isGridTreeNode && rowNode.children) return null;
    const resourceId = params.row.resourceId;
    if (_resources && resourceId) {
      return (
        (_resources as Resource[])?.find(res => res.Id === resourceId) || null
      );
    }
    return null;
  };

  const portfolioColumnConfig = [
    {
      field: 'portfolioName',
      headerName:
        scalarSettings?.Portfolio_Name || PORTFOLIO_DISPLAY_NAME + ' Name',
      width: 148,
      headerClassName: 'prime-header',
      cellClassName: 'prime-cell',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const { rowNode, api, value = '' } = params;
        const isGridTreeNode = 'children' in rowNode; // Required for Typescript
        if (isGridTreeNode && rowNode.children) {
          const fisrtChildRowNode = api.getRowNode(rowNode.children[0]);
          if (
            fisrtChildRowNode &&
            'children' in fisrtChildRowNode &&
            fisrtChildRowNode.children
          ) {
            const secondChild = api.getRow(fisrtChildRowNode?.children[1]);
            const portfolioSidebarColor = secondChild?.portfolioSidebarColor;
            const project_count = rowNode?.children?.length || null;
            return (
              <EllipsisNameCell
                value={value === 'zzzzz' ? PORTFOLIO_BLANK : (value as string)}
                resourceCount={project_count}
                onAddClick={() => handleAddClick(params)}
                showAddButton={false}
                showAddIcon={true}
                leftBorderColor={portfolioSidebarColor || 'none'}
              />
            );
          }
        }
      },
    },
    {
      field: 'projectSponsor',
      headerName: 'Project Sponsor',
      width: 148,
      type: 'string',
      headerClassName: 'secondary-header',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any) => {
      const s1 =
          getFirstChild(p1)?.projectSponsor?.toLowerCase().trim() || '';
      const s2 =
          getFirstChild(p2)?.projectSponsor?.toLowerCase().trim() || '';
        if (!s1 && !s2) return 0;
        if (!s1) return 1;
        if (!s2) return -1;
        return s1.localeCompare(s2);
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectSponsor ?? ''} />
        ) : null;
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 190,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const email = resource?.Email || '';
        return <EllipsisNameCell value={email} />;
      },
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone Number',
      width: 170,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const PhoneNumber = resource?.PhoneNumber || '';
        return <EllipsisNameCell value={PhoneNumber} />;
      },
    },
    {
      field: 'department',
      headerName: 'Organization',
      width: 170,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const Department = resource?.Department || '';
        return <EllipsisNameCell value={Department} />;
      },
    },
    {
      field: 'workLocation',
      headerName: 'Resource Work Location',
      width: 200,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const locationDetails = location?.find(
          (l: Location) => l.Id === resource?.WorkLocation
        );
        return <EllipsisNameCell value={locationDetails?.Name || ''} />;
      },
    },
    {
      field: 'resourceLocationCategory',
      headerName: 'Resource Location Category',
      width: 230,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const LocationCategory = resource?.LocationCategory || '';
        return <EllipsisNameCell value={LocationCategory} />;
      },
    },
    {
      field: 'resourceType',
      headerName: 'Resource Type',
      width: 170,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const Type = resource?.Type || '';
        return <EllipsisNameCell value={Type} />;
      },
    },
    {
      field: 'resourceStatus',
      headerName: 'Resource Status',
      width: 170,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const Status = resource?.Status || '';
        return <EllipsisNameCell value={Status} />;
      },
    },
    {
      field: 'hrLevel',
      headerName: 'HRLevel',
      width: 170,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const HRLevel = resource?.HRLevel || '';
        return <EllipsisNameCell value={HRLevel} />;
      },
    },
    {
      field: 'role',
      headerName: 'Tilte',
      width: 170,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const Role = resource?.Role || '';
        return <EllipsisNameCell value={Role} />;
      },
    },
    {
      field: 'resourceStartDate',
      headerName: 'Resource Start Date',
      width: 170,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const StartDate = resource?.StartDate || '';
        return <EllipsisNameCell value={StartDate} />;
      },
    },
    {
      field: 'resourceEndDate',
      headerName: 'Resource End Date',
      width: 170,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const EndDate = resource?.EndDate || '';
        return <EllipsisNameCell value={EndDate} />;
      },
    },
    {
      field: 'averageWeeklyHours',
      headerName: 'Average Weekly Hours',
      width: 190,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const AverageWeeklyHours = resource?.AverageWeeklyHours || '';
        return <EllipsisNameCell value={AverageWeeklyHours} />;
      },
    },
    {
      field: 'contractorHourlyRate',
      headerName: 'Contractor Hourly Rate',
      width: 200,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const ContractorHourlyRate = resource?.ContractorHourlyRate || '';
        return <EllipsisNameCell value={ContractorHourlyRate} />;
      },
    },
    {
      field: 'contractorHourlyRateCurrency',
      headerName: 'Contractor Hourly Rate Currency',
      width: 260,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const ContractorHourlyRateCurrency =
          resource?.ContractorHourlyRateCurrency || '';
        return <EllipsisNameCell value={ContractorHourlyRateCurrency} />;
      },
    },
    {
      field: 'projectManager',
      headerName: 'Project Manager',
      width: 148,
      type: 'string',
      headerClassName: 'secondary-header',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any) => {
      const s1 =
          getFirstChild(p1)?.projectManager?.toLowerCase().trim() || '';
      const s2 =
          getFirstChild(p2)?.projectManager?.toLowerCase().trim() || '';
        if (!s1 && !s2) return 0;
        if (!s1) return 1;
        if (!s2) return -1;
        return s1.localeCompare(s2);
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectManager ?? ''} />
        ) : null;
      },
    },
    {
      field: 'projectStatus',
      headerName: 'Project Status',
      width: 130,
      type: 'string',
      headerClassName: 'secondary-header',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any) => {
      const s1 =
          getFirstChild(p1)?.projectStatus?.toLowerCase().trim() || '';
      const s2 =
          getFirstChild(p2)?.projectStatus?.toLowerCase().trim() || '';
        if (!s1 && !s2) return 0;
        if (!s1) return 1;
        if (!s2) return -1;
        return s1.localeCompare(s2);
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectStatus ?? ''} />
        ) : null;
      },
    },
    {
      field: 'projectLocation',
      headerName: 'Project Location',
      width: 150,
      type: 'string',
      headerClassName: 'secondary-header',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any) => {
      const s1 =
          getFirstChild(p1)?.projectLocation?.toLowerCase().trim() || '';
      const s2 =
          getFirstChild(p2)?.projectLocation?.toLowerCase().trim() || '';
        if (!s1 && !s2) return 0;
        if (!s1) return 1;
        if (!s2) return -1;
        return s1.localeCompare(s2);
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectLocation ?? ''} />
        ) : null;
      },
    },
    {
      field: 'projectType',
      headerName: 'Project Type',
      width: 130,
      type: 'string',
      headerClassName: 'secondary-header',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any) => {
      const s1 =
          getFirstChild(p1)?.projectType?.toLowerCase().trim() || '';
      const s2 =
          getFirstChild(p2)?.projectType?.toLowerCase().trim() || '';
        if (!s1 && !s2) return 0;
        if (!s1) return 1;
        if (!s2) return -1;
        return s1.localeCompare(s2);
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectType ?? ''} />
        ) : null;
      },
    },
    {
      field: 'projectTypeGroup',
      headerName: 'Project Type Group',
      width: 130,
      type: 'string',
      headerClassName: 'secondary-header',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any) => {
      const s1 =
          getFirstChild(p1)?.projectTypeGroup?.toLowerCase().trim() || '';
      const s2 =
          getFirstChild(p2)?.projectTypeGroup?.toLowerCase().trim() || '';
        if (!s1 && !s2) return 0;
        if (!s1) return 1;
        if (!s2) return -1;
        return s1.localeCompare(s2);
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectTypeGroup ?? ''} />
        ) : null;
      },
    },
    {
      field: 'projectOvertimeAllowed',
      headerName: 'Overtime?',
      width: 110, // min-width without eliding.
      type: 'boolean',
      headerClassName: 'secondary-header',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: boolean | null,
        _v2: boolean | null,
        p1: any,
        p2: any
      ) => {
        const v1 = getFirstChild(p1)?.projectOvertimeAllowed;
        const v2 = getFirstChild(p2)?.projectOvertimeAllowed;
        if (v1 == null && v2 == null) return 0;
        if (v1 == null) return 1;
        if (v2 == null) return -1;
        return Number(v1) - Number(v2);
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell
            value={
              firstChild?.projectOvertimeAllowed === true
                ? 'Yes'
                : firstChild?.projectOvertimeAllowed === false
                  ? 'No'
                  : ''
            }
          />
        ) : null;
      },
    },
    {
      field: 'projectCost',
      headerName: 'Project Budget',
      width: 150,
      type: 'string ',
      headerClassName: 'secondary-header',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: number | null,
        _v2: number | null,
        p1: any,
        p2: any
      ) => {
        const n1 = Number(getFirstChild(p1)?.projectCost);
        const n2 = Number(getFirstChild(p2)?.projectCost);
        const isEmpty1 = Number.isNaN(n1);
        const isEmpty2 = Number.isNaN(n2);
        if (isEmpty1 && isEmpty2) return 0;
        if (isEmpty1) return 1;
        if (isEmpty2) return -1;
        return n1 - n2;
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        const cost = firstChild?.projectCost;
        return firstChild ? (
          <EllipsisNameCell value={cost ? `$ ${cost}` : ''} />
        ) : null;
      },
    },
    {
      field: 'projectCurrency',
      headerName: 'Project Currency',
      width: 160,
      type: 'string',
      headerClassName: 'secondary-header',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any) => {
        const s1 = getFirstChild(p1)?.projectCurrency?.toLowerCase().trim() || '';
        const s2 = getFirstChild(p2)?.projectCurrency?.toLowerCase().trim() || '';
        if (!s1 && !s2) return 0;
        if (!s1) return 1;
        if (!s2) return -1;
        return s1.localeCompare(s2);
      } ,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectCurrency ?? ''} />
        ) : null;
      },
    },
    {
      field: 'projectStartDate',
      headerName: 'Project Start Date',
      width: 160,
      type: 'string',
      headerClassName: 'secondary-header',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any
      ) => {
        const d1 = getFirstChild(p1)?.projectStartDate;
        const d2 = getFirstChild(p2)?.projectStartDate;
        const t1 = d1 ? new Date(d1).getTime() : NaN;
        const t2 = d2 ? new Date(d2).getTime() : NaN;
        if (Number.isNaN(t1) && Number.isNaN(t2)) return 0;
        if (Number.isNaN(t1)) return 1;
        if (Number.isNaN(t2)) return -1;
        return t1 - t2;
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectStartDate ?? ''} />
        ) : null;
      },
    },
    {
      field: 'projectEndDate',
      headerName: 'Project End Date',
      width: 150,
      type: 'string',
      headerClassName: 'secondary-header',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any
      ) => {
        const d1 = getFirstChild(p1)?.projectEndDate;
        const d2 = getFirstChild(p2)?.projectEndDate;
        const t1 = d1 ? new Date(d1).getTime() : NaN;
        const t2 = d2 ? new Date(d2).getTime() : NaN;
        if (Number.isNaN(t1) && Number.isNaN(t2)) return 0;
        if (Number.isNaN(t1)) return 1;
        if (Number.isNaN(t2)) return -1;
        return t1 - t2;
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectEndDate ?? ''} />
        ) : null;
      },
    },
    {
      field: 'totalEffort',
      headerName: 'Total Effort',
      width: 106,
      type: 'number',
      sortable: true,
      cellClassName: getCellClassName,
      headerClassName: 'secondary-header',
      // cellClassName: 'secondary-cell',
      headerAlign: 'left',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const value = Number(params.value);
        const formattedValue =
          !isNaN(value) && value !== null
            ? (Math.round(value * 10) / 10).toFixed(1) // Ensures 0 → "0.0" and 1 → "1.0"
            : null;
        return <EllipsisNameCell value={formattedValue} />;
      },
    },
  ];

  const removeResourcesWithNoProjects = (allocations: AllAllocations[]) => {
    return allocations.filter(allocation => allocation.project);
  };

  return (
    <>
      <Box
        sx={{
          height: 'calc(100vh - 54px)',
          width: '100%',
          '& .MuiDataGrid-columnHeader .MuiBadge-badge': {
            display: 'none !important',
          },
        }}
      >
        <AllocationGrid
          groupBy={'portfolioName'}
          columns={portfolioColumnConfig}
          startDate={startDate}
          mode="portfolio"
          endDate={endDate}
          selectedTeam={selectedTeam}
          toolbarComponent={CustomToolbar}
          setSelectedTeam={setSelectedTeam}
          initialState={{
            columns: {
              columnVisibilityModel: {
                averageWeeklyHours: false,
                contractorHourlyRate: false,
                contractorHourlyRateCurrency: false,
                department: false,
                email: false,
                hrLevel: false,
                phoneNumber: false,
                portfolioName: false,
                project: false,
                projectCost: false,
                projectCurrency: false,
                projectEndDate: false,
                projectLocation: false,
                projectManager: false,
                projectOvertimeAllowed: false,
                projectSponsor: false,
                projectStartDate: false,
                projectStatus: false,
                projectType: false,
                projectTypeGroup: false,
                resource: true,
                resourceEndDate: false,
                resourceLocationCategory: false,
                resourceStartDate: false,
                resourceStatus: false,
                resourceType: false,
                role: false,
                totalEffort: true,
                workLocation: false,
                __row_group_by_columns_group_portfolioName__: true,
                __row_group_by_columns_group_project__: true,
              },
            },
            sorting: {
              sortModel: [
                { field: 'portfolioName', sort: 'asc' },
                {
                  field: '__row_group_by_columns_group_portfolioName__',
                  sort: 'asc',
                },
              ],
            },
          }}
          NoRowsOverlay={NoRowsOverlay}
          loading={dataProcessing}
          viewId="projectAllocation"
          rowGroupingColumnMode={'multiple'}
          showActuals={showActuals}
        />
      </Box>
    </>
  );
}

export default withRBAC(PortfolioAllocation, ['Allocation']);
