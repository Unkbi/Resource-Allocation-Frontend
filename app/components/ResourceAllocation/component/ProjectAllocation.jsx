'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { columnGroupingModel } from '../../AllocationTable/TableHeader';
import { fetchAllProjectAllocations } from '@/app/redux/actions/fetchProjectsAction';
import { resetAllocations } from '@/app/redux/reducers/projectsReducer';

const projectColumnConfig = [
  {
    field: 'project',
    headerName: 'Project Name',
    width: 200,
    headerClassName: 'prime-header',
    cellClassName: 'prime-cell',
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
  },
];

export default function ProjectAllocation() {
  const [allocationsFetched, setAllocationsFetched] = useState(false);
  const { projects, allocations, loading, dataProcessing, error } = useSelector(
    state => state.projects
  );
  const dispatch = useDispatch();
  useEffect(() => {
    setAllocationsFetched(false);
  }, []);

  useEffect(() => {
    if (projects?.result && projects?.result.length > 0 && !allocationsFetched) {
      dispatch(resetAllocations());
      dispatch(fetchAllProjectAllocations(projects.result));
      setAllocationsFetched(true);
    }
  }, [projects, allocationsFetched]);

  return (
    <>
      <AllocationGrid
        groupBy="project"
        columns={projectColumnConfig}
        columnGroupingModel={columnGroupingModel}
        data={allocations}
        loading={loading || dataProcessing}
      />
    </>
  );
}
