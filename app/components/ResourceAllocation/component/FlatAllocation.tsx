'use client';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { AppDispatch, RootState } from '@/app/redux/store';
import { GridCellParams } from '@mui/x-data-grid';
import {
  calculateTotalEffort,
  formatDateMMDDYYYY,
  getAllocationManagerFromPath,
} from '@/app/utils/common';
import EllipsisNameCell from './EllipsisNameCell';
// import CustomToolbar from '../../Toolbar/CustomToolbarUpdated';
import CustomToolbar from '../../Toolbar/CustomAllocationToolbar';
import NoRowsOverlay from './NoRowsOverlay';
import { Box } from '@mui/material';
import { AllAllocations } from '@/app/types';
import { useAllocationGrid } from '@/app/hooks/useAllocationGrid';
import { injectBlankRows, normalizeRow } from '@/app/utils/allocationUtils';
import { setLoading } from '@/app/redux/reducers/allAllocationsReducer';
import { useAllGridRowsByView } from '@/app/hooks/useAllGridRowsByView';
import { CrudPermissions, withRBAC } from '../../HOC/withRBAC';
import { PORTFOLIO_DISPLAY_NAME } from '@/app/constants/constants';

interface FlatAllocationProps {
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

function FlatAllocation({
  startDate,
  endDate,
  permissions,
  loadingPermissions,
}: FlatAllocationProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { teams, teamsResources } = useSelector(
    (state: RootState) => state.teams
  );
  const { location } = useSelector((state: RootState) => state.allSettings);
  const { allResourcesDetail } = useSelector(
    (state: RootState) => state.allResourcesDetail
  );
  const _resources = useSelector(
    (state: RootState) => state.resources.resources
  );
  const { scalarSettings } = useSelector(
    (state: RootState) => state.allSettings
  );
  const { showActuals } = useSelector(
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
  const { getAllRowsForView, setRowsForView } = useAllGridRowsByView();

  useEffect(() => {
    if (loadingPermissions) return;
    if (permissions['Allocation'].r && ready) {
      let filteredResources;
      const allTempRows = getAllRowsForView('teamAllocationtemp');
      if (!loading && allTempRows?.length > 0) {
        setRows(allTempRows || []);
        setRowsForView('teamAllocationtemp', []);
      } else {
        const projectViewRows = getAllProjectViewRows();
        if (!loading && projectViewRows.length > 0) {
          filteredResources = removeResourcesWithNoTeams(
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
          );
        } else if (allAllocations) {
          filteredResources = removeResourcesWithNoTeams(allAllocations || []);
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
      // Sahadev : Reset temp View for Project Related Views, Currently ProjectsView and ProtfolioView.
      setRowsForView('projectAllocationtemp', []);
    }
  }, [ready, allAllocations, loadingPermissions]);

  const organisationColumnConfig = [
    {
      field: 'organisationName',
      headerName: 'Organization Name',
      width: 201,
      headerClassName: 'prime-header',
      cellClassName: 'prime-cell',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const organisationName = allocation?.organisationName;
        return <EllipsisNameCell value={organisationName || ''} />;
      },
    },
    {
      field: 'teams',
      headerName: 'Team',
      width: 201,
      type: 'string',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const team = allocation?.teams;
        return team ? <EllipsisNameCell value={team || ''} /> : null;
      },
    },
    {
      field: 'resource',
      headerName: 'Resource',
      width: 201,
      type: 'string',
      isEditable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const resource = allocation?.resource;
        return <EllipsisNameCell value={resource || ''} />;
      },
    },
    {
      field: 'portfolioName',
      headerName: `${scalarSettings?.Portfolio_Name || PORTFOLIO_DISPLAY_NAME}`,
      width: 201,
      type: 'string',
      isEditable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const portfolio =
          allocation?.portfolioName === 'zzzzz'
            ? ''
            : allocation?.portfolioName;
        return <EllipsisNameCell value={portfolio || ''} />;
      },
    },
    {
      field: 'project',
      headerName: 'Project',
      width: 201,
      type: 'string',
      isEditable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const project = allocation?.project;
        return <EllipsisNameCell value={project || ''} />;
      },
    },
    {
      field: 'organisationStatus',
      headerName: 'Organization Status',
      width: 201,
      headerClassName: 'prime-header',
      cellClassName: 'prime-cell',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const organisationStatus = allocation?.organisationStatus;
        return <EllipsisNameCell value={organisationStatus || ''} />;
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 180,
      type: 'string',
      isEditable: 'false',
      primaryColumn: true,
      headerClassName: 'prime-header',
      cellClassName: 'secondary-cell',
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const email = allocation?.email;
        return <EllipsisNameCell value={email || ''} />;
      },
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone Number',
      width: 180,
      type: 'string',
      isEditable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const phoneNumber = allocation?.phoneNumber;
        return <EllipsisNameCell value={phoneNumber || ''} />;
      },
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 180,
      type: 'string',
      isEditable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const department = allocation?.department;
        return <EllipsisNameCell value={department || ''} />;
      },
    },
    {
      field: 'hrLevel',
      headerName: 'HR Level',
      width: 100,
      type: 'string',
      isEditable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const hrLevel = allocation?.hrLevel;
        return <EllipsisNameCell value={hrLevel || ''} />;
      },
    },
    {
      field: 'role',
      headerName: 'Title',
      width: 180,
      type: 'string',
      isEditable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const role = allocation?.role;
        return <EllipsisNameCell value={role || ''} />;
      },
    },
    {
      field: 'workLocation',
      headerName: 'Work Location',
      width: 180,
      type: 'string',
      isEditable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        return <EllipsisNameCell value={(params.value || '') as string} />;
      },
    },
    {
      field: 'resourceStartDate',
      headerName: 'Resource Start Date',
      width: 180,
      type: 'string',
      isEditable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const resourceStartDate = allocation?.resourceStartDate;
        return (
          <EllipsisNameCell
            value={formatDateMMDDYYYY(resourceStartDate) || ''}
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
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const resourceEndDate = allocation?.resourceEndDate;
        return (
          <EllipsisNameCell value={formatDateMMDDYYYY(resourceEndDate) || ''} />
        );
      },
    },
    {
      field: 'resourceLocationCategory',
      headerName: 'Location Category',
      width: 160,
      type: 'string',
      isEditable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const resourceLocationCategory = allocation?.resourceLocationCategory;
        return <EllipsisNameCell value={resourceLocationCategory || ''} />;
      },
    },
    {
      field: 'averageWeeklyHours',
      headerName: 'Average Weekly Hours',
      width: 190,
      type: 'string',
      isEditable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const averageWeeklyHours = allocation?.averageWeeklyHours;
        return (
          <EllipsisNameCell
            value={averageWeeklyHours ? `${averageWeeklyHours} hrs/week` : ''}
          />
        );
      },
    },
    {
      field: 'contractorHourlyRate',
      headerName: 'Contractor Hourly Rate',
      width: 195,
      type: 'string',
      isEditable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const contractorHourlyRate = allocation?.contractorHourlyRate;
        return (
          <EllipsisNameCell
            value={
              contractorHourlyRate ? `$ ${contractorHourlyRate.toFixed(2)}` : ''
            }
          />
        );
      },
    },
    {
      field: 'contractorHourlyRateCurrency',
      headerName: 'Contractor Hourly Rate Currency',
      width: 260,
      type: 'string',
      isEditable: 'false',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const contractorHourlyRateCurrency =
          allocation?.contractorHourlyRateCurrency;
        return <EllipsisNameCell value={contractorHourlyRateCurrency || ''} />;
      },
    },
    {
      field: 'resourceType',
      headerName: 'Resource Type',
      width: 135,
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'secondary-cell',
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const resourceType = allocation?.resourceType;
        return <EllipsisNameCell value={resourceType || ''} />;
      },
    },
    {
      field: 'teamStatus',
      headerName: 'Team Status',
      width: 130,
      type: 'string',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const teamStatus = allocation?.teamStatus;
        return <EllipsisNameCell value={teamStatus || ''} />;
      },
    },
    {
      field: 'projectOvertimeAllowed',
      headerName: 'Allow Overtime',
      width: 140,
      type: 'string',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const projectOvertimeAllowed = allocation?.projectOvertimeAllowed;
        return (
          <EllipsisNameCell
            value={
              projectOvertimeAllowed
                ? projectOvertimeAllowed === 'true'
                  ? 'Yes'
                  : 'No'
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
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return <EllipsisNameCell value={allocation?.projectType || ''} />;
      },
    },
    {
      field: 'projectTypeGroup',
      headerName: 'Project Category',
      width: 150,
      type: 'string',
      isEditable: false,
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
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        const allocationManager = allocation?.teamAllocationManager;
        return <EllipsisNameCell value={allocationManager || ''} />;
      },
    },
    {
      field: 'manager',
      headerName: 'Manager',  // Resource page manager detail
      width: 130,
      type: 'string',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const allocation = params.row;
        return (
          <EllipsisNameCell value={allocation.manager || ''} /> )
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
        return <EllipsisNameCell value={allocation?.portfolioDescription || ''} />;
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
          groupBy=""
          mode="team"
          startDate={startDate}
          endDate={endDate}
          columns={organisationColumnConfig}
          selectedTeam={selectedTeam}
          toolbarComponent={CustomToolbar}
          setSelectedTeam={setSelectedTeam}
          initialState={{
            columns: {
              columnVisibilityModel: {
                teamAllocationManager: false,
                teamStatus: false,
                portfolioName: true,
                project: true,
                resourceType: true,
                organisationName: true, // This column has to always be false, as we are using grouping.
                resource: true, // This column has to always be false, as we are using grouping.
                organisationStatus: false,
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
                manager: false,
                portfolioStatus: false,
                portfolioDescription: false,
              },
            },
          }}
          NoRowsOverlay={NoRowsOverlay}
          viewId="teamAllocation"
          showActuals={showActuals}
          rowGroupingColumnMode={''}
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

export default withRBAC(FlatAllocation, ['Allocation']);
