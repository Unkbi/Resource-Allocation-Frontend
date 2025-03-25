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

  const getTeam = (params) => {
    if (params.rowNode.type === 'group' && params.rowNode.groupingField === 'teams') {
      // Find the team by name in the teams array
      const teamName = params.rowNode.groupingKey;
      const team = teams?.result?.find(t => t.Name === teamName);  
      return team;
    }
    return null;
  }

  const teamsColumnConfig = [
    {
      field: 'teams',
      headerName: 'Teams Name',
      width: 200,
      headerClassName: 'prime-header',
      cellClassName: 'prime-cell',
      primaryColumn: true,
      renderCell: (params) => {
        const resource_count = [
          ...new Set(
            params?.rowNode?.children?.map(
              child => params.api.getRow(child)
            )
          ),
        ];
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
          <div style={{
              display: 'flex',
              width: '100%',
              minWidth: 0,
            }}>
              <span style={{
                flex: '1 1 auto',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {params.value}
              </span>
              <span style={{
                flex: '0 0 auto',
              }}>
                ({resource_count.length})
              </span>
            </div>
          </Tooltip>
        );
      }
    },
    {
      field: 'teamStatus',
      headerName: 'Status',
      width: 100,
      type: 'string',
      isEditable: false,
      renderCell: (params) => {
        const team = getTeam(params);
        return team ? (<span>{team?.Status ?? "N/A"}</span>) : null;
      }
    },
    {
      field: 'teamAllocationManager',
      headerName: 'Allocation Manager',
      width: 150,
      type: 'string',
      isEditable: false,
      renderCell: (params) => {
        const team = getTeam(params);
        return team ? (<span>{team?.AllocationManager ?? "N/A"}</span>) : null;
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

  console.log({resources})
  return (
    <>
      <AllocationGrid
        loading={loading || dataProcessing}
        groupBy="teams"
        columns={teamsColumnConfig}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        initialState={{
          columns: {
            columnVisibilityModel: {
              teamAllocationManager: false,
              teamStatus: false,
            },
          },
        }}
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
