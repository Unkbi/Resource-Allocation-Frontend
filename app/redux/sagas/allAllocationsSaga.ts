import { call, put, takeLatest, all, takeLeading } from 'redux-saga/effects';
import { fetchAllAllocations } from '@/app/services/allocationServices';
import { getMondayOfISO } from '@/app/utils/common';
import {
  setAllAllocations,
  setDataProcessing,
  updateAllAllocations,
} from '../reducers/allAllocationsReducer';
import {
  formatAllAllocations,
  injectBlankRows,
  formatCostAllocations,
} from '@/app/utils/allocationUtils';
import {
  fetchResourcesAgainstTeamsForSaga,
  fetchTeamAllocationsForSaga,
} from '@/app/services/teamServices';
import { fetchProjectAllocationsForSaga } from '@/app/services/projectServices';
import { setAllTeamsResources } from '../reducers/teamsReducer';
import { Allocation, GetAllCostForPeriodResponse, Resource } from '@/app/types';
import {
  setCost,
  setDataProcessing as setCostDataProcessing,
} from '../reducers/AllocationsCostReducer';
import { fetchAllAllocationCosts } from '@/app/services/allocationCostServices';

function* fetchAllAllocationsSaga(action: any): Generator<any, void, any> {
  const { projects, teams, resources, startDate, endDate, resolve, reject } =
    action.payload;
  try {
    yield put(setDataProcessing(true));

    const postData = {
      'ResourceAllocation.Core/GetAllAllocationsForPeriod': {
        StartDate: getMondayOfISO(startDate),
        EndDate: getMondayOfISO(endDate),
      },
    };

    const responses = yield call(fetchAllAllocations, postData);
    // Got your response now, format the data to have a combination of teams and projects data.

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

    let teamResourceObject: Record<string, Resource[]> = {};
    const formatedTeamResults = teamResults
      // @ts-ignore
      ?.map(teamResult => ({
        id: teamResult?.team?.Id,
        resource: teamResult?.resourcesResult?.result,
      }));

    formatedTeamResults.forEach(
      (payload: { id: string; resource: Resource[] }) => {
        teamResourceObject = teamResourceObject || {};
        teamResourceObject[payload.id] = payload.resource;
      }
    );

    if (teamResults) {
      yield put(setAllTeamsResources(formatedTeamResults));
    }

    const formattedAllocations = formatAllAllocations(
      responses.result,
      teams,
      projects,
      resources,
      teamResourceObject,
      startDate,
      endDate
    );

    const fullAllocations = injectBlankRows(
      formattedAllocations,
      teams,
      teamResourceObject
    );

    if (fullAllocations.length) {
      yield put(setAllAllocations(fullAllocations));
    }
    if (resolve) resolve();
  } catch (error) {
    console.error(
      'Saga error, Failed to fetch team project/allocations : ',
      error
    );
    if (reject) reject(error);
  } finally {
    yield put(setDataProcessing(false));
  }
}

function* fetchAllocationsCostSaga(action: any): Generator<any, void, any> {
  const { projects, teams, resources, startDate, endDate } = action.payload;
  try {
    yield put(setCostDataProcessing(true));

    const postData = {
      'ResourceAllocation.Core/GetAllCostForPeriod': {
        StartDate: getMondayOfISO(startDate),
        EndDate: getMondayOfISO(endDate),
      },
    };

    const responses = yield call(fetchAllAllocationCosts, postData);

    // Got your response now, format the data to have a combination of teams and projects data.
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

    let teamResourceObject: Record<string, Resource[]> = {};
    const formatedTeamResults = teamResults
      // @ts-ignore
      ?.map(teamResult => ({
        id: teamResult?.team?.Id,
        resource: teamResult?.resourcesResult?.result,
      }));

    formatedTeamResults.forEach(
      (payload: { id: string; resource: Resource[] }) => {
        teamResourceObject = teamResourceObject || {};
        teamResourceObject[payload.id] = payload.resource;
      }
    );

    if (teamResults) {
      yield put(setAllTeamsResources(formatedTeamResults));
    }

    const formatResponses =
      responses?.result.map((res: GetAllCostForPeriodResponse) => ({
        ProjectName: res.ProjectName || null,
        Id: res.__Id__,
        Period: res.Period,
        Resource: res.ResourceRef?.split(',')[1] || null,
        Duration: res.Duration || null,
        ResourceName: res.ResourceName || null,
        Cost: res.PlannedCost || 0,
        Project: res.Project || null,
      })) || [];

    const formattedAllocations = formatCostAllocations(
      formatResponses,
      teams,
      projects,
      resources,
      teamResourceObject,
      startDate,
      endDate
    );

    const fullAllocations = injectBlankRows(
      formattedAllocations,
      teams,
      teamResourceObject
    );

    if (fullAllocations.length) {
      yield put(setCost(fullAllocations));
    }
  } catch (error) {
    console.error(
      'Saga error, Failed to fetch team project/allocations cost : ',
      error
    );
  } finally {
    yield put(setCostDataProcessing(false));
  }
}

