'use client';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { useEffect, useState, useMemo } from 'react';
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
import NoRowsOverlay from './NoRowsOverlay';

export default function SplitView() {
  const [selectedTeam, setSelectedTeam] = useState<
    Array<{ label: string; value: string }>
  >([]);
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

  const computeAverageAllocations = (data: any[]) => {
    const grouped: Record<string, any[]> = {};

    // Group by resource
    data.forEach(row => {
      const resource = row.resource;
      if (!grouped[resource]) grouped[resource] = [];
      grouped[resource].push(row);
    });

    const result: any[] = [];

    Object.entries(grouped).forEach(([resource, rows]) => {
      const weeks: Record<string, number[]> = {};

      // Step 2: Accumulate allocations per week across projects
      rows.forEach(row => {
        Object.keys(row).forEach(key => {
          if (key.startsWith('W') && typeof row[key] === 'object') {
            const value = parseFloat(row[key]?.value ?? 0);
            if (!weeks[key]) weeks[key] = [];
            weeks[key].push(value);
          }
        });
      });

      // Step 3: Compute average and attach to each row
      const avgPerWeek: Record<string, number> = {};
      Object.entries(weeks).forEach(([week, values]) => {
        avgPerWeek[week] = values.reduce((a, b) => a + b, 0) / values.length;
      });

      rows.forEach(row => {
        const cloned = { ...row };
        cloned._avgWeeklyAllocation = avgPerWeek;
        result.push(cloned);
      });
    });

    return result;
  };

  const enrichedResources = computeAverageAllocations(resources ?? []);

  const filteredResources = useMemo(() => {
    return enrichedResources.filter(row => {
      const teamMatch = selectedTeam.length
        ? row.teams && selectedTeam.some(team => team.label === row.teams)
        : true;

      const avgWeekly = row._avgWeeklyAllocation ?? {};
      if (allocationThreshold === 0) {
        return teamMatch;
      }
      //checks if all weeks satisfy the condition
      const hasBelowThreshold = Object.values(avgWeekly).every(
        avg => (avg as number) < allocationThreshold
      );

      return teamMatch && hasBelowThreshold;
    });
  }, [enrichedResources, selectedTeam, allocationThreshold]);

  return (
    <>
      <AllocationGrid
        loading={loading || dataProcessing}
        groupBy="teams"
        mode = "split"
        startDate={startDate}
        endDate={endDate}
        columns={teamsColumnConfig}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        setAllocationThreshold={setAllocationThreshold}
        toolbarComponent={(props: any) => (
          <SplitTeamToolbar
            {...props}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
            setAllocationThreshold={setAllocationThreshold}
            allocationThreshold={allocationThreshold}
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
        NoRowsOverlay = {NoRowsOverlay}
        data={filteredResources || []}
      />
    </>
  );
}
