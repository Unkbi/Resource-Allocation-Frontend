import { put, takeEvery } from 'redux-saga/effects';
import { setInitLoading } from '../reducers/authReducer';
import { GET_USER_AND_PRIVILEGES, FETCH_ROLES } from '../actions/rbacActions';
import { FETCH_ALL_RESOURCES_DETAIL } from '../actions/allResourcesDetailAction';
import { FETCH_ALL_SETTINGS } from '../actions/allSettingsActions';
import { FETCH_PORTFOLIOS } from '../actions/portfolioActions';
import { fetchAllTeams } from '../actions/fetchTeamsAction';
import { fetchAllProjects } from '../actions/fetchProjectsAction';
import { getUserData, INIT_BOOTSTRAP } from '../actions/authActions';

/**
 * Bootstrap saga - fetches all essential data on app initialization
 * Dispatches all necessary actions in parallel and then sets initLoading to false
 */
function* initBootstrapSaga(action: any): any {
  try {
    yield put(setInitLoading(true));
    const { userId } = action.payload;

    // Fetch all essential data in parallel
    yield put({ type: FETCH_ALL_RESOURCES_DETAIL, payload: {} });
    yield put(getUserData(userId, true));
    yield put({ type: GET_USER_AND_PRIVILEGES, payload: { userId } });
    yield put({ type: FETCH_ALL_SETTINGS, payload: {} });
    yield put(fetchAllTeams());
    yield put(fetchAllProjects());
    yield put({ type: FETCH_PORTFOLIOS, payload: {} });
    yield put({ type: FETCH_ROLES });
  } catch (error) {
    console.error('Error during bootstrap initialization:', error);
  } finally {
    yield put(setInitLoading(false));
  }
}

export function* bootstrapSaga() {
  yield takeEvery(INIT_BOOTSTRAP, initBootstrapSaga);
}
