import { call, put, takeEvery } from 'redux-saga/effects';
import { ChartParams } from '../../types/dashboardTypes';
import { fetchDashboardChart } from '../actions/dashboardAction';
import { setDashboardChart } from '../reducers/dashboardReducer';

function* fetchDashboardChartSaga(action: { payload: ChartParams }) {
  const { chartKey, queryKey, startDate, endDate, bucket, projectTypeFilter, projectTypeGroupFilter, portfolioFilter, teamFilter, teamAllocMgrFilter, orgFilter } = action.payload;
  try {
    // const paramString = new URLSearchParams(queryParams).toString();

    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      bucket,
      projectTypeFilter: projectTypeFilter ? projectTypeFilter.join(',') : '',
      projectTypeGroupFilter: projectTypeGroupFilter ? projectTypeGroupFilter.join(',') : '',
      portfolioFilter: portfolioFilter ? portfolioFilter.join(',') : '',
      teamFilter: teamFilter ? teamFilter.join(',') : '',
      teamAllocMgrFilter: teamAllocMgrFilter ? teamAllocMgrFilter.join(',') : '',
      orgFilter: orgFilter ? orgFilter.join(',') : '',
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
