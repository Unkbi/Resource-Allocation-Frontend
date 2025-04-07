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
import { AppDispatch, RootState } from '@/app/redux/store';
import { GridCellParams } from '@mui/x-data-grid';

export default function TeamAllocation() {
  const [selectedTeam, setSelectedTeam] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { teams, resources, loading, dataProcessing, calendarDate } =
    useSelector((state: RootState) => state.teams);
  const { startDate, endDate } = calendarDate || {};

  const handleAddClick = (params: GridCellParams) => {
    dispatch(
      openDialog({
        title: 'Add Allocation',
        submitButtonText: 'Add',
        cancelButtonText: 'Cancel',
        formType: 'add_allocation',
        initialData: {
          Project: params.value,
        },
      })
    );
  };

  useEffect(() => {
    if (!teams?.result?.length) {
      dispatch(fetchAllTeams());
    }
  }, []);

  useEffect(() => {
    if (teams?.result?.length && startDate && endDate) {
      dispatch(resetResources());
      dispatch(
        fetchResourcesAgainstTeams(teams.result, null, startDate, endDate)
      );
    }
  }, [teams, calendarDate]);

  const getTeam = (params: GridCellParams) => {
    if (
      params.rowNode.type === 'group' &&
      params.rowNode.groupingField === 'teams'
    ) {
      // Find the team by name in the teams array
      const teamName = params.rowNode.groupingKey;
      const team = teams?.result?.find(t => t.Name === teamName);
      return team;
    }
    return null;
  };

  const teamsColumnConfig = [
    {
      field: 'teams',
      headerName: 'Teams Name',
      minWidth: 201,
      flex:2,
      headerClassName: 'prime-header',
      cellClassName: 'prime-cell',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const { rowNode, api, value = '' } = params;
        const isGridTreeNode = 'children' in rowNode; // Required for Typescript
        let resource_count = [];
        if (isGridTreeNode && rowNode.children) {
          resource_count = [
            ...new Set(rowNode?.children?.map(child => api.getRow(child))),
          ];
        }
        return (
          <Tooltip
            title={value as string}
            placement="right"
            arrow
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: 'offset',
                    options: { offset: [0, 10] },
                  },
                ],
              },
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '100%',
                minWidth: 0,
              }}
            >
              <span
                style={{
                  flex: '1 1 auto',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {value as string}
              </span>
              <span
                style={{
                  flex: '0 0 auto',
                  display: 'flex',
                  width: '24px',
                  height: '24px',
                  padding: '4px 3px',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#F1F1F1',
                  marginTop: '13px',
                  marginLeft: '8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: ' #7881A5',
                }}
              >
                ({resource_count.length})
              </span>
            </div>
          </Tooltip>
        );
      },
    },
    {
      field: 'teamStatus',
      headerName: 'Status',
      minWidth: 90,
      flex:0.5,
      type: 'string',
      isEditable: false,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const team = getTeam(params);
        return team ? <span>{team?.Status ?? 'N/A'}</span> : null;
      },
    },
    {
      field: 'teamAllocationManager',
      headerName: 'Allocation Manager',
      minWidth: 180,
      flex:1.5,
      type: 'string',
      isEditable: false,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const team = getTeam(params);
        return team ? <span>{team?.AllocationManager ?? 'N/A'}</span> : null;
      },
    },
    {
      field: 'resourceType',
      headerName: 'Resource Type',
      minWidth: 135,
      flex:0.5,
      sortable: false,
      headerClassName: 'secondary-header',
      cellClassName: 'secondary-cell',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const { rowNode, api, value = '' } = params;
        const isGridTreeNode = 'children' in rowNode; // Required for Typescript

        if (value) {
          return value;
        } else {
          if (isGridTreeNode && rowNode.children) {
            const uniqueResourceTypes = [
              ...new Set(
                rowNode?.children?.map(
                  child => params.api.getRow(child)?.resourceType
                )
              ),
            ].filter(Boolean);
            return uniqueResourceTypes.length
              ? uniqueResourceTypes.length > 1
                ? `${uniqueResourceTypes[0]} +${uniqueResourceTypes.length - 1}`
                : uniqueResourceTypes[0]
              : '';
          }
        }
      },
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
