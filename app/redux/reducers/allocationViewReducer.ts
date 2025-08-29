import {
  DEFAULT_PROJECT_WEEK_MINUS,
  DEFAULT_PROJECT_WEEK_PLUS,
} from '@/app/constants/constants';
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
import { formatAPIResponse } from '@/app/utils/authUtils';
import { createSlice } from '@reduxjs/toolkit';

export const DEFAULT_VISIBLE_TEAMS_COLUMNS = [
  '__row_group_by_columns_group_teams__',
  '__row_group_by_columns_group_resource__',
  'project',
  'resourceType',
];

export const DEFAULT_VISIBLE_ORGANISATION_COLUMNS = [
  '__row_group_by_columns_group_organisationName__',
  '__row_group_by_columns_group_resource__',
  'project',
  'resourceType',
];

export const DEFAULT_VISIBLE_RESOURCES_COLUMNS = [
  '__row_group_by_columns_group__',
  'project',
  'resourceType',
];

export const DEFAULT_VISIBLE_FLAT_COLUMNS = [
  'organisationName',
  'teams',
  'resource',
  'portfolioName',
  'project',
  'resourceType',
];

export const DEFAULT_VISIBLE_PROJECTS_COLUMNS = [
  '__row_group_by_columns_group__',
  'resource',
  'totalEffort',
];

export const DEFAULT_VISIBLE_PORTFOLIO_COLUMNS = [
  '__row_group_by_columns_group_project__',
  '__row_group_by_columns_group_portfolioName__',
  'resource',
  'totalEffort',
];

export const COMPANY_DEFAULT_VIEW: AllocationGridView = {
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
  isDynamicRange: true,
  isFixedRange: false,
  StartDate: null,
  EndDate: null,
  WeekPlus: DEFAULT_PROJECT_WEEK_PLUS,
  WeekMinus: DEFAULT_PROJECT_WEEK_MINUS,
  Filters: [],
};

