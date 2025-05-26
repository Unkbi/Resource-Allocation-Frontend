import { call, put, takeEvery } from 'redux-saga/effects';
import { ChartParams } from '../../types/dashboardTypes';
import { fetchDashboardChart } from '../actions/dashboardAction';
import { setDashboardChart } from '../reducers/dashboardReducer';

function* fetchDashboardChartSaga(action: { payload: ChartParams }) {
  const { chartKey, queryKey } = action.payload;
  try {
    // const paramString = new URLSearchParams(queryParams).toString();
    const res: Response = yield call(fetch, `/api/report/${queryKey}`);
    const data: any[] = yield res.json();
    yield put(setDashboardChart({ chartKey, data }));
  } catch (err) {
    console.error(`Dashboard chart fetch failed for ${chartKey}`, err);
  }
}

export function* dashboardSaga() {
  yield takeEvery(fetchDashboardChart, fetchDashboardChartSaga);
}
