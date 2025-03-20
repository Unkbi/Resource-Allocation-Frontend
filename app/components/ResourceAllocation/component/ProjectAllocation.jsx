'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
// import { columnGroupingModel } from '../../AllocationTable/TableHeader';
import { fetchAllProjectAllocations } from '@/app/redux/actions/fetchProjectsAction';
import { resetAllocations } from '@/app/redux/reducers/projectsReducer';
import { getProjectOrTeamIdByName, isResourceInProject } from '@/app/utils/common';
import { Tooltip } from '@mui/material';


export default function ProjectAllocation() {
  const [allocationsFetched, setAllocationsFetched] = useState(false);
  const [rowsState, setRowsState] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

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

  const handleAddRow = async (e, resource) => {
    const newRowForProject = {
      id: `${selectedProject}-${resource.FullName}-${rowsState.length + 1}`,
      resourceId: resource.Id,
      project: selectedProject,
      projectId: getProjectOrTeamIdByName(projects?.result, selectedProject),
      resource: resource.FullName,
      role: resource.Role,
      totalEffort: resource.totalHours,
      hasButton: false,
    };
    if (!isResourceInProject(rowsState, selectedProject, resource.FullName)) {
      setRowsState([...rowsState, newRowForProject]);
    }
  };

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
        const cell_value = params.value?.length > 21 ? params.value?.slice(0, 19) + "..." : params.value;
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
            <div style={{ width: '100%' }}>
              <span>{cell_value}</span>
            </div>
          </Tooltip>
        )
      }
    },
    {
      field: 'totalEffort',
      headerName: 'Total Effort',
      width: 150,
      valueFormatter: params => {
        const value = Number(params);
        return value && typeof value === 'number' && value !== 0
          ? Math.round(value * 10) / 10
          : null;
      },
      type: 'number',
      sortable: false,
      headerClassName: 'secondary-header',
      cellClassName: 'secondary-cell',
      headerAlign: 'left',
      primaryColumn: true,
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
