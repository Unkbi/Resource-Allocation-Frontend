'use client';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { columnGroupingModel } from '../../AllocationTable/TableHeader';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllTeams,
  fetchResourcesAgainstTeams,
} from '@/app/redux/actions/fetchTeamsAction';
import CenteredLoader from '../../Shared/Loader/CenteredLoader';
import { resetResources } from '@/app/redux/reducers/teamsReducer';

const teamsColumnConfig = [
  {
    field: 'teams',
    headerName: 'Teams Name',
    width: 200,
    headerClassName: 'prime-header',
    cellClassName: 'prime-cell',
  },
  {
    field: 'resourceType',
    headerName: 'Resource Type',
    width: 200,
    disableColumnMenu: true,
    sortable: false,
    headerClassName: 'secondary-header',
    cellClassName: 'secondary-cell',
  },
];

export default function TeamAllocation() {
  const [resourcesFetched, setResourcesFetched] = useState(false);
  const dispatch = useDispatch();
  const { teams, resources, loading, dataProcessing, error } = useSelector(
    state => state.teams
  );

  useEffect(() => {
    setResourcesFetched(false);
    dispatch(fetchAllTeams());
  }, []);

  useEffect(() => {
    if (teams?.result && teams?.result.length > 0 && !resourcesFetched) {
      dispatch(resetResources());
      dispatch(fetchResourcesAgainstTeams(teams.result));
      setResourcesFetched(true);
    }
  }, [teams, resourcesFetched]);

  return (
    <>
      <AllocationGrid
        loading={loading || dataProcessing}
        groupBy="teams"
        columns={teamsColumnConfig}
        columnGroupingModel={columnGroupingModel}
        data={resources}
      />
      {!resources && !loading && (
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
