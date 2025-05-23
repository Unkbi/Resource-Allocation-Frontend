import { call, put, takeEvery } from 'redux-saga/effects';
import { FETCH_EMPLOYEE_RATES } from '../actions/employeeRatesActions';
import { setEmployeeRates, setLoading } from '../reducers/employeeRatesReducer';
import { fetchEmployeeRates } from '@/app/services/employeeRatesServices';
import { mockEmployeeRates } from '@/app/constants/mockEmployeeRates';

function* fetchEmployeeRatesSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    // const responses = yield call(fetchEmployeeRates);
    const responses = yield mockEmployeeRates;

    yield put(setEmployeeRates(responses?.result));
  } catch (error) {
    console.error('Saga error, Failed to fetch Employee Rates : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

export function* employeeRatesSaga() {
  yield takeEvery(FETCH_EMPLOYEE_RATES, fetchEmployeeRatesSaga);
}
