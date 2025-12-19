import { call, put, takeLatest } from "redux-saga/effects";
import { setBusinessImpact, setBusinessImpactType, setLoading } from "../reducers/businessImpactReducer";
import { createBusinessImpact, deleteBusinessImpact, fetchBusinessImpact, fetchBusinessImpactType, updateBusinessImpact } from "@/app/services/businessImpactServices";
import { CREATE_BUSINESS_IMPACT, DELETE_BUSINESS_IMPACT, FETCH_BUSINESS_IMPACT, FETCH_BUSINESS_IMPACT_TYPE, UPDATE_BUSINESS_IMPACT } from "../actions/businessImpactActions";


function* fetchBusinessImpactSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const responses = yield call(fetchBusinessImpact);
    yield put(setBusinessImpact(responses));
  } catch (error) {
    console.error('Saga error, Failed to fetch Business Impact : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchBusinessImpactTypeSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const responses = yield call(fetchBusinessImpactType);
    yield put(setBusinessImpactType(responses));
  } catch (error) {
    console.error('Saga error, Failed to fetch Business Impact Types : ', error);
  }
  finally {
    yield put(setLoading(false));
  }
}

function* createBusinessImpactSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(createBusinessImpact, postData);
    yield call(fetchBusinessImpactSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to create Business Impact: ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* updateBusinessImapctSaga(action: any): Generator<any, void, any> {
  const { id, updatedFields, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(updateBusinessImpact, id, updatedFields);
    yield call(fetchBusinessImpactSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to update Business Impact : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* deleteBusinessImpactSaga(action: any): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const id = action.payload;
    yield call(deleteBusinessImpact, id);
    yield call(fetchBusinessImpactSaga);
  } catch (error) {
    console.error('Saga error, Failed to delete Business Impact : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

export function* businessImpactSaga() {
  yield takeLatest(FETCH_BUSINESS_IMPACT, fetchBusinessImpactSaga);
  yield takeLatest(FETCH_BUSINESS_IMPACT_TYPE, fetchBusinessImpactTypeSaga);
  yield takeLatest(CREATE_BUSINESS_IMPACT, createBusinessImpactSaga);
  yield takeLatest(UPDATE_BUSINESS_IMPACT, updateBusinessImapctSaga);
  yield takeLatest( DELETE_BUSINESS_IMPACT , deleteBusinessImpactSaga);
}