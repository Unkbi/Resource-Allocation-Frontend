'use client';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { columnGroupingModel } from '../../AllocationTable/TableHeader';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllTeams } from '@/app/redux/actions/fetchTeamsAction';

const teamsColumnConfig = [
  {
    field: 'teams',
    headerName: 'Teams Name',
    width: 250,
    headerClassName: 'prime-header',
    cellClassName: 'prime-cell',
  },
  {
    field: 'resource',
    headerName: 'Resource',
    width: 200,
    disableColumnMenu: true,
  },
  {
    field: 'project',
    headerName: 'Projects',
    width: 200,
    disableColumnMenu: true,
    headerClassName: 'secondary-header',
    cellClassName: 'secondary-cell',
  },
  {
    field: 'resourceType',
    headerName: 'Resource Type',
    width: 200,
    disableColumnMenu: true,
    headerClassName: 'secondary-header',
    cellClassName: 'secondary-cell',
  },
];

export default function TeamAllocation() {
  const dispatch = useDispatch();
  const { teams, loading, error } = useSelector(state => state.teams);

  useEffect(() => {
    dispatch(fetchAllTeams());
  }, []);
  return (
    <>
      <AllocationGrid
        groupBy="teams"
        columns={teamsColumnConfig}
        columnGroupingModel={columnGroupingModel}
      />
    </>
  );
}
