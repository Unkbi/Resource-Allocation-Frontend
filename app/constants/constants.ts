export const themeColors = {
  '#816CB3': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#fdc2332',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#fdc2332',
    },
  },
  '#B56A9B': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#1976d2',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#1976d2',
    },
  },
  '#4779CD': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#fdc2332',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#fdc2332',
    },
  },
  '#1C2D5F': {
    light: {
      bgColor: '#1C2D5F',
      primaryColor: '#212121',
      secondryColor: '#ffffff',
      ternaryColor: '#122047',
      textColor: '#298AFF',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#1976d2',
    },
  },
  '#6BB6B2': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#fdc2332',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#fdc2332',
    },
  },
  '#DD5091': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#1976d2',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#1976d2',
    },
  },
  '#828F95': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#fdc2332',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#fdc2332',
    },
  },
  '#E59D6D': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#1976d2',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#1976d2',
    },
  },
  '#768C85': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#fdc2332',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#fdc2332',
    },
  },
  '#A2B076': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#1976d2',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#1976d2',
    },
  },
  '#7775B4': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#fdc2332',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#fdc2332',
    },
  },
  '#58CD5E': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#1976d2',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#1976d2',
    },
  },
  '#FBE133': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#1976d2',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#1976d2',
    },
  },
  '#647BA1': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#fdc2332',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#fdc2332',
    },
  },
  '#3822F3': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#1976d2',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#1976d2',
    },
  },
  '#DF624E': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#fdc2332',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#fdc2332',
    },
  },
  '#D54EDF': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#1976d2',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#1976d2',
    },
  },
  '#2BD9E9': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#fdc2332',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#fdc2332',
    },
  },
  '#7B90DE': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#1976d2',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#1976d2',
    },
  },
  '#D6DF4E': {
    light: {
      bgColor: '#ffffff',
      primaryColor: '#1976d2',
    },
    dark: {
      bgColor: '#121212',
      primaryColor: '#1976d2',
    },
  },
};

export const fontSizeMap = {
  sm: -6,
  md: 0,
  lg: 4,
  xl: 6,
};

export const DEFAULT_COLOR = '#1C2D5F';

export const BASE_FONT_SIZE = 16;

export const TOTAL_FUTURE_WEEKS = 20; //Configurable weeks count (Previous + Current + 20 weeks)
export const TOTAL_FUTURE_WEEKS_ARROW = 4;
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DISPLAY_DATE_FORMAT = 'MMM yyyy';
export const USA_DATE_FORMAT = 'MM/dd/yyyy';

export const API_PROJECT_PORTFOLIO = '/Resource';
export const API_AGENTLANG_KERNEL_RBAC = '/agentlang.auth';

export const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/signup-otp',
  '/reset-password',
  '/callback',
  '/invite',
];

export const DEFAULT_LOCALE = 'en-gb';

export const DEFAULT_PROJECT_WEEK_PLUS = 19;
export const DEFAULT_PROJECT_WEEK_MINUS = 1;

export const PROJECT_TYPES = ['Key Initiative', 'RTB', 'CTB', 'STB', 'Ongoing'];
export const PROJECT_TOTAL_COST_CATEGORIES = [
  'onBudget',
  'overBudget',
  'underBudget',
];

export const PORTFOLIO_DISPLAY_NAME = 'Portfolio';
export const PORTFOLIO_DISPLAY_NAME_PLURAL = 'Portfolios';

export const PORTFOLIO_BLANK = 'Blank';

export const RESOURCE_PAGE_VALID_TABS = [
  'resource',
  'teams',
  'organizations',
  'rates',
] as const;

export const PROJECT_PAGE_VALID_TABS = [
  'project',
  'portfolio',
  'businessImpact',
] as const;

export const PROJECT_TYPE_VALID_TABS = ['project-types', 'project-types-group'];

export const LOCATION_VALID_TABS = ['location', 'location-group'];

export const ALLOCATION_SETTINGS_VALID_TABS = [
  'color-settings',
  'alerts-threshold',
  'allocation-history',
];

export const ACCESS_MANAGEMENT_VALID_TABS = [
  'role-assignments',
  'role-management',
  'privilege-assignments',
  'privilege-management',
];

//creating array  constant for storing project active and inactive status

export const PROJECT_ACTIVE_STATUS = ['Active', 'Approved'];

export const PROJECT_INACTIVE_STATUS = ['Proposed', 'Paused', 'Completed'];

export const Resource_All_Status = [
  'Active',
  'Inactive',
  'Unassigned',
  'Not-Planned',
  'Pending',
];

export const AllocationForm_Status_Filter = ['Active', 'Pending'];

export const Resource_Team_Project_Status_Filter = ['Active', 'Not-Planned'];

export const Project_Sponsor_Manager_Status_Filter = [
  'Active',
  'Not-Planned',
  'Unassigned',
];

export const DASHBOARD_ALL_ACCESS = [
  'activeProjects',
  'allocationPercentage',
  'actualsConfirmed',
  'plan_vs_actual_variance',
  'engagementScoreOverview',
  'activeProjectsByType',
  'projects_by_type_distribution',
  'top_projects_by_variance',
  'allocation_by_project_type_group',
  'actuals_confirmation_status',
  'unapprovedProjectAllocation',
  'projectHealthOverview',
  'projectFTE',
];

export const TOTAL_ACTUALS_LESS_THAN_ONE = 'TOTAL_ACTUALS_LESS_THAN_ONE';
export const MISSING_PROJECT_ACTUALS_STATUS = 'MISSING_PROJECT_ACTUALS_STATUS';

export const teamsViewsGrouping = [
  'Teams',
  'Organisations',
  'Resources',
  'Flat',
];
export const projectViewsGrouping = ['Portfolio', 'Project'];
