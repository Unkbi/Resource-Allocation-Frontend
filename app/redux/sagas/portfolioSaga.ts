import { call, put, takeEvery } from 'redux-saga/effects';
import { setEmployeeRates, setLoading } from '../reducers/employeeRatesReducer';
import {
  fetchEmployeeRates,
  createEmployeeRates,
  updateEmployeeRates,
  deleteEmployeeRates,
} from '@/app/services/employeeRatesServices';
import {
  CREATE_PORTFOLIOS,
  DELETE_PORTFOLIOS,
  FETCH_PORTFOLIOS,
  UPDATE_PORTFOLIOS,
} from '../actions/portfolioActions';

function* fetchPortfolioSaga(): Generator<any, void, any> {
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

function* createPortfolioSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(createEmployeeRates, postData);
    yield call(fetchPortfolioSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to create Employee Rate : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* updatePortfolioSaga(action: any): Generator<any, void, any> {
  const { id, updatedFields, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(updateEmployeeRates, id, updatedFields);
    yield call(fetchPortfolioSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to update Employee Rate : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* deletePortfolioSaga(action: any): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const id = action.payload;
    yield call(deleteEmployeeRates, id);
    yield call(fetchPortfolioSaga);
  } catch (error) {
    console.error('Saga error, Failed to delete Employee Rate : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

export function* portfolioSaga() {
  yield takeEvery(FETCH_PORTFOLIOS, fetchPortfolioSaga);
  yield takeEvery(CREATE_PORTFOLIOS, createPortfolioSaga);
  yield takeEvery(UPDATE_PORTFOLIOS, updatePortfolioSaga);
  yield takeEvery(DELETE_PORTFOLIOS, deletePortfolioSaga);
}
