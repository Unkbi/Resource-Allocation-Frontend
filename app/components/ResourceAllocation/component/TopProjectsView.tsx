'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetAllocations } from '@/app/redux/reducers/projectsReducer';
import { getCellClassName } from '../../AllocationTable/AllocationGridUtils';
import { AppDispatch, RootState } from '@/app/redux/store';
import { GridCellParams } from '@mui/x-data-grid';
import EllipsisNameCell from './EllipsisNameCell';
import {
  AllocationGridCell,
  AllocationGridCellData,
  ProjectsTableRow,
} from '@/app/types';
import AllocationGrid from '../../AllocationTable/AllocationGrid';
import { Box } from '@mui/material';

export default function TopProjectsView() {
  const [selectedTeam, setSelectedTeam] = useState('');

  const { projects, allocations, loading, dataProcessing, calendarDate } =
    useSelector((state: RootState) => state.projects);
  const { splitViewCurrentProject } = useSelector(
    (state: RootState) => state.allocationView
  );
  const { startDate, endDate } = calendarDate || {};
  const dispatch: AppDispatch = useDispatch();

  console.log('splitViewCurrentProject : ', splitViewCurrentProject);
  useEffect(() => {
    if (
      projects &&
      'result' in projects &&
      projects?.result?.length &&
      startDate &&
      endDate
    ) {
      dispatch(resetAllocations());
      dispatch({
        type: 'FETCH_ALL_ALLOCATIONS',
        payload: { projects: projects?.result, startDate, endDate },
      });
    }
  }, [projects, calendarDate]);

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
    allocations: AllocationGridCell[]
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
  console.log(
    'filterAllocationsForSelectedProject(allocations) : ',
    filterAllocationsForSelectedProject(allocations)
  );

  // const handleAddClick = (params: GridCellParams) => {
  //   dispatch(
  //     openDialog({
  //       title: 'Update Allocation',
  //       submitButtonText: 'Update',
  //       cancelButtonText: 'Cancel',
  //       formType: 'add_allocation',
  //       initialData: {
  //         Project: params.value,
  //       },
  //     })
  //   );
  // };

  // const getFirstChild = (params: GridCellParams) => {
  //   const { rowNode, api } = params;
  //   const isGridTreeNode = 'children' in rowNode; // Required for Typescript
  //   if (isGridTreeNode && rowNode.children && rowNode.children.length > 0) {
  //     const firstChildId = rowNode.children[0];
  //     const firstChildRow = api.getRow(firstChildId);
  //     return firstChildRow;
  //   }
  //   return null;
  // };

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
      field: 'team',
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

      // renderCell: (params: GridCellParams) => {
      //   const firstChild = getFirstChild(params);
      //   return firstChild ? (
      //     <EllipsisNameCell value={firstChild.projectSponsor ?? 'N/A'} />
      //   ) : null;
      // },
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
      // renderCell: (params: GridCellParams) => {
      //   const firstChild = getFirstChild(params);
      //   return firstChild ? (
      //     <EllipsisNameCell value={firstChild.projectManager ?? 'N/A'} />
      //   ) : null;
      // },
    },
    {
      field: 'projectStatus',
      headerName: 'Status',
      width: 84,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      // renderCell: (params: GridCellParams) => {
      //   const firstChild = getFirstChild(params);
      //   return firstChild ? (
      //     <EllipsisNameCell value={firstChild.projectStatus ?? 'N/A'} />
      //   ) : null;
      // },
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
      // renderCell: (params: GridCellParams) => {
      //   const firstChild = getFirstChild(params);
      //   return firstChild ? (
      //     <EllipsisNameCell value={firstChild.projectLocation ?? 'N/A'} />
      //   ) : null;
      // },
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
      // renderCell: (params: GridCellParams) => {
      //   const firstChild = getFirstChild(params);
      //   return firstChild ? (
      //     <EllipsisNameCell value={firstChild.projectType ?? 'N/A'} />
      //   ) : null;
      // },
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
      // renderCell: (params: GridCellParams) => {
      //   const firstChild = getFirstChild(params);
      //   return firstChild ? (
      //     <EllipsisNameCell
      //       value={firstChild?.projectOvertimeAllowed ? 'Yes' : 'No'}
      //     />
      //   ) : null;
      // },
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
      // renderCell: (params: GridCellParams) => {
      //   const firstChild = getFirstChild(params);
      //   return firstChild ? (
      //     <EllipsisNameCell value={firstChild.projectCost ?? 'N/A'} />
      //   ) : null;
      // },
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
      // renderCell: (params: GridCellParams) => {
      //   const firstChild = getFirstChild(params);
      //   return firstChild ? (
      //     <EllipsisNameCell value={firstChild.projectCurrency ?? 'N/A'} />
      //   ) : null;
      // },
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
      // renderCell: (params: GridCellParams) => {
      //   const firstChild = getFirstChild(params);
      //   return firstChild ? (
      //     <EllipsisNameCell value={firstChild.projectStartDate ?? 'N/A'} />
      //   ) : null;
      // },
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
      // renderCell: (params: GridCellParams) => {
      //   const firstChild = getFirstChild(params);
      //   return firstChild ? (
      //     <EllipsisNameCell value={firstChild.projectEndDate ?? 'N/A'} />
      //   ) : null;
      // },
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

  console.log(
    'filterAllocationsForSelectedProject(allocations): ',
    filterAllocationsForSelectedProject(allocations)
  );

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
                'team',
                'totalEffort',
              ],
            },
          }}
          data={filterAllocationsForSelectedProject(allocations) || []}
          loading={loading || dataProcessing}
        />
      </Box>
    </>
  );
}
