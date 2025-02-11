'use client';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { columnGroupingModel } from '../../AllocationTable/TableHeader';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  fetchAllProjectAllocations,
  fetchAllProjects,
} from '@/app/redux/actions/fetchProjectsAction';
import { resetAllocations } from '@/app/redux/reducers/projectsReducer';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';

const projectColumnConfig = [
  {
    field: 'project',
    headerName: 'Project Name',
    width: 200,
    headerClassName: 'prime-header',
    cellClassName: 'prime-cell',
  },
  // {
  //   field: 'teams',
  //   headerName: 'Teams',
  //   width: 200,
  //   disableColumnMenu: true,
  //   headerClassName: 'secondary-header',
  //   cellClassName: 'secondary-cell',
  // },
  {
    field: 'totalEffort',
    headerName: 'Total Effort',
    width: 150,
    disableColumnMenu: true,
    type: 'number',
    headerClassName: 'secondary-header',
    cellClassName: 'secondary-cell',
  },
];

export default function ProjectAllocation() {
  const [allocationsFetched, setAllocationsFetched] = useState(false);
  const { projects, allocations, loading, error } = useSelector(
    state => state.projects
  );
  const dispatch = useDispatch();

  useEffect(() => {
    setAllocationsFetched(false);
    dispatch(fetchAllProjects());
    dispatch(fetchAllResources());
  }, []);

  useEffect(() => {
    if (projects && projects.length > 0 && !allocationsFetched) {
      dispatch(resetAllocations());
      // Fetch allocations for each project
      dispatch(fetchAllProjectAllocations(projects[0].result));
      setAllocationsFetched(true);
    }
  }, [projects, allocationsFetched]);
  return (
    <>
      {loading && <div>Loading...</div>}
      {allocations && allocations.length > 0 && (
        <AllocationGrid
          groupBy="project"
          columns={projectColumnConfig}
          columnGroupingModel={columnGroupingModel}
          data={allocations}
        />
      )}
    </>
  );
}
