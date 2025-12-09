import { put, select, takeEvery, call, all } from 'redux-saga/effects';
import { setInitLoading } from '../reducers/authReducer';
import {
  GET_USER_AND_PRIVILEGES,
  SETUP_ADVANCED_FILTERS,
} from '../actions/rbacActions';
import {
  FETCH_ALL_RESOURCES_DETAIL,
  FETCH_RESOURCE_DETAILS,
} from '../actions/allResourcesDetailAction';
import { FETCH_ALL_SETTINGS } from '../actions/allSettingsActions';
import { FETCH_PORTFOLIOS } from '../actions/portfolioActions';
import { fetchAllTeams } from '../actions/fetchTeamsAction';
import { fetchAllProjects } from '../actions/fetchProjectsAction';
import { getUserData, INIT_BOOTSTRAP } from '../actions/authActions';
import { setLoadingAdvancedFilters } from '../reducers/dashboardReducer';

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

    // Wait for the required slices to populate.
    // Helper: poll selectors until predicate is true or timeout expires.
    function* waitForState(
      selector: any,
      predicate: any,
      opts = {}
    ): Generator<any, any, any> {
      const { interval = 200, timeout = 15000 } = opts as any;
      const start = Date.now();
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const val = yield select(selector);
        if (predicate(val)) return val;
        if (Date.now() - start > timeout) return null;
        // small delay
        yield call(() => new Promise(res => setTimeout(res, interval)));
      }
    }

    // Wait for resources, privileges, projects and teams in parallel.
    // Running the waits concurrently reduces total blocking time
    // (each wait still has its own timeout).
    let [resources, loginUserPrivileges, projects, teams] = yield all([
      call(
        waitForState,
        (s: any) => s.resources?.resources,
        (v: any) => Array.isArray(v) && v.length > 0,
        { interval: 200, timeout: 6000 }
      ),
      call(
        waitForState,
        (s: any) => s.rbac?.loginUserPrivileges,
        (v: any) => v && Object.keys(v).length > 0,
        { interval: 200, timeout: 5000 }
      ),
      call(
        waitForState,
        (s: any) => s.projects?.projects || s.projects?.data || null,
        (v: any) => Array.isArray(v) || (v && typeof v === 'object'),
        { interval: 200, timeout: 5000 }
      ),
      call(
        waitForState,
        (s: any) => s.teams?.teams,
        (v: any) => Array.isArray(v) && v.length > 0,
        { interval: 200, timeout: 5000 }
      ),
    ]);

    // If there are no resources, attempt to fetch resource details then wait
    if (!resources || resources.length === 0) {
      // Trigger a fetch for resource details scoped to this user
      yield put({
        type: FETCH_RESOURCE_DETAILS,
        payload: { queryParams: { UserId: userId } },
      });

      // Wait for resources to appear in the store
      const fetchedResources = yield call(
        waitForState,
        (s: any) => s.resources?.resources,
        (v: any) => Array.isArray(v) && v.length > 0,
        { interval: 200, timeout: 3000 }
      );

      // If still no resources after waiting, bail out of advanced filter setup
      if (!fetchedResources || fetchedResources.length === 0) {
        yield put(setLoadingAdvancedFilters(false));
        return;
      }

      resources = fetchedResources;
    }

    // Dispatch SETUP_ADVANCED_FILTERS when we have the necessary data
    if (loginUserPrivileges) {
      yield put({
        type: SETUP_ADVANCED_FILTERS,
        payload: {
          loginUserPrivileges,
          userId,
          resources,
          projects: projects || [],
          teams: teams || [],
        },
      });
    } else {
      // Could not obtain privileges in time: ensure loading flag cleared
      yield put(setLoadingAdvancedFilters(false));
    }
  } catch (error) {
    console.error('Error during bootstrap initialization:', error);
  } finally {
    yield put(setInitLoading(false));
  }
}

export function* bootstrapSaga() {
  yield takeEvery(INIT_BOOTSTRAP, initBootstrapSaga);
}
