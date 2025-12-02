import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCellClassName } from '../../AllocationTable/AllocationGridUtils';
import { AppDispatch, RootState } from '@/app/redux/store';
import { GridCellParams } from '@mui/x-data-grid';
import EllipsisNameCell from './EllipsisNameCell';
import AllocationGrid from '../../AllocationTable/AllocationGrid';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import CustomToolbar from '../../Toolbar/CustomAllocationToolbar';
import { Box } from '@mui/material';
import NoRowsOverlay from './NoRowsOverlay';
import { AllAllocations, Location, Project } from '@/app/types';
import {
  calculateTotalEffort,
  getAllocationManagerFromPath,
  getProjectBudgetCategory,
  getProjectBudgetColor,
} from '@/app/utils/common';
import ProjectTotalCustomToolTip from '../../AllocationTable/components/ProjectTotalCustomToolTip';
import { getProjectTypeColorLine } from '@/app/utils/common';
import { useAllocationGrid } from '@/app/hooks/useAllocationGrid';
import { normalizeRow } from '@/app/utils/allocationUtils';
import { CrudPermissions, withRBAC } from '../../HOC/withRBAC';
import {
  FETCH_PROJECT_TYPE_GROUPS,
  FETCH_PROJECT_TYPES,
} from '@/app/redux/actions/allSettingsActions';

