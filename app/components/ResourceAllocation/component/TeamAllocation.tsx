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
import { AppDispatch, RootState } from '@/app/redux/store';
import { GridCellParams } from '@mui/x-data-grid';
import { getAllocationManagerFromPath } from '@/app/utils/common';
import EllipsisNameCell from './EllipsisNameCell';
import CustomToolbar from '../../Toolbar/CustomToolbarUpdated';
import NoRowsOverlay from './NoRowsOverlay';

export default function TeamAllocation() {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [allocationThreshold, setAllocationThreshold] = useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const { teams, resources, loading, dataProcessing, calendarDate } =
    useSelector((state: RootState) => state.teams);
  const { startDate, endDate } = calendarDate || {};
  const _resources = useSelector(
    (state: RootState) => state.resources.resources
  );

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
      width: 201,
      headerClassName: 'prime-header',
      cellClassName: 'prime-cell',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const { rowNode, api, value = '' } = params;
        const isGridTreeNode = 'children' in rowNode; // Required for Typescript
        let resource_count: any[] = [];
        if (isGridTreeNode && rowNode.children) {
          resource_count = [
            ...new Set(rowNode?.children?.map(child => api.getRow(child))),
          ];
        }
        return (
          <EllipsisNameCell
            value={value as string}
            resourceCount={resource_count.length}
            onAddClick={() => handleAddClick(params)}
            showAddIcon
          />
        );
      },
    },
    {
      field: 'teamStatus',
      headerName: 'Status',
      width: 90,
      type: 'string',
      isEditable: false,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const team = getTeam(params);
        return team ? <EllipsisNameCell value={team?.Status ?? 'N/A'} /> : null;
      },
    },
    {
      field: 'teamAllocationManager',
      headerName: 'Allocation Manager',
      width: 180,
      type: 'string',
      isEditable: false,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const team = getTeam(params);
        return team && _resources && 'result' in _resources ? (
          <EllipsisNameCell
            value={
              getAllocationManagerFromPath(
                team?.AllocationManager,
                _resources?.result || []
              )?.FullName ?? 'N/A'
            }
          />
        ) : null;
      },
    },
    {
      field: 'resourceType',
      headerName: 'Resource Type',
      width: 135,
      sortable: false,
      headerClassName: 'secondary-header',
      cellClassName: 'secondary-cell',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const { rowNode, api, value } = params;
        const isGridTreeNode = 'children' in rowNode; // Required for Typescript
        let displayValue = (value ?? '') as string;

        if (!displayValue && isGridTreeNode && rowNode.children) {
          const uniqueResourceTypes = [
            ...new Set(
              rowNode.children.map(child => api.getRow(child)?.resourceType)
            ),
          ].filter(Boolean);

          displayValue = uniqueResourceTypes.length
            ? uniqueResourceTypes.length > 1
              ? `${uniqueResourceTypes[0]} +${uniqueResourceTypes.length - 1}`
              : uniqueResourceTypes[0]
            : '';
        }

        return <EllipsisNameCell value={displayValue} />;
      },
    },
  ];

  return (
    <>
      <AllocationGrid
        loading={loading || dataProcessing}
        groupBy="teams"
        mode="team"
        startDate={startDate}
        endDate={endDate}
        columns={teamsColumnConfig}
        selectedTeam={selectedTeam}
        toolbarComponent={CustomToolbar}
        setAllocationThreshold={setAllocationThreshold}
        setSelectedTeam={setSelectedTeam}
        initialState={{
          columns: {
            columnVisibilityModel: {
              teamAllocationManager: false,
              teamStatus: false,
              __row_group_by_columns_group_teams__: true, // This is the grouping column for teams
              __row_group_by_columns_group_resource__: true, // This is the gtouping column for resource
              project: true,
              resourceType: true,
              teams: false, // This column has to always be false, as we are using grouping.
              resource: false, // This column has to always be false, as we are using grouping.
            },
          },
        }}
        NoRowsOverlay = {NoRowsOverlay}
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
