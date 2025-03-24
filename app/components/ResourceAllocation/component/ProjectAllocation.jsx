'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
// import { columnGroupingModel } from '../../AllocationTable/TableHeader';
import { fetchAllProjectAllocations } from '@/app/redux/actions/fetchProjectsAction';
import { resetAllocations } from '@/app/redux/reducers/projectsReducer';
import { Box, Tooltip } from '@mui/material';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { CustomAddIcon } from '../../AllocationTable/CustomAddIcon';


export default function ProjectAllocation() {
  const [allocationsFetched, setAllocationsFetched] = useState(false);
  const [rowsState, setRowsState] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');

  const { projects, allocations, loading, dataProcessing } = useSelector(
    state => state.projects
  );
  const dispatch = useDispatch();

  useEffect(() => {
    setAllocationsFetched(false);
  }, []);

  useEffect(() => {
    if (
      projects?.result &&
      projects?.result.length > 0 &&
      !allocationsFetched
    ) {
      dispatch(resetAllocations());
      dispatch(fetchAllProjectAllocations(projects.result));
      setAllocationsFetched(true);
    }
  }, [projects, allocationsFetched]);

  const handleAddClick =(params)=>{
    dispatch(
      openDialog({
        title: "Add Allocation",
        submitButtonText: 'Add',
        cancelButtonText: 'Cancel',
        formType: "add_allocation",
        initialData: {  
          Project: params.value 
        },
      })
    );
  }

  const projectColumnConfig = [
    {
      field: 'project',
      headerName: 'Project Name',
      width: 200,
      headerClassName: 'prime-header',
      cellClassName: 'prime-cell',
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
      field: 'totalEffort',
      headerName: 'Total Effort',
      width: 150,
      type: 'number',
      sortable: false,
      headerClassName: 'secondary-header',
      cellClassName: 'secondary-cell',
      headerAlign: 'left',
      primaryColumn: true,
      renderCell: (params) => {
        const value = Number(params.value);
        const formattedValue =
          value && typeof value === 'number' && value !== 0
            ? Math.round(value * 10) / 10
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
        setRowsState={setRowsState}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        // columnGroupingModel={columnGroupingModel}
        data={allocations}
        loading={loading || dataProcessing}
      />
    </>
  );
}
