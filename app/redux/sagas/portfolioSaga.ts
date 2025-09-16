import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  CREATE_PORTFOLIOS,
  DELETE_PORTFOLIOS,
  FETCH_PORTFOLIOS,
  UPDATE_PORTFOLIOS,
} from '../actions/portfolioActions';

// all the API calls being imported from portfolioServices
import {
  createPortfolio,
  deletePortfolio,
  fetchPortfolios,
  updatePortfolio,
} from '@/app/services/prorfolioServices';
import { setLoading, setPortfolios } from '../reducers/portfolioReducer';

function* fetchPortfolioSaga(): Generator<any, void, any> {
  try {
    // changing loading state in porfolio Reducer
    yield put(setLoading(true));
    // calling fetchPortfolio from services to get all the portfolios
    const responses = yield call(fetchPortfolios);

    yield put(setPortfolios(responses));
  } catch (error) {
    console.error('Saga error, Failed to fetch Portfolios : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* createPortfolioSaga(action: any): Generator<any, void, any> {
  // deconstructed action object
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    // API post
    const response = yield call(createPortfolio, postData);
    // skips the middleware and calls the saga fucntion
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
  // deconstructed action
  const { id, updatedFields, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    // parts passed into undate function
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
// attaching actions to watchers
export function* portfolioSaga() {
  yield takeLatest(FETCH_PORTFOLIOS, fetchPortfolioSaga);
  yield takeEvery(CREATE_PORTFOLIOS, createPortfolioSaga);
  yield takeEvery(UPDATE_PORTFOLIOS, updatePortfolioSaga);
  yield takeEvery(DELETE_PORTFOLIOS, deletePortfolioSaga);
}
