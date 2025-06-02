import { call, put, takeEvery } from 'redux-saga/effects';
import {
  FETCH_EMPLOYEE_RATES,
  CREATE_EMPLOYEE_RATES,
  UPDATE_EMPLOYEE_RATES,
  DELETE_EMPLOYEE_RATES,
} from '../actions/employeeRatesActions';
import { setEmployeeRates, setLoading } from '../reducers/employeeRatesReducer';
import { fetchEmployeeRates,createEmployeeRates,updateEmployeeRates,deleteEmployeeRates } from '@/app/services/employeeRatesServices';

function* fetchEmployeeRatesSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchEmployeeRates);

    yield put(setEmployeeRates(responses?.result));
  } catch (error) {
    console.error('Saga error, Failed to fetch Employee Rates : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* createEmployeeRatesSaga(action: any): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield call(createEmployeeRates, action.payload);
    yield call(fetchEmployeeRatesSaga);
  } catch (error) {
    console.error('Saga error, Failed to create Employee Rate : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* updateEmployeeRatesSaga(action: any): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const { id, updatedFields } = action.payload;
    yield call(updateEmployeeRates, id, updatedFields);
    yield call(fetchEmployeeRatesSaga);
  } catch (error) {
    console.error('Saga error, Failed to update Employee Rate : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* deleteEmployeeRatesSaga(action: any): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const id = action.payload;
    yield call(deleteEmployeeRates, id);
    yield call(fetchEmployeeRatesSaga);
  } catch (error) {
    console.error('Saga error, Failed to delete Employee Rate : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

export function* employeeRatesSaga() {
  yield takeEvery(FETCH_EMPLOYEE_RATES, fetchEmployeeRatesSaga);
  yield takeEvery(CREATE_EMPLOYEE_RATES, createEmployeeRatesSaga);
  yield takeEvery(UPDATE_EMPLOYEE_RATES, updateEmployeeRatesSaga);
  yield takeEvery(DELETE_EMPLOYEE_RATES, deleteEmployeeRatesSaga);
}
