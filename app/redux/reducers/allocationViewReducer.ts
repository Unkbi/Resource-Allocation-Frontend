import {
  getAllSavedViews,
  getUsersSavedViews,
} from '@/app/services/allocationServices';
import {
  AllocationGridView,
  AllocationGridViewState,
  GetUsersSavedViewsResponse,
} from '@/app/types';
import { createSlice } from '@reduxjs/toolkit';
// import { set } from 'date-fns';

const COMPANY_DEFAULT_VIEW: AllocationGridView = {
  Id: '0',
  UserId: null,
  Name: 'Default View',
  isDefault: false,
  isProjectDefault: true,
  GroupBy: 'teams',
  MyTeam: false,
  MyProjects: false,
  ColumnsVisible: [
    '__row_group_by_columns_group_teams__',
    'resource',
    'project',
    'resourceType',
  ],
  isDefaultRange: true,
  isDynamicRange: false,
  isFixedRange: false,
  StartDate: null,
  EndDate: null,
  WeekPlus: null,
  WeekMinus: null,
  Filters: [],
};

const DEFAULT_VISIBLE_TEAMS_COLUMNS = [
  '__row_group_by_columns_group_teams__',
  'resource',
  'project',
  'resourceType',
];

const DEFAULT_VISIBLE_PROJECTS_COLUMNS = [
  'teams',
  'resource',
  'project',
  'resourceType',
  'totalEffort',
];

const initialState: AllocationGridViewState = {
  view: 'Teams',
  loading: false,
  error: null,
  expandRowId: [],
  cellSelectionData: {},
  columns: {
    team: [
      '__row_group_by_columns_group_teams__',
      'resource',
      'project',
      'resourceType',
      'teamStatus',
      'teamAllocationManager',
    ],
    project: ['teams', 'resource', 'project', 'resourceType', 'totalEffort'],
  },
  currentView: COMPANY_DEFAULT_VIEW,
  savedViews: [COMPANY_DEFAULT_VIEW],
};

const viewSlice = createSlice({
  name: 'view',
  initialState,
  reducers: {
    changeView: (state, action) => {
      state.view = action.payload;
      state.currentView = {
        ...state.currentView,
        GroupBy: action.payload === 'Teams' ? 'teams' : 'projects',
        ColumnsVisible:
          action.payload === 'Teams'
            ? DEFAULT_VISIBLE_TEAMS_COLUMNS
            : DEFAULT_VISIBLE_PROJECTS_COLUMNS,
      };
    },
    setExpandRowId: (state, action) => {
      state.expandRowId = action.payload;
    },
    setCellSelectionData: (state, action) => {
      state.cellSelectionData = action.payload;
    },
    setInitialCurrentView: state => {
      if (state.savedViews && state.savedViews.length > 1) {
        state.savedViews.some(view => {
          if (view.isDefault) {
            state.currentView = view;
            return true;
          }
          return false;
        });
      }
    },
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    updateCurrentView: (state, action) => {
      console.log('Updating Current View : ', action.payload);
      state.currentView = {
        ...state.currentView,
        ...action.payload,
      };
    },
    setSaveViews: (state, action) => {
      const views = state.savedViews ?? [];
      state.savedViews = [...views, action.payload];
    },
  },
  extraReducers: builder => {
    builder
      // For all the Saved Views - not sure if we need this.
      .addCase(getAllSavedViews.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllSavedViews.fulfilled, (state, action) => {
        state.loading = false;
        state.savedViews = action.payload ?? [];
      })
      .addCase(getAllSavedViews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      })
      // Get Users Saved Views.
      .addCase(getUsersSavedViews.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsersSavedViews.fulfilled, (state, action) => {
        state.loading = false;
        let formatedView: AllocationGridView[] = [];
        if (action.payload?.result?.length > 0) {
          formatedView = action.payload.result.map(
            (view: GetUsersSavedViewsResponse) => ({
              Id: view.__Id__,
              UserId: view.UserId,
              Name: view.Name,
              isDefault: view.isDefault,
              isProjectDefault: false,
              GroupBy: view.GroupBy,
              MyTeam: view.ShowBy === 'MyTeam',
              MyProjects: view.ShowBy === 'MyProjects',
              ColumnsVisible: view.Columns,
              StartDate: view.StartDate,
              EndDate: view.EndDate,
              isFixedRange: view.isFixedRange,
              isDynamicRange: view.isDynamicRange,
              isDefaultRange: !view.isFixedRange && !view.isDynamicRange,
              WeekPlus: view.WeekPlus,
              WeekMinus: view.WeekMinus,
              Filters: view.Filters,
            })
          );
        }
        state.savedViews = [...formatedView, COMPANY_DEFAULT_VIEW];
      })
      .addCase(getUsersSavedViews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      });
  },
});

export const {
  changeView,
  setExpandRowId,
  setCellSelectionData,
  setInitialCurrentView,
  setCurrentView,
  updateCurrentView,
  setSaveViews,
} = viewSlice.actions;
export default viewSlice.reducer;
