import { call, put, takeEvery, select, all } from 'redux-saga/effects';
import { ChartParams } from '../../types/dashboardTypes';
import { fetchDashboardChart, fetchInventoryMetrics, fetchReport } from '../actions/dashboardAction';
import { setDashboardChart, startChartLoading, startMultipleChartsLoading, startReportLoading, setReportRequestPayload, setReportData, setReportError } from '../reducers/dashboardReducer';
import { RootState } from '../store';
import { fetchDashboardChartData, DashboardFilterPayload, fetchDashboardChartsByGroup, buildReportPayload, fetchReportData } from '../../services/dashboardServices';


function* fetchDashboardChartSaga(action: { payload: ChartParams }): Generator<any, void, any> {
  const { chartKey, startDate, endDate, bucket } = action.payload;
  
  // Mark this chart as loading
  yield put(startChartLoading(chartKey));
  
  // Selector to get advanced filters
  const selectAdvancedFilters = (state: RootState) => state.dashboard.advancedFilters;
  
  try {
    const advancedFilters: ReturnType<typeof selectAdvancedFilters> = yield select(selectAdvancedFilters);
    
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

    const data: any[] = yield call(fetchDashboardChartData, chartKey, filterPayload);

    yield put(setDashboardChart({ chartKey, data }));
  } catch (err) {
    console.error(`Dashboard chart fetch failed for ${chartKey}`, err);
    yield put(setDashboardChart({ chartKey, data: [] }));
  }
}

function* fetchInventoryMetricsSaga(action: { payload: ChartParams }): Generator<any, void, any> {
  const { startDate, endDate, bucket } = action.payload;
  
  // Mark all inventory charts as loading
  yield put(startMultipleChartsLoading([
    'activeProjects',
    'activeProjectsByType', 
    'activeResources',
    'resourceFTEContractorRatio',
    'totalHeadcount',
    'team_headcount_distribution',
    'allocation_by_project_type_group',
    'plan_vs_actual_variance',
    'actuals_confirmation_status',
  ]));
  
  const selectAdvancedFilters = (state: RootState) => state.dashboard.advancedFilters;
  
  try {
    const advancedFilters: ReturnType<typeof selectAdvancedFilters> = yield select(selectAdvancedFilters);
    
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
      StatusFilter: "AND proj.\"Status\" IN ('Active','Approved') ",
      SelectColumns: '',
      OrderByClause: '1',
    };

    // Single API call for all inventory metrics
    const rawData = yield call(fetchDashboardChartsByGroup,payload);
    
    if (rawData.length > 0) {
      const responseData = rawData[0];
      
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
          data: responseData.total_head_breakdown || [] 
        })),
        put(setDashboardChart({ 
          chartKey: 'team_headcount_distribution', 
          data: responseData.headcount_by_team || []
        })),
        put(setDashboardChart({ 
          chartKey: 'allocation_by_project_type_group', 
          data: responseData.allocation_by_project_type_group || [] 
        })),
        put(setDashboardChart({ 
          chartKey: 'plan_vs_actual_variance', 
          data: responseData.plan_vs_actual_variance || []
        })),
        put(setDashboardChart({
          chartKey: 'top_projects_by_variance',
          data: responseData.top_5_projects_by_variance || []
        })),
        put(setDashboardChart({
          chartKey: 'projects_by_type_distribution',
          data: responseData.projects_by_type || []
        })),
        put(setDashboardChart({
          chartKey: 'actuals_confirmation_status',
          data: [
            { status: 'Actuals', percentage: responseData.actuals_confirmation_status.actuals_percentage },
            { status: 'Planned', percentage: responseData.actuals_confirmation_status.planned_percentage }
          ]
        })),
      ]);
    } else {
      yield all([
        put(setDashboardChart({ chartKey: 'activeProjects', data: [] })),
        put(setDashboardChart({ chartKey: 'activeProjectsByType', data: [] })),
        put(setDashboardChart({ chartKey: 'activeResources', data: [] })),
        put(setDashboardChart({ chartKey: 'resourceFTEContractorRatio', data: [] })),
        put(setDashboardChart({ chartKey: 'totalHeadcount', data: [] })),
        put(setDashboardChart({ chartKey: 'team_headcount_distribution', data: [] })),
        put(setDashboardChart({ chartKey: 'allocation_by_project_type_group', data: [] })),
        put(setDashboardChart({ chartKey: 'plan_vs_actual_variance', data: [] })),
        put(setDashboardChart({ chartKey: 'top_projects_by_variance', data: [] })),
        put(setDashboardChart({ chartKey: 'projects_by_type_distribution', data: [] })),
        put(setDashboardChart({ chartKey: 'actuals_confirmation_status', data: [] })),
      ]);
    }
  } catch (err) {
    console.error('Inventory metrics fetch failed', err);
    yield all([
      put(setDashboardChart({ chartKey: 'activeProjects', data: [] })),
      put(setDashboardChart({ chartKey: 'activeProjectsByType', data: [] })),
      put(setDashboardChart({ chartKey: 'activeResources', data: [] })),
      put(setDashboardChart({ chartKey: 'resourceFTEContractorRatio', data: [] })),
      put(setDashboardChart({ chartKey: 'totalHeadcount', data: [] })),
      put(setDashboardChart({ chartKey: 'team_headcount_distribution', data: [] })),
      put(setDashboardChart({ chartKey: 'allocation_by_project_type_group', data: [] })),
      put(setDashboardChart({ chartKey: 'plan_vs_actual_variance', data: [] })),
      put(setDashboardChart({ chartKey: 'top_projects_by_variance', data: [] })),
      put(setDashboardChart({ chartKey: 'projects_by_type_distribution', data: [] })),
      put(setDashboardChart({ chartKey: 'actuals_confirmation_status', data: [] })),
    ]);
  }
}

function* fetchReportSaga(action: { payload: { reportType: string; uiFilters: any } }): Generator<any, void, any> {
  const { reportType, uiFilters } = action.payload;
  try {
    yield put(startReportLoading({ reportType }));
    const requestPayload = buildReportPayload(uiFilters);
    yield put(setReportRequestPayload({ reportType, uiFilters, requestPayload }));

    const data: any[] = yield call(fetchReportData, reportType, requestPayload);
    yield put(setReportData({ reportType, data }));
  } catch (err: any) {
    console.error('Report fetch failed', err);
    yield put(setReportError({ reportType, error: err?.message || 'Report fetch failed' }));
  }
}

export function* dashboardSaga() {
  yield takeEvery(fetchDashboardChart, fetchDashboardChartSaga);
  yield takeEvery(fetchInventoryMetrics, fetchInventoryMetricsSaga);
  yield takeEvery(fetchReport, fetchReportSaga);
}
