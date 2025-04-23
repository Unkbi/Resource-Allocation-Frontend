'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { fetchAllProjectAllocations } from '@/app/redux/actions/fetchProjectsAction';
import { resetAllocations } from '@/app/redux/reducers/projectsReducer';
import { Tooltip } from '@mui/material';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { CustomAddIcon } from '../../AllocationTable/CustomAddIcon';
import { getCellClassName } from '../../AllocationTable/AllocationGridUtils';
import { AppDispatch, RootState } from '@/app/redux/store';
import { GridCellParams } from '@mui/x-data-grid';
import EllipsisNameCell from './EllipsisNameCell'; 
import CustomToolbar from '../../Toolbar/CustomToolbarUpdated';
import NoRowsOverlay from './NoRowsOverlay';

export default function ProjectAllocation() {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [allocationThreshold, setAllocationThreshold] = useState(0);
  const { projects, allocations, loading, dataProcessing, calendarDate } =
    useSelector((state: RootState) => state.projects);
  const { startDate, endDate } = calendarDate || {};
  const dispatch: AppDispatch = useDispatch();

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
        if (isGridTreeNode && rowNode.children) {
          const resource_count = rowNode?.children?.length || null;
          return (
            <EllipsisNameCell
              value={value as string}
              resourceCount={resource_count}
              onAddClick={() => handleAddClick(params)}
              showAddIcon={true}
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
      headerName: 'Status',
      width: 84,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectStatus ?? 'N/A'} />
        ) : null;
      },
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
      width: 116,
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
      width: 102, // min-width without eliding.
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
      headerName: 'Cost',
      width: 90,
      type: 'string ',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectCost ?? 'N/A'} />
        ) : null;
      },
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
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectCurrency ?? 'N/A'} />
        ) : null;
      },
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
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectStartDate ?? 'N/A'} />
        ) : null;
      },
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

  return (
    <>
      <AllocationGrid
        groupBy="project"
        columns={projectColumnConfig}
        startDate={startDate}
        mode="project"
        endDate={endDate}
        selectedTeam={selectedTeam}
        toolbarComponent={CustomToolbar}
        setAllocationThreshold={setAllocationThreshold}
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
            },
          },
        }}
        NoRowsOverlay = {NoRowsOverlay}
        data={allocations}
        loading={loading || dataProcessing}
      />
    </>
  );
}
