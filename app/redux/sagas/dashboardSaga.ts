import { call, put, takeEvery, select } from 'redux-saga/effects';
import { ChartParams } from '../../types/dashboardTypes';
import { fetchDashboardChart } from '../actions/dashboardAction';
import { setDashboardChart } from '../reducers/dashboardReducer';
import { RootState } from '../store';

function* fetchDashboardChartSaga(action: { payload: ChartParams }) {
  const { chartKey, queryKey, startDate, endDate, bucket, projectTypeFilter, projectTypeGroupFilter, portfolioFilter, teamFilter, teamAllocMgrFilter, orgFilter } = action.payload;
  // Selector to get advanced filters
const selectAdvancedFilters = (state: RootState) => state.dashboard.advancedFilters;
  try {
    // Get advanced filters from Redux state
    const advancedFilters: ReturnType<typeof selectAdvancedFilters> = yield select(selectAdvancedFilters);
    
    // Merge advanced filters with existing filters (advanced filters take precedence if set)
    const mergedFilters = {
      projectTypeFilter: advancedFilters.ProjectType ? [advancedFilters.ProjectType] : (projectTypeFilter || []),
      projectTypeGroupFilter: advancedFilters.ProjectTypeGroup ? [advancedFilters.ProjectTypeGroup] : (projectTypeGroupFilter || []),
      portfolioFilter: advancedFilters.Portfolio ? [advancedFilters.Portfolio] : (portfolioFilter || []),
      teamFilter: advancedFilters.Team ? [advancedFilters.Team] : (teamFilter || []),
      teamAllocMgrFilter: advancedFilters.AllocationManager ? [advancedFilters.AllocationManager] : (teamAllocMgrFilter || []),
      orgFilter: advancedFilters.Organization ? [advancedFilters.Organization] : (orgFilter || []),
      resourceFilter: advancedFilters.Resource ? [advancedFilters.Resource] : [],
      projectFilter: advancedFilters.Project ? [advancedFilters.Project] : [],
      projectManagerFilter: advancedFilters.ProjectManager ? [advancedFilters.ProjectManager] : [],
    };

    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      bucket,
      projectTypeFilter: mergedFilters.projectTypeFilter.join(','),
      projectTypeGroupFilter: mergedFilters.projectTypeGroupFilter.join(','),
      portfolioFilter: mergedFilters.portfolioFilter.join(','),
      teamFilter: mergedFilters.teamFilter.join(','),
      teamAllocMgrFilter: mergedFilters.teamAllocMgrFilter.join(','),
      orgFilter: mergedFilters.orgFilter.join(','),
      resourceFilter: mergedFilters.resourceFilter.join(','),
      projectFilter: mergedFilters.projectFilter.join(','),
      projectManagerFilter: mergedFilters.projectManagerFilter.join(','),
    }).toString();

    const res: Response = yield call(
      fetch,
      `/api/report/${queryKey}?${queryParams}`
    );
    const data: any[] = yield res.json();

    if (!res.ok) {
      // @ts-ignore
      throw new Error(`Error fetching chart data: ${data?.error}`);
    }

    yield put(setDashboardChart({ chartKey, data }));
  } catch (err) {
    console.error(`Dashboard chart fetch failed for ${chartKey}`, err);
  }
}

export function* dashboardSaga() {
  yield takeEvery(fetchDashboardChart, fetchDashboardChartSaga);
}
