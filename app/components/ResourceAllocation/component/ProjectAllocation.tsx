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
import CustomToolbar from '../../Toolbar/CustomToolbarUpdated';
import NoRowsOverlay from './NoRowsOverlay';
import { AllAllocations } from '@/app/types';
import { getProjectTypeColorLine } from '@/app/utils/common';
import { useAllocationGrid } from '@/app/hooks/useAllocationGrid';

interface ProjectAllocationProps {
  startDate: string | null;
  endDate: string | null;
}
interface Resource {
  Id: string;
  Email: string;
  PhoneNumber: string;
  Department: string;
  [key: string]: any;
}

export default function ProjectAllocation({
  startDate,
  endDate,
}: ProjectAllocationProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const { allAllocations, loading, dataProcessing } = useSelector(
    (state: RootState) => state.allAllocations
  );
  const _resources = useSelector(
    (state: RootState) => state.resources.resources
  ) as {
    result?: Resource[];
    loading?: boolean;
    error?: string;
  };
  const dispatch: AppDispatch = useDispatch();
  const { projects } = useSelector((state: RootState) => state.projects);
  const { setRows, ready } = useAllocationGrid('projectAllocation');
  const { getAllRows } = useAllocationGrid('teamAllocation');

  useEffect(() => {
    if (ready) {
      if (getAllRows().length > 0) {
        setRows(
          removeResourcesWithNoProjects(
            (getAllRows() as AllAllocations[]) || []
          )
        );
      } else if (allAllocations) {
        setRows(removeResourcesWithNoProjects(allAllocations || []));
      }
    }
  }, [ready && allAllocations]);

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
    if (_resources.result && resourceId) {
      return _resources.result.find(res => res.Id === resourceId) || null;
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
        const row = api.getRow(rowNode.id);
        const projectType = projects?.result?.find(
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
      field: 'projectSponsor',
      headerName: 'Project Sponsor',
      width: 148,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectSponsor ?? 'N/A'} />
        ) : null;
      },
    },
    {
      field: 'Email',
      headerName: 'Email',
      width: 190,
      isEditable: 'false',
      sortable: 'false',
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
      sortable: 'false',
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
      sortable: 'false',
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
      field: 'WorkLocation',
      headerName: 'Resource Work Location',
      width: 200,
      isEditable: 'false',
      sortable: 'false',
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const WorkLocation = resource?.WorkLocation || '';
        return <EllipsisNameCell value={WorkLocation} />;
      },
    },
    {
      field: 'LocationCategory',
      headerName: 'Resource Location Category',
      width: 230,
      isEditable: 'false',
      sortable: 'false',
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
      sortable: 'false',
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
      sortable: 'false',
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
      sortable: 'false',
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
      headerName: 'Resource Role',
      width: 170,
      isEditable: 'false',
      sortable: 'false',
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
      sortable: 'false',
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
      sortable: 'false',
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
      width: 190,
      isEditable: 'false',
      sortable: 'false',
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
      width: 200,
      isEditable: 'false',
      sortable: 'false',
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
      width: 260,
      isEditable: 'false',
      sortable: 'false',
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
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectManager ?? 'N/A'} />
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
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectStatus ?? 'N/A'} />
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
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectLocation ?? 'N/A'} />
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
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectType ?? 'N/A'} />
        ) : null;
      },
    },
    {
      field: 'projectOvertimeAllowed',
      headerName: 'Overtime?',
      width: 110, // min-width without eliding.
      type: 'boolean',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
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
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectCurrency ?? 'N/A'} />
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
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectStartDate ?? 'N/A'} />
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
          <EllipsisNameCell value={firstChild.projectEndDate ?? 'N/A'} />
        ) : null;
      },
    },
    {
      field: 'totalEffort',
      headerName: 'Total Effort',
      width: 106,
      type: 'number',
      sortable: false,
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
      <Box sx={{ height: 'calc(100vh - 54px)', width: '100%' }}>
        <AllocationGrid
          groupBy="project"
          columns={projectColumnConfig}
          startDate={startDate}
          mode="project"
          endDate={endDate}
          selectedTeam={selectedTeam}
          toolbarComponent={CustomToolbar}
          setSelectedTeam={setSelectedTeam}
          initialState={{
            columns: {
              columnVisibilityModel: {
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
                totalEffort: true,
                resource: true, // Always be true
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
          loading={loading || dataProcessing}
          viewId="projectAllocation"
        />
      </Box>
    </>
  );
}
