'use client';

import Overview from '../../components/Dashboard/OverviewCards';
import ScoreCard from '../../components/Dashboard/ScoreCard';
import ReportBuilderPage from '@/app/components/Dashboard/ReportBuilder/ReportBuilderPage';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Global, css } from '@emotion/react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Tabs,
  Tab,
  TextField,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Responsive, WidthProvider } from 'react-grid-layout';
import {
  LineChart,
  PieChart,
  BarChart,
  pieArcLabelClasses,
} from '@mui/x-charts';
import {
  ChartContainer,
  BarPlot,
  LinePlot,
  MarkPlot,
  ChartsXAxis,
  ChartsYAxis,
  ChartsLegend,
  ChartsTooltip,
} from '@mui/x-charts';
import DashboardWidget from '../../components/Dashboard/DashboardWidget';
import DashboardToolbar from '../../components/Toolbar/DashboardToolbar';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboardChart,
  fetchInventoryMetrics,
} from '../../redux/actions/dashboardAction';
import { startMultipleChartsLoading } from '../../redux/reducers/dashboardReducer';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Topbar from '@/app/components/Dashboard/TabTopbar';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekday from 'dayjs/plugin/weekday';
import utc from 'dayjs/plugin/utc';
import {
  useResponsiveChart,
  truncateLabel,
  formatTeamName,
} from '@/app/utils/useResponsiveChart';
import CommonToolbar from '@/app/components/Toolbar/CommonToolbar';
import { getWeekNumber } from '@/app/utils/common';
import { FETCH_PROJECT_TYPES } from '@/app/redux/actions/allSettingsActions';
import { getAllTeams } from '@/app/services/teamServices';
import LoadingScreen from '@/app/components/Loading/loadingScreen';
import { FETCH_DASHBOARD_QUERY_KEYS } from '@/app/redux/actions/rbacActions';
import { DASHBOARD_ALL_ACCESS } from '@/app/constants/constants';
import { 
  hasBarChartAllZeroValues, 
  hasPieChartAllZeroValues, 
  hasLineChartAllZeroValues,
  hasStackedChartAllZeroValues 
} from '@/app/utils/chartDataHelpers';

dayjs.extend(isoWeek);
dayjs.extend(weekday);
dayjs.extend(utc);

const ResponsiveGridLayout = WidthProvider(Responsive);

dayjs.extend(quarterOfYear);

// Helper functions for sorting bar chart data in descending order
const sortBarChartData = (data, sortKey, descending = true) => {
  return [...data].sort((a, b) => {
    const aVal = Number(a[sortKey]) || 0;
    const bVal = Number(b[sortKey]) || 0;
    return descending ? bVal - aVal : aVal - bVal;
  });
};

// For stacked charts with multiple values to sum
const sortByTotal = (data, sumKeys, descending = true) => {
  return [...data].sort((a, b) => {
    const aTotal = sumKeys.reduce((sum, key) => sum + (Number(a[key]) || 0), 0);
    const bTotal = sumKeys.reduce((sum, key) => sum + (Number(b[key]) || 0), 0);
    return descending ? bTotal - aTotal : aTotal - bTotal;
  });
};

// Sort project type groups in Transform -> Grow -> Run order
const sortByProjectTypeGroupOrder = (data, groupKey = 'project_type_group') => {
  const order = { Transform: 0, Grow: 1, Run: 2 };
  return [...data].sort((a, b) => {
    const aGroup = a[groupKey] || '';
    const bGroup = b[groupKey] || '';
    const aOrder = order[aGroup] !== undefined ? order[aGroup] : 999;
    const bOrder = order[bGroup] !== undefined ? order[bGroup] : 999;
    return aOrder - bOrder;
  });
};

// Define chart sequence for each tab - EASY TO CUSTOMIZE
// Simply reorder the items in these arrays to change the sequence
const OVERVIEW_CHART_SEQUENCE = [
  'projectHealthOverview',
  'engagementScoreOverview',
  'plan_vs_actual_variance',
  'top_projects_by_variance',
  'projectFTE',
  'activeProjectsByType',
  'totalHeadcount',
  'allocation_by_project_type_group',
  'unapprovedProjectAllocation',
  'actuals_confirmation_status',
];

const COST_CHART_SEQUENCE = [
  'budgetVsPlanVsActual',
];

const TEAM_CHART_SEQUENCE = [
  'team_headcount_distribution',
  'teamEngagementScore',
  'unapprovedProjectActualsByTeam',
  'resourceCoverage',
  'actualsTrendWeekly',
  'underAllocated',
  'overAllocated',
];

const generateLayouts = chartKeys => {
  // Auto-height widgets that should take less vertical space
  const autoHeightWidgets = [
    'engagementScoreOverview',
    'projectHealthOverview',
  ];

  return {
    lg: chartKeys.map((key, idx) => ({
      i: key,
      x: (idx % 2) * 6,
      y: Math.floor(idx / 2) * 3,
      w: 6,
      h: autoHeightWidgets.includes(key) ? (key === 'engagementScoreOverview' ? 1.8 : 1.9 ) : 3,
      minW: 5,
      minH: autoHeightWidgets.includes(key) ? (key === 'engagementScoreOverview' ? 1.8 : 1.9 ) : 3,
    })),
    md: chartKeys.map((key, idx) => ({
      i: key,
      x: 0,
      y: idx * 3,
      w: 12,
      h: autoHeightWidgets.includes(key) ? (key === 'engagementScoreOverview' ? 1.8 : 1.9 ) : 3,
      minW: 6,
      minH: autoHeightWidgets.includes(key) ? (key === 'engagementScoreOverview' ? 1.8 : 1.9 ) : 3,
    })),
    sm: chartKeys.map((key, idx) => ({
      i: key,
      x: 0,
      y: idx * 3,
      w: 12,
      h: autoHeightWidgets.includes(key) ?  1.8 : 3,
      minW: 12,
      minH: autoHeightWidgets.includes(key) ?  1.8 : 3,
    })),
  };
};

