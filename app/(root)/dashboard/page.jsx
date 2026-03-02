'use client';

import Overview from '../../components/Dashboard/OverviewCards';
import ScoreCard from '../../components/Dashboard/ScoreCard';
import ReportBuilderPage from '@/app/components/Dashboard/ReportBuilder/ReportBuilderPage';
import { useEffect, useState, useRef, useMemo,useCallback } from 'react';
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
  useAxisTooltip,
  ChartsTooltipContainer,
} from '@mui/x-charts';
import DashboardWidget from '../../components/Dashboard/DashboardWidget';
import DashboardToolbar from '../../components/Toolbar/DashboardToolbar';
import CustomChartTooltip from '../../components/Dashboard/CustomChartTooltip';
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
import { navigateToReport } from '@/app/utils/reportNavigation';
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
import { useRouter, useSearchParams } from 'next/navigation';
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
import { add } from 'date-fns';

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

// Custom tooltip for Weekly Allocation vs Capacity chart
const WeeklyAllocCapTooltip = () => {
  const tooltipData = useAxisTooltip();
  if (!tooltipData) return null;

  const { axisValue, seriesItems } = tooltipData;
  const capacityItem = seriesItems?.find(s => s.label === 'Capacity');
  const cap = capacityItem ? Number(capacityItem.value ?? 0) : 0;
  const alloc = seriesItems
    ?.filter(s => s.label !== 'Capacity')
    .reduce((sum, s) => sum + Number(s.value ?? 0), 0) ?? 0;
  const avail = Math.round(cap - alloc);

  return (
    <Box
      sx={{
        bgcolor: 'rgba(255,255,255,0.97)',
        border: '1px solid #e2e8f0',
        borderRadius: 1.5,
        boxShadow: 4,
        p: 1.5,
        minWidth: 160,
        pointerEvents: 'none',
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5, color: '#0f172a' }}>
        {axisValue}
      </Typography>
      {avail >= 0 && (
        <Typography
          sx={{
            color: '#16a34a',
            fontWeight: 600,
            fontSize: 12,
            mb: 0.75,
            bgcolor: '#dcfce7',
            px: 1,
            py: 0.25,
            borderRadius: 1,
            display: 'inline-block',
          }}
        >
          {avail} avail
        </Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4, mt: 0.5 }}>
        <Typography sx={{ fontSize: 12, color: '#64748b' }}>Alloc</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
          {Number(alloc.toFixed(2))}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
        <Typography sx={{ fontSize: 12, color: '#64748b' }}>Cap</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
          {cap}
        </Typography>
      </Box>
    </Box>
  );
};

// Define chart sequence for each tab - EASY TO CUSTOMIZE
// Simply reorder the items in these arrays to change the sequence
const OVERVIEW_CHART_SEQUENCE = [
  'engagementScoreOverview',
  'projectHealthOverview',
  'plan_vs_actual_variance',
  'top_projects_by_variance',
  'projectFTE',
  'weeklyAllocationVsCapacity',
  'activeProjectsByType',
  'totalHeadcount',
  'allocation_by_project_type_group',
  'custom_allocation_percentage',
  'unapprovedProjectAllocation',
  'projectScoreByPM',
  'actuals_confirmation_status',
  'actualsTrendWeekly',
];

const COST_CHART_SEQUENCE = [
  'budgetVsPlanVsActual',
];

const TEAM_CHART_SEQUENCE = [
  'team_headcount_distribution',
  'teamEngagementScore',
  'projectScoreByTeam',
  'unapprovedProjectActualsByTeam',
  'resourceCoverage',
  'underAllocated',
  'overAllocated',
  'weeklyLoggedInUsersByTeam',
  'userStatusSplitByTeam',
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
      h: autoHeightWidgets.includes(key) ? 1.8 : 3,
      minW: 5,
      minH: autoHeightWidgets.includes(key) ? 1.8 : 3,
    })),
    md: chartKeys.map((key, idx) => ({
      i: key,
      x: 0,
      y: idx * 3,
      w: 12,
      h: autoHeightWidgets.includes(key) ? 1.8 : 3,
      minW: 6,
      minH: autoHeightWidgets.includes(key) ? 1.8 : 3,
    })),
    sm: chartKeys.map((key, idx) => ({
      i: key,
      x: 0,
      y: idx * 3,
      w: 12,
      h: autoHeightWidgets.includes(key) ? 1.8 : 3,
      minW: 12,
      minH: autoHeightWidgets.includes(key) ? 1.8 : 3,
    })),
  };
};

