'use client';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { AppDispatch, RootState } from '@/app/redux/store';
import { GridCellParams } from '@mui/x-data-grid';
import EllipsisNameCell from './EllipsisNameCell';
import SplitTeamToolbar from '../../Toolbar/SplitTeamToolbar';
import NoRowsOverlay from './NoRowsOverlay';
import { Box } from '@mui/material';
import { AllAllocations } from '@/app/types';
import { useAllocationGrid } from '@/app/hooks/useAllocationGrid';
import { getCombinedAllocation } from '@/app/utils/allocationUtils';

interface BottomTeamsViewProps {
  startDate: string | null;
  endDate: string | null;
}

export default function BottomTeamsView({
  startDate,
  endDate,
}: BottomTeamsViewProps) {
  const [selectedTeam, setSelectedTeam] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [allocationThreshold, setAllocationThreshold] = useState(1.2);
  const dispatch = useDispatch<AppDispatch>();
  const { allAllocations, loading, dataProcessing, calendarDate } = useSelector(
    (state: RootState) => state.allAllocations
  );
  // const { startDate, endDate } = calendarDate || {};

  const { setRows, ready, getAllRows } = useAllocationGrid('bottomTeam');

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

  const teamsColumnConfig = [
    {
      field: 'teams',
      headerName: 'Teams Name',
      width: 212,
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
            showAddButton={false}
          />
        );
      },
    },
  ];

  const computeAverageAllocations = (data: AllAllocations[]) => {
    const grouped: Record<string, any[]> = {};

    // Group by resource
    data.forEach(row => {
      const resource = row.resource;
      if (!resource) return; // Skip if resource is not defined
      if (!grouped[resource]) grouped[resource] = [];
      grouped[resource].push(row);
    });

    const result: any[] = [];

    Object.entries(grouped).forEach(([resource, rows]) => {
      let totalAllocation = 0;
      const seenWeeks = new Set<string>();

      rows.forEach(row => {
        Object.keys(row).forEach(key => {
          if (/^W\d+/.test(key) && typeof row[key] === 'object') {
            const value = parseFloat(row[key]?.value ?? 0);
            totalAllocation += value;
            if (!seenWeeks.has(key)) {
              seenWeeks.add(key);
            }
          }
        });
      });

      const avgAllocation =
        seenWeeks.size > 0 ? totalAllocation / seenWeeks.size : 0;
      rows.forEach(row => {
        const cloned = { ...row };
        cloned._avgPeriodAllocation = avgAllocation; // New field
        result.push(cloned);
      });
    });

    return result;
  };

  const removeResourcesWithNoTeams = (allocations: AllAllocations[]) => {
    return allocations.filter(allocation => allocation.teams);
  };

  const hasZeroAllocation = (row: AllAllocations) => {
    if (row._avgPeriodAllocation === 0) return true;
    return Object.keys(row).every(key => {
      if (/^W\d+/.test(key)) {
        const value = row[key];
        if (value && typeof value === 'object' && 'value' in value) {
          return value.value === 0 || value.value === undefined;
        }
        return true;
      }
      return true;
    });
  };

  const filteredResources = useMemo(() => {
    if (ready && (allAllocations || getAllRows())) {
      // Combine to keep upto Date information.
      const allRows = getCombinedAllocation(
        getAllRows() as AllAllocations[],
        allAllocations || []
      );
      const enrichedResources = computeAverageAllocations(
        removeResourcesWithNoTeams(allRows) ?? []
      );

      return enrichedResources.filter(row => {
        const teamMatch = selectedTeam.length
          ? row.teams && selectedTeam.some(team => team.label === row.teams)
          : true;

        const avgWeekly = row._avgPeriodAllocation ?? 0;
        if (allocationThreshold === 0) {
          return teamMatch && hasZeroAllocation(row);
        }
        if (allocationThreshold > 1) {
          return teamMatch;
        }

        return teamMatch && avgWeekly <= allocationThreshold;
      });
    }
  }, [ready, allAllocations, selectedTeam, allocationThreshold]);

  useEffect(() => {
    if (ready && allAllocations) {
      setRows(filteredResources || []);
    }
  }, [ready, allAllocations, filteredResources]);

  return (
    <>
      <Box
        sx={{
          height: loading || dataProcessing ? '100vh' : 'var(--height)',
          width: '100%',
        }}
      >
        <AllocationGrid
          loading={loading || dataProcessing}
          groupBy="teams"
          mode="split"
          startDate={startDate}
          endDate={endDate}
          columns={teamsColumnConfig}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
          columnsFilterable={false}
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
            pinnedColumns: {
              left: [
                '__row_group_by_columns_group_teams__',
                '__row_group_by_columns_group_resource__',
                'project',
              ],
            },
          }}
          NoRowsOverlay={NoRowsOverlay}
          viewId="bottomTeam"
        />
      </Box>
    </>
  );
}