export default function ExecutiveDashboardPage() {
  const dispatch = useDispatch();
  const lastRequestKeyRef = useRef({});
  const teams = useSelector(state => state.teams?.teams || []);
  const advancedFilters = useSelector(
    state => state.dashboard.advancedFilters || {}
  );
  const dashboardLoading = useSelector(state => state.dashboard.loading);
  const { loadingAdvancedFilters } = useSelector(state => state.dashboard);
  const resourcesLoading = useSelector(state => state.resources.loading);
  const initLoading = useSelector(state => state.user.initLoading);
  const [initialLoad, setInitialLoad] = useState(true);
  const coverageData = useSelector(
    state => state.dashboard.resourceCoverage || []
  );
  const projectFTEData = useSelector(state => state.dashboard.projectFTE || []);
  const {
    budgetVsPlanVsActual = [],
    resourceUtilization = [],
    plan_vs_actual_variance = [],
    resourceFTEContractorRatio = [],
    unapprovedProjectAllocation = [],
    unapprovedProjectActualsByTeam = [],
    activeProjectsByType = [],
    totalHeadcount = [],
    team_headcount_distribution = [],
    activeProjects = [],
    activeResources = [],
    actualsConfirmed = [],
    totalResourceCost = [],
    allocationPercentage = [],
    allocation_by_project_type_group = [],
    top_projects_by_variance = [],
    actuals_confirmation_status = [],
    actualsTrendWeekly = [],
    teamEngagementScore = [],
    projectHealthOverview = [],
    engagementScoreOverview = [],
  } = useSelector(state => state.dashboard);
  const [layout, setLayout] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);
  const [bucket, setBucket] = useState('week');
  const [teamFilter, setTeamFilter] = useState('all');
  const [selectedProjectType, setSelectedProjectType] = useState('all');
  const [selectedProjectTypeGroup, setSelectedProjectTypeGroup] =
    useState('all');
  const [chartVisibility, setChartVisibility] = useState({
    resourceCoverage: true,
    projectFTE: true,
  });
  const [filteredCoverageData, setFilteredCoverageData] = useState([]);
  const [filteredProjectFTEData, setFilteredProjectFTEData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = dayjs();
    const day = today.day();
    return today.subtract(day === 0 ? 6 : day - 1, 'day'); // Adjust for Sunday (day 0)
  }); // Default to Monday of the current week
  const [overAllocated, setOverAllocated] = useState([]);
  const [underAllocated, setUnderAllocated] = useState([]);
  const [filteredCapacityData, setFilteredCapacityData] = useState([]);
  const [filteredUnderAllocated, setFilteredUnderAllocated] = useState([]);
  const [filteredOverAllocated, setFilteredOverAllocated] = useState([]);
  const [filteredActiveProjectsByType, setFilteredActiveProjectsByType] =
    useState([]);
  const [originalCapacityData, setOriginalCapacityData] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOption, setSelectedOption] = useState('week'); // Default option
  const [
    filteredUnapprovedProjectAllocation,
    setFilteredUnapprovedProjectAllocation,
  ] = useState([]);
  const [filteredActualsConfirmed, setFilteredActualsConfirmed] = useState([]);
  const [filteredUnapprovedActualsByTeam, setFilteredUnapprovedActualsByTeam] =
    useState([]);
  const [originalUnapprovedActualsByTeam, setOriginalUnapprovedActualsByTeam] =
    useState([]);
  const [filteredActualDeviation, setFilteredActualDeviation] = useState([]);
  const [filteredAllocationPercentage, setFilteredAllocationPercentage] =
    useState([]);
  const [filteredTop5Projects, setFilteredTop5Projects] = useState([]);
  const { projectTypes, projectTypeGroups } = useSelector(
    state => state.allSettings
  );
  const {
    dashboardQueryKeys,
    loginUserPrivileges,
    loadingLoginUserPrivileges,
  } = useSelector(state => state.rbac);
  // Guard to avoid repeated init dispatches causing render loops
  const initRequestedRef = useRef({
    projectTypes: false,
    projectTypeGroups: false,
    teams: false,
  });

  // Define shared color palette
  const colorPalette = [
    '#4169E1', // Blue
    '#FFD700', // Yellow
    '#00C9A7', // Green
    '#FFA500', // Orange
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#9C27B0', // Purple
    '#53C1DE', // Light Blue

    '#FF884D', // Orange-Red
    '#FFE66D', // Light Yellow
    '#E066FF', // Pink
    '#66D9EF', // Sky Blue
    '#A8E6CF', // Mint
    '#FF8B94', // Salmon
  ];

  // Memoize groupColorMap at component level so it's available for CSS generation
  const groupColorMap = useMemo(() => {
    if (!filteredProjectFTEData || filteredProjectFTEData.length === 0)
      return {};

    // Group data by project_type_group
    const groupedData = {};
    filteredProjectFTEData.forEach(item => {
      const group = item.project_type_group || 'Unknown';
      if (!groupedData[group]) {
        groupedData[group] = true;
      }
    });

    const map = {};
    Object.keys(groupedData).forEach((group, index) => {
      map[group] = colorPalette[index % colorPalette.length];
    });
    return map;
  }, [filteredProjectFTEData]);

  // Memoize projectTypeColorMap for pie chart
  const projectTypeColorMap = useMemo(() => {
    if (
      !filteredActiveProjectsByType ||
      filteredActiveProjectsByType.length === 0
    )
      return {};

    const map = {};
    filteredActiveProjectsByType.forEach((item, index) => {
      const typeName =
        projectTypeGroups?.find(pt => pt.Name === item._type)?.Name ||
        item._type;
      map[typeName] = colorPalette[index % colorPalette.length];
    });
    return map;
  }, [filteredActiveProjectsByType, projectTypeGroups]);
  useEffect(() => {
    const saved = localStorage.getItem('dashboardLayout');
    const parsed = saved ? JSON.parse(saved) : overviewLayouts?.md;
    setLayout(parsed);
  }, []);

  useEffect(() => {
    if (dashboardQueryKeys.length === 0) {
      dispatch({ type: FETCH_DASHBOARD_QUERY_KEYS });
    }
  }, []);

  useEffect(() => {
    if (!initRequestedRef.current.projectTypes && projectTypes.length === 0) {
      dispatch({ type: FETCH_PROJECT_TYPES });
      initRequestedRef.current.projectTypes = true;
    }
    if (
      !initRequestedRef.current.projectTypeGroups &&
      projectTypeGroups.length === 0
    ) {
      dispatch({ type: 'FETCH_PROJECT_TYPE_GROUPS' });
      initRequestedRef.current.projectTypeGroups = true;
    }
    if (!initRequestedRef.current.teams && teams.length === 0) {
      dispatch(getAllTeams());
      initRequestedRef.current.teams = true;
    }
  }, []);

  useEffect(() => {
    if (!initRequestedRef.current.projectTypes && projectTypes.length === 0) {
      dispatch({ type: FETCH_PROJECT_TYPES });
      initRequestedRef.current.projectTypes = true;
    }
    if (
      !initRequestedRef.current.projectTypeGroups &&
      projectTypeGroups.length === 0
    ) {
      dispatch({ type: 'FETCH_PROJECT_TYPE_GROUPS' });
      initRequestedRef.current.projectTypeGroups = true;
    }
    if (!initRequestedRef.current.teams && teams.length === 0) {
      dispatch(getAllTeams());
      initRequestedRef.current.teams = true;
    }
  }, [dispatch]);

  const selectedTeamPaths = useMemo(() => {
    if (teamFilter === 'all') return null;
    if (!Array.isArray(teams) || teams.length === 0) return null;
    const match = teams.find(t => t?.Name === teamFilter);
    const path = match?.__path__ || match?.Id || null;
    return path ? [path] : null;
  }, [teamFilter, teams]);
  const selectedTeamPathsKey = selectedTeamPaths
    ? selectedTeamPaths.join(',')
    : 'null';
  const advancedFiltersKey = JSON.stringify(advancedFilters);

  useEffect(() => {
    try {
      let startDate, endDate;
      if (selectedOption == 'week') {
        startDate = getMonday(selectedDate).format('YYYY-MM-DD');
        endDate = dayjs(selectedDate).isoWeekday(7).format('YYYY-MM-DD');
      } else {
        startDate = selectedDate.startOf(selectedOption).format('YYYY-MM-DD');
        endDate = selectedDate.endOf(selectedOption).format('YYYY-MM-DD');
      }

      // Inventory metrics charts (grouped - single API call)
      const inventoryMetricsCharts = [
        'activeProjects',
        'activeProjectsByType',
        'activeResources',
        'totalHeadcount',
        'resourceFTEContractorRatio',
        'plan_vs_actual_variance',
        'team_headcount_distribution',
        'top_projects_by_variance',
        'projects_by_type_distribution',
      ];

      // Individual charts (separate API calls)
      const individualCharts = [
        'unapprovedProjectAllocation',
        'projectFTE',
        'resourceCoverage',
        'resourceUtilization',
        'unapprovedProjectActualsByTeam',
        'budgetVsPlanVsActual',
        'totalResourceCost',
        'allocationPercentage',
        'actualsConfirmed',
        'actualsTrendWeekly',
        'teamEngagementScore',
        'projectHealthOverview',
        'engagementScoreOverview',
      ];

      // Set loading state at the start of data fetch only on initial load or when filters change
      if (initialLoad) {
        // Start loading for all charts that will be fetched
        const allChartKeys = [...inventoryMetricsCharts, ...individualCharts];
        dispatch(startMultipleChartsLoading(allChartKeys));
      }

      // Fetch inventory metrics as a batch (single API call)
      const inventoryMetricsKey = 'inventoryMetrics';
      const inventoryParamsForKey = {
        chartKey: inventoryMetricsKey,
        startDate: startDate,
        endDate: endDate,
        bucket: selectedOption,
        advancedFilters, // Only advanced filters matter now
      };

      const inventoryRequestKey = JSON.stringify(inventoryParamsForKey);
      if (
        lastRequestKeyRef.current[inventoryMetricsKey] !== inventoryRequestKey
      ) {
        lastRequestKeyRef.current[inventoryMetricsKey] = inventoryRequestKey;

        dispatch(
          fetchInventoryMetrics({
            startDate: startDate,
            endDate: endDate,
            bucket: selectedOption,
          })
        );
      }

      // Fetch individual charts
      individualCharts.forEach(chartKey => {
        const queryStart =
          (chartKey === 'plan_vs_actual_variance' ||
            chartKey === 'actualsConfirmed' || chartKey === 'unapprovedProjectAllocation') &&
          selectedOption === 'week'
            ? getMonday(selectedDate).subtract(1, 'week').format('YYYY-MM-DD')
            : startDate;
        const queryEnd =
          (chartKey === 'plan_vs_actual_variance' ||
            chartKey === 'actualsConfirmed' || chartKey === 'unapprovedProjectAllocation') &&
            selectedOption === 'week'
            ?  getMonday(selectedDate)
              .subtract(1, 'week')
              .add(6, 'day')
              .format('YYYY-MM-DD')
              : endDate;

        const paramsForKey = {
          chartKey: chartKey,
          startDate: queryStart,
          endDate: queryEnd,
          bucket: selectedOption,
          advancedFilters, // Only advanced filters matter now
        };

        const requestKey = JSON.stringify(paramsForKey);
        if (lastRequestKeyRef.current[chartKey] === requestKey) {
          return;
        }
        lastRequestKeyRef.current[chartKey] = requestKey;

        dispatch(
          fetchDashboardChart({
            chartKey: chartKey,
            startDate: queryStart,
            endDate: queryEnd,
            bucket: selectedOption,
          })
        );
      });
    } catch {
      console.error('Error fetching dashboard data. Please try again later.');
    }
  }, [
    dispatch,
    selectedDate,
    selectedOption,
    selectedProjectType,
    selectedProjectTypeGroup,
    selectedTeamPathsKey,
    advancedFiltersKey,
  ]);

  useEffect(() => {
    // Always reflect Redux state, including empty arrays
    setFilteredCoverageData(Array.isArray(coverageData) ? coverageData : []);
  }, [coverageData]);

  useEffect(() => {
    // Derive under/over allocated from resourceUtilization
    const under = resourceUtilization.filter(
      d => d.allocation_status === 'under-allocated'
    );
    const over = resourceUtilization.filter(
      d => d.allocation_status === 'over-allocated'
    );

    setFilteredUnderAllocated(Array.isArray(under) ? under : []);
    setFilteredOverAllocated(Array.isArray(over) ? over : []);
    
  }, [resourceUtilization]);

  useEffect(() => {
    const data = Array.isArray(unapprovedProjectActualsByTeam)
      ? unapprovedProjectActualsByTeam
      : [];
    setFilteredUnapprovedActualsByTeam(data);
    setOriginalUnapprovedActualsByTeam(data);
  }, [unapprovedProjectActualsByTeam]);

  useEffect(() => {
    setFilteredUnapprovedProjectAllocation(
      Array.isArray(unapprovedProjectAllocation) ? unapprovedProjectAllocation : []
    );
  }, [unapprovedProjectAllocation]);

  useEffect(() => {
    setFilteredActualsConfirmed(
      Array.isArray(actualsConfirmed) ? actualsConfirmed : []
    );
  }, [actualsConfirmed]);

  useEffect(() => {
    setFilteredActualDeviation(
      Array.isArray(plan_vs_actual_variance) ? plan_vs_actual_variance : []
    );
  }, [plan_vs_actual_variance]);

  useEffect(() => {
    setFilteredAllocationPercentage(
      Array.isArray(allocationPercentage) ? allocationPercentage : []
    );
  }, [allocationPercentage]);

  useEffect(() => {
    setFilteredTop5Projects(
      Array.isArray(top_projects_by_variance) ? top_projects_by_variance : []
    );
  }, [top_projects_by_variance]);

  useEffect(() => {
    // Backend returns already-filtered data; reflect even when empty
    setFilteredProjectFTEData(Array.isArray(projectFTEData) ? projectFTEData : []);
  }, [projectFTEData]);

  useEffect(() => {
    // Backend returns already-filtered data; reflect even when empty
    setFilteredActiveProjectsByType(
      Array.isArray(activeProjectsByType) ? activeProjectsByType : []
    );
  }, [activeProjectsByType]);

  // Calculate the Monday of the selected week
  const getMonday = date => {
    const day = date.day();
    return date.subtract(day === 0 ? 6 : day - 1, 'day'); // Adjust for Sunday (day 0)
  };

  useEffect(() => {
    // Check if all required data is loaded
    const allDataLoaded =
      resourceUtilization.length > 0 &&
      unapprovedProjectAllocation.length > 0 &&
      actualsConfirmed.length > 0 &&
      unapprovedProjectActualsByTeam.length > 0 &&
      plan_vs_actual_variance.length > 0 &&
      allocationPercentage.length > 0 &&
      top_projects_by_variance.length > 0 &&
      // Check inventory metrics data
      (activeProjects.length > 0 || activeProjectsByType.length > 0) &&
      (activeResources.length > 0 || totalHeadcount.length > 0);

    if (allDataLoaded) {
      if (initialLoad) {
        setInitialLoad(false);
      }
    }
  }, [
    resourceUtilization,
    actualsConfirmed,
    unapprovedProjectAllocation,
    unapprovedProjectActualsByTeam,
    plan_vs_actual_variance,
    allocationPercentage,
    top_projects_by_variance,
    activeProjects,
    activeProjectsByType,
    activeResources,
    resourceFTEContractorRatio,
    totalHeadcount,
    dashboardLoading,
    initialLoad,
  ]);

  const handleFilterChange = filter => {
    if (filter.type === 'time') setBucket(filter.value);
    if (filter.type === 'team') setTeamFilter(filter.value);
    if (filter.type === 'projectType') setSelectedProjectType(filter.value);
    if (filter.type === 'projectTypeGroup')
      setSelectedProjectTypeGroup(filter.value);
  };

  const handleLayoutChange = newLayout => {
    setLayout(newLayout);
    localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
  };

  const handleChartClick = chartName => {
    setSelectedChart(chartName);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedChart(null);
  };

  const toggleChartVisibility = chartKey => {
    setChartVisibility(prev => ({ ...prev, [chartKey]: !prev[chartKey] }));
  };

  const hasAccessToQueryKey = queryKey => {
    if (!dashboardQueryKeys) return false;
    if (DASHBOARD_ALL_ACCESS.includes(queryKey)) return true;
    if (loadingLoginUserPrivileges) return false;

    const queryDetails = dashboardQueryKeys?.find(
      qk => qk.QueryKey === queryKey
    );
    if (!queryDetails) return false;
    if (loginUserPrivileges === null) return false;

    const hasAccess = queryDetails?.Entities.every(entity => {
      return loginUserPrivileges[entity]?.r;
    });

    return hasAccess;
  };

  // Filter charts based on user permissions
  const allowedOverviewCharts = OVERVIEW_CHART_SEQUENCE.filter(queryKey =>
    hasAccessToQueryKey(queryKey)
  );
  const allowedCostsCharts = COST_CHART_SEQUENCE.filter(queryKey =>
    hasAccessToQueryKey(queryKey)
  );
  const allowedTeamCharts = TEAM_CHART_SEQUENCE.filter(queryKey =>
    hasAccessToQueryKey(queryKey)
  );

  const overviewLayouts = useMemo(
    () => generateLayouts(allowedOverviewCharts),
    [allowedOverviewCharts.join(',')]
  );
  const costsLayouts = useMemo(
    () => generateLayouts(allowedCostsCharts),
    [allowedCostsCharts.join(',')]
  );
  const teamLayouts = useMemo(
    () => generateLayouts(allowedTeamCharts),
    [allowedTeamCharts.join(',')]
  );

  const Teams = filteredCoverageData?.length
    ? [...new Set(filteredCoverageData.map(d => d.team_name))]
    : [];
  const periods = filteredCoverageData?.length
    ? [...new Set(filteredCoverageData.map(d => d.period_start))].sort()
    : [];

  const coverageSeries = Teams.map(team => ({
    label: team,
    data: periods.map(period => {
      const match = filteredCoverageData.find(
        d => d.team_name === team && d.period_start === period
      );
      const value = match ? parseFloat(match.coverage_pct) : 0;
      return isNaN(value) ? 0 : value;
    }),
  }));

  // Extract unique project types and periods from projectFTEData
  const ProjectTypes = [
    ...new Set(
      filteredProjectFTEData
        .map(d => d.project_type)
        .filter(type => type !== null)
    ),
  ];
  const projectPeriods = [
    ...new Set(filteredProjectFTEData.map(d => d.period_start)),
  ].sort();

  // Create project series with proper name mapping
  const projectSeries = ProjectTypes.map(typeId => {
    const projectTypeName =
      projectTypes.find(pt => pt.Id === typeId)?.Name || `Unknown (${typeId})`;
    const projectTypeColor =
      projectTypes.find(pt => pt.Id === typeId)?.Color || '#CCCCCC';

    return {
      label: projectTypeName,
      data: projectPeriods.map(period => {
        const match = filteredProjectFTEData.find(
          d => d.project_type === typeId && d.period_start === period
        );
        const value = match ? parseFloat(match.avg_weekly_fte) : 0;
        return isNaN(value) ? 0 : value;
      }),
      color: projectTypeColor,
      area: true,
    };
  });

  const transformDataForPieChart = data => {
    const colors = {
      'Approved Work': '#00C9A7', // Green
      'Unplanned Projects': '#FF884D', // Orange
      'Other Work': '#FFC233', // Yellow
      'Personal Time': '#0080FF', // Blue
    };

    return data.map((item, index) => ({
      id: index,
      value: parseFloat(item.pct_of_actuals),
      label: item.category,
      color: colors[item.category] || '#CCCCCC',
    }));
  };

  const unapprovedProjectAllocationData = transformDataForPieChart(
    filteredUnapprovedProjectAllocation
  );

  const filteredbudgetVsPlanVsActual = budgetVsPlanVsActual.filter(
    b => b.budget_total !== 0
  );

  const overviewcharts = {
    plan_vs_actual_variance: (
      <DashboardWidget
        onClick={() => handleChartClick('Plan vs Actuals Variance')}
        minWidth={320}
        minHeight={280}
        showNoData={
          !filteredActualDeviation || 
          filteredActualDeviation.length === 0 ||
          hasBarChartAllZeroValues(filteredActualDeviation, ['planned_units', 'actual_units'])
        }
        noDataMessage="No variance data available for the selected period"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Sort by Transform -> Grow -> Run order
          const sortedVarianceData = sortByProjectTypeGroupOrder(
            plan_vs_actual_variance,
            'project_type_group'
          );

          // Extract project type groups for x-axis
          const projectTypeGroups = sortedVarianceData.map(
            d => d.project_type_group
          );

          // Prepare data for bars (Plan and Actuals)
          const planData = sortedVarianceData.map(d =>
            Number(d.planned_units || 0)
          );

          const actualsData = sortedVarianceData.map(d =>
            Number(d.actual_units || 0)
          );

          // Prepare data for line (Absolute Variance %)
          const varianceData = sortedVarianceData.map(d =>
            Number(d.absolute_variance || 0)
          );

          const maxVariance = Math.max(...varianceData, 1);

          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: dimensions.width < 400 ? '16px' : '18px',
                  fontWeight: 600,
                }}
              >
                Plan vs Actuals Variance{' '}
                <span
                  style={{
                    fontSize: dimensions.width < 400 ? '12px' : '14px',
                    color: 'rgba(0, 0, 0, 0.6)',
                    fontWeight: 400,
                  }}
                >
                  (Previous week)
                </span>
              </Typography>

              {/* Custom Legend */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 3,
                  mb: 1,
                  fontSize: '14px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: '#FFE66D',
                      borderRadius: '2px',
                    }}
                  />
                  <Typography variant="body2">Plan</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: '#FF884D',
                      borderRadius: '2px',
                    }}
                  />
                  <Typography variant="body2">Actuals</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 3,
                      bgcolor: '#0080FF',
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        width: 8,
                        height: 8,
                        bgcolor: '#0080FF',
                        borderRadius: '50%',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  </Box>
                  <Typography variant="body2">Absolute Variance</Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1, width: '100%', position: 'relative' }}>
                <ChartContainer
                  width={config.width}
                  height={config.height}
                  series={[
                    {
                      type: 'bar',
                      data: planData,
                      label: 'Plan',
                      id: 'plan',
                      color: '#FFE66D',
                      yAxisKey: 'leftAxis',
                    },
                    {
                      type: 'bar',
                      data: actualsData,
                      label: 'Actuals',
                      id: 'actuals',
                      color: '#FF884D',
                      yAxisKey: 'leftAxis',
                    },
                    {
                      type: 'line',
                      data: varianceData,
                      label: 'Absolute Variance',
                      id: 'variance',
                      color: '#0080FF',
                      yAxisKey: 'rightAxis',
                      curve: 'linear',
                      showMark: true,
                    },
                  ]}
                  xAxis={[
                    {
                      data: projectTypeGroups,
                      scaleType: 'band',
                      id: 'x-axis',
                      categoryGapRatio: 0.4,
                      barGapRatio: 0,
                    },
                  ]}
                  yAxis={[
                    {
                      id: 'leftAxis',
                      scaleType: 'linear',
                      min: 0,
                    },
                    {
                      id: 'rightAxis',
                      scaleType: 'linear',
                      min: 0,
                      max: maxVariance * 1.2,
                    },
                  ]}
                  margin={{ left: 50, right: 50, top: 30, bottom: 40 }}
                >
                  <BarPlot />
                  <LinePlot />
                  <MarkPlot />
                  <ChartsXAxis
                    position="bottom"
                    axisId="x-axis"
                    tickLabelStyle={config.xAxis?.tickLabelStyle}
                  />
                  <ChartsYAxis
                    position="left"
                    axisId="leftAxis"
                    label="Resource Units Planned / % Actuals"
                    labelStyle={config.yAxis?.labelStyle}
                  />
                  <ChartsYAxis
                    position="right"
                    axisId="rightAxis"
                    label="Absolute Variance (%)"
                    labelStyle={config.yAxis?.labelStyle}
                    tickNumber={6}
                  />
                  <ChartsTooltip />
                </ChartContainer>
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    top_projects_by_variance: (
      <DashboardWidget
        onClick={() => handleChartClick('Top 5 Projects with Variance')}
        minWidth={320}
        minHeight={280}
        showNoData={
          !filteredTop5Projects || 
          filteredTop5Projects.length === 0 ||
          hasBarChartAllZeroValues(filteredTop5Projects, ['planned_units', 'actual_units', 'variance_percentage'])
        }
        noDataMessage="No project variance data available for the selected period"
      >
        {dimensions => {
          // Define columns for DataGrid
          const columns = [
            {
              field: 'project_name',
              headerName: 'PROJECT',
              flex: 1,
              minWidth: 150,
              headerClassName: 'custom-header',
              renderCell: params => (
                <Typography
                  sx={{ fontSize: '14px', fontWeight: 500, color: '#333' }}
                >
                  {params.value || 'N/A'}
                </Typography>
              ),
            },
            {
              field: 'project_type_group',
              headerName: 'TYPE',
              flex: 0.8,
              minWidth: 120,
              headerClassName: 'custom-header',
              renderCell: params => (
                <Typography sx={{ fontSize: '14px', color: '#666' }}>
                  {params.value || 'N/A'}
                </Typography>
              ),
            },
            {
              field: 'planned_units',
              headerName: 'PLAN',
              width: 100,
              align: 'center',
              headerAlign: 'center',
              headerClassName: 'custom-header',
              renderCell: params => (
                <Typography sx={{ fontSize: '14px', color: '#666' }}>
                  {Number(params.value || 0).toFixed(1)}
                </Typography>
              ),
            },
            {
              field: 'actual_units',
              headerName: 'ACTUALS',
              width: 100,
              align: 'center',
              headerAlign: 'center',
              headerClassName: 'custom-header',
              renderCell: params => (
                <Typography sx={{ fontSize: '14px', color: '#666' }}>
                  {Number(params.value || 0).toFixed(1)}
                </Typography>
              ),
            },
            {
              field: 'variance',
              headerName: 'VARIANCE',
              width: 110,
              align: 'center',
              headerAlign: 'center',
              headerClassName: 'custom-header',
              renderCell: params => {
                const variance = Number(params.value || 0);
                const varianceColor =
                  variance > 0 ? '#ef5350' : variance < 0 ? '#26a69a' : '#666';
                const varianceSign = variance > 0 ? '+' : '';
                const displayVariance =
                  variance === 0
                    ? '--'
                    : `${varianceSign}${variance.toFixed(1)}`;

                return (
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: varianceColor,
                    }}
                  >
                    {displayVariance}
                  </Typography>
                );
              },
            },
          ];

          // Prepare rows with unique IDs
          const rows = filteredTop5Projects
            .slice(0, 5)
            .map((project, index) => ({
              id: index,
              ...project,
            }));

          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontSize: dimensions.width < 400 ? '16px' : '18px',
                  fontWeight: 600,
                }}
              >
                Top 5 Projects with Variance{' '}
                <span
                  style={{
                    fontSize: dimensions.width < 400 ? '12px' : '14px',
                    color: 'rgba(0, 0, 0, 0.6)',
                    fontWeight: 400,
                  }}
                >
                  (Previous week)
                </span>
              </Typography>

              <Box sx={{ flex: 1, width: '100%' }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  hideFooter
                  disableColumnMenu
                  disableRowSelectionOnClick
                  rowHeight={56}
                  columnHeaderHeight={48}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-main': {
                      border: 'none',
                    },
                    '& .custom-header': {
                      backgroundColor: '#f5f5f5',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      borderBottom: '2px solid #e0e0e0',
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderTop: 'none',
                    },
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid #f0f0f0',
                      borderLeft: 'none',
                      borderRight: 'none',
                      alignItems: 'center',
                      display: 'flex',
                    },
                    '& .MuiDataGrid-row:last-child .MuiDataGrid-cell': {
                      borderBottom: 'none',
                    },
                    '& .MuiDataGrid-columnSeparator': {
                      display: 'none',
                    },
                    '& .MuiDataGrid-virtualScroller': {
                      marginTop: '0 !important',
                    },
                    '& .MuiDataGrid-filler': {
                      border: 'none',
                    },
                  }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    activeProjectsByType: (
      <DashboardWidget
        onClick={() =>
          handleChartClick('Active Projects by Project Type Group')
        }
        minWidth={400}
        minHeight={300}
        showNoData={
          !filteredActiveProjectsByType || 
          filteredActiveProjectsByType.length === 0 ||
          filteredActiveProjectsByType.every(item => Number(item.count || 0) === 0)
        }
        noDataMessage="No active projects found for the selected filters"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Define project type categories with consistent colors
          const projectTypeColors = {
            Run: '#5B7FFF',
            Grow: '#FFD666',
            Transform: '#FF9966',
          };

          // Sort data in Transform -> Grow -> Run order (create copy first)
          const groupOrder = ['Transform', 'Grow', 'Run'];
          const sortedData = [...(activeProjectsByType || [])].sort((a, b) => {
            const aIdx = groupOrder.indexOf(a._type);
            const bIdx = groupOrder.indexOf(b._type);
            return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
          });

          // Extract labels and counts
          const projectTypeLabels = sortedData.map(item => item._type);
          const projectTypeCounts = sortedData.map(item =>
            Number(item.count || 0)
          );

          // Assign colors based on type
          const barColors = sortedData.map(
            item => projectTypeColors[item._type] || '#CCCCCC'
          );

          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontSize: dimensions.width < 400 ? '16px' : '18px',
                  fontWeight: 600,
                }}
              >
                Active Projects by Project Type Group
              </Typography>

              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  minHeight: 0,
                }}
              >
                <BarChart
                  xAxis={[
                    {
                      scaleType: 'band',
                      data: projectTypeLabels,
                      categoryGapRatio: 0.5,
                      barGapRatio: 0.2,
                    },
                  ]}
                  yAxis={[
                    {
                      label: 'No. of Active Projects',
                      min: 0,
                      width: config.yAxis?.width || 50,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  series={[
                    {
                      data: projectTypeCounts,
                      id: 'activeProjects',
                      label: 'Active Projects',
                    },
                  ]}
                  width={config.width}
                  height={config.height}
                  grid={{ horizontal: true }}
                  margin={{
                    top: 10,
                    bottom: 40,
                    left: 40,
                    right: 10,
                  }}
                  colors={barColors}
                  slotProps={{
                    legend: {
                      hidden: true,
                    },
                  }}
                  sx={{
                    '& .MuiChartsAxis-tickLabel': {
                      fontSize: '12px',
                      fill: '#666',
                    },
                    '& .MuiChartsAxis-label': {
                      fontSize: '13px',
                      fontWeight: 500,
                    },
                  }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    totalHeadcount: (
      <DashboardWidget
        onClick={() => handleChartClick('Total Headcount Breakdown')}
        minWidth={320}
        minHeight={280}
        showNoData={
          !totalHeadcount || 
          totalHeadcount.length === 0 ||
          hasStackedChartAllZeroValues(totalHeadcount, ['FTE', 'Contractor - FT', 'Contractor - PT', 'Intern'])
        }
        noDataMessage="No headcount data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Transform the data structure from API
          // API returns: [{shore_flag: "Onshore", FTE: 55, "Contractor - FT": 10, ...}, {...}]
          // Define employee types and their colors
          const employeeTypes = [
            { key: 'FTE', label: 'FTE', color: '#0080FF' },
            {
              key: 'Contractor - FT',
              label: 'Contractor - FT',
              color: '#00C9A7',
            },
            {
              key: 'Contractor - PT',
              label: 'Contractor - PT',
              color: '#FFB6B6',
            },
            { key: 'Intern', label: 'Intern', color: '#FF884D' },
          ];

          // Sort by total headcount (sum of all employee types) descending
          const sortedHeadcount = sortByTotal(
            totalHeadcount || [],
            employeeTypes.map(t => t.key)
          );

          const shoreLabels = sortedHeadcount.map(item => item.shore_flag);

          // Create series data for each employee type
          const seriesData = employeeTypes.map(type => ({
            label: type.label,
            id: type.key,
            data: sortedHeadcount.map(item => Number(item[type.key] || 0)),
            color: type.color,
            stack: 'total',
          }));

          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: dimensions.width < 400 ? '16px' : '18px',
                  fontWeight: 600,
                }}
              >
                Total Headcount Breakdown
              </Typography>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <BarChart
                  width={config.width}
                  height={config.height}
                  series={seriesData}
                  xAxis={[
                    {
                      data: shoreLabels,
                      label: '',
                      scaleType: 'band',
                      categoryGapRatio: 0.7,
                      barGapRatio: 0.1,
                    },
                  ]}
                  yAxis={[
                    {
                      label: 'No. of Resources',
                      min: 0,
                      width: config.yAxis?.width || 50,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  slotProps={{
                    legend: config.legend,
                  }}
                  margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
                  grid={{ horizontal: true }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    allocation_by_project_type_group: (
      <DashboardWidget
        onClick={() => handleChartClick('Allocation by Project Type Group')}
        minWidth={320}
        minHeight={280}
        showNoData={
          !allocation_by_project_type_group || 
          Object.keys(allocation_by_project_type_group).length === 0 ||
          Object.values(allocation_by_project_type_group).every(groupData => 
            !Array.isArray(groupData) || 
            groupData.length === 0 || 
            groupData.every(item => Number(item.allocation_percentage || 0) === 0)
          )
        }
        noDataMessage="No allocation data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Process the nested data structure from API
          const processedData = [];
          const projectTypeNames = new Set();

          // Extract all unique project type names and flatten the data
          Object.keys(allocation_by_project_type_group).forEach(groupKey => {
            const groupData = allocation_by_project_type_group[groupKey];
            if (Array.isArray(groupData)) {
              groupData.forEach(item => {
                const typeName = item.project_type_name;
                projectTypeNames.add(typeName);
                processedData.push({
                  project_type_group: groupKey,
                  project_type_name: typeName,
                  allocation_percentage: Number(
                    item.allocation_percentage || 0
                  ),
                  allocated_units: Number(item.allocated_units || 0),
                  project_count: Number(item.project_count || 0),
                });
              });
            }
          });

          // Sort project type groups in Transform -> Grow -> Run order
          const groupOrder = ['Transform', 'Grow', 'Run'];
          const projectTypeGroups = Object.keys(
            allocation_by_project_type_group
          ).sort((a, b) => {
            const aIdx = groupOrder.indexOf(a);
            const bIdx = groupOrder.indexOf(b);
            return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
          });

          // Create series data for each project type using global colorPalette
          const projectTypeArray = Array.from(projectTypeNames);
          const seriesData = projectTypeArray.map((typeName, index) => ({
            label: typeName,
            id: typeName,
            data: projectTypeGroups.map(group => {
              const item = processedData.find(
                d =>
                  d.project_type_group === group &&
                  d.project_type_name === typeName
              );
              return item ? item.allocation_percentage : 0;
            }),
            color: colorPalette[index % colorPalette.length],
            stack: 'total',
          }));

          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: dimensions.width < 400 ? '16px' : '18px',
                  fontWeight: 600,
                }}
              >
                Allocation by Project Type Group
              </Typography>
              <Box sx={{ flex: 1, overflow: 'hidden', width: '100%' }}>
                <BarChart
                  width={config.width}
                  height={config.height}
                  series={seriesData}
                  xAxis={[
                    {
                      data: projectTypeGroups,
                      scaleType: 'band',
                      categoryGapRatio: 0.4,
                      barGapRatio: 0.1,
                    },
                  ]}
                  yAxis={[
                    {
                      label: 'Allocation %',
                      min: 0,
                      max: 100,
                      valueFormatter: value => `${value}%`,
                      width: config.yAxis?.width || 50,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  slotProps={{
                    legend: {
                      ...config.legend,
                      direction: 'row',
                      position: { vertical: 'bottom', horizontal: 'middle' },
                      padding: 0,
                    },
                  }}
                  margin={{ left: 60, right: 20, top: 20, bottom: 80 }}
                  grid={{ horizontal: true }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    unapprovedProjectAllocation: (
      <DashboardWidget
        onClick={() => handleChartClick('Actuals by Category')}
        minWidth={320}
        minHeight={280}
        showNoData={
          !filteredUnapprovedProjectAllocation || 
          filteredUnapprovedProjectAllocation.length === 0 ||
          hasPieChartAllZeroValues(transformDataForPieChart(filteredUnapprovedProjectAllocation))
        }
        noDataMessage="No actuals data available for the selected period"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'pie');
          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: dimensions.width < 400 ? '16px' : '18px',
                  fontWeight: 600,
                }}
              >
                Actuals by Category{' '}
                <span
                  style={{
                    fontSize: dimensions.width < 400 ? '12px' : '14px',
                    color: 'rgba(0, 0, 0, 0.6)',
                    fontWeight: 400,
                  }}
                >
                  (Previous week)
                </span>
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <PieChart
                  series={[
                    {
                      data: unapprovedProjectAllocationData.map(item => ({
                        ...item,
                        label: truncateLabel(
                          item.label,
                          dimensions.width < 400 ? 16 : 18
                        ),
                      })),
                      innerRadius: 0,
                      outerRadius: config.outerRadius || 80,
                      cornerRadius: 3,
                      highlightScope: { faded: 'global', highlighted: 'item' },
                      faded: { additionalRadius: -10, color: 'gray' },
                    },
                  ]}
                  width={config.width}
                  height={config.height}
                  slotProps={{
                    legend: config.legend,
                  }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    actuals_confirmation_status: (
      <DashboardWidget
        onClick={() => handleChartClick('Actuals Confirmation Status')}
        minWidth={320}
        minHeight={280}
        showNoData={
          !actuals_confirmation_status || 
          actuals_confirmation_status.length === 0 ||
          actuals_confirmation_status.every(item => parseFloat(item.percentage || 0) === 0)
        }
        noDataMessage="No actuals confirmation data available for the selected period"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'pie');
          // Transform data for pie chart with fixed colors
          const chartData = (actuals_confirmation_status || []).map(item => ({
            id: item.status,
            value: parseFloat(item.percentage || 0),
            label: item.status,
            color: item.status === 'Actuals' ? '#4169E1' : '#FFD700',
          }));

          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: dimensions.width < 400 ? '16px' : '18px',
                  fontWeight: 600,
                }}
              >
                Actuals Confirmation Status{' '}
                <span
                  style={{
                    fontSize: dimensions.width < 400 ? '12px' : '14px',
                    color: 'rgba(0, 0, 0, 0.6)',
                    fontWeight: 400,
                  }}
                >
                  (Previous week)
                </span>
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <PieChart
                  series={[
                    {
                      data: chartData,
                      innerRadius: 0,
                      outerRadius: config.outerRadius || 80,
                      cornerRadius: 3,
                      arcLabel: item => `${item.value}%`,
                      arcLabelMinAngle: 20,
                      arcLabelRadius: '70%',
                      highlightScope: { faded: 'global', highlighted: 'item' },
                      faded: { additionalRadius: -10, color: 'gray' },
                    },
                  ]}
                  width={config.width}
                  height={config.height}
                  sx={{
                    [`& .${pieArcLabelClasses.root}`]: {
                      fill: '#000000',
                      fontSize: '12px',
                      fontWeight: 600,
                    },
                  }}
                  slotProps={{
                    legend: {
                      ...config.legend,
                      direction: 'column',
                      position: { vertical: 'middle', horizontal: 'right' },
                      padding: { right: 5 },
                      itemmarkwidth: 12,
                      itemmarkheight: 12,
                      markgap: 8,
                      itemgap: 12,
                    },
                  }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    engagementScoreOverview: (
      <DashboardWidget
        onClick={() => handleChartClick('Engagement Score Overview')}
        // minWidth={650}
        minHeight={280}
        autoHeight={true}
      >
        {() => {
          const data = engagementScoreOverview?.[0] || {};

          return (
            <ScoreCard
              title="Engagement Overview"
              tooltipText="Combines two components: Planning and Actuals. Planning measures allocation entries across a rolling time window, weighted toward the present and near future. Actuals measures timely confirmation of completed work, weighted toward the most recent period. Both components contribute to the total score."
              overallScore={parseFloat(data.overall_engagement || 0)}
              overallChange={parseFloat(data.overall_engagement_change || 0)}
              overallDirection={data.overall_engagement_direction}
              subScores={[
                {
                  score: parseFloat(data.planned_score || 0),
                  label: 'Planned Score',
                  tooltipText:`Evaluates allocation entries across a 5-week rolling window centered on the current week. Each week's allocation percentage is weighted, with the current week and near-future weeks carrying the greatest influence. Higher allocation percentages in the weighted window increase score up to full capacity, with overallocation (typically over 1.0 FTE) indicating overburdening. Complete absence of allocation across the entire window triggers an additional penalty.`,
                  change: parseFloat(data.planned_score_change || 0),
                  positive: data.planned_score_direction !== 'down',
                },
                {
                  score: parseFloat(data.actual_score || 0),
                  label: 'Actuals Score',
                  tooltipText:'Evaluates actuals confirmation status across the 3 most recent completed weeks, weighted toward the most recent week. Confirmed status for the most recent week yields full component points. Any status other than confirmed yields zero base points, with additional penalties applied if older weeks are also unconfirmed. Key action: Confirm actuals for the most recent completed week.',
                  change: parseFloat(data.actual_score_change || 0),
                  positive: data.actual_score_direction !== 'down',
                },
              ]}
              hasAccess={true}
            />
          );
        }}
      </DashboardWidget>
    ),

     projectHealthOverview: (
      <DashboardWidget
        onClick={() => handleChartClick('Project Health Score Overview')}
        // minWidth={650}
        minHeight={100}
        autoHeight={true}
      >
        {() => {
          const data = projectHealthOverview?.[0] || {};

          return (
            <ScoreCard
              title="Projects Health Score"
              tooltipText={`Weighted combination of three components: Alignment (delivery predictability), Actuals Status (contributor status distribution), and Engagement (reporting participation). Each component contributes a configurable percentage of the total. Alignment examines variance between planned and actual allocation. Actuals Status evaluates the mix of 'On-Track', 'At-Risk', and 'Off-Track' statuses. Engagement measures status submission rates.`}
              overallScore={parseFloat(data.overall_health_score || 0)}
              overallChange={parseFloat(data.overall_health_score_change || 0)}
              overallDirection={data.overall_health_score_direction}
              subScores={[
                {
                  score: parseFloat(data.alignment_score || 0),
                  label: 'Alignment Score',
                  tooltipText:"Measures delivery predictability by comparing total planned allocation versus total actual allocation across all contributors. Projects score highest when variance falls within an optimal range around zero. Tolerance for variance depends on project type: Transform projects allow more positive variance (extra effort on challenging work), Run projects favor stability in both directions, Grow projects expect tight control. Scores decay as variance moves outside optimal range. Exception: Negative variance paired with 'On-Track' project status may bypass penalties.",
                  change: parseFloat(data.alignment_score_change || 0),
                  positive: data.alignment_score_direction !== 'down',
                },
                {
                  score: parseFloat(data.actuals_score || 0),
                  label: 'Actuals Status',
                  tooltipText:"Evaluates contributor status distribution using a weighted formula: 'On-Track' statuses add positive value, 'Off-Track' statuses subtract value, 'At-Risk' is neutral. The ratio of status types determines the raw score, which is then normalized. Contributors who don't submit status are excluded from calculation.",
                  change: parseFloat(data.actuals_score_change || 0),
                  positive: data.actuals_score_direction !== 'down',
                },
                {
                  score: parseFloat(data.engagement_score || 0),
                  label: 'Engagement Score',
                  tooltipText:"Measures what percentage of project contributors submit any status update. Score scales proportionally with participation rate. Any status submission counts ('On-Track', 'At-Risk', or 'Off-Track')—the specific status value doesn't affect engagement, only that something was submitted.",
                  change: parseFloat(data.engagement_score_change || 0),
                  positive: data.engagement_score_direction !== 'down',
                },
              ]}
              hasAccess={true}
            />
          );
        }}
      </DashboardWidget>
    ),

    projectFTE: (
      <DashboardWidget
        onClick={() =>
          handleChartClick('Monthly Allocation Trends - Planned vs Actual')
        }
        minWidth={320}
        minHeight={280}
        showNoData={
          !filteredProjectFTEData || 
          filteredProjectFTEData.length === 0 ||
          filteredProjectFTEData.every(d => (
            Number(d.planned_pct || 0) === 0 && Number(d.actual_pct || 0) === 0
          ))
        }
        noDataMessage="No FTE allocation data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'line');

          const currentWeekStart = getMonday(selectedDate);

          // Generate week range: 3 weeks in past, current week, 2 weeks in future (total 6 weeks)
          const weekRange = [];
          for (let i = -3; i <= 2; i++) {
            weekRange.push(
              currentWeekStart.add(i, 'week').format('YYYY-MM-DD')
            );
          }

          // Group data by project_type_group and week
          const groupedData = {};
          filteredProjectFTEData.forEach(item => {
            const group = item.project_type_group || 'Unknown';
            if (!groupedData[group]) {
              groupedData[group] = {};
            }
            const weekStart = item.week_start;
            if (!groupedData[group][weekStart]) {
              groupedData[group][weekStart] = {
                planned_pct: 0,
                actual_pct: 0,
              };
            }
            // Use percentage fields from the data
            groupedData[group][weekStart].planned_pct += parseFloat(
              item.planned_pct || 0
            );
            groupedData[group][weekStart].actual_pct += parseFloat(
              item.actual_pct || 0
            );
          });

          // Create series for each project type group in Transform-Grow-Run order
          const allSeries = [];
          const groupOrder = ['Transform', 'Grow', 'Run'];
          const sortedGroups = Object.keys(groupedData).sort((a, b) => {
            const aIdx = groupOrder.indexOf(a);
            const bIdx = groupOrder.indexOf(b);
            return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
          });

          sortedGroups.forEach(group => {
            const groupColor = groupColorMap[group];

            // Planned series (dotted line) - show for all weeks
            allSeries.push({
              label: `${group} - Planned`,
              id: `${group}-planned`,
              data: weekRange.map(week => {
                const value = groupedData[group][week]?.planned_pct || 0;
                return isNaN(value) ? 0 : parseFloat(value);
              }),
              curve: 'linear',
              showMark: true,
              color: groupColor,
            });

            // Actual series (solid line) - show only for past weeks (not future)
            // Stop the line at the last week with actual data (don't connect to 0 in current week)
            const actualData = weekRange.map((week, idx) => {
              // For future weeks (idx > 3), return null
              if (idx > 3) {
                return null;
              }

              // For past and current weeks, check if actual_pct exists
              const actual_pct = groupedData[group][week]?.actual_pct;

              // For current week (idx === 3): treat 0 as null to stop the line
              if (
                idx === 3 &&
                (actual_pct === null ||
                  actual_pct === undefined ||
                  actual_pct === 0)
              ) {
                return null;
              }

              // For past weeks (idx < 3): treat null/undefined as null, but keep 0 as 0
              if (
                idx < 3 &&
                (actual_pct === null || actual_pct === undefined)
              ) {
                return null;
              }

              const value = parseFloat(actual_pct);
              return isNaN(value) ? null : value;
            });

            allSeries.push({
              label: `${group} - Actual`,
              id: `${group}-actual`,
              data: actualData,
              curve: 'linear',
              showMark: true,
              color: groupColor,
              connectNulls: false, // Don't connect across null values - line stops at last valid point
            });
          });

          return (
            <Box
              sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: dimensions.width < 400 ? '16px' : '18px',
                  fontWeight: 600,
                }}
              >
                Allocation Trends - Planned vs Actual (%)
              </Typography>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <LineChart
                  width={config.width}
                  height={config.height}
                  series={allSeries.map(series => ({
                    ...series,
                    // Make planned lines dotted/dashed
                    strokeDasharray: series.label.includes('Planned')
                      ? '5 5'
                      : undefined,
                    strokeWidth: 2,
                  }))}
                  xAxis={[
                    {
                      data: weekRange.map((week, idx) => {
                        const weekDate = dayjs(week);
                        const isCurrentWeek = idx === 3;
                        const weekNumber = getWeekNumber(week);
                        return isCurrentWeek
                          ? `${weekNumber} (Current)`
                          : `${weekNumber}`;
                      }),
                      label: 'Week',
                      scaleType: 'point',
                    },
                  ]}
                  yAxis={[
                    {
                      label: 'Allocation Percentage',
                      min: 0,
                      valueFormatter: value => `${value.toFixed(0)}%`,
                      width: config.yAxis?.width || 50,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  slotProps={{
                    legend: {
                      ...config.legend,
                      direction: 'row',
                      position: { vertical: 'bottom', horizontal: 'middle' },
                    },
                  }}
                  grid={{ vertical: true, horizontal: true }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),
  };

  const costsCharts = {
    budgetVsPlanVsActual: (
      <DashboardWidget
        onClick={() =>
          handleChartClick('Budget vs Planned vs Actuals by Projects')
        }
        minWidth={320}
        minHeight={280}
        showNoData={
          !filteredbudgetVsPlanVsActual ||
          filteredbudgetVsPlanVsActual.length === 0 ||
          hasBarChartAllZeroValues(filteredbudgetVsPlanVsActual, ['budget_total','planned_to_date','actual_to_date'])
        }
        noDataMessage="No budget/plan/actual data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Sort by budget total descending
          const sortedBudgetData = sortBarChartData(
            filteredbudgetVsPlanVsActual,
            'budget_total'
          );

          return (
            <Box
              sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: dimensions.width < 400 ? '16px' : '18px',
                  fontWeight: 600,
                }}
              >
                Budget vs Planned vs Actual by Project
              </Typography>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <BarChart
                  width={config.width}
                  height={config.height}
                  series={[
                    {
                      data: sortedBudgetData.map(d =>
                        Number.parseFloat(d.budget_total)
                      ),
                      label: 'Budget',
                      id: 'budget',
                      color: '#9FA8DA',
                    },
                    {
                      data: sortedBudgetData.map(d =>
                        Number.parseFloat(d.planned_to_date)
                      ),
                      label: 'Planned',
                      id: 'planned',
                      color: '#80CBC4',
                    },
                    {
                      data: sortedBudgetData.map(d =>
                        Number.parseFloat(d.actual_to_date)
                      ),
                      label: 'Actuals',
                      id: 'actual',
                      color: '#FFB74D',
                    },
                  ]}
                  xAxis={[
                    {
                      data: sortedBudgetData.map(d => d.project_name),
                      label: 'Project',
                      //tickLabelStyle: config.xAxis?.tickLabelStyle,
                    },
                  ]}
                  yAxis={[
                    {
                      min: 0,
                      width: config.yAxis?.width || 80,
                      valueFormatter: value => `$ ${value}`,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  slotProps={{
                    legend: config.legend,
                  }}
                  grid={{ horizontal: true }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),
  };

  const teamCharts = {
    team_headcount_distribution: (
      <DashboardWidget
        onClick={() => handleChartClick('Total Headcount by Team')}
        minWidth={320}
        minHeight={280}
        showNoData={
          !team_headcount_distribution ||
          team_headcount_distribution.length === 0 ||
          team_headcount_distribution.every(item => {
            const splits = item.resource_type_split || {};
            return (
              Number(splits['FTE'] || 0) === 0 &&
              Number(splits['Intern'] || 0) === 0 &&
              Number(splits['Contractor - PT'] || 0) === 0 &&
              Number(splits['Contractor - FT'] || 0) === 0
            );
          })
        }
        noDataMessage="No team headcount data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Define employee types and their colors (matching totalHeadcount)
          const employeeTypes = [
            { key: 'FTE', label: 'FTE', color: '#53C1DE' },
            { key: 'Intern', label: 'Interns', color: '#0080FF' },
            {
              key: 'Contractor - PT',
              label: 'Contractors (PT)',
              color: '#FFE66D',
            },
            {
              key: 'Contractor - FT',
              label: 'Contractors (FT)',
              color: '#FF884D',
            },
          ];

          // Sort teams by total headcount descending
          const sortedTeamHeadcount = [
            ...(team_headcount_distribution || []),
          ].sort((a, b) => {
            const aTotal = employeeTypes.reduce(
              (sum, type) =>
                sum + Number(a.resource_type_split?.[type.key] || 0),
              0
            );
            const bTotal = employeeTypes.reduce(
              (sum, type) =>
                sum + Number(b.resource_type_split?.[type.key] || 0),
              0
            );
            return bTotal - aTotal;
          });

          // Extract team names from sorted data
          const teamNames = sortedTeamHeadcount.map(item =>
            formatTeamName(
              item.team_name,
              dimensions.width < 400 ? 8 : 10,
              sortedTeamHeadcount.length
            )
          );

          // Create series data for each employee type
          const seriesData = employeeTypes.map(type => ({
            label: type.label,
            id: type.key,
            data: sortedTeamHeadcount.map(item =>
              Number(item.resource_type_split?.[type.key] || 0)
            ),
            color: type.color,
            stack: 'total',
          }));

          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: dimensions.width < 400 ? '16px' : '18px',
                  fontWeight: 600,
                }}
              >
                Total Headcount by Team
              </Typography>
              <Box sx={{ flex: 1, overflow: 'hidden', width: '100%' }}>
                <BarChart
                  width={config.width}
                  height={config.height}
                  series={seriesData}
                  xAxis={[
                    {
                      data: teamNames,
                      label: 'Team',
                      scaleType: 'band',
                      categoryGapRatio: 0.5,
                      barGapRatio: 0.1,
                      tickLabelStyle: config.xAxis?.tickLabelStyle,
                    },
                  ]}
                  yAxis={[
                    {
                      label: 'No. of Resources',
                      min: 0,
                      width: config.yAxis?.width || 50,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  slotProps={{
                    legend: {
                      ...config.legend,
                      direction: 'row',
                      position: { vertical: 'bottom', horizontal: 'middle' },
                    },
                  }}
                  margin={{ left: 20, right: 20, top: 20, bottom: 80 }}
                  grid={{ horizontal: true }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    unapprovedProjectActualsByTeam: (
      <DashboardWidget
        onClick={() => handleChartClick('Project Actuals Breakdown by Team')}
        minWidth={320}
        minHeight={280}
        showNoData={
          !filteredUnapprovedActualsByTeam ||
          filteredUnapprovedActualsByTeam.length === 0 ||
          hasStackedChartAllZeroValues(
            filteredUnapprovedActualsByTeam,
            ['pct_of_actuals']
          )
        }
        noDataMessage="No unapproved project actuals data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Get unique teams and calculate total actuals for each
          const uniqueTeams = [
            ...new Set(filteredUnapprovedActualsByTeam.map(d => d.team_name)),
          ];

          // Calculate total actuals per team and sort descending
          const teamTotals = uniqueTeams.map(team => ({
            team,
            total: filteredUnapprovedActualsByTeam
              .filter(d => d.team_name === team)
              .reduce(
                (sum, d) => sum + Number.parseFloat(d.pct_of_actuals || 0),
                0
              ),
          }));
          teamTotals.sort((a, b) => b.total - a.total);
          const sortedUniqueTeams = teamTotals.map(t => t.team);

          return (
            <Box
              sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: dimensions.width < 400 ? '16px' : '18px',
                  fontWeight: 600,
                }}
              >
                Project Actuals Breakdown by Team
              </Typography>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <BarChart
                  width={config.width}
                  height={config.height}
                  series={[
                    ...new Set(
                      filteredUnapprovedActualsByTeam.map(d => d.category)
                    ),
                  ].map(category => ({
                    label: category, //truncateLabel(category, dimensions.width < 400 ? 16 : 18),
                    id: category,
                    stack: 'total',
                    data: sortedUniqueTeams.map(team => {
                      const match = filteredUnapprovedActualsByTeam.find(
                        d => d.category === category && d.team_name === team
                      );
                      return match
                        ? Number.parseFloat(match.pct_of_actuals)
                        : 0;
                    }),
                    color:
                      category === 'Approved Work'
                        ? '#00C9A7'
                        : category === 'Unplanned Projects'
                          ? '#FF884D'
                          : category === 'Other Work'
                            ? '#FFC233'
                            : category === 'Personal Time'
                              ? '#0080FF'
                              : '#CCCCCC',
                  }))}
                  xAxis={[
                    {
                      data: sortedUniqueTeams.map(team =>
                        formatTeamName(
                          team,
                          dimensions.width < 400 ? 10 : 12,
                          sortedUniqueTeams.length
                        )
                      ),
                      label: 'Team',
                      tickLabelStyle: config.xAxis?.tickLabelStyle,
                    },
                  ]}
                  yAxis={[
                    {
                      label: '% of Actuals',
                      min: 0,
                      max: 100,
                      valueFormatter: value => `${value}%`,
                      width: config.yAxis?.width || 50,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  slotProps={{
                    legend: config.legend,
                  }}
                  grid={{ horizontal: true }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    resourceCoverage: (
      <DashboardWidget
        onClick={() => handleChartClick('Resource Allocation Coverage')}
        minWidth={320}
        minHeight={280}
        showNoData={
          !filteredCoverageData ||
          filteredCoverageData.length === 0 ||
          hasBarChartAllZeroValues(filteredCoverageData, ['coverage_pct'])
        }
        noDataMessage="No coverage data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Sort by coverage percentage descending
          const sortedCoverageData = sortBarChartData(
            filteredCoverageData,
            'coverage_pct'
          );

          return (
            <Box
              sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: dimensions.width < 400 ? '16px' : '18px',
                  fontWeight: 600,
                }}
              >
                Resource Coverage by Teams
              </Typography>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <BarChart
                  width={config.width}
                  height={config.height}
                  series={[
                    {
                      data: sortedCoverageData.map(d =>
                        parseFloat(d.coverage_pct)
                      ),
                      label: 'Coverage',
                      id: 'coverage',
                      color: '#FF884D',
                    },
                  ]}
                  xAxis={[
                    {
                      data: sortedCoverageData.map(d =>
                        formatTeamName(
                          d.team_name,
                          dimensions.width < 400 ? 10 : 12,
                          sortedCoverageData.length
                        )
                      ), // Team names as x-axis labels
                      label: 'Team',
                      tickLabelStyle: config.xAxis?.tickLabelStyle,
                    },
                  ]}
                  yAxis={[
                    {
                      label: 'Coverage %',
                      min: 0,
                      max: 100,
                      width: config.yAxis?.width || 50,
                      valueFormatter: value => `${value}%`,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  slotProps={{
                    legend: config.legend,
                    bar: {
                      borderradius: 2,
                      barwidth: 0.4,
                    },
                  }}
                  grid={{ horizontal: true }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    underAllocated: (
      <DashboardWidget minWidth={320} minHeight={280}
        showNoData={
          !filteredUnderAllocated ||
          filteredUnderAllocated.length === 0 ||
          hasBarChartAllZeroValues(filteredUnderAllocated, ['utilization_pct'])
        }
        noDataMessage="No under-allocation data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Sort by utilization percentage descending
          const sortedUnderAllocated = sortBarChartData(
            filteredUnderAllocated,
            'utilization_pct'
          );

          return (
            <Box
              sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: dimensions.width < 400 ? '16px' : '18px',
                  fontWeight: 600,
                }}
              >
                Under-Allocated Teams
              </Typography>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <BarChart
                  width={config.width}
                  height={config.height}
                  series={[
                    {
                      data: sortedUnderAllocated.map(d =>
                        Number.parseFloat(d.utilization_pct)
                      ),
                      label: 'Under-allocation',
                      id: 'underAllocation',
                      color: '#80CBC4',
                    },
                  ]}
                  xAxis={[
                    {
                      data: sortedUnderAllocated.map(d =>
                        formatTeamName(
                          d.team_name,
                          dimensions.width < 400 ? 10 : 12,
                          sortedUnderAllocated.length
                        )
                      ),
                      label: 'Team',
                      tickLabelStyle: config.xAxis?.tickLabelStyle,
                    },
                  ]}
                  yAxis={[
                    {
                      min: 0,
                      width: config.yAxis?.width || 50,
                      valueFormatter: value => `${value}%`,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  slotProps={{
                    legend: config.legend,
                  }}
                  grid={{ horizontal: true }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    overAllocated: (
      <DashboardWidget minWidth={320} minHeight={280}
        showNoData={
          !filteredOverAllocated ||
          filteredOverAllocated.length === 0 ||
          hasBarChartAllZeroValues(filteredOverAllocated, ['utilization_pct'])
        }
        noDataMessage="No over-allocation data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Sort by utilization percentage descending
          const sortedOverAllocated = sortBarChartData(
            filteredOverAllocated,
            'utilization_pct'
          );

          return (
            <Box
              sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: dimensions.width < 400 ? '16px' : '18px',
                  fontWeight: 600,
                }}
              >
                Over-Allocated Teams
              </Typography>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <BarChart
                  width={config.width}
                  height={config.height}
                  series={[
                    {
                      data: sortedOverAllocated.map(d =>
                        Number.parseFloat(d.utilization_pct)
                      ),
                      label: 'Over-allocation',
                      id: 'overAllocation',
                      color: '#FF7043',
                    },
                  ]}
                  xAxis={[
                    {
                      data: sortedOverAllocated.map(d =>
                        formatTeamName(
                          d.team_name,
                          dimensions.width < 400 ? 10 : 12,
                          sortedOverAllocated.length
                        )
                      ),
                      label: 'Team',
                      tickLabelStyle: config.xAxis?.tickLabelStyle,
                    },
                  ]}
                  yAxis={[
                    {
                      min: 0,
                      width: config.yAxis?.width || 50,
                      valueFormatter: value => `${value}%`,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  slotProps={{
                    legend: config.legend,
                  }}
                  grid={{ horizontal: true }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    actualsTrendWeekly: (
      <DashboardWidget
        onClick={() => handleChartClick('Actuals Trend')}
        minWidth={320}
        minHeight={280}
        showNoData={
          !actualsTrendWeekly ||
          actualsTrendWeekly.length === 0 ||
          actualsTrendWeekly.every(item =>
            (item.actuals || []).every(
              a => parseFloat(a.percentage || 0) === 0
            )
          )
        }
        noDataMessage="No weekly actuals trend data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          const periodData = (actualsTrendWeekly || [])
            .map(item => ({
              period_start: item.period_start,
              week: getWeekNumber(item.period_start),
              actuals: item.actuals || [],
            }))
            .sort(
              (a, b) => new Date(a.period_start) - new Date(b.period_start)
            );

          const weeks = periodData.map(d => d.week);

          // Define categories and their colors matching the image
          const categories = [
            { key: 'Personal Time', label: 'Personal Time', color: '#0080FF' },
            { key: 'Other Work', label: 'Other Work', color: '#FFC233' },
            {
              key: 'Unplanned Projects',
              label: 'Unplanned Projects',
              color: '#FF884D',
            },
            { key: 'Approved Work', label: 'Approved Work', color: '#00C9A7' },
          ];

          // Create series data for each category
          const seriesData = categories.map(category => ({
            label: category.label,
            id: category.key,
            data: periodData.map(weekData => {
              const match = weekData.actuals.find(
                a => a.category === category.key
              );
              return match ? parseFloat(match.percentage || 0) : 0;
            }),
            color: category.color,
            stack: 'total',
          }));

          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: dimensions.width < 400 ? '16px' : '18px',
                  fontWeight: 600,
                }}
              >
                Actuals Trend
              </Typography>
              <Box sx={{ flex: 1, overflow: 'hidden', width: '100%' }}>
                <BarChart
                  width={config.width}
                  height={config.height}
                  series={seriesData}
                  xAxis={[
                    {
                      label: 'Previous weeks',
                      data: weeks,
                      scaleType: 'band',
                      categoryGapRatio: 0.3,
                      barGapRatio: 0.1,
                      tickLabelStyle: config.xAxis?.tickLabelStyle,
                    },
                  ]}
                  yAxis={[
                    {
                      label: 'Actuals (%)',
                      min: 0,
                      max: 100,
                      valueFormatter: value => `${value}`,
                      width: config.yAxis?.width || 50,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  slotProps={{
                    legend: {
                      ...config.legend,
                      direction: 'column',
                      position: { vertical: 'middle', horizontal: 'right' },
                      padding: { right: 5 },
                      itemmarkwidth: 12,
                      itemmarkheight: 12,
                      markgap: 8,
                      itemgap: 12,
                    },
                  }}
                  margin={{ left: 60, right: 140, top: 20, bottom: 60 }}
                  grid={{ horizontal: true }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    teamEngagementScore: (
      <DashboardWidget
        onClick={() => handleChartClick('Engagement Score by Teams')}
        minWidth={320}
        minHeight={280}
        showNoData={
          !teamEngagementScore ||
          teamEngagementScore.length === 0 ||
          hasBarChartAllZeroValues(teamEngagementScore,['avg_engagement_score'])
        }
        noDataMessage="No engagement score data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Sort by engagement score descending
          const sortedEngagementData = sortBarChartData(
            teamEngagementScore || [],
            'avg_engagement_score'
          );

          return (
            <Box
              sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: dimensions.width < 400 ? '16px' : '18px',
                  fontWeight: 600,
                }}
              >
                Engagement Score by Teams
              </Typography>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <BarChart
                  width={config.width}
                  height={config.height}
                  series={[
                    {
                      data: sortedEngagementData.map(d =>
                        Number.parseFloat(d.avg_engagement_score || 0)
                      ),
                      label: 'Engagement Score',
                      id: 'engagementScore',
                      color: '#7C93F5',
                    },
                  ]}
                  xAxis={[
                    {
                      data: sortedEngagementData.map(d =>
                        formatTeamName(
                          d.team_name,
                          dimensions.width < 400 ? 10 : 12,
                          sortedEngagementData.length
                        )
                      ),
                      label: 'Team',
                      tickLabelStyle: config.xAxis?.tickLabelStyle,
                    },
                  ]}
                  yAxis={[
                    {
                      min: 0,
                      max: 100,
                      width: config.yAxis?.width || 50,
                      valueFormatter: value => `${value}`,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  slotProps={{
                    legend: config.legend,
                  }}
                  grid={{ horizontal: true }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),
  };

  const teamNames = [...new Set(teams.map(d => d.Name))];
  const projectTypeNames = [...new Set(projectTypes.map(d => d.Name))];
  const projectTypeGroupNames = [
    ...new Set(projectTypeGroups.map(d => d.Name)),
  ];

  // Show loading screen while data is being fetched
  if (dashboardLoading && initialLoad) {
    return <LoadingScreen />;
  }

  return initLoading ||
    loadingLoginUserPrivileges ||
    resourcesLoading || // Needed to setup filters
    loadingAdvancedFilters ||
    (dashboardLoading && !initialLoad) ? (
    <LoadingScreen />
  ) : (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: `calc(100vh - 31px)` }}>
      <Global
        styles={css`
          circle.MuiMarkElement-root {
            r: 3 !important; /* Set the radius to a smaller value */
          }
          .react-grid-item {
            transition: all 200ms ease;
            transition-property: left, top;
          }
          .react-grid-item.cssTransforms {
            transition-property: transform;
          }

          /* Fix resize handle for auto-height widgets */
          .react-grid-item.auto-height-widget {
            height: auto !important;
          }
          .react-grid-item.auto-height-widget .react-resizable-handle {
            position: absolute;
            bottom: 0;
          }

          .MuiChartsLegend-item[data-series$='-planned']
            .MuiChartsLabelMark-fill {
            fill: transparent !important;
            stroke-width: 4 !important;
            stroke-dasharray: 5 5 !important;
          }

          /* Dynamically generate stroke colors for each group */
          ${Object.entries(groupColorMap)
            .map(
              ([group, color]) => `
              .MuiChartsLegend-item[data-series$='-planned'] .MuiChartsLabelMark-fill[fill='${color}'] { 
                stroke: ${color} !important; 
              }
            `
            )
            .join('\n')}

          [class*='MuiLineElement-series-'][class*='-planned'] {
            stroke-dasharray: 5 5 !important;
          }

          [class*='MuiLineElement-series-'][class*='-actual'] {
            stroke-dasharray: none !important;
          }

          /* Responsive chart styles */
          .MuiChartsLegend-root {
            max-width: 100% !important;
            overflow: hidden !important;
            font-size: 10px !important;
            margin: 0 !important;
          }

          .MuiChartsAxis-tickLabel {
            font-size: 11px !important;
          }

          .MuiChartsAxisHighlight-root {
            fill: none !important;
            opcacity: 0 !important;
          }

          @media (max-width: 768px) {
            .MuiChartsAxis-tickLabel {
              font-size: 9px !important;
            }

            .MuiChartsLegend-mark {
              width: 16px !important;
              height: 12px !important;
            }

            .MuiChartsLegend-label {
              font-size: 11px !important;
            }
          }
        `}
      />
      {/* Sticky header containing Tabs and Topbar */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: '#fff' }}>
        <CommonToolbar>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            sx={{ padding: '16px 16px 0px 8px' }}
          >
            <Tab
              value="overview"
              label="Overview"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            {allowedTeamCharts.length > 0 && (
              <Tab
                value="teams"
                label="Teams"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
            )}
            {allowedCostsCharts.length > 0 && (
              <Tab
                value="costs"
                label="Costs"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
            )}         
          <Tab
            value="report-builder"
            label="Report Builder"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          {activeTab !== 'report-builder' && (
            <DashboardToolbar
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              anchorEl={anchorEl}
              setAnchorEl={setAnchorEl}
            />
          )}
        </Tabs>
      </CommonToolbar>
      {activeTab !== 'report-builder' && <Topbar />}
      </Box>
      {/* Scrollable content area (scroll without visible scrollbar) */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE 10+
          '&::-webkit-scrollbar': { display: 'none' }, // WebKit
        }}
      >
      {activeTab === 'overview' && (
        <>
          <Typography
            variant="h2"
            sx={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              paddingLeft: '24px',
              paddingBottom: '8px',
            }}
          >
            Overview
          </Typography>

          <Overview
            activeProjects={activeProjects}
            activeResources={activeResources}
            actualsConfirmed={filteredActualsConfirmed}
            totalResourceCost={totalResourceCost}
            allocationPercentage={filteredAllocationPercentage}
            hasAccessToQueryKey={hasAccessToQueryKey}
          />
          <ResponsiveGridLayout
            className="layout"
            layouts={overviewLayouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 12, sm: 12 }}
            rowHeight={130}
            onLayoutChange={handleLayoutChange}
            isDraggable
            isResizable
            compactType="vertical"
            style={{ padding: '0 16px' }}
          >
            {allowedOverviewCharts.map(key => (
              <div
                key={key}
                className={
                  key === 'engagementScoreOverview' || key === 'projectHealthOverview' ? 'auto-height-widget' : ''
                }
              >
                {overviewcharts[key]}
              </div>
            ))}
          </ResponsiveGridLayout>
        </>
      )}

      {activeTab === 'teams' && (
        <>
          <Typography
            variant="h2"
            sx={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              paddingLeft: '24px',
              paddingBottom: '8px',
            }}
          >
            Teams Overview
          </Typography>
          <ResponsiveGridLayout
            className="layout"
            layouts={teamLayouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 12, sm: 12 }}
            rowHeight={130}
            onLayoutChange={handleLayoutChange}
            isDraggable
            isResizable
            compactType="vertical"
            style={{ padding: '0 16px' }}
          >
            {allowedTeamCharts.map(key => (
              <div key={key}>{teamCharts[key]}</div>
            ))}
          </ResponsiveGridLayout>
        </>
      )}

      {activeTab === 'costs' && (
        <>
          <Typography
            variant="h2"
            sx={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              paddingLeft: '24px',
              paddingBottom: '8px',
            }}
          >
            Costs Tracking
          </Typography>
          <ResponsiveGridLayout
            className="layout"
            layouts={costsLayouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 12, sm: 12 }}
            rowHeight={130}
            onLayoutChange={handleLayoutChange}
            isDraggable
            isResizable
            compactType="vertical"
            style={{ padding: '0 16px' }}
          >
            {allowedCostsCharts.map(key => (
              <div key={key}>{costsCharts[key]}</div>
            ))}
          </ResponsiveGridLayout>
        </>
      )}
      {activeTab === 'report-builder' && (
        <Box
          sx={{
            height: 'calc(100vh - 200px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ReportBuilderPage onReportGenerate={(filters) => { console.log('Report generated with filters:', filters) }} />
        </Box>
      )}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{selectedChart}</DialogTitle>
        <DialogContent>
          <Typography>
            Drilldown details for "{selectedChart}" will appear here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Box>
  );
}