export default function ExecutiveDashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lastRequestKeyRef = useRef({});
  const teams = useSelector(state => state.teams?.teams || []);
  const projects = useSelector(state => state.projects?.projects || []);
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
    systemActiveProjects = [],
    activeProjects = [],
    activeResources = [],
    actualsConfirmed = [],
    totalResourceCost = [],
    allocationPercentage = [],
    allocation_by_project_type_group = [],
    custom_allocation_percentage = [],
    weeklyAllocationVsCapacity = [],
    top_projects_by_variance = [],
    actuals_confirmation_status = [],
    actualsTrendWeekly = [],
    teamEngagementScore = [],
    projectScoreByTeam = [],
    projectScoreByPM = [],
    projectHealthOverview = [],
    engagementScoreOverview = [],
    weeklyLoggedInUsersByTeam = [],
  } = useSelector(state => state.dashboard);
  // Persisted layouts per tab (overview, teams, costs)
  const [persistedOverviewLayouts, setPersistedOverviewLayouts] = useState(null);
  const [persistedTeamLayouts, setPersistedTeamLayouts] = useState(null);
  const [persistedCostsLayouts, setPersistedCostsLayouts] = useState(null);
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
  const [filteredUserStatusSplit, setFilteredUserStatusSplit] = useState([]);
  const { projectTypes, projectTypeGroups,locationGroups } = useSelector(
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
    '#FF6B6B', // Red
    '#FFA500', // Orange
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
  // Suppress saving during initial hydration to avoid overwriting saved layouts
  const suppressSaveRef = useRef({ overview: true, teams: true, costs: true });
  // Storage keys per tab
  const STORAGE_KEYS = useMemo(
    () => ({
      overview: 'dashboard_layout_overview',
      teams: 'dashboard_layout_teams',
      costs: 'dashboard_layout_costs',
    }),
    []
  );

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
        'systemActiveProjects',
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
        'projectScoreByTeam',
        'projectScoreByPM',
        'projectHealthOverview',
        'engagementScoreOverview',
        'weeklyAllocationVsCapacity',
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
            chartKey === 'actualsConfirmed' || chartKey === 'unapprovedProjectAllocation' || chartKey === 'unapprovedProjectActualsByTeam' || chartKey === 'projectScoreByTeam' || chartKey === 'teamEngagementScore' || chartKey === 'projectScoreByPM') &&
          selectedOption === 'week'
            ? getMonday(selectedDate).subtract(1, 'week').format('YYYY-MM-DD')
            : startDate;
        const queryEnd =
          (chartKey === 'plan_vs_actual_variance' ||
            chartKey === 'actualsConfirmed' || chartKey === 'unapprovedProjectAllocation' || chartKey === 'unapprovedProjectActualsByTeam' || chartKey === 'projectScoreByTeam' || chartKey === 'teamEngagementScore' || chartKey === 'projectScoreByPM') &&
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

  useEffect(() => {
    setFilteredUserStatusSplit(
      Array.isArray(weeklyLoggedInUsersByTeam) ? weeklyLoggedInUsersByTeam : []
    );
  }, [weeklyLoggedInUsersByTeam]);

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
      (activeResources.length > 0 || totalHeadcount.length > 0) &&
      systemActiveProjects.length > 0;

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
    systemActiveProjects,
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

  // Merge saved layouts with defaults, keeping only allowed chart ids
  const mergeLayouts = useCallback((defaults, saved, allowedIds) => {
    if (!saved || typeof saved !== 'object') return defaults;
    const result = {};
    for (const bp of Object.keys(defaults)) {
      const defaultItems = Array.isArray(defaults[bp]) ? defaults[bp] : [];
      const savedItems = Array.isArray(saved[bp]) ? saved[bp] : [];
      const filteredSaved = savedItems.filter(it => allowedIds.has(it.i));
      const byId = new Map(filteredSaved.map(it => [it.i, it]));
      result[bp] = defaultItems.map(def => byId.get(def.i) || def);
    }
    return result;
  }, []);


  // Save layout changes per tab
  const handleLayoutChange = useCallback((tab, _layout, layouts) => {
    // Prevent initial mount from overwriting saved layouts
    if (suppressSaveRef.current[tab]) return;

    try {
      const key = STORAGE_KEYS[tab];
      if (key) {
        localStorage.setItem(key, JSON.stringify(layouts));
      }
    } catch {}
    if (tab === 'overview') setPersistedOverviewLayouts(layouts);
    if (tab === 'teams') setPersistedTeamLayouts(layouts);
    if (tab === 'costs') setPersistedCostsLayouts(layouts);
  }, [STORAGE_KEYS]);

  const currentWeekMonday = getMonday(selectedDate);
  const currentWeekSunday = currentWeekMonday.add(6, 'day');
  const lastWeekMonday = currentWeekMonday.subtract(1, 'week');
  const lastWeekSunday = lastWeekMonday.add(6, 'day');

  const threeWeeksBeforeMonday = currentWeekMonday.subtract(3, 'week');
  const twoWeeksAfterSunday = currentWeekMonday.add(2, 'week').add(6, 'day');

  /**
   * Helper function to navigate to report page with filters
   * Maps chart identifiers to appropriate report types and configurations
   */
  const navigateToReportWithFilters = useCallback((chartKey, additionalFilters = null, weekData = null) => {
    // Special case: Navigate to custom tab for custom allocation chart
    if (chartKey === 'custom_allocation_percentage') {
      navigateToReport(
        advancedFilters,
        {
          reportType: 'percentageAllocation', // Dummy value for custom tab
          period: 'custom',
          customStartDate: currentWeekMonday.format('YYYY-MM-DD'),
          customEndDate: currentWeekSunday.format('YYYY-MM-DD'),
          show_actuals: 'true',
        },
        false,
        router
      );
      return ;
    }

    if (chartKey === 'weeklyAllocationVsCapacity') {
      let startDate, endDate;
      
      if (weekData && weekData.Period) {
        const weekStartDate = dayjs(weekData.Period);
        const weekMonday = weekStartDate.isoWeekday(1);
        const weekSunday = weekStartDate.isoWeekday(7);
        startDate = weekMonday.format('YYYY-MM-DD');
        endDate = weekSunday.format('YYYY-MM-DD');
      } else {
        // Default to 13-week range: 4 weeks past + current week + 8 weeks future
        const currentMonday = dayjs().isoWeekday(1);
        startDate = currentMonday.subtract(4, 'week').format('YYYY-MM-DD');
        endDate = currentMonday.add(8, 'week').isoWeekday(7).format('YYYY-MM-DD');
      }
      
      navigateToReport(
        advancedFilters,
        {
          reportType: 'allocationCapacity',
          period: 'custom',
          customStartDate: startDate,
          customEndDate: endDate,
        },
        false,
        router
      );
      return ;
    }

    // Map chart keys to report types
    const chartToReportMap = {
      // Overview charts
      'plan_vs_actual_variance': { reportType: 'resourceProjectPeriod', period: 'custom', customStartDate: lastWeekMonday.format('YYYY-MM-DD'), customEndDate: lastWeekSunday.format('YYYY-MM-DD'), },
      'top_projects_by_variance': { reportType: 'resourceProjectPeriod', period: 'custom', customStartDate: lastWeekMonday.format('YYYY-MM-DD'), customEndDate: lastWeekSunday.format('YYYY-MM-DD') },
      'projectFTE': { reportType: 'resourceProjectPeriod', period: 'custom', customStartDate: threeWeeksBeforeMonday.format('YYYY-MM-DD'),
       customEndDate: twoWeeksAfterSunday.format('YYYY-MM-DD') },
      'activeProjectsByType': { reportType: 'projectsOnly', period: 'custom', customStartDate: lastWeekMonday.format('YYYY-MM-DD'), customEndDate: lastWeekSunday.format('YYYY-MM-DD') },
      'totalHeadcount': { reportType: 'resourceOnly' },
      'allocation_by_project_type_group': { reportType: 'resourceProjectPeriod', period: 'custom', customStartDate: lastWeekMonday.format('YYYY-MM-DD'), customEndDate: lastWeekSunday.format('YYYY-MM-DD'), },
      'weeklyAllocationVsCapacity': { reportType: 'resourceProjectPeriod', period: 'custom', customStartDate: lastWeekMonday.format('YYYY-MM-DD'), customEndDate: lastWeekSunday.format('YYYY-MM-DD') },
      //actuals by category
      'unapprovedProjectAllocation': { reportType: 'resourceProjectPeriod', period: 'custom', customStartDate: lastWeekMonday.format('YYYY-MM-DD'), customEndDate: lastWeekSunday.format('YYYY-MM-DD') },
      'actuals_confirmation_status': { reportType: 'resourceProjectPeriod', period: 'custom', customStartDate: lastWeekMonday.format('YYYY-MM-DD'), customEndDate: lastWeekSunday.format('YYYY-MM-DD') },
      'engagementScoreOverview': { reportType: 'resourcePeriod', period: 'custom', customStartDate: lastWeekMonday.format('YYYY-MM-DD'), customEndDate: lastWeekSunday.format('YYYY-MM-DD') },
      'projectHealthOverview': { reportType: 'projectPeriod', period: 'custom', customStartDate: lastWeekMonday.format('YYYY-MM-DD'), customEndDate: lastWeekSunday.format('YYYY-MM-DD') },
      'projectScoreByPM': { reportType: 'projectPeriod', period: 'custom', customStartDate: lastWeekMonday.format('YYYY-MM-DD'), customEndDate: lastWeekSunday.format('YYYY-MM-DD') },
      
      // Team charts
      'team_headcount_distribution': { reportType: 'resourceOnly'},
      'teamEngagementScore': { reportType: 'resourcePeriod', period: 'custom', customStartDate: lastWeekMonday.format('YYYY-MM-DD'), customEndDate: lastWeekSunday.format('YYYY-MM-DD') },
      'projectScoreByTeam': { reportType: 'resourcePeriod', period: 'custom', customStartDate: lastWeekMonday.format('YYYY-MM-DD'), customEndDate: lastWeekSunday.format('YYYY-MM-DD') },
      'unapprovedProjectActualsByTeam': { reportType: 'resourceProjectPeriod', period: 'custom', customStartDate: currentWeekMonday.format('YYYY-MM-DD'), customEndDate: currentWeekSunday.format('YYYY-MM-DD') },
      'weeklyLoggedInUsersByTeam': { reportType: 'resourcePeriod', period: 'custom', customStartDate: currentWeekMonday.format('YYYY-MM-DD'), customEndDate: currentWeekSunday.format('YYYY-MM-DD') },
      'userStatusSplitByTeam': { reportType: 'resourcePeriod', period: 'custom', customStartDate: currentWeekMonday.format('YYYY-MM-DD'), customEndDate: currentWeekSunday.format('YYYY-MM-DD') },
      'resourceCoverage': { reportType: 'resourcePeriod', period: 'custom', customStartDate: currentWeekMonday.format('YYYY-MM-DD'), customEndDate: currentWeekSunday.format('YYYY-MM-DD') },
      'actualsTrendWeekly': { reportType: 'resourceProjectPeriod', period: 'custom' },
      'underAllocated': { reportType: 'resourcePeriod', period: 'custom', customStartDate: currentWeekMonday.format('YYYY-MM-DD'), customEndDate: currentWeekSunday.format('YYYY-MM-DD') },
      'overAllocated': { reportType: 'resourcePeriod', period: 'custom', customStartDate: currentWeekMonday.format('YYYY-MM-DD'), customEndDate: currentWeekSunday.format('YYYY-MM-DD') },
      
      // Cost charts
      'budgetVsPlanVsActual': { reportType: 'resourceProjectPeriodCost', period: 'custom', customStartDate: currentWeekMonday.format('YYYY-MM-DD'), customEndDate: currentWeekSunday.format('YYYY-MM-DD') },
    };

    if (chartKey === 'actualsTrendWeekly')
      {
        chartToReportMap['actualsTrendWeekly'] = {...chartToReportMap['actualsTrendWeekly'],...additionalFilters}
        additionalFilters = null; 
      } 

    const config = chartToReportMap[chartKey] || { reportType: 'resourceProjectPeriod', period: 'custom', customStartDate: lastWeekMonday.format('YYYY-MM-DD'), customEndDate: lastWeekSunday.format('YYYY-MM-DD') };
    
    // Add additional filters if provided
    if (additionalFilters) {
      config.additionalFilters = additionalFilters;
    }

    // Navigate with advanced filters and chart config
    navigateToReport(advancedFilters, config, false, router);
  }, [advancedFilters, router, currentWeekMonday, currentWeekSunday, lastWeekMonday, lastWeekSunday, threeWeeksBeforeMonday, twoWeeksAfterSunday]);

  const handleChartClick = chartName => {
    setSelectedChart(chartName);
    // setDialogOpen(true);
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

  // Load persisted layouts when allowed charts change (or defaults change)
  useEffect(() => {
    try {
      const allowedOverview = new Set(allowedOverviewCharts);
      const saved = localStorage.getItem(STORAGE_KEYS.overview);
      const parsed = saved ? JSON.parse(saved) : null;
      const merged = mergeLayouts(overviewLayouts, parsed, allowedOverview);
      setPersistedOverviewLayouts(merged);
      suppressSaveRef.current.overview = false;
    } catch (e) {
      setPersistedOverviewLayouts(overviewLayouts);
      suppressSaveRef.current.overview = false;
    }
  }, [overviewLayouts, allowedOverviewCharts.join(','), STORAGE_KEYS.overview, mergeLayouts]);

  useEffect(() => {
    try {
      const allowedTeams = new Set(allowedTeamCharts);
      const saved = localStorage.getItem(STORAGE_KEYS.teams);
      const parsed = saved ? JSON.parse(saved) : null;
      const merged = mergeLayouts(teamLayouts, parsed, allowedTeams);
      setPersistedTeamLayouts(merged);
      suppressSaveRef.current.teams = false;
    } catch (e) {
      setPersistedTeamLayouts(teamLayouts);
      suppressSaveRef.current.teams = false;
    }
  }, [teamLayouts, allowedTeamCharts.join(','), STORAGE_KEYS.teams, mergeLayouts]);

  useEffect(() => {
    try {
      const allowedCosts = new Set(allowedCostsCharts);
      const saved = localStorage.getItem(STORAGE_KEYS.costs);
      const parsed = saved ? JSON.parse(saved) : null;
      const merged = mergeLayouts(costsLayouts, parsed, allowedCosts);
      setPersistedCostsLayouts(merged);
      suppressSaveRef.current.costs = false;
    } catch (e) {
      setPersistedCostsLayouts(costsLayouts);
      suppressSaveRef.current.costs = false;
    }
  }, [costsLayouts, allowedCostsCharts.join(','), STORAGE_KEYS.costs, mergeLayouts]);

  // Keep active tab in sync with URL `?tab=` and validate accessibility
  useEffect(() => {
    try {
      // Don't validate tabs until permissions and query keys are loaded
      if (loadingLoginUserPrivileges || dashboardQueryKeys.length === 0) {
        return;
      }

      const accessibleTabs = ['overview','reports'];
      if (allowedTeamCharts.length > 0) accessibleTabs.push('teams');
      if (allowedCostsCharts.length > 0) accessibleTabs.push('costs');

      const tabParam = searchParams?.get('tab');
      const isValid = tabParam && accessibleTabs.includes(tabParam);

      if (!isValid) {
        const first = accessibleTabs[0] || 'overview';
        if (activeTab !== first) setActiveTab(first);
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('tab', first);
        router.replace(`/dashboard?${params.toString()}`, { scroll: false });
        return;
      }

      if (tabParam !== activeTab) {
        setActiveTab(tabParam);
      }
    } catch {}
    // Re-run when URL params or tab availability changes
  }, [searchParams, allowedTeamCharts.length, allowedCostsCharts.length, loadingLoginUserPrivileges, dashboardQueryKeys.length]);

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
          const projectTypeGroupNames = sortedVarianceData.map(
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
                  mb: 0.5,
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
                  mb: 0.75,
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
                      data: projectTypeGroupNames,
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
                  margin={{ left: 45, right: 45, top: 15, bottom: 30 }}
                  onAxisClick={(event, axisData) =>{
                    const {axisValue} = axisData;
                    const projectTypeId = projectTypeGroups.find(pt => pt.Name === axisValue)?.Id;
                  if (projectTypeId) {
                    navigateToReportWithFilters('plan_vs_actual_variance',{
                    projectTypeGroup: projectTypeId,
                    projectStatuses: ['Active', 'Approved']
                  })}
                  }
                }
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
              {/* Clickable header area */}
              <Box
                onClick={() => {
                  const projectIds = filteredTop5Projects.map(p =>
                    projects.find(proj => proj.Name === p.project_name)?.Id
                  );
                  navigateToReportWithFilters('top_projects_by_variance', {
                    project: projectIds
                  });
                }}
                sx={{
                  cursor: 'pointer',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
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
              </Box>

              <Box sx={{ flex: 1, width: '100%' }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  hideFooter
                  disableColumnMenu
                  disableRowSelectionOnClick
                  rowHeight={56}
                  onRowClick={(params, event)=>
                  {
                    event.stopPropagation(); // Prevent click from bubbling to parent
                    const projectIds = 
                  projects.find(proj => proj.Name === params.row.project_name)?.Id;
                navigateToReportWithFilters('top_projects_by_variance', {
                  project: projectIds
                });
                  }}
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
          filteredActiveProjectsByType.every(item => 
            Number(item.status_breakdown?.Active || 0) === 0 && Number(item.status_breakdown?.Approved || 0) === 0
          )
        }
        noDataMessage="No active or approved projects found for the selected filters"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Sort data in Transform -> Grow -> Run order (create copy first)
          const groupOrder = ['Transform', 'Grow', 'Run'];
          const sortedData = [...(activeProjectsByType || [])].sort((a, b) => {
            const aIdx = groupOrder.indexOf(a._type);
            const bIdx = groupOrder.indexOf(b._type);
            return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
          });

          // Extract labels
          const projectTypeLabels = sortedData.map(item => item._type);
          
          // Extract counts for each status
          const activeCounts = sortedData.map(item =>
            Number(item.status_breakdown?.Active || 0)
          );
          const approvedCounts = sortedData.map(item =>
            Number(item.status_breakdown?.Approved || 0)
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
                Active & Approved Projects by Project Type Group
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
                      label: 'No. of Projects',
                      min: 0,
                      width: config.yAxis?.width || 50,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  series={[
                    {
                      data: activeCounts,
                      id: 'activeProjects',
                      label: 'Active',
                      stack: 'total',
                      color: '#4CAF50',
                      valueFormatter: (value) => `${value} active`,
                    },
                    {
                      data: approvedCounts,
                      id: 'approvedProjects',
                      label: 'Approved',
                      stack: 'total',
                      color: '#2196F3',
                      valueFormatter: (value) => `${value} approved`,
                    },
                  ]}
                  onItemClick={(event, barItemIdentifier) => {
                    const { dataIndex, seriesId } = barItemIdentifier || {};
                    if (dataIndex !== undefined && sortedData[dataIndex]) {
                      const projectType = sortedData[dataIndex]._type;
                      const projectTypeId = projectTypeGroups.find(pt => pt.Name === projectType)?.Id;

                      const status = seriesId === 'activeProjects' ? 'Active' : 'Approved';
                      
                      if (projectTypeId) {
                        navigateToReportWithFilters('activeProjectsByType', {
                          projectTypeGroup: projectTypeId,
                          projectStatuses: [status]
                        });
                      }
                    }
                  }}
                  width={config.width}
                  height={config.height}
                  grid={{ horizontal: true }}
                  margin={{
                    top: 10,
                    bottom: 40,
                    left: 40,
                    right: 10,
                  }}
                  slots={{
                    tooltip: CustomChartTooltip,
                  }}
                  slotProps={{
                    legend: config.legend,
                    tooltip: {
                      trigger: 'item',
                      disablePortal: true,
                    },
                  }}
                  sx={{
                    cursor: 'pointer',
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
          // const employeeTypes = [
          //   { key: 'FTE', label: 'FTE', color: '#0080FF' },
          //   {
          //     key: 'Contractor - FT',
          //     label: 'Contractor - FT',
          //     color: '#00C9A7',
          //   },
          //   {
          //     key: 'Contractor - PT',
          //     label: 'Contractor - PT',
          //     color: '#FFB6B6',
          //   },
          //   { key: 'Intern', label: 'Intern', color: '#FF884D' },
          
          // ];
          // Dynamically extract employee types from the data (excluding shore_flag)
          const employeeTypes = useMemo(() => {
            if (!totalHeadcount || totalHeadcount.length === 0) return [];
            
            const firstItem = totalHeadcount[0];
            const types = Object.keys(firstItem)
              .filter(key => key !== 'shore_flag' && key !== '__typename')
              .map((key, index) => ({
                key: key,
                label: key,
                color: colorPalette[index % colorPalette.length]
              }));
            
            return types;
          }, [totalHeadcount]);

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
                  sx={{
                    cursor: 'pointer',
                  }}
                  onItemClick={(event, axisData) => {
                    const { dataIndex, seriesId } = axisData || {};
                    if (dataIndex !== undefined && sortedHeadcount[dataIndex]) {
                      const groupName = sortedHeadcount[dataIndex].shore_flag;
                      const groupId = locationGroups?.find(g => g.Name === groupName)?.Id;
                      const resource_type = seriesId; // e.g., 'FTE', 'Contractor - FT', etc.
                      if (groupId && resource_type) {
                        navigateToReportWithFilters('totalHeadcount', {
                          resourceWorkLocationGroup: groupId,
                          resourceType: resource_type
                        });
                      }
                    }
                  }}
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
          const projectTypeGroupNames = Object.keys(
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
            data: projectTypeGroupNames.map(group => {
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
                      data: projectTypeGroupNames,
                      scaleType: 'band',
                      categoryGapRatio: 0.4,
                      barGapRatio: 0.1,
                    },
                  ]}
                  yAxis={[
                    {
                      label: 'Allocation %',
                      min: 0,
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
                  sx={{
                    cursor: 'pointer',
                  }}
                  onItemClick={(event, barItemIdentifier) => {
                    const { dataIndex, seriesId } = barItemIdentifier || {};
                    if (dataIndex !== undefined && projectTypeGroupNames[dataIndex] && seriesId) {
                      const groupName = projectTypeGroupNames[dataIndex];
                      const groupId = projectTypeGroups?.find(g => g.Name === groupName)?.Id;
                      const projectTypeId = projectTypes?.find(pt => pt.Name === seriesId)?.Id;
                      if (groupId && projectTypeId) {
                        navigateToReportWithFilters('allocation_by_project_type_group', {
                          projectTypeGroup: groupId,
                          projectType: projectTypeId
                        });
                      }
                    }
                  }}
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
                  onItemClick={(event, axisData) => {
                    const { dataIndex } = axisData || {};
                    if (dataIndex !== undefined && filteredUnapprovedProjectAllocation[dataIndex]) {
                      const category = filteredUnapprovedProjectAllocation[dataIndex].category;
                      navigateToReportWithFilters('unapprovedProjectAllocation', {
                        actualsCategory: category
                      });
                    }
                  }}
                  slotProps={{
                    legend: config.legend,
                  }}
                  sx={{
                    cursor: 'pointer',
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
          actuals_confirmation_status.every(item =>
            parseFloat(item.actuals_total || 0) === 0 && parseFloat(item.planned_total || 0) === 0
          )
        }
        noDataMessage="No actuals confirmation data available for the selected period"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Extract data from API response
          const data = actuals_confirmation_status?.[0] || {};
          const actualsTotal = parseFloat(data.actuals_total || 0);
          const plannedTotal = parseFloat(data.planned_total || 0);
          const actualsPercentage = parseFloat(data.actuals_percentage || 0);
          const plannedPercentage = parseFloat(data.planned_percentage || 0);

          // Prepare data for bar chart
          const categories = ['Planned', 'Actuals'];
          const values = [plannedTotal, actualsTotal];
          const percentages = [plannedPercentage, actualsPercentage];
          const barColors = ['#4169E1', '#FFD700'];

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
              <Box sx={{ flex: 1, width: '100%', minHeight: 0 }}>
                <BarChart
                  xAxis={[
                    {
                      scaleType: 'band',
                      data: categories,
                      categoryGapRatio: 0.2,
                      barGapRatio: 0,
                    },
                  ]}
                  yAxis={[
                    {
                      label: 'Total Allocation Units',
                      min: 0,
                      width: config.yAxis?.width || 50,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  series={[
                    {
                      data: [plannedTotal,null],
                      id: 'planned',
                      label: 'Planned',
                      color: '#4169E1',
                      valueFormatter: (value) => 
                        value ? `${value.toFixed(1)} (${plannedPercentage.toFixed(1)}%)` : '',
                    },
                    {
                      data: [null,actualsTotal],
                      id: 'actuals',
                      label: 'Actuals',
                      color: '#FFD700',
                      valueFormatter: (value) => 
                        value ? `${value.toFixed(1)} (${actualsPercentage.toFixed(1)}%)` : '',
                    },
                  ]}
                  width={config.width}
                  height={config.height}
                  grid={{ horizontal: true }}
                  margin={{
                    top: 10,
                    bottom: 40,
                    left: 60,
                    right: 10,
                  }}
                  slotProps={{
                    legend: config.legend,
                  }}
                  sx={{
                    cursor: 'pointer',
                    '& .MuiChartsAxis-tickLabel': {
                      fontSize: '12px',
                      fill: '#666',
                    },
                    '& .MuiChartsAxis-label': {
                      fontSize: '13px',
                      fontWeight: 500,
                    },
                  }}
                  onAxisClick={() => {
                    navigateToReportWithFilters('actuals_confirmation_status',{
                      projectStatuses: ['Active', 'Approved']
                    })
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
        // minWidth={650}
        minHeight={300}
        autoHeight={true}
      >
        {() => {
          const data = engagementScoreOverview?.[0] || {};

          return (
            <ScoreCard
              title="Engagement Score"
              tooltipText="Measures manager and team participation in the planning process. Combines Plan Score and Actuals Score. Higher scores indicate better data quality and system adoption"
              overallScore={parseFloat(data.overall_engagement || 0)}
              overallChange={parseFloat(data.overall_engagement_change || 0)}
              overallDirection={data.overall_engagement_direction}
              subScores={[
                {
                  score: parseFloat(data.planned_engagement || 0),
                  label: 'Plan Score',
                  tooltipText: `Reflects whether resource allocations are planned for upcoming weeks. Near-term weeks are typically weighted more heavily than future weeks.`,
                  change: parseFloat(data.planned_engagement_change || 0),
                  positive: data.planned_engagement_direction !== 'down',
                },
                {
                  score: parseFloat(data.actual_engagement || 0),
                  label: 'Actuals Score',
                  tooltipText: 'Measures whether resources confirmed their weekly actuals. On-time confirmations score highest, late confirmations score partially, and missing confirmations score zero.',
                  change: parseFloat(data.actual_engagement_change || 0),
                  positive: data.actual_engagement_direction !== 'down',
                },
              ]}
              hasAccess={true}
              onClick={() => navigateToReportWithFilters('engagementScoreOverview')}
            />
          );
        }}
      </DashboardWidget>
    ),

    projectHealthOverview: (
      <DashboardWidget
        // minWidth={650}
        minHeight={300}
        autoHeight={true}
      >
        {() => {
          const data = projectHealthOverview?.[0] || {};

          return (
            <ScoreCard
              title="Projects Health Score"
              tooltipText='Measures overall project execution health. Combines Alignment Score and Health Score. Higher scores indicate projects are on track and resourced as planned.'
              overallScore={parseFloat(data.overall_project_score || 0)}
              overallChange={parseFloat(data.overall_project_score_change || 0)}
              overallDirection={data.overall_project_score_direction}
              subScores={[
                {
                  score: parseFloat(data.alignment_score || 0),
                  label: 'Alignment Score',
                  tooltipText: `Measures how closely actual time allocation matches planned allocation. Tolerance zones vary by project category (Run/Grow/Transform)`,
                  change: parseFloat(data.alignment_score_change || 0),
                  positive: data.alignment_score_direction !== 'down',
                },
                {
                  score: parseFloat(data.project_health_score || 0),
                  label: 'Health Score',
                  tooltipText: `Based on contributor-reported project status. On Track status scores highest, At Risk scores partially, Off Track scores lowest, and a lack of status scores minimally.`,
                  change: parseFloat(data.project_health_score_change || 0),
                  positive: data.project_health_score_direction !== 'down',
                },
              ]}
              hasAccess={true}
              onClick={() => navigateToReportWithFilters('projectHealthOverview',
                 {
                   projectStatuses: ['Active', 'Approved'],
                   project: data.project_uuids 
                 })}
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
                  sx={{
                    cursor: 'pointer',
                  }}
                  onAxisClick={()=> navigateToReportWithFilters('projectFTE')}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    projectScoreByPM: (
      <DashboardWidget
        minWidth={320}
        minHeight={280}
        showNoData={
          !projectScoreByPM ||
          projectScoreByPM.length === 0 ||
          projectScoreByPM.every(item =>
            Number.parseFloat(item.alignment_score || 0) === 0 &&
            Number.parseFloat(item.project_health_score || 0) === 0
          )
        }
        noDataMessage="No project score data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Aggregate data by PM
          const aggregatedData = {};
          (projectScoreByPM || []).forEach(item => {
            const pmId = item.pm_id || item.pmId || 'unknown';
            if (!aggregatedData[pmId]) {
              aggregatedData[pmId] = {
                pm_id: pmId,
                pm_name: item.pm_name || item.pmId || 'Unknown PM',
                alignment_score: 0,
                project_health_score: 0,
                count: 0,
              };
            }
            aggregatedData[pmId].alignment_score += Number.parseFloat(item.alignment_score || 0);
            aggregatedData[pmId].project_health_score += Number.parseFloat(item.project_health_score || 0);
            aggregatedData[pmId].count += 1;
          });

          // Calculate averages
          const aggregatedArray = Object.values(aggregatedData).map(item => ({
            ...item,
            alignment_score: item.alignment_score / item.count,
            project_health_score: item.project_health_score / item.count,
          }));

          // Sort by PM name
          const sortedProjects = aggregatedArray.sort((a, b) => {
            const nameA = a.pm_name || '';
            const nameB = b.pm_name || '';
            return nameA.localeCompare(nameB);
          });

          const pmIds = sortedProjects.map(item => item.pm_id || 'unknown');
          const pmNames = sortedProjects.map(item => {
            const name = item.pm_name || 'Unknown PM';
            return name.trim() === '' ? 'Unassigned' : name;
          });

          const series = [
            {
              data: sortedProjects.map(d => Number.parseFloat(d.alignment_score || 0) / 2),
              label: 'Project Alignment Score',
              id: 'alignment',
              color: '#7C93F5',
              stack: 'total',
            },
            {
              data: sortedProjects.map(d => Number.parseFloat(d.project_health_score || 0) / 2),
              label: 'Project Health Score',
              id: 'health',
              color: '#00C9A7',
              stack: 'total',
            },
          ];

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
                Project Score by Project Manager{' '}
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
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <BarChart
                  width={config.width}
                  height={config.height}
                  series={series}
                  xAxis={[
                    {
                      data: pmNames,
                      label: 'Project Manager',
                      scaleType: 'band',
                      categoryGapRatio: 0.5,
                      barGapRatio: 0.1,
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
                  sx={{
                    cursor: 'pointer',
                  }}
                  onAxisClick={(event, axisData) => {
                    const { dataIndex, axisValue } = axisData || {};
                    if (dataIndex !== undefined && pmIds[dataIndex]) {
                      const isUnassigned = pmNames[dataIndex] === 'Unassigned';
                      navigateToReportWithFilters('projectScoreByPM', {
                        projectManager: isUnassigned ? ['_BLANK_'] : [pmIds[dataIndex]],
                      });
                    }
                  }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),
    actualsTrendWeekly: (
      <DashboardWidget
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
                      valueFormatter: value => `${value}`,
                      width: config.yAxis?.width || 50,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  slotProps={{
                    legend: {
                      ...config.legend,
                      direction: 'column',
                      position: { vertical: 'bottom', horizontal: 'right' },
                      padding: { right: 5 },
                      itemmarkwidth: 12,
                      itemmarkheight: 12,
                      markgap: 8,
                      itemgap: 12,
                    },
                  }}
                  margin={{ left: 60, right: 60, top: 20, bottom: 60 }}
                  grid={{ horizontal: true }}
                  sx={{
                    cursor: 'pointer',
                  }}
                  onAxisClick={(event, axisData)=>{
                    const { dataIndex } = axisData || {};
                    if (dataIndex !== undefined && periodData[dataIndex]) {
                      const periodStart = periodData[dataIndex].period_start;
                      const endDate = dayjs(periodStart).add(6, 'day').format('YYYY-MM-DD');
                      navigateToReportWithFilters('actualsTrendWeekly', {
                        customStartDate: periodStart,
                        customEndDate: endDate
                      });
                    }
                  }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    weeklyAllocationVsCapacity: (() => {
      // Derive all unique project types across all periods (new API: ProjectTypeAllocations[].ProjectType.Name)
      const allProjectTypes = [
        ...new Set(
          (weeklyAllocationVsCapacity || []).flatMap(period =>
            (period.ProjectTypeAllocations || []).map(d => d.ProjectType?.Name).filter(Boolean)
          )
        ),
      ];

      // X-axis labels: week labels (W4, W5, ...) from new API field Week or Period
      const weekLabels = (weeklyAllocationVsCapacity || []).map(p => p.Week || p.Period);

      // Build dataset: one entry per period, with TotalAllocation per project type + TotalCapacity
      const dataset = (weeklyAllocationVsCapacity || []).map(period => {
        const entry = { week: period.Week || period.Period, capacity: Number(period.TotalCapacity || 0) };
        allProjectTypes.forEach(pt => {
          const match = (period.ProjectTypeAllocations || []).find(d => d.ProjectType?.Name === pt);
          entry[pt] = Number(match?.TotalAllocation || 0);
        });
        return entry;
      });

       const barColors = [
        '#4D79FF', '#7BBCB1', '#8B5CF694', '#F6C260',
        '#E97E7E', '#A9D18E', '#FFD700', ,
      ];

      const allZero =
        !weeklyAllocationVsCapacity ||
        weeklyAllocationVsCapacity.length === 0 ||
        weeklyAllocationVsCapacity.every(p =>
          Number(p.TotalCapacity || 0) === 0 &&
          (p.ProjectTypeAllocations || []).every(d => Number(d.TotalAllocation || 0) === 0)
        );

      return (
        <DashboardWidget
          minWidth={320}
          minHeight={320}
          showNoData={allZero}
          noDataMessage="No weekly allocation vs capacity data available"
        >
          {dimensions => {
            const config = useResponsiveChart(dimensions, 'bar');
            const chartWidth = Math.max(config.width, 400);
            const chartHeight = Math.max(config.height, 300);

            const series = [
              // One stacked bar series per project type
              ...allProjectTypes.map((pt, idx) => ({
                type: 'bar',
                dataKey: pt,
                label: pt,
                stack: 'allocation',
                color: barColors[idx % barColors.length],
              })),
              // Capacity line series
              {
                type: 'line',
                dataKey: 'capacity',
                label: 'Capacity',
                color: '#F97316',
                curve: 'linear',
                showMark: true,
              },
            ];

            return (
              <Box sx={{ pt: 1, px: 1 }}>
                <Typography
                  sx={{ fontSize: '18px', fontWeight: 600, color: '#000000DE', mb: 1 }}
                >
                  Weekly Allocation vs. Capacity
                </Typography>
                <ChartContainer
                  width={chartWidth}
                  height={chartHeight}
                  dataset={dataset}
                  series={series}
                  xAxis={[{
                    scaleType: 'band',
                    dataKey: 'week',
                    categoryGapRatio: 0.3,
                    tickLabelStyle: { color: '#475569', fontSize: 12 },
                  }]}
                  yAxis={[{ tickLabelStyle: { color: '#475569' } }]}
                  margin={{ bottom: 40, left: 40, right: 20, top: 20 }}
                  onAxisClick={(event, axisData) => {
                    // Find the week data for the clicked axis point
                    const clickedWeek = axisData?.axisValue;
                    const weekDataItem = clickedWeek ? dataset.find(d => d.week === clickedWeek) : null;
                    
                    // Pass the full week data object which includes the Period
                    const weekInfo = clickedWeek && weeklyAllocationVsCapacity 
                      ? weeklyAllocationVsCapacity.find(w => w.Week === clickedWeek || w.Period === clickedWeek)
                      : null;
                    
                    navigateToReportWithFilters('weeklyAllocationVsCapacity', null, weekInfo);
                  }}
                >
                  <BarPlot />
                  <LinePlot />
                  <MarkPlot />
                  <ChartsXAxis />
                  <ChartsYAxis />
                  <ChartsTooltip
                    trigger="axis"
                    slots={{ axisContent: WeeklyAllocCapTooltip }}
                  />
                </ChartContainer>
                {/* Custom legend so it's always visible */}
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    alignItems: 'center',
                    justifyContent: chartWidth < 400 ? 'flex-start' : 'center',
                  }}
                >
                  {allProjectTypes.map((pt, idx) => (
                    <Box
                      key={pt}
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: 0.5,
                          bgcolor: barColors[idx % barColors.length],
                        }}
                      />
                      <Typography sx={{ fontSize: 12, color: '#475569' }}>
                        {pt}
                      </Typography>
                    </Box>
                  ))}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: 22,
                        height: 2,
                        bgcolor: '#F97316',
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          right: -3,
                          top: -3,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#F97316',
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontSize: 12, color: '#475569' }}>
                      Capacity
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          }}
        </DashboardWidget>
      );
    })(),

    custom_allocation_percentage: (
      <DashboardWidget
        minWidth={320}
        minHeight={280}
        showNoData={
          !custom_allocation_percentage ||
          custom_allocation_percentage.length === 0 ||
          custom_allocation_percentage.every(item =>
            (Number(item.AllocationPercentage || 0) === 0) &&
            (Number(item.ActualsPercentage || 0) === 0)
          )
        }
        noDataMessage="No percentage allocation data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Prepare chart data
          const categories = custom_allocation_percentage.map(item => item.ProjectBucket || 'Unknown');
          const allocationData = custom_allocation_percentage.map(item => Number(item.AllocationPercentage || 0));
          const actualsData = custom_allocation_percentage.map(item => Number(item.ActualsPercentage || 0));

          return (
            <Box sx={{ pt: 1, px: 1 }}>
              <Typography
                sx={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#000000DE',
                  mb: 1,
                }}
              >
                Percentage Allocation by Project Reporting Type
              </Typography>

              <BarChart
                width={config.width}
                height={config.height}
                series={[
                  {
                    data: allocationData,
                    label: 'Allocation',
                    id: 'allocationId',
                    color: '#116086',
                  },
                  {
                    data: actualsData,
                    label: 'Actuals',
                    id: 'actualsId',
                    color: '#3790BB',
                  },
                ]}
                xAxis={[
                  {
                    data: categories,
                    scaleType: 'band',
                    categoryGapRatio: 0.3,
                    tickLabelStyle: { color: '#475569' },
                  },
                ]}
                yAxis={[
                  {
                    label: 'Percentage Allocation (%)',
                    max: 100,
                    tickLabelStyle: { color: '#475569' },
                  },
                ]}
                slotProps={{
                  legend: {
                    position: {
                      vertical: 'bottom',
                      horizontal: config.width < 400 ? 'start' : 'center',
                    },
                  },
                }}
                margin={{
                  left: config.isSmallScreen ? 40 : 20,
                  right: config.isSmallScreen ? 10 : 20,
                  top: 20,
                  bottom: config.isSmallScreen ? 40 : 20,
                }}
                grid={{ vertical: true, horizontal: true }}
                onAxisClick={(event, axisData)=> {
                  navigateToReportWithFilters('custom_allocation_percentage');
                }}
              />
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
          hasBarChartAllZeroValues(filteredbudgetVsPlanVsActual, ['budget_total', 'planned_to_date', 'actual_to_date'])
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
                  sx={{
                    cursor: 'pointer',
                  }}
                  onAxisClick={() => navigateToReportWithFilters('budgetVsPlanVsActual')}
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
              label: 'Contractors - PT',
              color: '#FFE66D',
            },
            {
              key: 'Contractor - FT',
              label: 'Contractors - FT',
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
                  margin={{ left: 20, right: 20, top: 20, bottom: 20 }}
                  grid={{ horizontal: true }}
                  sx={{
                    cursor: 'pointer',
                  }}
                  onItemClick={(event, barItemIdentifier ) => {
                    const { dataIndex, seriesId } = barItemIdentifier  || {};
                    if (dataIndex !== undefined && seriesId) {
                      const teamname = sortedTeamHeadcount[dataIndex]?.team_name;
                      const teamId = teams.find(t => t.Name === teamname)?.Id;
                      if (teamId && seriesId) {
                        navigateToReportWithFilters('team_headcount_distribution', {
                          resourceStatuses: 'Active',
                          team: teamId,
                          resourceType: seriesId,
                        });
                      }
                  }}}
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
                Project Actuals Breakdown by Team{' '}
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
                      valueFormatter: value => `${value}%`,
                      width: config.yAxis?.width || 50,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  slotProps={{
                    legend: config.legend,
                  }}
                  grid={{ horizontal: true }}
                  sx={{
                    cursor: 'pointer',
                  }}
                  onAxisClick={(event, axisData) =>{
                    const { dataIndex, axisValue } = axisData || {};
                    if (dataIndex !== undefined && axisValue) {
                      const teamId = teams.find(d => d.Name === axisValue)?.Id;
                      if (teamId) {
                        navigateToReportWithFilters('unapprovedProjectActualsByTeam', {
                         team: teamId,
                        });
                      }
                    }
                  }}
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
                Percentage Allocation by Teams
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
                      label: 'Allocation',
                      id: 'coverage',
                      color: '#FF884D',
                      valueFormatter: (value) => `${value?.toFixed(1)}%`,
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
                      label: 'Allocation %',
                      min: 0,
                      width: config.yAxis?.width || 50,
                      valueFormatter: value => `${value}%`,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  slots={{
                    tooltip: CustomChartTooltip,
                  }}
                  slotProps={{
                    legend: config.legend,
                    bar: {
                      borderradius: 2,
                      barwidth: 0.4,
                    },
                    tooltip: {
                      trigger: 'item',
                      disablePortal: true,
                    },
                  }}
                  grid={{ horizontal: true }}
                  sx={{
                    cursor: 'pointer',
                  }}
                  onAxisClick={(event, axisData) => {
                    const { dataIndex, axisValue } = axisData || {};
                    if (dataIndex !== undefined && axisValue) {
                      const teamId = teams.find(t => t.Name === axisValue)?.Id;
                      if (teamId) {
                        navigateToReportWithFilters('resourceCoverage', {
                          team: teamId
                        });
                      }
                    }
                  }}
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
                  sx={{
                    cursor: 'pointer',
                  }}
                  onAxisClick={(event, axisData) => {
                    const { dataIndex, axisValue } = axisData || {};
                    if (dataIndex !== undefined && axisValue) {
                      const teamId = teams.find(t => t.Name === axisValue)?.Id;
                      if (teamId) {
                        navigateToReportWithFilters('underAllocated', {
                          team: teamId,
                          utilization: 'Under-allocated'
                        });
                      }
                    }
                  }}
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
                  sx={{
                    cursor: 'pointer',
                  }}
                  onAxisClick={(event, axisData) => {
                    const { dataIndex, axisValue } = axisData || {};
                    if (dataIndex !== undefined && axisValue) {
                      const teamId = teams.find(t => t.Name === axisValue)?.Id;
                      if (teamId) {
                        navigateToReportWithFilters('overAllocated', {
                          team: teamId,
                          utilization: 'Over-allocated'
                        });
                      }
                    }
                  }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    teamEngagementScore: (
      <DashboardWidget
        minWidth={320}
        minHeight={280}
        showNoData={
          !teamEngagementScore ||
          teamEngagementScore.length === 0 ||
          hasStackedChartAllZeroValues(teamEngagementScore, [
            'avg_engagement_score',
          ])
        }
        noDataMessage="No engagement score data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Sort by combined (actuals + planning) engagement contribution descending
          const sortedEngagementData = sortByTotal(
            teamEngagementScore || [],
            ['avg_actuals_engagement', 'avg_planning_engagement']
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
                Engagement Score by Teams{' '}
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
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <BarChart
                  width={config.width}
                  height={config.height}
                  series={[
                    {
                      data: sortedEngagementData.map(d =>
                        Number.parseFloat(d.avg_planning_engagement || 0) / 2
                      ),
                      label: 'Planned Score',
                      id: 'engagementPlannedScore',
                      color: '#7C93F5',
                      stack: 'total',
                    },
                    {
                      data: sortedEngagementData.map(d =>
                        Number.parseFloat(d.avg_actuals_engagement || 0) / 2
                      ),
                      label: 'Actuals Score',
                      id: 'engagementActualsScore',
                      color: '#00C9A7',
                      stack: 'total',
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
                      width: config.yAxis?.width || 50,
                      valueFormatter: value => `${value}%`,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  slotProps={{
                    legend: config.legend,
                  }}
                  grid={{ horizontal: true }}
                  sx={{
                    cursor: 'pointer',
                  }}
                  onAxisClick={(event, axisData) => {
                    const { dataIndex, axisValue } = axisData || {};
                    if (dataIndex !== undefined && axisValue) {
                      const teamId = teams.find(t => t.Name === axisValue)?.Id;
                      if (teamId) {
                        navigateToReportWithFilters('teamEngagementScore', {
                          team: teamId
                        });
                      }
                    }
                  }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    weeklyLoggedInUsersByTeam: (
      <DashboardWidget
        minWidth={320}
        minHeight={280}
        showNoData={
          !weeklyLoggedInUsersByTeam ||
          weeklyLoggedInUsersByTeam.length === 0 ||
          hasBarChartAllZeroValues(weeklyLoggedInUsersByTeam, [
            'active_users',
            'logged_in_last_week',
          ])
        }
        noDataMessage="No weekly logged in users data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Sort by total active users descending
          const sortedLoggedInData = sortBarChartData(
            weeklyLoggedInUsersByTeam || [],
            'active_users'
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
                Weekly Logged in Users
              </Typography>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <BarChart
                  width={config.width}
                  height={config.height}
                  series={[
                    {
                      data: sortedLoggedInData.map(d =>
                        Number.parseInt(d.active_users || 0)
                      ),
                      label: 'Total Active Users',
                      id: 'totalActiveUsers',
                      color: '#4169E1',
                    },
                    {
                      data: sortedLoggedInData.map(d =>
                        Number.parseInt(d.logged_in_last_week || 0)
                      ),
                      label: 'Weekly Logged in Users',
                      id: 'weeklyLoggedInUsers',
                      color: '#FFD700',
                    },
                  ]}
                  xAxis={[
                    {
                      data: sortedLoggedInData.map(d =>
                        formatTeamName(
                          d.team_name,
                          dimensions.width < 400 ? 10 : 12,
                          sortedLoggedInData.length
                        )
                      ),
                      label: 'Team',
                      scaleType: 'band',
                      tickLabelStyle: config.xAxis?.tickLabelStyle,
                    },
                  ]}
                  yAxis={[
                    {
                      label: 'No. of Users',
                      min: 0,
                      width: config.yAxis?.width || 50,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
                  slotProps={{
                    legend: config.legend,
                  }}
                  grid={{ horizontal: true }}
                  sx={{
                    cursor: 'pointer',
                  }}
                  onAxisClick={(event, axisData) => {
                    const { dataIndex, axisValue } = axisData || {};
                    if (dataIndex !== undefined && axisValue) {
                      const teamId = teams.find(t => t.Name === axisValue)?.Id;
                      if (teamId) {
                        navigateToReportWithFilters('weeklyLoggedInUsersByTeam', {
                          team: teamId
                        });
                      }
                    }
                  }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    projectScoreByTeam: (
      <DashboardWidget
        minWidth={320}
        minHeight={280}
        showNoData={
          !projectScoreByTeam ||
          projectScoreByTeam.length === 0 ||
          hasStackedChartAllZeroValues(projectScoreByTeam, [
            'avg_alignment_score',
            'avg_project_health_score',
          ])
        }
        noDataMessage="No project score data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Sort by combined (alignment + health) score descending
          const sortedProjectScoreData = sortByTotal(
            projectScoreByTeam || [],
            ['avg_alignment_score', 'avg_project_health_score']
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
                Project Score by Teams{' '}
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
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <BarChart
                  width={config.width}
                  height={config.height}
                  series={[
                    {
                      data: sortedProjectScoreData.map(d =>
                        Number.parseFloat(d.avg_alignment_score || 0) / 2
                      ),
                      label: 'Alignment Score',
                      id: 'alignmentScore',
                      color: '#7C93F5',
                      stack: 'total',
                    },
                    {
                      data: sortedProjectScoreData.map(d =>
                        Number.parseFloat(d.avg_project_health_score || 0) / 2
                      ),
                      label: 'Health Score',
                      id: 'healthScore',
                      color: '#00C9A7',
                      stack: 'total',
                    }, 
                  ]}
                  xAxis={[
                    {
                      data: sortedProjectScoreData.map(d =>
                        formatTeamName(
                          d.team_name,
                          dimensions.width < 400 ? 10 : 12,
                          sortedProjectScoreData.length
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
                  sx={{
                    cursor: 'pointer',
                  }}
                  onAxisClick={(event, axisData) => {
                    const { dataIndex, axisValue } = axisData || {};
                    if (dataIndex !== undefined && axisValue) {
                      const teamId = teams.find(t => t.Name === axisValue)?.Id;
                      if (teamId) {
                        navigateToReportWithFilters('projectScoreByTeam', {
                          team: teamId
                        });
                      }
                    }
                  }}
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    userStatusSplitByTeam: (
      <DashboardWidget
        minWidth={320}
        minHeight={280}
        showNoData={
          !filteredUserStatusSplit ||
          filteredUserStatusSplit.length === 0 ||
          filteredUserStatusSplit.every(item => {
            const splits = item.user_status_split || {};
            return (
              Number(splits['Active'] || 0) === 0 &&
              Number(splits['Invited'] || 0) === 0 &&
              Number(splits['Not Invited'] || 0) === 0
            );
          })
        }
        noDataMessage="No invite status data available"
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');

          // Define status types and their colors
          const statusTypes = [
            { key: 'Active', label: 'Active', color: '#00C49F' },
            { key: 'Invited', label: 'Invited', color: '#FFD966' },
            { key: 'Not Invited', label: 'Not Invited', color: '#FDAA5D' },
          ];

          // Sort teams by total users descending
          const sortedUserStatusData = [
            ...(filteredUserStatusSplit || []),
          ].sort((a, b) => {
            const aTotal = statusTypes.reduce(
              (sum, type) =>
                sum + Number(a.user_status_split?.[type.key] || 0),
              0
            );
            const bTotal = statusTypes.reduce(
              (sum, type) =>
                sum + Number(b.user_status_split?.[type.key] || 0),
              0
            );
            return bTotal - aTotal;
          });

          // Extract team names from sorted data
          const teamNames = sortedUserStatusData.map(item =>
            formatTeamName(
              item.team_name,
              dimensions.width < 400 ? 8 : 10,
              sortedUserStatusData.length
            )
          );

          // Create series data for each status type
          const seriesData = statusTypes.map(type => ({
            label: type.label,
            id: type.key,
            data: sortedUserStatusData.map(item =>
              Number(item.user_status_split?.[type.key] || 0)
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
                Invite Status by Team
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
                      label: 'No. of Users',
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
                  margin={{ left: 20, right: 20, top: 20, bottom: 20 }}
                  grid={{ horizontal: true }}
                  sx={{
                    cursor: 'pointer',
                  }}
                  onItemClick={(event, barItemIdentifier) => {
                    const { dataIndex, seriesId } = barItemIdentifier || {};
                    if (dataIndex !== undefined && seriesId) {
                      const teamname = sortedUserStatusData[dataIndex]?.team_name;
                      const teamId = teams.find(t => t.Name === teamname)?.Id;
                      if (teamId && seriesId) {
                        navigateToReportWithFilters('userStatusSplitByTeam', {
                          // resourceStatuses: seriesId,
                          team: teamId,
                        });
                      }
                    }
                  }}
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
            onChange={(e, val) => {
              setActiveTab(val);
              const params = new URLSearchParams(searchParams?.toString() || '');
              params.set('tab', val);
              router.replace(`/dashboard?${params.toString()}`, { scroll: false });
            }}
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
            <DashboardToolbar
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              anchorEl={anchorEl}
              setAnchorEl={setAnchorEl}
            />
        </Tabs>
      </CommonToolbar>
      {activeTab !== 'reports' && <Topbar />}
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
              systemActiveProjects={systemActiveProjects}
              activeResources={activeResources}
              actualsConfirmed={filteredActualsConfirmed}
              totalResourceCost={totalResourceCost}
              allocationPercentage={filteredAllocationPercentage}
              hasAccessToQueryKey={hasAccessToQueryKey}
              advancedFilters={advancedFilters}
              selectedDate={selectedDate}
            />
            <ResponsiveGridLayout
              className="layout"
              layouts={persistedOverviewLayouts || overviewLayouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768 }}
              cols={{ lg: 12, md: 12, sm: 12 }}
              rowHeight={130}
              onLayoutChange={(layout, layouts) => handleLayoutChange('overview', layout, layouts)}
              isDraggable
              isResizable
              draggableHandle=".drag-handle"
              compactType="vertical"
              style={{ padding: '0 16px' }}
            >
              {allowedOverviewCharts.map(key => (
                <div
                  key={key}
                  className={
                    [
                      key === 'engagementScoreOverview' ||
                        key === 'projectHealthOverview'
                        ? 'auto-height-widget'
                        : '',
                      key === 'plan_vs_actual_variance'
                        ? 'plan-vs-actual-adjust'
                        : '',
                      key === 'projectFTE'
                        ? 'allocation-trends-adjust'
                        : '',
                      key === 'unapprovedProjectAllocation'
                        ? 'actuals-by-category-adjust'
                        : '',
                      key === 'totalHeadcount'
                        ? 'total-headcount-adjust'
                        : '',
                    ].join(' ')}
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
              layouts={persistedTeamLayouts || teamLayouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768 }}
              cols={{ lg: 12, md: 12, sm: 12 }}
              rowHeight={130}
              onLayoutChange={(layout, layouts) => handleLayoutChange('teams', layout, layouts)}
              isDraggable
              isResizable
              draggableHandle=".drag-handle"
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
            layouts={persistedCostsLayouts || costsLayouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 12, sm: 12 }}
            rowHeight={130}
            onLayoutChange={(layout, layouts) => handleLayoutChange('costs', layout, layouts)}
            isDraggable
            isResizable
            draggableHandle=".drag-handle"
            compactType="vertical"
            style={{ padding: '0 16px' }}
          >
            {allowedCostsCharts.map(key => (
              <div key={key}>{costsCharts[key]}</div>
            ))}
          </ResponsiveGridLayout>
        </>
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
