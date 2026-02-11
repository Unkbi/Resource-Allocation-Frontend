'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getCellClassName } from '../../AllocationTable/AllocationGridUtils';
import { RootState } from '@/app/redux/store';
import { GridCellParams } from '@mui/x-data-grid';
import EllipsisNameCell from './EllipsisNameCell';
import AllocationGrid from '../../AllocationTable/AllocationGrid';
import { Box } from '@mui/material';
import NoRowsOverlay from './NoRowsOverlay';
import { useAllocationGrid } from '@/app/hooks/useAllocationGrid';
import { filterAllocationsForSelectedProject } from '@/app/utils/allocationUtils';
import CommonToolbar from '../../Toolbar/CommonToolbar';
import { CrudPermissions, withRBAC } from '../../HOC/withRBAC';

interface TopProjectsViewProps {
  startDate: string | null;
  endDate: string | null;
  permissions?: Record<string, CrudPermissions>;
  loadingPermissions?: boolean;
}

function TopProjectsView({
  startDate,
  endDate,
  permissions,
  loadingPermissions,
}: TopProjectsViewProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const { splitViewCurrentProject } = useSelector(
    (state: RootState) => state.allocationView
  );
  const { allAllocations, dataProcessing } = useSelector(
    (state: RootState) => state.allAllocations
  );
  const { setRows, ready } = useAllocationGrid('topProject');

  useEffect(() => {
    if (loadingPermissions) return;
    if (permissions && permissions['Allocation'].r && ready && allAllocations) {
      setRows(
        filterAllocationsForSelectedProject(
          allAllocations || [],
          splitViewCurrentProject
        ) || []
      );
    }
  }, [ready, allAllocations, loadingPermissions, splitViewCurrentProject]);

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
      sortable: false,
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
      sortable: false,
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
      sortable: false,
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
      sortable: false,
      primaryColumn: true,
    },
    {
      field: 'projectTypeGroup',
      headerName: 'Project Category',
      width: 150,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      sortable: false,
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
      sortable: false,
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
      sortable: false,
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
      sortable: false,
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
        return (
          <EllipsisNameCell
            value={formattedValue === '0.0' ? '' : formattedValue}
          />
        );
      },
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          zIndex: 10,
        }}
      >
        <CommonToolbar />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
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
                projectTypeGroup: false,
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
          loading={dataProcessing}
          NoRowsOverlay={NoRowsOverlay}
          toolbarComponent={''}
          viewId="topProject"
          defaultGroupingExpansionDepth={1}
        />
      </Box>
    </Box>
  );
}

export default withRBAC(TopProjectsView, ['Allocation']);
