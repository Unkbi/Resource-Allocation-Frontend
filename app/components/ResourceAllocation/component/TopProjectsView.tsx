'use client';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getCellClassName } from '../../AllocationTable/AllocationGridUtils';
import { RootState } from '@/app/redux/store';
import { GridCellParams } from '@mui/x-data-grid';
import EllipsisNameCell from './EllipsisNameCell';
import {
  AllAllocations,
  AllocationGridCell,
  AllocationGridCellData,
  ProjectsTableRow,
} from '@/app/types';
import AllocationGrid from '../../AllocationTable/AllocationGrid';
import { Box } from '@mui/material';
import NoRowsOverlay from './NoRowsOverlay';

interface TopProjectsViewProps {
  startDate: string | null;
  endDate: string | null;
}

export default function TopProjectsView({
  startDate,
  endDate,
}: TopProjectsViewProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const { splitViewCurrentProject } = useSelector(
    (state: RootState) => state.allocationView
  );
  const { allAllocations, loading, dataProcessing, calendarDate } = useSelector(
    (state: RootState) => state.allAllocations
  );
  // const { startDate, endDate } = calendarDate || {};

  const generateEmptyAllocation = (
    template: AllocationGridCell,
    project: ProjectsTableRow
  ) => {
    const empty: AllocationGridCell = {
      id: project.Id,
      resourceId: null,
      project: project.Name,
      projectId: project.Id,
      projectSponsor: project.Owner.name,
      projectManager: project.ProjectManager,
      projectStatus: project.Status,
      projectLocation: project.Location,
      projectType: project.Type,
      projectOvertimeAllowed: project.AllowOvertime,
      projectCost: project.Cost,
      projectCurrency: project.CostCurrency,
      projectStartDate: project.StartDate,
      projectEndDate: project.EndDate,
      resource: null,
      totalEffort: null,
      role: null,
      teams: null,
      resourceType: null,
    };

    // Extract Wxx weeks and set them to empty values with preserved "period"
    Object.entries(template).forEach(([key, value]) => {
      if (/^W\d+$/.test(key)) {
        empty[key] = {
          allocationId: null,
          value: null,
          period: (value as AllocationGridCellData)?.period ?? null,
        };
      }
    });

    return empty;
  };

  const filterAllocationsForSelectedProject = (
    allocations: AllAllocations[]
  ) => {
    if (allocations && allocations.length > 0 && splitViewCurrentProject) {
      const selectedProjectAllocations = allocations.filter(
        allocation => allocation.projectId === splitViewCurrentProject.Id
      );
      if (selectedProjectAllocations.length > 0) {
        return selectedProjectAllocations;
      }
      return [generateEmptyAllocation(allocations[0], splitViewCurrentProject)];
    }
    return allocations;
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
      filterable: false,
      isEditable: false,
      renderCell: (params: GridCellParams) => {
        const { rowNode, api, value = '' } = params;
        const isGridTreeNode = 'children' in rowNode; // Required for Typescript
        if (isGridTreeNode && rowNode.children) {
          const resource_count = rowNode?.children?.length || null;
          return (
            <EllipsisNameCell
              value={value as string}
              resourceCount={resource_count}
              // onAddClick={() => handleAddClick(params)}
              showAddIcon={true}
            />
          );
        }
      },
    },
    {
      field: 'teams',
      headerName: 'Team',
      width: 148,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
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
    },
    {
      field: 'projectStatus',
      headerName: 'Status',
      width: 84,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
    },
    {
      field: 'projectLocation',
      headerName: 'Location',
      width: 92,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
    },
    {
      field: 'projectType',
      headerName: 'Project Type',
      width: 116,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
    },
    {
      field: 'projectOvertimeAllowed',
      headerName: 'Overtime?',
      width: 102, // min-width without eliding.
      type: 'boolean',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
    },
    {
      field: 'projectCost',
      headerName: 'Cost',
      width: 90,
      type: 'string ',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
    },
    {
      field: 'projectCurrency',
      headerName: 'Currency',
      width: 100,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
    },
    {
      field: 'projectStartDate',
      headerName: 'Start Date',
      width: 100,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
    },
    {
      field: 'projectEndDate',
      headerName: 'End Date',
      width: 100,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
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

  return (
    <>
      <Box sx={{ height: 'var(--height)', width: '100%' }}>
        <AllocationGrid
          groupBy="project"
          columns={projectColumnConfig}
          startDate={startDate}
          endDate={endDate}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
          mode={'split'}
          initialState={{
            columns: {
              columnVisibilityModel: {
                project: true,
                team: true,
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
              },
            },
            pinnedColumns: {
              left: [
                '__row_group_by_columns_group__',
                'resource',
                'teams',
                'totalEffort',
              ],
            },
          }}
          data={filterAllocationsForSelectedProject(allAllocations || []) || []}
          loading={loading || dataProcessing}
          NoRowsOverlay={NoRowsOverlay}
          toolbarComponent={''}
        />
      </Box>
    </>
  );
}
