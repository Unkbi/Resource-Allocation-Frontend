'use client';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllTeams,
  fetchResourcesAgainstTeams,
} from '@/app/redux/actions/fetchTeamsAction';
import { resetResources } from '@/app/redux/reducers/teamsReducer';
import { Tooltip } from '@mui/material';

export default function TeamAllocation() {
  const [resourcesFetched, setResourcesFetched] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');

  const dispatch = useDispatch();
  const { teams, resources, loading, dataProcessing } = useSelector(
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

  const teamsColumnConfig = [
    {
      field: 'teams',
      headerName: 'Teams Name',
      width: 200,
      headerClassName: 'prime-header',
      cellClassName: 'prime-cell',
      primaryColumn: true,
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
          }}>
            <div style={{ width: '100%' }}>
              <span>{cell_value}</span>
            </div>
          </Tooltip>
        )
      }
    },
    {
      field: 'resourceType',
      headerName: 'Resource Type',
      width: 200,
      sortable: false,
      headerClassName: 'secondary-header',
      cellClassName: 'secondary-cell',
      primaryColumn: true,
      renderCell: (params) => {
        if (params.value) {
          return params.value;
        } else {
          const uniqueResourceTypes = [
            ...new Set(params?.rowNode?.children?.map(child => params.api.getRow(child)?.resourceType))
          ].filter(Boolean);

          return uniqueResourceTypes.length
            ? uniqueResourceTypes.length > 1
              ? `${uniqueResourceTypes[0]} +${uniqueResourceTypes.length - 1}`
              : uniqueResourceTypes[0]
            : '';
        }
      }
    },
  ];

  return (
    <>
      <AllocationGrid
        loading={loading || dataProcessing}
        groupBy="teams"
        columns={teamsColumnConfig}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        // columnGroupingModel={columnGroupingModel}
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
