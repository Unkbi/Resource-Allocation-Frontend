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
import EllipsisNameCell from './EllipsisNameCell';
import SplitTeamToolbar from '../../Toolbar/SplitTeamToolbar';

export default function SplitView() {
  const [selectedTeam, setSelectedTeam] = useState<Array<{label: string, value: string}>>([]);
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
  ];

  const filteredResources = resources?.filter(resource => {
    const matchesTeam = selectedTeam.length
    ? resource.teams && selectedTeam.some(team => team.label === resource.teams)
    : true;
    
    return matchesTeam;
  });

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
        setAllocationThreshold={setAllocationThreshold}
        toolbarComponent={(props: any) => (
          <SplitTeamToolbar
            {...props}
            selectedTeam = {selectedTeam}
            setSelectedTeam={setSelectedTeam}
            setAllocationThreshold={setAllocationThreshold}
          />
        )}
        initialState={{
          columns: {
            columnVisibilityModel: {
              __row_group_by_columns_group_teams__: true, // This is the grouping column for teams
              __row_group_by_columns_group_resource__: true, // This is the gtouping column for resource
              project: true,
              teams: false, // This column has to always be false, as we are using grouping.
              resource: false, // This column has to always be false, as we are using grouping.
            },
          },
        }}
        data={filteredResources || []}

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
