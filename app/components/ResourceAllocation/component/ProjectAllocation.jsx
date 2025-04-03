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


export default function ProjectAllocation() {
  const [rowsState, setRowsState] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');

  const { projects, allocations, loading, dataProcessing, calendarDate } = useSelector(
    state => state.projects
  );
  const { startDate, endDate } = calendarDate || {};
  const dispatch = useDispatch();

  useEffect(() => {
    if (projects?.result?.length && startDate && endDate) {
      dispatch(resetAllocations());
      dispatch(fetchAllProjectAllocations(projects.result, startDate, endDate));
    }
  }, [projects, calendarDate]);

  const handleAddClick =(params)=>{
    dispatch(
      openDialog({
        title: "Update Allocation",
        submitButtonText: 'Update',
        cancelButtonText: 'Cancel',
        formType: "add_allocation",
        initialData: {  
          Project: params.value 
        },
      })
    );
  }

  const getFirstChild = (params) => {
    if (params.rowNode.children && params.rowNode.children.length > 0) {
      const firstChildId = params.rowNode.children[0];
      const firstChildRow = params.api.getRow(firstChildId);
      return firstChildRow;
    }
    return null;
  }

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
      renderCell: (params) => {
        const resource_count = params?.rowNode?.children?.length || "";
        return (
          <Tooltip title={params.value} variant="solid" placement="right" arrow slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: { offset: [0, 10] },
                },
              ],
            }
          }}
          >
            <CustomAddIcon
              value={params.value}
              count={resource_count}
              onClick={() => handleAddClick(params)}
            />
          </Tooltip>
        );
      }
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
      renderCell: (params) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (<span>{firstChild.projectSponsor ?? 'N/A'}</span>) : null;
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
      renderCell: (params) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (<span>{firstChild.projectManager ?? 'N/A'}</span>) : null;
      },
    },
    { field: 'projectStatus',
      headerName: 'Status',
      width: 84,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      renderCell: (params) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (<span>{firstChild.projectStatus ?? 'N/A'}</span>) : null;
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
      renderCell: (params) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (<span>{firstChild.projectLocation ?? 'N/A'}</span>) : null;
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
      renderCell: (params) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (<span>{firstChild.projectType ?? 'N/A'}</span>) : null;
      },
    },
    { 
      field: "projectOvertimeAllowed",
      headerName: "Overtime?",
      width: 102, // min-width without eliding.
      type: 'boolean',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (<span>{firstChild?.projectOvertimeAllowed ? 'Yes' : 'No'}</span>) : null;
      },
    },
    {
      field: "projectCost",
      headerName: "Cost",
      width: 90,
      type: 'string ',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (<span>{firstChild.projectCost ?? 'N/A'}</span>) : null;
      },
    },
    {
      field: "projectCurrency", 
      headerName: "Currency",
      width: 100,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (<span>{firstChild.projectCurrency ?? 'N/A'}</span>) : null;
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
      renderCell: (params) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (<span>{firstChild.projectStartDate ?? 'N/A'}</span>) : null;
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
      renderCell: (params) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (<span>{firstChild.projectEndDate ?? 'N/A'}</span>) : null;
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
      renderCell: (params) => {
        const value = Number(params.value);
        const formattedValue =
        !isNaN(value) && value !== null
          ? (Math.round(value * 10) / 10).toFixed(1) // Ensures 0 → "0.0" and 1 → "1.0"
          : null;
        return <span style={{ fontWeight: 'bold' }}>{formattedValue}</span>;
      },
    },
  ];
 
  return (
    <>
      <AllocationGrid
        groupBy="project"
        columns={projectColumnConfig}
        rowsState={rowsState}
        startDate={startDate}
        endDate={endDate}
        setRowsState={setRowsState}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        initialState={{
          columns: {
            columnVisibilityModel: {
              projectSponsor: false,
              projectManager: false,
              projectStatus: false,
              projectLocation: false,
              projectType: false,
              projectOvertimeAllowed: false,
              projectCost: false,
              projectCurrency: false,
              projectStartDate: false,
              projectEndDate: false,
            },
          },
        }}
        data={allocations}
        loading={loading || dataProcessing}
      />
    </>
  );
}
