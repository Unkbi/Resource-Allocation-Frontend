import { call, put, takeEvery } from 'redux-saga/effects';
import {
  CREATE_PORTFOLIOS,
  DELETE_PORTFOLIOS,
  FETCH_PORTFOLIOS,
  UPDATE_PORTFOLIOS,
} from '../actions/portfolioActions';
import {
  createPortfolio,
  deletePortfolio,
  fetchPortfolios,
  updatePortfolio,
} from '@/app/services/prorfolioServices';
import { setLoading, setPortfolios } from '../reducers/portfolioReducer';

function* fetchPortfolioSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchPortfolios);

    yield put(setPortfolios(responses));
  } catch (error) {
    console.error('Saga error, Failed to fetch Portfolios : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* createPortfolioSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(createPortfolio, postData);
    yield call(fetchPortfolioSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to create Portfolio : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* updatePortfolioSaga(action: any): Generator<any, void, any> {
  const { id, updatedFields, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(updatePortfolio, id, updatedFields);
    yield call(fetchPortfolioSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to update Portfolio : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* deletePortfolioSaga(action: any): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const id = action.payload;
    yield call(deletePortfolio, id);
    yield call(fetchPortfolioSaga);
  } catch (error) {
    console.error('Saga error, Failed to delete Portfolio : ', error);
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