const initialState: AllocationGridViewState = {
  view: 'Teams',
  splitView: false,
  splitViewCurrentProject: null,
  showActuals: false,
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
      'email',
      'phoneNumber',
      'department',
      'hrLevel',
      'role',
      'workLocation',
      'resourceStartDate',
      'resourceEndDate',
      'resourceLocationCategory',
      'averageWeeklyHours',
      'contractorHourlyRate',
      'contractorHourlyRateCurrency',
      'projectOvertimeAllowed',
      'projectCost',
      'projectCurrency',
      'projectDescription',
      'projectLocation',
      'projectManager',
      'projectSponsor',
      'projectEndDate',
      'projectStartDate',
      'projectStatus',
      'projectType',
    ],
    resource: [
      '__row_group_by_columns_group__',
      'project',
      'resourceType',
      'teamStatus',
      'teamAllocationManager',
      'email',
      'phoneNumber',
      'department',
      'hrLevel',
      'role',
      'workLocation',
      'resourceStartDate',
      'resourceEndDate',
      'resourceLocationCategory',
      'averageWeeklyHours',
      'contractorHourlyRate',
      'contractorHourlyRateCurrency',
      'projectOvertimeAllowed',
      'projectCost',
      'projectCurrency',
      'projectDescription',
      'projectLocation',
      'projectManager',
      'projectSponsor',
      'projectEndDate',
      'projectStartDate',
      'projectStatus',
      'projectType',
    ],
    organisationName: [
      '__row_group_by_columns_group_organisationName__',
      '__row_group_by_columns_group_resource__',
      'project',
      'resourceType',
      'teamStatus',
      'teamAllocationManager',
      'organisationStatus',
      'email',
      'phoneNumber',
      'department',
      'hrLevel',
      'role',
      'workLocation',
      'resourceStartDate',
      'resourceEndDate',
      'resourceLocationCategory',
      'averageWeeklyHours',
      'contractorHourlyRate',
      'contractorHourlyRateCurrency',
      'projectOvertimeAllowed',
      'projectCost',
      'projectCurrency',
      'projectDescription',
      'projectLocation',
      'projectManager',
      'projectSponsor',
      'projectEndDate',
      'projectStartDate',
      'projectStatus',
      'projectType',
    ],
    project: [
      '__row_group_by_columns_group__',
      'resource',
      'totalEffort',
      'project',
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
      'email',
      'phoneNumber',
      'department',
      'hrLevel',
      'role',
      'workLocation',
      'resourceStartDate',
      'resourceEndDate',
      'resourceLocationCategory',
      'averageWeeklyHours',
      'contractorHourlyRate',
      'contractorHourlyRateCurrency',
      'resourceType',
      'projectType',
    ],
    portfolioName: [
      '__row_group_by_columns_group_project__',
      '__row_group_by_columns_group_portfolioName__',
      'resource',
      'project',
      'portfolioName',
      'projectCost',
      'projectCurrency',
      'projectEndDate',
      'projectLocation',
      'projectManager',
      'projectOvertimeAllowed',
      'projectSponsor',
      'projectStartDate',
      'projectStatus',
      'projectType',
      'totalEffort',
      'email',
      'phoneNumber',
      'department',
      'workLocation',
      'resourceLocationCategory',
      'resourceType',
      'resourceStatus',
      'hrLevel',
      'role',
      'resourceStartDate',
      'resourceEndDate',
      'averageWeeklyHours',
      'contractorHourlyRate',
      'contractorHourlyRateCurrency',
    ],
    project_cost: [
      '__row_group_by_columns_group__',
      'resource',
      'totalCost',
      'project',
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
      'Email',
      'PhoneNumber',
      'Department',
      'WorkLocation',
      'LocationCategory',
      'Type',
      'Status',
      'HRLevel',
      'Role',
      'StartDate',
      'EndDate',
      'AverageWeeklyHours',
      'ContractorHourlyRate',
      'ContractorHourlyRateCurrency',
    ],
    '': [
      'organisationName',
      'teams',
      'resource',
      'portfolioName',
      'project',
      'resourceType',
      'teamStatus',
      'teamAllocationManager',
      'organisationStatus',
      'email',
      'phoneNumber',
      'department',
      'hrLevel',
      'role',
      'workLocation',
      'resourceStartDate',
      'resourceEndDate',
      'resourceLocationCategory',
      'averageWeeklyHours',
      'contractorHourlyRate',
      'contractorHourlyRateCurrency',
      'projectOvertimeAllowed',
      'projectCost',
      'projectCurrency',
      'projectDescription',
      'projectLocation',
      'projectManager',
      'projectSponsor',
      'projectEndDate',
      'projectStartDate',
      'projectStatus',
      'projectType',
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
        ColumnsVisible: action.payload.includes('Teams')
          ? DEFAULT_VISIBLE_TEAMS_COLUMNS
          : action.payload.includes('Organisations')
            ? DEFAULT_VISIBLE_ORGANISATION_COLUMNS
            : action.payload.includes('Resources')
              ? DEFAULT_VISIBLE_RESOURCES_COLUMNS
              : action.payload.includes('Portfolio')
                ? DEFAULT_VISIBLE_PORTFOLIO_COLUMNS
                : action.payload.includes('Project')
                  ? DEFAULT_VISIBLE_PROJECTS_COLUMNS
                  : DEFAULT_VISIBLE_FLAT_COLUMNS,
      };
    },
    setSplitView: (state, action) => {
      state.splitView = action.payload;
    },
    setSplitViewCurrentProject: (state, action) => {
      state.splitViewCurrentProject = action.payload;
    },
    setShowActuals: (state, action) => {
      state.showActuals = action.payload;
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
        const response = formatAPIResponse(
          'UserAllocationView',
          action.payload
        );
        let formatedView: AllocationGridView[] = [];

        if (response?.length > 0) {
          formatedView = response.map((view: GetUsersSavedViewsResponse) => ({
            Id: view.Id,
            UserId: view.UserId,
            Name: view.Name,
            Description: view.Description,
            isDefault: view.isDefault,
            isProjectDefault: false,
            GroupBy: view.GroupBy,
            MyTeam: view.ShowBy === 'MyTeams',
            MyProjects: view.ShowBy === 'MyProject',
            ColumnsVisible: view.Columns,
            StartDate: view.StartDate,
            EndDate: view.EndDate,
            isFixedRange: view.isFixedRange,
            isDynamicRange: view.isDynamicRange,
            WeekPlus: view.WeekPlus,
            WeekMinus: view.WeekMinus,
            Filters: view.Filters,
          }));
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
        const newView = action.payload?.UserAllocationView;
        const formatedView: AllocationGridView = {
          Id: newView.Id,
          UserId: newView.UserId,
          Name: newView.Name,
          Description: newView.Description,
          isDefault: newView.isDefault,
          isProjectDefault: false,
          GroupBy: newView.GroupBy,
          MyTeam: newView.ShowBy === 'MyTeams',
          MyProjects: newView.ShowBy === 'MyProject',
          ColumnsVisible: newView.Columns,
          StartDate: newView.StartDate,
          EndDate: newView.EndDate,
          isFixedRange: newView.isFixedRange,
          isDynamicRange: newView.isDynamicRange,
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
        const response = formatAPIResponse(
          'UserAllocationView',
          action.payload
        );
        const updatedView = response?.length > 0 ? response[0] : null;
        const formatedView: AllocationGridView = {
          Id: updatedView?.Id,
          UserId: updatedView?.UserId,
          Name: updatedView?.Name,
          Description: updatedView?.Description,
          isDefault: updatedView?.isDefault,
          isProjectDefault: false,
          GroupBy: updatedView?.GroupBy,
          MyTeam: updatedView?.ShowBy === 'MyTeams',
          MyProjects: updatedView?.ShowBy === 'MyProject',
          ColumnsVisible: updatedView?.Columns,
          StartDate: updatedView?.StartDate,
          EndDate: updatedView?.EndDate,
          isFixedRange: updatedView?.isFixedRange,
          isDynamicRange: updatedView?.isDynamicRange,
          WeekPlus: updatedView?.WeekPlus,
          WeekMinus: updatedView?.WeekMinus,
          Filters: updatedView?.Filters,
        };

        // Update saved View list.
        state.savedViews = state.savedViews.map(view => {
          if (view.Id === updatedView?.Id) {
            return {
              ...view,
              ...formatedView,
            };
          }
          return view;
        });

        // Update current view if it is the same as updated view.
        if (updatedView?.Id === state.currentView.Id) {
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
          action.payload?.UserAllocationView?.length > 0
            ? action.payload?.UserAllocationView[0]
            : null;
        if (deletedView) {
          if (deletedView?.Id === state.currentView.Id) {
            state.currentView = COMPANY_DEFAULT_VIEW;
          }
          state.savedViews = state.savedViews.filter(
            view => view.Id !== deletedView.Id
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
  setSplitView,
  setSplitViewCurrentProject,
  setShowActuals,
  setExpandRowId,
  setCellSelectionData,
  setInitialCurrentView,
  setCurrentView,
  updateCurrentView,
  setSaveViews,
} = viewSlice.actions;
export default viewSlice.reducer;
