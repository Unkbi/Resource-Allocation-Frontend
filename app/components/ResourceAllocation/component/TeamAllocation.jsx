'use client';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllTeams,
  fetchResourcesAgainstTeams,
} from '@/app/redux/actions/fetchTeamsAction';
import { resetResources } from '@/app/redux/reducers/teamsReducer';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { Tooltip } from '@mui/material';

export default function TeamAllocation() {
  const [selectedTeam, setSelectedTeam] = useState('');
  
  const dispatch = useDispatch();
  const { teams, resources, loading, dataProcessing, calendarDate } = useSelector(
    state => state.teams
  );
  const { startDate, endDate } = calendarDate || {};
  
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

  useEffect(() => {
    if (!teams?.result?.length) {
      dispatch(fetchAllTeams());
    }
  }, []);

  useEffect(() => {
    if (teams?.result.length && startDate && endDate) {
      dispatch(resetResources());
      dispatch(fetchResourcesAgainstTeams(teams.result, null, startDate, endDate));
    }
  }, [teams, calendarDate]);

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
                display: "flex",
                width: "24px",
                height: "24px",
                padding: "4px 3px",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color:"#F1F1F1",
                marginTop: "13px",
                marginLeft: "8px",
                borderRadius: "4px",
                fontSize:"12px",
                fontWeight:"600",
                background:" #7881A5",
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
      width: 90,
      type: 'string',
      isEditable: false,
      sortable: false,
      renderCell: (params) => {
        const team = getTeam(params);
        return team ? (<span>{team?.Status ?? "N/A"}</span>) : null;
      }
    },
    {
      field: 'teamAllocationManager',
      headerName: 'Allocation Manager',
      width: 180,
      type: 'string',
      isEditable: false,
      sortable: false,
      renderCell: (params) => {
        const team = getTeam(params);
        return team ? (<span>{team?.AllocationManager ?? "N/A"}</span>) : null;
      }
    },
    {
      field: 'resourceType',
      headerName: 'Resource Type',
      width: 135,
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
        startDate={startDate}
        endDate={endDate}
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
