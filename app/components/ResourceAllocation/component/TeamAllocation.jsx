'use client';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addResourceToTeam,
  fetchAllTeams,
  fetchResourcesAgainstTeams,
} from '@/app/redux/actions/fetchTeamsAction';
import { resetResources } from '@/app/redux/reducers/teamsReducer';
import { AddRowIcon } from '../../AllocationTable/AddRowButton';
import { getTeamAllocations } from '@/app/services/teamServices';
import { getProjectOrTeamIdByName } from '@/app/utils/common';

export default function TeamAllocation() {
  const [resourcesFetched, setResourcesFetched] = useState(false);
  const [rowsState, setRowsState] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');

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

  const handleAddRow = async (e, resource) => {
    const newRowForTeams = {
      id: `${selectedTeam}-${resource.FullName}-${rowsState.length + 1}`,
      resourceId: resource.Id,
      project: '',
      teamsId: getProjectOrTeamIdByName(teams?.result, selectedTeam),
      resource: resource.FullName,
      teams: selectedTeam,
      role: resource.Role,
      totalEffort: resource.totalHours,
      hasButton: false,
      hasProject: true,
    };
    setRowsState( [...rowsState,newRowForTeams]);

    try {
      await new Promise((resolve, reject) => {
        const obj = {
          Team: `:ResourceAllocation.Core/Team,${newRowForTeams.teamsId}`,
          Resource: `:ResourceAllocation.Core/Resource,${newRowForTeams.resourceId}`,
        };
        dispatch(addResourceToTeam(obj.Team, obj.Resource))
          .then(resolve)
          .catch(reject);
      });

      const teamAllocationPostData = {
        'ResourceAllocation.Core/GetTeamAllocations': {
          TeamId: newRowForTeams.teamsId,
        },
      };

      dispatch(getTeamAllocations(teamAllocationPostData));
    } catch (error) {
      console.error('Error in handleAddRow:', error);
    }
  };

  const teamsColumnConfig = [
    {
      field: 'teams',
      headerName: 'Teams Name',
      width: 200,
      headerClassName: 'prime-header',
      cellClassName: 'prime-cell',
      primaryColumn: true,
      renderCell: (params) => {
        return (
          <div style={{ width: '100%' }}>
            <span>{params.value}</span>
            <AddRowIcon
              team_name={params.value}
              handleAddRow={handleAddRow}
              onClick={() => {
                setSelectedTeam(params?.formattedValue);
              }}
            />
          </div>
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
        rowsState={rowsState}
        setRowsState={setRowsState}
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
