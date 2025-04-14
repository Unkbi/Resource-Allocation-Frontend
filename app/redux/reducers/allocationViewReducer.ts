import {
  addAllocationView,
  deleteAllocationView,
  getAllSavedViews,
  getUsersSavedViews,
  updateAllocationView,
} from '@/app/services/allocationServices';
import {
  AllocationGridView,
  AllocationGridViewState,
  GetUsersSavedViewsResponse,
} from '@/app/types';
import { createSlice } from '@reduxjs/toolkit';

const DEFAULT_VISIBLE_TEAMS_COLUMNS = [
  '__row_group_by_columns_group_teams__',
  '__row_group_by_columns_group_resource__',
  'project',
  'resourceType',
];

const DEFAULT_VISIBLE_PROJECTS_COLUMNS = ['resource', 'totalEffort'];

const COMPANY_DEFAULT_VIEW: AllocationGridView = {
  Id: '0',
  UserId: null,
  Name: 'Default View',
  Description: '',
  isDefault: false,
  isProjectDefault: true,
  GroupBy: 'Teams',
  MyTeam: false,
  MyProjects: false,
  ColumnsVisible: DEFAULT_VISIBLE_TEAMS_COLUMNS,
  isDefaultRange: true,
  isDynamicRange: false,
  isFixedRange: false,
  StartDate: null,
  EndDate: null,
  WeekPlus: null,
  WeekMinus: null,
  Filters: [],
};

const initialState: AllocationGridViewState = {
  view: 'Teams',
  loading: false,
  error: null,
  expandRowId: [],
  cellSelectionData: {},
  columns: {
    team: [
      '__row_group_by_columns_group_teams__',
      '__row_group_by_columns_group_resource__',
      'project',
      'resourceType',
      'teamStatus',
      'teamAllocationManager',
    ],
    project: [
      '__row_group_by_columns_group__project__',
      'projectSponsor',
      'projectManager',
      'projectStatus',
      'projectLocation',
      'projectType',
      'projectOvertimeAllowed',
      'projectCost',
      'projectCurrency',
      'projectStartDate',
      'projectEndDate',
    ],
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
        GroupBy: action.payload,
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
              Description: view.Description,
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
      })
      // Add new saved view.
      .addCase(addAllocationView.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAllocationView.fulfilled, (state, action) => {
        state.loading = false;
        const newView = action.payload?.result;
        const formatedView: AllocationGridView = {
          Id: newView.__Id__,
          UserId: newView.UserId,
          Name: newView.Name,
          Description: newView.Description,
          isDefault: newView.isDefault,
          isProjectDefault: false,
          GroupBy: newView.GroupBy,
          MyTeam: newView.ShowBy === 'MyTeam',
          MyProjects: newView.ShowBy === 'MyProjects',
          ColumnsVisible: newView.Columns,
          StartDate: newView.StartDate,
          EndDate: newView.EndDate,
          isFixedRange: newView.isFixedRange,
          isDynamicRange: newView.isDynamicRange,
          isDefaultRange: !newView.isFixedRange && !newView.isDynamicRange,
          WeekPlus: newView.WeekPlus,
          WeekMinus: newView.WeekMinus,
          Filters: newView.Filters,
        };
        state.savedViews = [formatedView, ...state.savedViews];
        state.currentView = {
          ...state.currentView,
          ...formatedView,
        };
      })
      .addCase(addAllocationView.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      })
      // Update saved view.
      .addCase(updateAllocationView.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAllocationView.fulfilled, (state, action) => {
        state.loading = false;
        const updatedView =
          action.payload?.result.length > 0 ? action.payload?.result[0] : null;
        const formatedView: AllocationGridView = {
          Id: updatedView?.__Id__,
          UserId: updatedView?.UserId,
          Name: updatedView?.Name,
          Description: updatedView?.Description,
          isDefault: updatedView?.isDefault,
          isProjectDefault: false,
          GroupBy: updatedView?.GroupBy,
          MyTeam: updatedView?.ShowBy === 'MyTeam',
          MyProjects: updatedView?.ShowBy === 'MyProjects',
          ColumnsVisible: updatedView?.Columns,
          StartDate: updatedView?.StartDate,
          EndDate: updatedView?.EndDate,
          isFixedRange: updatedView?.isFixedRange,
          isDynamicRange: updatedView?.isDynamicRange,
          isDefaultRange:
            !updatedView?.isFixedRange && !updatedView?.isDynamicRange,
          WeekPlus: updatedView?.WeekPlus,
          WeekMinus: updatedView?.WeekMinus,
          Filters: updatedView?.Filters,
        };

        // Update saved View list.
        state.savedViews = state.savedViews.map(view => {
          if (view.Id === updatedView?.__Id__) {
            return {
              ...view,
              ...formatedView,
            };
          }
          return view;
        });

        // Update current view if it is the same as updated view.
        if (updatedView?.__Id__ === state.currentView.Id) {
          state.currentView = {
            ...state.currentView,
            ...formatedView,
          };
        }
      })
      .addCase(updateAllocationView.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      })
      // Delete saved view.
      .addCase(deleteAllocationView.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAllocationView.fulfilled, (state, action) => {
        state.loading = false;
        const deletedView =
          action.payload?.result.length > 0 ? action.payload?.result[0] : null;
        if (deletedView) {
          if (deletedView?.__Id__ === state.currentView.Id) {
            state.currentView = COMPANY_DEFAULT_VIEW;
          }
          state.savedViews = state.savedViews.filter(
            view => view.Id !== deletedView.__Id__
          );
        }
      })
      .addCase(deleteAllocationView.rejected, (state, action) => {
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