function* updateTeamAllocationsSaga(action: any): Generator<any, void, any> {
  const {
    teamIds,
    teams,
    projects,
    resources,
    teamsResources,
    startDate,
    endDate,
    resolve,
    reject,
  } = action.payload;
  try {
    yield put(setDataProcessing(true));

    const results = yield all(
      teamIds.map((teamId: string) =>
        call(function* () {
          const postData = {
            'ResourceAllocation.Core/GetTeamAllocationsForPeriod': {
              TeamId: teamId,
              StartDate: getMondayOfISO(startDate),
              EndDate: getMondayOfISO(endDate),
            },
          };
          // @ts-ignore
          const result = yield call(fetchTeamAllocationsForSaga, postData);
          return { teamId, result };
        })
      )
    );

    const allTeamAllocations = results.reduce(
      (
        tot: Allocation[],
        acc: { result: { result: Allocation[] }; teamId: string }
      ) => {
        return [...tot, ...acc.result.result];
      },
      []
    );

    const formattedAllocations = formatAllAllocations(
      allTeamAllocations,
      teams,
      projects,
      resources,
      teamsResources,
      startDate,
      endDate
    );

    const fullAllocations = injectBlankRows(
      formattedAllocations,
      teams,
      teamsResources
    );

    yield put(updateAllAllocations(fullAllocations));
    // Notify if async operation is completed
    if (resolve) resolve();
  } catch (error) {
    console.error('Saga error: Failed to update team allocations:', error);
    if (reject) reject(error);
  } finally {
    yield put(setDataProcessing(false));
  }
}

function* updateProjectAllocationsSaga(action: any): Generator<any, void, any> {
  const {
    projectIds,
    teams,
    projects,
    resources,
    teamsResources,
    startDate,
    endDate,
    resolve,
    reject,
  } = action.payload;

  try {
    yield put(setDataProcessing(true));

    const results = yield all(
      projectIds.map((projectId: string) =>
        call(function* () {
          const postData = {
            'ResourceAllocation.Core/GetProjectAllocationsForPeriod': {
              Project: projectId,
              StartDate: getMondayOfISO(startDate),
              EndDate: getMondayOfISO(endDate),
            },
          };
          // @ts-ignore
          const result = yield call(fetchProjectAllocationsForSaga, postData);
          return { projectId, result };
        })
      )
    );

    const allProjectAllocations = results.reduce(
      (
        acc: Allocation[],
        curr: { result: { result: Allocation[] }; projectId: string }
      ) => [...acc, ...curr.result.result],
      []
    );

    const projectsAllocations = formatAllAllocations(
      allProjectAllocations,
      teams,
      projects,
      resources,
      teamsResources,
      startDate,
      endDate
    );

    yield put(updateAllAllocations(projectsAllocations));

    if (resolve) resolve();
  } catch (error) {
    console.error('Saga error: Failed to update project allocations:', error);
    if (reject) reject(error);
  } finally {
    yield put(setDataProcessing(false));
  }
}

export function* allAllocationsSaga() {
  yield takeLeading('FETCH_ALL_ALLOCATIONS_INIT', fetchAllAllocationsSaga); //This is for the inital Load.
  yield takeLatest('FETCH_ALL_ALLOCATIONS', fetchAllAllocationsSaga); // This is for subsequent fetch. Ex : Date Shift.
  yield takeLatest('UPDATE_TEAM_ALLOCATIONS', updateTeamAllocationsSaga);
  yield takeLatest('UPDATE_PROJECT_ALLOCATIONS', updateProjectAllocationsSaga);
  yield takeLatest('FETCH_ALLOCATIONS_COST', fetchAllocationsCostSaga);
}
