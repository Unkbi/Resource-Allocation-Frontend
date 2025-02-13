'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { columnGroupingModel } from '../../AllocationTable/TableHeader';
import {
  fetchAllProjectAllocations,
  fetchAllProjects,
} from '@/app/redux/actions/fetchProjectsAction';
import { resetAllocations } from '@/app/redux/reducers/projectsReducer';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';
import CenteredLoader from '../../Shared/Loader/CenteredLoader';

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
      {loading && <CenteredLoader />}
      {allocations && allocations.length > 0 && (
        <AllocationGrid
          groupBy="project"
          columns={projectColumnConfig}
          columnGroupingModel={columnGroupingModel}
          data={allocations}
        />
      )}
      {!allocations && !loading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '90vh',
          }}
        >
          <div>No Data</div>
        </div>
      )}
    </>
  );
}