interface ProjectCostAllocationProps {
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

const ProjectCost = ({
  startDate,
  endDate,
  permissions,
  loadingPermissions,
}: ProjectCostAllocationProps) => {
  const dispatch: AppDispatch = useDispatch();
  const [selectedTeam, setSelectedTeam] = useState('');
  const { costs: projectCosts, dataProcessing } = useSelector(
    (state: RootState) => state.allocationsCost
  );
  const { location } = useSelector((state: RootState) => state.allSettings);
  const { teams } = useSelector((state: RootState) => state.teams);
  const { projects } = useSelector((state: RootState) => state.projects);
  const { projectTypes, projectTypeGroups } = useSelector(
    (state: RootState) => state.allSettings
  );
  // @ts-ignore
  const { resources }: { resources: Resource[] } = useSelector(
    (state: RootState) => state.resources
  );
  const { allResourcesDetail } = useSelector(
    (state: RootState) => state.allResourcesDetail
  );
  const { setRows, ready } = useAllocationGrid('main');

  useEffect(() => {
    if (projectTypes.length === 0) {
      dispatch({ type: FETCH_PROJECT_TYPES });
    }
  }, []);

  useEffect(() => {
    if (projectTypeGroups.length === 0) {
      dispatch({ type: FETCH_PROJECT_TYPE_GROUPS });
    }
  }, []);

  useEffect(() => {
    if (loadingPermissions) return;
    if (permissions['AllocationCost'].r && ready && projectCosts) {
      const filteredResources = removeResourcesWithNoProjects(projectCosts)
         .sort((a, b) =>
         (a?.resource || "") < (b?.resource || "") ? -1 : 1
       );

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
  }, [ready, projectCosts, loadingPermissions]);

  useEffect(() => {
    if (loadingPermissions) return;
    if (permissions['AllocationCost'].r) {
      dispatch({
        type: 'FETCH_ALLOCATIONS_COST',
        payload: {
          teams: teams,
          projects: projects,
          resources: resources,
          allResourcesDetail: allResourcesDetail,
          location: location,
          projectTypes: projectTypes,
          projectTypeGroups: projectTypeGroups,
          startDate: startDate,
          endDate: endDate,
        },
      });
    }
  }, [startDate, endDate, teams, projects, resources, loadingPermissions]);

  const _resources = useSelector(
    (state: RootState) => state.resources.resources
  );

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

  const getFirstChild = (params: GridCellParams) => {
    const { rowNode, api } = params;
    const isGridTreeNode = 'children' in rowNode; // Required for Typescript
    if (isGridTreeNode && rowNode.children && rowNode.children.length > 0) {
      const firstChildId = rowNode.children[0];
      const firstChildRow = api.getRow(firstChildId);
      return firstChildRow;
    }
    return null;
  };

  const getResource = (params: GridCellParams): Resource | null => {
    const { rowNode } = params;
    const isGridTreeNode = 'children' in rowNode;
    if (isGridTreeNode && rowNode.children) return null;
    const resourceId = params.row.resourceId;
    if (_resources && resourceId) {
      return (
        (_resources as Resource[]).find(res => res.Id === resourceId) || null
      );
    }
    return null;
  };

  const projectColumnConfig = [
    {
      field: 'project',
      headerName: 'Project Name',
      width: 200,
      headerClassName: 'prime-header',
      // cellClassName: getCellClassName,
      cellClassName: () => 'project-view-projectName',
      primaryColumn: true,
      filterable: true,
      isEditable: false,
      renderCell: (params: GridCellParams) => {
        const { rowNode, api, value = '' } = params;
        const isGridTreeNode = 'children' in rowNode; // Required for Typescript
        const projectType = projects?.find(
          project => project.Name === value
        )?.Type;
        if (isGridTreeNode && rowNode.children) {
          const resource_count = rowNode?.children?.length || null;
          return (
            <EllipsisNameCell
              value={value as string}
              resourceCount={resource_count}
              onAddClick={() => handleAddClick(params)}
              showAddIcon={true}
              leftBorderColor={getProjectTypeColorLine(projectType || '')}
            />
          );
        }
      },
    },
    {
      field: 'totalEffort',
      headerName: 'Total Cost $',
      width: 110,
      type: 'number',
      sortable: false,
      isEditable: false,
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
        const project: Project | undefined = projects?.find(
          // @ts-ignore
          (project: Project) => project.Name === params?.rowNode?.groupingKey
        );
        const projectCategory = getProjectBudgetCategory(
          project?.Budget || 0,
          params?.value || 0
        );
        const projectBudgetColor = getProjectBudgetColor(projectCategory);
        return (
          <EllipsisNameCell
            value={`${formattedValue}k`}
            // @ts-ignore
            {...(params?.rowNode?.groupingField === 'project'
              ? {
                  CustomTooptip: (
                    <ProjectTotalCustomToolTip
                      params={params}
                      projectCategory={projectCategory}
                      projectBudgetColor={projectBudgetColor}
                      formattedValue={formattedValue || ''}
                      project={project}
                    />
                  ),
                }
              : {})}
          />
        );
      },
    },
    {
      field: 'projectSponsor',
      headerName: 'Project Sponsor',
      width: 148,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectSponsor || ''} />
        ) : null;
      },
    },
    {
      field: 'Email',
      headerName: 'Email',
      width: 190,
      isEditable: 'false',
      sortable: false,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const email = resource?.Email || '';
        return <EllipsisNameCell value={email} />;
      },
    },
    {
      field: 'PhoneNumber',
      headerName: 'Phone Number',
      width: 170,
      isEditable: 'false',
      sortable: false,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const PhoneNumber = resource?.PhoneNumber || '';
        return <EllipsisNameCell value={PhoneNumber} />;
      },
    },
    {
      field: 'Department',
      headerName: 'Organization',
      width: 170,
      isEditable: 'false',
      sortable: false,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const Department = resource?.Department || '';
        return <EllipsisNameCell value={Department} />;
      },
    },
    {
      field: 'workLocation',
      headerName: 'Resource Work Location',
      width: 170,
      isEditable: 'false',
      sortable: false,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const locationDetails = location?.find(
          (l: Location) => l.Id === resource?.WorkLocation
        );
        return <EllipsisNameCell value={locationDetails?.Name || ''} />;
      },
    },
    {
      field: 'LocationCategory',
      headerName: 'Resource Location Category',
      width: 170,
      isEditable: 'false',
      sortable: false,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const LocationCategory = resource?.LocationCategory || '';
        return <EllipsisNameCell value={LocationCategory} />;
      },
    },
    {
      field: 'Type',
      headerName: 'Resource Type',
      width: 170,
      isEditable: 'false',
      sortable: false,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const Type = resource?.Type || '';
        return <EllipsisNameCell value={Type} />;
      },
    },
    {
      field: 'Status',
      headerName: 'Resource Status',
      width: 170,
      isEditable: 'false',
      sortable: false,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const Status = resource?.Status || '';
        return <EllipsisNameCell value={Status} />;
      },
    },
    {
      field: 'HRLevel',
      headerName: 'HRLevel',
      width: 170,
      isEditable: 'false',
      sortable: false,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const HRLevel = resource?.HRLevel || '';
        return <EllipsisNameCell value={HRLevel} />;
      },
    },
    {
      field: 'Role',
      headerName: 'Title',
      width: 170,
      isEditable: 'false',
      sortable: false,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const Role = resource?.Role || '';
        return <EllipsisNameCell value={Role} />;
      },
    },
    {
      field: 'StartDate',
      headerName: 'Resource Start Date',
      width: 170,
      isEditable: 'false',
      sortable: false,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const StartDate = resource?.StartDate || '';
        return <EllipsisNameCell value={StartDate} />;
      },
    },
    {
      field: 'EndDate',
      headerName: 'Resource End Date',
      width: 170,
      isEditable: 'false',
      sortable: false,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const EndDate = resource?.EndDate || '';
        return <EllipsisNameCell value={EndDate} />;
      },
    },
    {
      field: 'AverageWeeklyHours',
      headerName: 'Average Weekly Hours',
      width: 170,
      isEditable: 'false',
      sortable: false,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const AverageWeeklyHours = resource?.AverageWeeklyHours || '';
        return <EllipsisNameCell value={AverageWeeklyHours} />;
      },
    },
    {
      field: 'ContractorHourlyRate',
      headerName: 'Contractor Hourly Rate',
      width: 170,
      isEditable: 'false',
      sortable: false,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const ContractorHourlyRate = resource?.ContractorHourlyRate || '';
        return <EllipsisNameCell value={ContractorHourlyRate} />;
      },
    },
    {
      field: 'ContractorHourlyRateCurrency',
      headerName: 'Contractor Hourly Rate Currency',
      width: 170,
      isEditable: 'false',
      sortable: false,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
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
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectManager || ''} />
        ) : null;
      },
    },
    {
      field: 'projectStatus',
      headerName: 'Project Status',
      width: 130,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectStatus || ''} />
        ) : null;
      },
    },
    {
      field: 'projectLocation',
      headerName: 'Project Location',
      width: 150,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectLocation || ''} />
        ) : null;
      },
    },
    {
      field: 'projectType',
      headerName: 'Project Type',
      width: 130,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectType || ''} />
        ) : null;
      },
    },
    {
      field: 'projectTypeGroup',
      headerName: 'Project Type Group',
      width: 150,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectTypeGroup || ''} />
        ) : null;
      },
    },
    {
      field: 'projectOvertimeAllowed',
      headerName: 'Overtime?',
      width: 102, // min-width without eliding.
      type: 'boolean',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell
            value={firstChild?.projectOvertimeAllowed ? 'Yes' : 'No'}
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
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
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
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectCurrency || ''} />
        ) : null;
      },
    },
    {
      field: 'projectStartDate',
      headerName: 'Project Start Date',
      width: 160,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      sortable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectStartDate || ''} />
        ) : null;
      },
    },
    {
      field: 'projectEndDate',
      headerName: 'Project End Date',
      width: 150,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectEndDate || ''} />
        ) : null;
      },
    },
  ];

  const removeResourcesWithNoProjects = (allocations: AllAllocations[]) => {
    return allocations.filter(allocation => allocation.project);
  };

  return (
    <>
      <Box sx={{ height: 'calc(100vh - 31px)', width: '100%' }}>
        <AllocationGrid
          groupBy="project"
          columns={projectColumnConfig}
          type="cost"
          mode="project"
          startDate={startDate}
          endDate={endDate}
          selectedTeam={selectedTeam}
          toolbarComponent={CustomToolbar}
          setSelectedTeam={setSelectedTeam}
          initialState={{
            columns: {
              columnVisibilityModel: {
                totalCost: true,
                resource: true, // Always be true
                // __row_group_by_columns_group__: true, // Always be true
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
                __row_group_by_columns_group__: true, // Always be true
                Email: false,
                PhoneNumber: false,
                Department: false,
                WorkLocation: false,
                LocationCategory: false,
                Type: false,
                Status: false,
                HRLevel: false,
                Role: false,
                StartDate: false,
                EndDate: false,
                AverageWeeklyHours: false,
                ContractorHourlyRate: false,
                ContractorHourlyRateCurrency: false,
              },
            },
          }}
          NoRowsOverlay={NoRowsOverlay}
          loading={dataProcessing}
        />
      </Box>
    </>
  );
};

export default withRBAC(ProjectCost, ['AllocationCost']);
