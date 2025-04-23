import { call, put, all, takeLatest, fork, cancel } from 'redux-saga/effects';
import {
  setAllTeamsResources,
  setTeamsDataProcessing,
  updateResources,
} from '../reducers/teamsReducer';
import { fetchResourcesAgainstTeamsForSaga } from '@/app/services/teamServices';
import { setAllocations } from '../reducers/dataGridReducer';
import { Allocation, AllocationGridCell, Resource } from '@/app/types';
import {
  getMonday,
  getMondaysInRange,
  getWeekNumber,
  removeDuplicateResources,
} from '@/app/utils/common';
//@ts-ignore
import { format, parseISO } from 'date-fns';
import { DATE_FORMAT } from '@/app/constants/constants';
import { fetchAllAllocations } from '@/app/services/allocationServices';
import { sagaTaskRefs } from './sagaTasks';

const formatAllocations = (
  data: Allocation[],
  resources: Resource[],
  teamId: string,
  teamName: string,
  teamStatus: string | null,
  teamAllocationManager: string | null,
  startDate: string,
  endDate: string
) => {
  const allocationsData = data;
  const allocationMap = new Map();
  const resourcesData = resources;

  if (Array.isArray(allocationsData) && allocationsData.length === 0) {
    let obj: AllocationGridCell[] = [];
    if (resources?.length === 0) {
      obj = [
        {
          id: teamId,
          resourceId: '',
          project: '',
          projectId: '',
          resource: '',
          totalEffort: null,
          role: '',
          teamStatus: teamStatus ?? '',
          teamAllocationManager: teamAllocationManager ?? '',
          teams: teamName,
          teamsId: teamId,
          resourceType: '',
          W1: null,
        },
      ];
    } else {
      if (Array.isArray(resources) && resources?.length !== 0) {
        const uniqueRecords = removeDuplicateResources(resources);

        if (uniqueRecords.length > 0) {
          obj = uniqueRecords.map(resource => ({
            id: resource.Id + teamId,
            resourceId: resource.Id,
            project: '',
            projectId: '',
            resource: resource.FullName,
            totalEffort: null,
            role: resource.Role,
            teams: teamName,
            teamsId: teamId,
            teamStatus: teamStatus ?? '',
            teamAllocationManager: teamAllocationManager ?? '',
            resourceType: resource.Type,
            hasProject: true,
            W1: null,
          }));
        }
      }
    }
    return obj;
  }

  Array.isArray(allocationsData) &&
    allocationsData.forEach(allocation => {
      if (!allocation.Period || allocation.AllocationEntered === 0) return;

      const periodDate = parseISO(allocation.Period);
      const weekNumber = getWeekNumber(periodDate);
      const formattedDate = format(periodDate, DATE_FORMAT);

      const matchingTeamResource =
        Array.isArray(resources) &&
        resources?.find(
          team =>
            team.FullName === allocation.ResourceName ||
            team.Id === allocation.Resource
        );

      const role = matchingTeamResource ? matchingTeamResource.Role : 'N/A';
      const resourceType = matchingTeamResource
        ? matchingTeamResource.Type
        : 'N/A';

      // Using Resource + Team ID + Project ID as the unique identifier
      const uniqueId = `${allocation.Resource}-${teamId}-${allocation.Project}`;
      const existingAllocation = allocationMap.get(uniqueId);
      if (existingAllocation) {
        existingAllocation[weekNumber] = {
          allocationId: allocation.Id,
          value: allocation.AllocationEntered,
          period: formattedDate,
        };
        existingAllocation.totalEffort += allocation.AllocationEntered;
        existingAllocation.teamStatus = teamStatus ?? '';
        existingAllocation.teamAllocationManager = teamAllocationManager ?? '';
      } else {
        const newAllocation: AllocationGridCell = {
          id: uniqueId,
          resourceId: allocation.Resource || '',
          project: allocation.ProjectName || '',
          projectId: allocation.Project || '',
          resource: allocation.ResourceName || '',
          totalEffort: allocation.AllocationEntered || null,
          teamStatus: teamStatus ?? '',
          teamAllocationManager: teamAllocationManager ?? '',
          role,
          teams: teamName,
          resourceType,
        };

        newAllocation[weekNumber] = {
          allocationId: allocation.Id,
          value: allocation.AllocationEntered,
          period: formattedDate,
        };

        allocationMap.set(uniqueId, newAllocation);
      }
    });

  // add empty allocations with period within date range
  const allWeeks: string[] = getMondaysInRange(startDate, endDate);
  const updatedAllocationMap: AllocationGridCell[] = Array.from(
    allocationMap.values()
  );
  updatedAllocationMap.forEach(allocation => {
    const filteredWeeksArr = Object.values(allocation).filter(
      item => typeof item === 'object'
    );
    const allFilteredDates = filteredWeeksArr
      .map(obj => obj?.period && format(getMonday(obj.period), DATE_FORMAT))
      .filter(Boolean);
    allWeeks
      .filter(week => !allFilteredDates.includes(week))
      .forEach(week => {
        allocation[getWeekNumber(new Date(week))] ??= {
          allocationId: null,
          value: null,
          period: week,
        };
      });
  });

  // Build a set of all resource IDs already added via allocations
  const allocatedResourceIds = new Set<string>(
    updatedAllocationMap
      .map(item => item.resourceId)
      .filter((id): id is string => id !== null && id !== undefined)
  );

  // Add resources with no allocations
  if (resourcesData && Array.isArray(resourcesData)) {
    resourcesData.forEach(resource => {
      if (!allocatedResourceIds.has(resource.Id)) {
        const defaultEntry: AllocationGridCell = {
          id: `${resource.Id}-${teamId}`,
          resourceId: resource.Id,
          project: '',
          projectId: '',
          resource: resource.FullName,
          totalEffort: null,
          teamStatus: teamStatus ?? '',
          teamAllocationManager: teamAllocationManager ?? '',
          role: resource.Role || '',
          teams: teamName,
          resourceType: resource.Type || '',
        };

        const allWeeks: string[] = getMondaysInRange(startDate, endDate);
        allWeeks.forEach(week => {
          const weekNum = getWeekNumber(new Date(week));
          defaultEntry[weekNum] = {
            allocationId: null,
            value: null,
            period: week,
          };
        });

        updatedAllocationMap.push(defaultEntry);
      }
    });
  }
  return updatedAllocationMap;
};

