import { call, put, takeEvery, select, all } from 'redux-saga/effects';
import { ChartParams } from '../../types/dashboardTypes';
import { fetchDashboardChart, fetchInventoryMetrics } from '../actions/dashboardAction';
import { setDashboardChart } from '../reducers/dashboardReducer';
import { RootState } from '../store';
import { fetchDashboardChartData, DashboardFilterPayload } from '../../services/dashboardServices';
import apiClient from '../../utils/apiClient';

function* fetchDashboardChartSaga(action: { payload: ChartParams }): Generator<any, void, any> {
  const { chartKey, startDate, endDate, bucket } = action.payload;
  
  // Selector to get advanced filters
  const selectAdvancedFilters = (state: RootState) => state.dashboard.advancedFilters;
  
  try {
    // Get advanced filters from Redux state
    const advancedFilters: ReturnType<typeof selectAdvancedFilters> = yield select(selectAdvancedFilters);
    
    // Build the filter payload using only advanced filters (already in correct array format)
    const filterPayload: DashboardFilterPayload = {
      StartDate: startDate,
      EndDate: endDate,
      TimeBucket: bucket,
      Teams: advancedFilters.Team || [],
      Orgs: advancedFilters.Organization || [],
      ProjectTypeGroups: advancedFilters.ProjectTypeGroup || [],
      ProjectTypes: advancedFilters.ProjectType || [],
      Projects: advancedFilters.Project || [],
      Portfolios: advancedFilters.Portfolio || [],
      ProjectManagers: advancedFilters.ProjectManager || [],
      Resources: advancedFilters.Resource || [],
      AllocationManagers: advancedFilters.AllocationManager || [],
    };

    // Call the new service to fetch data
    const data: any[] = yield call(fetchDashboardChartData, chartKey, filterPayload);

    yield put(setDashboardChart({ chartKey, data }));
  } catch (err) {
    console.error(`Dashboard chart fetch failed for ${chartKey}`, err);
    // Set empty data on error
    yield put(setDashboardChart({ chartKey, data: [] }));
  }
}

function* fetchInventoryMetricsSaga(action: { payload: ChartParams }): Generator<any, void, any> {
  const { startDate, endDate, bucket } = action.payload;
  
  // Selector to get advanced filters
  const selectAdvancedFilters = (state: RootState) => state.dashboard.advancedFilters;
  
  try {
    // Get advanced filters from Redux state
    const advancedFilters: ReturnType<typeof selectAdvancedFilters> = yield select(selectAdvancedFilters);
    
    // Build the payload using only advanced filters (already in correct array format)
    const payload = {
      StartDate: startDate,
      EndDate: endDate,
      TimeBucket: bucket,
      Teams: advancedFilters.Team || [],
      Orgs: advancedFilters.Organization || [],
      ProjectTypeGroups: advancedFilters.ProjectTypeGroup || [],
      ProjectTypes: advancedFilters.ProjectType || [],
      Projects: advancedFilters.Project || [],
      Portfolios: advancedFilters.Portfolio || [],
      ProjectManagers: advancedFilters.ProjectManager || [],
      Resources: advancedFilters.Resource || [],
      AllocationManagers: advancedFilters.AllocationManager || [],
    };

    // Single API call for all inventory metrics
    const response: any = yield call(
      apiClient.post,
      '/Resource/ExecuteResourceProjectInventoryMetricsQuery',
      payload
    );
    
    const rawData = response.data || [];
    
    if (rawData.length > 0) {
      const responseData = rawData[0];
      
      // Distribute data to individual charts
      yield all([
        put(setDashboardChart({ 
          chartKey: 'activeProjects', 
          data: responseData.active_project ? [responseData.active_project] : [] 
        })),
        put(setDashboardChart({ 
          chartKey: 'activeProjectsByType', 
          data: responseData.projects_by_type || [] 
        })),
        put(setDashboardChart({ 
          chartKey: 'activeResources', 
          data: responseData.active_resource ? [responseData.active_resource] : [] 
        })),
        put(setDashboardChart({ 
          chartKey: 'resourceFTEContractorRatio', 
          data: responseData.shore_split || [] 
        })),
        put(setDashboardChart({ 
          chartKey: 'totalHeadcount', 
          data: responseData.resource_type_split || [] 
        })),
      ]);
    } else {
      // Set empty data for all charts if no response
      yield all([
        put(setDashboardChart({ chartKey: 'activeProjects', data: [] })),
        put(setDashboardChart({ chartKey: 'activeProjectsByType', data: [] })),
        put(setDashboardChart({ chartKey: 'activeResources', data: [] })),
        put(setDashboardChart({ chartKey: 'resourceFTEContractorRatio', data: [] })),
        put(setDashboardChart({ chartKey: 'totalHeadcount', data: [] })),
      ]);
    }
  } catch (err) {
    console.error('Inventory metrics fetch failed', err);
    // Set empty data on error for all charts
    yield all([
      put(setDashboardChart({ chartKey: 'activeProjects', data: [] })),
      put(setDashboardChart({ chartKey: 'activeProjectsByType', data: [] })),
      put(setDashboardChart({ chartKey: 'activeResources', data: [] })),
      put(setDashboardChart({ chartKey: 'resourceFTEContractorRatio', data: [] })),
      put(setDashboardChart({ chartKey: 'totalHeadcount', data: [] })),
    ]);
  }
}

export function* dashboardSaga() {
  yield takeEvery(fetchDashboardChart, fetchDashboardChartSaga);
  yield takeEvery(fetchInventoryMetrics, fetchInventoryMetricsSaga);
}
