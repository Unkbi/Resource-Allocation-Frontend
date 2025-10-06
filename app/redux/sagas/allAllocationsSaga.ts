import {
  call,
  put,
  takeLatest,
  all,
  takeLeading,
  takeEvery,
} from 'redux-saga/effects';
import {
  bulkDeleteAllocations,
  bulkUpdateAllocations,
  fetchAllAllocations,
} from '@/app/services/allocationServices';
import { getMondayOfISO } from '@/app/utils/common';
import {
  setAllAllocations,
  setDataProcessing,
  setLoading,
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
  fetchTransferAllocationsForSaga,
} from '@/app/services/teamServices';
import { fetchProjectAllocationsForSaga } from '@/app/services/projectServices';
import { setAllTeamsResources } from '../reducers/teamsReducer';
import {
  Allocation,
  AllResourceDetail,
  GetAllCostForPeriodResponse,
  Resource,
} from '@/app/types';
import {
  setCost,
  setDataProcessing as setCostDataProcessing,
} from '../reducers/AllocationsCostReducer';
import { fetchAllAllocationCosts } from '@/app/services/allocationCostServices';
import { formatAPIResponse } from '@/app/utils/authUtils';

function* fetchAllAllocationsSaga(action: any): Generator<any, void, any> {
  const {
    projects,
    teams,
    resources,
    projectTypes,
    portfolios,
    allResourcesDetail,
    startDate,
    endDate,
    resolve,
    reject,
  } = action.payload;
  try {
    yield put(setDataProcessing(true));

    const postData = {
      StartDate: getMondayOfISO(startDate),
      EndDate: getMondayOfISO(endDate),
    };

    const responses = yield call(fetchAllAllocations, postData);
    // Got your response now, format the data to have a combination of teams and projects data.

    const teamResults = yield all(
      teams.map((team: any) =>
        call(function* () {
          const resourcesResult = {
            result: allResourcesDetail
              .filter((r: AllResourceDetail) => r.Team?.Id === team?.Id)
              .map((r: AllResourceDetail) => r.Resource),
          };

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
      responses,
      teams,
      projects,
      projectTypes,
      resources,
      portfolios || [],
      allResourcesDetail || [],
      startDate,
      endDate
    );

    const fullAllocations = injectBlankRows(
      formattedAllocations,
      teams,
      teamResourceObject,
      allResourcesDetail || [],
      startDate,
      endDate
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
    yield put(setLoading(true));
  }
}

function* fetchAllocationsCostSaga(action: any): Generator<any, void, any> {
  const { projects, teams, resources, allResourcesDetail, startDate, endDate } =
    action.payload;
  try {
    yield put(setCostDataProcessing(true));

    const postData = {
      StartDate: getMondayOfISO(startDate),
      EndDate: getMondayOfISO(endDate),
    };

    let responses = yield call(fetchAllAllocationCosts, postData);
    responses = formatAPIResponse('AllocationCost', responses);

    // Got your response now, format the data to have a combination of teams and projects data.
    const teamResults = yield all(
      teams.map((team: any) =>
        call(function* () {
          const resourcesResult = {
            result: allResourcesDetail
              .filter((r: AllResourceDetail) => r.Team?.Id === team?.Id)
              .map((r: AllResourceDetail) => r.Resource),
          };

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
      responses?.map((res: GetAllCostForPeriodResponse) => ({
        ProjectName: res.ProjectName || null,
        Id: res.__path__?.split('/')[1] || null,
        Period: res.Period,
        Resource: res.ResourceRef?.split('/')[1] || null,
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
      teamResourceObject,
      [],
      startDate,
      endDate
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
  // Not being used in application.
  const {
    teamIds,
    teams,
    projects,
    resources,
    portfolios,
    allResourcesDetail,
    teamsResources,
    startDate,
    projectTypes,
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
      projectTypes || [],
      portfolios || [],
      allResourcesDetail || [],
      startDate,
      endDate
    );

    const fullAllocations = injectBlankRows(
      formattedAllocations,
      teams,
      teamsResources,
      allResourcesDetail || [],
      startDate,
      endDate
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
    portfolios,
    allResourcesDetail,
    projectTypes,
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
      projectTypes || [],
      portfolios || [],
      allResourcesDetail || [],
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

function* updatedBulkAllocationSaga(action: any): Generator<any, void, any> {
  const { resourceId, allocList, resolve, reject } = action.payload;
  try {
    const postData = {
      Resource: resourceId,
      AllocsList: allocList,
    };

    const response = yield call(bulkUpdateAllocations, postData);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error: Failed to update bulk allocations:', error);
    if (reject) reject(error);
  }
}

function* deleteBulkAllocationSaga(action: any): Generator<any, void, any> {
  const { resourceId, allocList, resolve, reject } = action.payload;
  try {
    const postData = {
      Resource: resourceId,
      AllocsList: allocList,
    };

    const response = yield call(bulkDeleteAllocations, postData);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error: Failed to delete bulk allocations:', error);
    if (reject) reject(error);
  }
}

function* updateResourceAllocationsSaga(
  action: any
): Generator<any, void, any> {
  const {
    ResourceId,
    teams,
    projects,
    resources,
    portfolios,
    projectTypes,
    allResourcesDetail,
    teamsResources,
    startDate,
    endDate,
    resolve,
    reject,
  } = action.payload;
  try {
    yield put(setDataProcessing(true));

    const results = yield all(
      ResourceId.map((ResourceId: string) =>
        call(function* () {
          const postData = {
            Resource: ResourceId,
            StartDate: getMondayOfISO(startDate),
            EndDate: getMondayOfISO(endDate),
          };
          // @ts-ignore
          const result = yield call(fetchTeamAllocationsForSaga, postData);
          return { ResourceId, result };
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
      projectTypes || [],
      portfolios,
      allResourcesDetail || [],
      startDate,
      endDate
    );

    const fullAllocations = injectBlankRows(
      formattedAllocations,
      teams,
      teamsResources,
      allResourcesDetail || [],
      startDate,
      endDate
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

export function* TransferAllocationsSaga(
  action: any
): Generator<any, void, any> {
  try {
    yield put(setDataProcessing(true));
    const { ResourceFrom, ResourceTo, StartDate, EndDate, resolve, reject } =
      action.payload;
    const postData = {
      ResourceFrom,
      ResourceTo,
      StartDate,
      EndDate,
    };
    const response = yield call(fetchTransferAllocationsForSaga, postData);
    if (response?.error) {
      console.error('API returned error:', response.error);
      if (reject) reject(response.error);
    } else {
      if (resolve) resolve(response);
    }
  } catch (error) {
    console.error('Saga error: Failed to transfer allocations:', error);
    if (action.payload.reject) action.payload.reject(error);
  } finally {
    yield put(setDataProcessing(false));
  }
}

export function* allAllocationsSaga() {
  yield takeLatest('FETCH_ALL_ALLOCATIONS_INIT', fetchAllAllocationsSaga); //This is for the inital Load.
  yield takeLatest('FETCH_ALL_ALLOCATIONS', fetchAllAllocationsSaga); // This is for subsequent fetch. Ex : Date Shift.
  yield takeLatest('UPDATE_TEAM_ALLOCATIONS', updateTeamAllocationsSaga);
  yield takeLatest('UPDATE_PROJECT_ALLOCATIONS', updateProjectAllocationsSaga);
  yield takeLatest('FETCH_ALLOCATIONS_COST', fetchAllocationsCostSaga);
  yield takeEvery('UPDATE_BULK_ALLOCATIONS', updatedBulkAllocationSaga);
  yield takeEvery('DELETE_BULK_ALLOCATIONS', deleteBulkAllocationSaga);
  yield takeLatest(
    'UPDATE_RESOURCE_ALLOCATIONS',
    updateResourceAllocationsSaga
  );
  yield takeLatest('TRANSFER_ALLOCATIONS_RESOURCES', TransferAllocationsSaga);
}