function* fetchResourcesAgainstTeamsSaga(
  action: any
): Generator<any, void, any> {
  const { teams, StartDate, EndDate } = action.payload;

  try {
    yield put(setTeamsDataProcessing(true));
    let allResources: any[] = [];

    const allocationsPostData = {
      'ResourceAllocation.Core/GetAllAllocationsForPeriod': {
        StartDate,
        EndDate,
      },
    };
    const allAllocationsResult = yield call(
      fetchAllAllocations,
      allocationsPostData
    );

    const teamResults = yield all(
      teams.map((team: any) =>
        call(function* () {
          const resourcesPostData = {
            'ResourceAllocation.Core/GetTeamResources': { TeamId: team.Id },
          };
          //@ts-ignore
          const resourcesResult = yield call(
            fetchResourcesAgainstTeamsForSaga,
            resourcesPostData
          );

          return { resourcesResult, team };
        })
      )
    );

    const teamResourceResponse = teamResults.map(
      ({ resourcesResult, team }: any) => ({
        id: team.Id,
        teamStatus: team.Status,
        teamAllocationManager: team.AllocationManager,
        resource: resourcesResult.result,
      })
    );
    yield put(setAllTeamsResources(teamResourceResponse));

    for (const { resourcesResult, team } of teamResults) {
      // Filter allocations relevant to the team
      const resourcesIds = resourcesResult.result.map(
        (resource: any) => resource.Id
      );
      const teamAllocations = allAllocationsResult.result.filter(
        (allocation: any) => resourcesIds.includes(allocation.Resource)
      );

      yield put(
        setAllocations({
          team_id: team.Id,
          value: {
            resourcesResult: {
              status: 'fulfilled',
              result: {
                payload: {
                  result: resourcesResult.result,
                  status: 'ok',
                },
                type: 'team/allocations/fulfilled',
              },
              team: team,
            },
            allocationsResult: {
              status: 'fulfilled',
              result: {
                payload: {
                  result: teamAllocations,
                  status: 'ok',
                },
                type: '/team/resources/fulfilled',
              },
              team: team,
            },
            team,
          },
        })
      );

      const formattedAllocations = formatAllocations(
        teamAllocations,
        resourcesResult.result,
        team.Id,
        team.Name,
        team.Status,
        team.AllocationManager,
        StartDate,
        EndDate
      );

      allResources = [...allResources, ...formattedAllocations];
    }

    allResources.sort((a, b) => a.resource?.localeCompare(b.resource));
    if (allResources.length > 0) {
      yield put(updateResources(allResources));
    }
  } catch (err) {
    console.error('Saga: Failed to fetch team resources/allocations', err);
  } finally {
    yield put(setTeamsDataProcessing(false));
  }
}

export default function* teamSaga() {
  yield takeLatest('FETCH_RESOURCES_AGAINST_TEAMS', function* (action) {
    // Cancel projects task if active
    if (sagaTaskRefs.ongoingProjectTask) {
      yield cancel(sagaTaskRefs.ongoingProjectTask);
    }

    if (sagaTaskRefs.ongoingTeamsTask) {
      yield cancel(sagaTaskRefs.ongoingTeamsTask);
    }

    //@ts-ignore
    sagaTaskRefs.ongoingTeamsTask = yield fork(
      fetchResourcesAgainstTeamsSaga,
      action
    );
  });
}
