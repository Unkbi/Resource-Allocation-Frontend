'use client';

import Overview from '../../components/Dashboard/OverviewCards';
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
import { Responsive, WidthProvider } from 'react-grid-layout';
import { LineChart, PieChart, BarChart, pieArcLabelClasses } from '@mui/x-charts';
import DashboardWidget from '../../components/Dashboard/DashboardWidget';
import DashboardToolbar from '../../components/Toolbar/DashboardToolbar';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardChart, fetchInventoryMetrics } from '../../redux/actions/dashboardAction';
import { startMultipleChartsLoading, setDashboardLoading } from '../../redux/reducers/dashboardReducer';
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

dayjs.extend(isoWeek);
dayjs.extend(weekday);
dayjs.extend(utc);

const ResponsiveGridLayout = WidthProvider(Responsive);

dayjs.extend(quarterOfYear);

// Define all dashboard chart keys
const chartKeys = [
  'activeProjects',
  'activeProjectsByType',
  'activeResources',
  'resourceFTEContractorRatio',
  'totalHeadcount',
  'capacityAvailability',
  'resourceCoverage',
  'resourceUtilization',
  'unapprovedProjectActualsByTeam',
  'unapprovedProjectAllocation',
  'budgetVsPlanVsActual',
  'totalResourceCost',
  'allocationPercentage',
  'projectFTE',
  'actualsConfirmed',
  'resourceActualsDeviation',
  'underAllocated',
  'overAllocated'
];

const layouts = {
  lg: chartKeys.map((key, idx) => ({
    i: key,
    x: (idx % 2) * 6,
    y: Math.floor(idx / 2) * 3,
    w: 6,
    h: 3,
    minW: 5, // Minimum width in grid units (adjust as needed)
    minH: 3,
  })),
  md: chartKeys.map((key, idx) => ({
    i: key,
    x: 0,
    y: idx * 3,
    w: 12,
    h: 3,
    minW: 6, // Minimum width for medium screens
    minH: 3,
  })),
  sm: chartKeys.map((key, idx) => ({
    i: key,
    x: 0,
    y: idx * 3,
    w: 12,
    h: 3,
    minW: 12, // Minimum width for small screens
    minH: 3,
  })),
};

export default function ExecutiveDashboardPage() {
  const dispatch = useDispatch();
  const lastRequestKeyRef = useRef({});
  const teams = useSelector(state => state.teams?.teams || []);
  const advancedFilters = useSelector(state => state.dashboard.advancedFilters || {});
  const dashboardLoading = useSelector(state => state.dashboard.loading);
  const [initialLoad, setInitialLoad] = useState(true);

  const capacityAvailability = useSelector(
    state => state.dashboard.capacityAvailability || []
  );
  const coverageData = useSelector(
    state => state.dashboard.resourceCoverage || []
  );
  const projectFTEData = useSelector(state => state.dashboard.projectFTE || []);
  const {
    budgetVsPlanVsActual = [],
    resourceUtilization = [],
    resourceActualsDeviation = [],
    resourceFTEContractorRatio = [],
    unapprovedProjectAllocation = [],
    unapprovedProjectActualsByTeam = [],
    activeProjectsByType = [],
    totalHeadcount = [],
    activeProjects = [],
    activeResources = [],
    actualsConfirmed = [],
    totalResourceCost = [],
    allocationPercentage = [],
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

  // Memoize groupColorMap at component level so it's available for CSS generation
  const groupColorMap = useMemo(() => {
    if (!filteredProjectFTEData || filteredProjectFTEData.length === 0)
      return {};

    const colorPalette = [
      '#0080FF',
      '#00C9A7',
      '#FFA500',
      '#e66767ff',
      '#9C27B0',
      '#FF5722',
      '#4CAF50',
      '#FFB74D',
      '#80CBC4',
      '#9FA8DA',
      '#FF884D',
      '#FFC233',
      '#FFB6B6',
      '#CE93D8',
      '#A1887F',
    ];

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

  useEffect(() => {
    const saved = localStorage.getItem('dashboardLayout');
    const parsed = saved ? JSON.parse(saved) : layouts.md;
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

  // Memoize selected team path array (or null)
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

      // Define charts that need to be fetched (excluding computed ones like underAllocated/overAllocated)
      // Inventory metrics charts (grouped - single API call)
      const inventoryMetricsCharts = [
        'activeProjects',
        'activeProjectsByType',
        'activeResources',
        'totalHeadcount',
        'resourceFTEContractorRatio',
      ];

      // Individual charts (separate API calls)
      const individualCharts = [
        'resourceActualsDeviation',
        'unapprovedProjectAllocation',
        'projectFTE',
        'capacityAvailability',
        'resourceCoverage',
        'resourceUtilization',
        'unapprovedProjectActualsByTeam',
        'budgetVsPlanVsActual',
        'totalResourceCost',
        'allocationPercentage',
        'actualsConfirmed',
        
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
      if (lastRequestKeyRef.current[inventoryMetricsKey] !== inventoryRequestKey) {
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
          (chartKey === 'resourceActualsDeviation' || chartKey === 'actualsConfirmed') && selectedOption === 'week'
            ? getMonday(selectedDate).subtract(1, 'week').format('YYYY-MM-DD')
            : startDate;
        const queryEnd =
          (chartKey === 'resourceActualsDeviation' || chartKey === 'actualsConfirmed') && selectedOption === 'week'
            ? getMonday(selectedDate).subtract(1, 'week').add(6, 'day').format('YYYY-MM-DD')
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
    if (coverageData.length > 0) {
      setFilteredCoverageData(coverageData);
    }
  }, [coverageData]);

  useEffect(() => {
    if (overAllocated.length > 0) {
      setFilteredOverAllocated(overAllocated);
    }
    if (underAllocated.length > 0) {
      setFilteredUnderAllocated(underAllocated);
    }

    if (originalCapacityData.length > 0) {
      setFilteredCapacityData(originalCapacityData);
    }

    if (originalUnapprovedActualsByTeam.length > 0) {
      setFilteredUnapprovedActualsByTeam(originalUnapprovedActualsByTeam);
    }
  }, [
    overAllocated,
    underAllocated,
    originalCapacityData,
    originalUnapprovedActualsByTeam,
  ]);

  useEffect(() => {
    if (projectFTEData.length > 0) {
      // Backend returns already-filtered data
      setFilteredProjectFTEData(projectFTEData);
    }
  }, [projectFTEData]);

  useEffect(() => {
    if (activeProjectsByType.length > 0) {
      // Backend returns already-filtered data
      setFilteredActiveProjectsByType(activeProjectsByType);
    }
  }, [activeProjectsByType]);

  // Calculate the Monday of the selected week
  const getMonday = date => {
    const day = date.day();
    return date.subtract(day === 0 ? 6 : day - 1, 'day'); // Adjust for Sunday (day 0)
  };

  const filterDataByDate = date => {
    const monday = getMonday(date).format('YYYY-MM-DD');

    const capacityData = capacityAvailability;
    const underAllocated = resourceUtilization.filter(
      d => d.allocation_status === 'under-allocated'
    );

    const overAllocated = resourceUtilization.filter(
      d => d.allocation_status === 'over-allocated'
    );

    const unapprovedAllocation = unapprovedProjectAllocation;

    const actualsconfirmed = actualsConfirmed;

    const unapprovedActualsByTeam = unapprovedProjectActualsByTeam;

    const actualdeviation = resourceActualsDeviation;

    const filterallocationpercentage = allocationPercentage;

    setOverAllocated(overAllocated);
    setUnderAllocated(underAllocated);
    setFilteredCapacityData(capacityData);
    setOriginalCapacityData(capacityData);
    setFilteredUnderAllocated(underAllocated);
    setFilteredOverAllocated(overAllocated);
    setFilteredUnapprovedProjectAllocation(unapprovedAllocation);
    setFilteredActualsConfirmed(actualsconfirmed);
    setOriginalUnapprovedActualsByTeam(unapprovedActualsByTeam);
    setFilteredActualDeviation(actualdeviation);
    setFilteredAllocationPercentage(filterallocationpercentage);
  };

  useEffect(() => {
    filterDataByDate(selectedDate);
  }, []);

  useEffect(() => {
    // Check if all required data is loaded
    const allDataLoaded =
      capacityAvailability.length > 0 &&
      resourceUtilization.length > 0 &&
      unapprovedProjectAllocation.length > 0 &&
      actualsConfirmed.length > 0 &&
      unapprovedProjectActualsByTeam.length > 0 &&
      resourceActualsDeviation.length > 0 &&
      allocationPercentage.length > 0 &&
      // Check inventory metrics data
      (activeProjects.length > 0 || activeProjectsByType.length > 0) &&
      (activeResources.length > 0 || resourceFTEContractorRatio.length > 0 || totalHeadcount.length > 0);
    filterDataByDate(selectedDate);
    if (allDataLoaded) {

      // Turn off loading when all data is loaded
      if (initialLoad) {
        setInitialLoad(false);
        // Loading will be turned off automatically by the reducer when all charts are loaded
      }
    }
  }, [
    capacityAvailability,
    resourceUtilization,
    actualsConfirmed,
    unapprovedProjectAllocation,
    unapprovedProjectActualsByTeam,
    resourceActualsDeviation,
    allocationPercentage,
    activeProjects,
    activeProjectsByType,
    activeResources,
    resourceFTEContractorRatio,
    totalHeadcount,
    selectedDate,
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
    if (loadingLoginUserPrivileges) return false;

    const queryDetails = dashboardQueryKeys?.find(
      qk => qk.QueryKey === queryKey
    );
    if (!queryDetails) return false;
    if (loginUserPrivileges === null) return false;

    const hasAccess = queryDetails?.Entities.every(
      entity => loginUserPrivileges[entity]?.r
    );

    return hasAccess;
  };

  // Dynamically generate layouts for all charts in allowedQueries
  const chartKeys = [
    ...Object.keys(queries),
    'underAllocated',
    'overAllocated',
  ].filter(queryKey => hasAccessToQueryKey(queryKey));

  const layouts = {
    lg: chartKeys.map((key, idx) => ({
      i: key,
      x: (idx % 2) * 6,
      y: Math.floor(idx / 2) * 3,
      w: 6,
      h: 3,
      minW: 5, // Minimum width in grid units (adjust as needed)
      minH: 3,
    })),
    md: chartKeys.map((key, idx) => ({
      i: key,
      x: 0,
      y: idx * 3,
      w: 12,
      h: 3,
      minW: 6, // Minimum width for medium screens
      minH: 3,
    })),
    sm: chartKeys.map((key, idx) => ({
      i: key,
      x: 0,
      y: idx * 3,
      w: 12,
      h: 3,
      minW: 12, // Minimum width for small screens
      minH: 3,
    })),
  };

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
    resourceActualsDeviation: (
      <DashboardWidget
        onClick={() => handleChartClick('Actual Vs Plan Deviation')}
        minWidth={320}
        minHeight={280}
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
                Actual Vs Plan Deviation{' '}
                <span
                  style={{
                    fontSize: dimensions.width < 400 ? '12px' : '14px',
                    color: 'rgba(0, 0, 0, 0.6)',
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
                      data:
                        filteredActualDeviation.length > 0
                          ? [
                              {
                                id: 0,
                                value: Number.parseFloat(
                                  filteredActualDeviation[0].deviation_pct
                                ),
                                label: 'Deviation',
                                color: '#FF7043',
                              },
                              {
                                id: 1,
                                value: Number.parseFloat(
                                  filteredActualDeviation[0].in_plan_pct
                                ),
                                label: 'In Plan',
                                color: '#80CBC4',
                              },
                            ]
                          : [],
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

    activeProjectsByType: (
      <DashboardWidget
        onClick={() =>
          handleChartClick('Active Projects by Project Type Group')
        }
        minWidth={320}
        minHeight={280}
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
                Active Projects by Project Type Group
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
                      data: (filteredActiveProjectsByType || []).map(
                        (item, idx) => {
                          // Map UUID project type to name
                          const projectType = projectTypes?.find(
                            pt => pt.Name === item._type
                          );
                          const typeName = projectType
                            ? projectType.Name
                            : item._type;
                          const typeColor = projectType
                            ? projectType.Color
                            : item.Color;

                          return {
                            id: idx,
                            value: Number(item.count),
                            label: truncateLabel(
                              typeName,
                              dimensions.width < 400 ? 12 : 14
                            ),
                            color: typeColor || undefined,
                          };
                        }
                      ),
                      innerRadius: 70,
                      arcLabel: (item) => `${item.data}`,
                      arcLabelRadius: '70%',
                      outerRadius: config.outerRadius || 80,
                      cornerRadius: 3,
                      highlightScope: { faded: 'global', highlighted: 'item' },
                      faded: { additionalRadius: -10, color: 'gray' },
                    },
                  ]}
                  width={config.width}
                  height={config.height}
                  sx={{
                    [`& .${pieArcLabelClasses.root}`]: {
                      fontSize: '12px',
                      fontWeight: 600,
                    },
                  }}
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

    totalHeadcount: (
      <DashboardWidget
        onClick={() => handleChartClick('Total Headcount Breakdown')}
        minWidth={320}
        minHeight={280}
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');
          
          // Transform the data structure from API
          // API returns: [{shore_flag: "Onshore", FTE: 55, "Contractor - FT": 10, ...}, {...}]
          const shoreLabels = (totalHeadcount || []).map(item => item.shore_flag);
          
          // Define employee types and their colors
          const employeeTypes = [
            { key: 'FTE', label: 'FTE', color: '#0080FF' },
            { key: 'Contractor - FT', label: 'Contractor - FT', color: '#00C9A7' },
            { key: 'Contractor - PT', label: 'Contractor - PT', color: '#FFB6B6' },
            { key: 'Intern', label: 'Intern', color: '#FF884D' },
          ];
          
          // Create series data for each employee type
          const seriesData = employeeTypes.map(type => ({
            label: type.label,
            id: type.key,
            data: (totalHeadcount || []).map(item => Number(item[type.key] || 0)),
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
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    unapprovedProjectAllocation: (
      <DashboardWidget
        onClick={() => handleChartClick('Unplanned Allocation Units')}
        minWidth={320}
        minHeight={280}
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
                Unplanned Allocation Units
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

    // resourceFTEContractorRatio: (
    //   <DashboardWidget
    //     onClick={() => handleChartClick('FTE vs Contractor Ratio')}
    //     minWidth={320}
    //     minHeight={280}
    //   >
    //     {dimensions => {
    //       const config = useResponsiveChart(dimensions, 'bar');
          
    //       // Use the same data as totalHeadcount but show only FTE vs Contractor summary
    //       const shoreLabels = (resourceFTEContractorRatio || []).map(item => item.shore_flag);
          
    //       return (
    //         <Box
    //           sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
    //         >
    //           <Typography
    //             variant="h6"
    //             sx={{
    //               mb: 1,
    //               fontSize: dimensions.width < 400 ? '16px' : '18px',
    //               fontWeight: 600,
    //             }}
    //           >
    //             FTE vs Contractor Ratio
    //           </Typography>
    //           <Box sx={{ flex: 1, overflow: 'hidden' }}>
    //             <BarChart
    //               width={config.width}
    //               height={config.height}
    //               series={[
    //                 {
    //                   data: (resourceFTEContractorRatio || []).map(d =>
    //                     Number(d.fte_cnt || d.FTE || 0)
    //                   ),
    //                   label: 'FTE',
    //                   id: 'fteCount',
    //                   color: '#4CAF50',
    //                   stack: 'total',
    //                 },
    //                 {
    //                   data: (resourceFTEContractorRatio || []).map(d =>
    //                     Number(d.contractor_cnt || 0)
    //                   ),
    //                   label: 'Contractor',
    //                   id: 'contractorCount',
    //                   color: '#FF5722',
    //                   stack: 'total',
    //                 },
    //               ]}
    //               xAxis={[
    //                 {
    //                   data: shoreLabels,
    //                   label: 'Location',
    //                   scaleType: 'band',
    //                 },
    //               ]}
    //               yAxis={[
    //                 {
    //                   label: 'No. of Resources',
    //                   min: 0,
    //                   width: config.yAxis?.width || 50,
    //                   labelStyle: config.yAxis?.labelStyle,
    //                 },
    //               ]}
    //               slotProps={{
    //                 legend: config.legend,
    //               }}
    //             />
    //           </Box>
    //         </Box>
    //       );
    //     }}
    //   </DashboardWidget>
    // ),
  };

  const projectCharts = {
    projectFTE: (
      <DashboardWidget
        onClick={() =>
          handleChartClick('Monthly Allocation Trends - Planned vs Actual')
        }
        minWidth={320}
        minHeight={280}
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

          // Create series for each project type group
          const allSeries = [];

          Object.keys(groupedData).forEach(group => {
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
              if (idx === 3 && (actual_pct === null || actual_pct === undefined || actual_pct === 0)) {
                return null;
              }
              
              // For past weeks (idx < 3): treat null/undefined as null, but keep 0 as 0
              if (idx < 3 && (actual_pct === null || actual_pct === undefined)) {
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

    budgetVsPlanVsActual: (
      <DashboardWidget
        onClick={() =>
          handleChartClick('Budget vs Planned vs Actual by Project')
        }
        minWidth={320}
        minHeight={280}
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');
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
                      data: filteredbudgetVsPlanVsActual.map(d =>
                        Number.parseFloat(d.budget_total)
                      ),
                      label: 'Budget',
                      id: 'budget',
                      color: '#9FA8DA',
                    },
                    {
                      data: filteredbudgetVsPlanVsActual.map(d =>
                        Number.parseFloat(d.planned_to_date)
                      ),
                      label: 'Planned',
                      id: 'planned',
                      color: '#80CBC4',
                    },
                    {
                      data: filteredbudgetVsPlanVsActual.map(d =>
                        Number.parseFloat(d.actuals_to_date)
                      ),
                      label: 'Actuals',
                      id: 'actual',
                      color: '#FFB74D',
                    },
                  ]}
                  xAxis={[
                    {
                      data: filteredbudgetVsPlanVsActual.map(
                        d => d.project_name
                      ),
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
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),
  };

  const teamCharts = {
    unapprovedProjectActualsByTeam: (
      <DashboardWidget
        onClick={() => handleChartClick('Project Actuals Breakdown by Team')}
        minWidth={320}
        minHeight={280}
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');
          const uniqueTeams = [
            ...new Set(filteredUnapprovedActualsByTeam.map(d => d.team_name)),
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
                    data: uniqueTeams.map(team => {
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
                      data: [
                        ...new Set(
                          filteredUnapprovedActualsByTeam.map(d => {
                            return formatTeamName(
                              d.team_name,
                              dimensions.width < 400 ? 10 : 12,
                              filteredUnapprovedActualsByTeam.length
                            );
                          })
                        ),
                      ],
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
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    capacityAvailability: (
      <DashboardWidget
        onClick={() => handleChartClick('Capacity vs Utilization by Team')}
        minWidth={320}
        minHeight={280}
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');
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
                Capacity vs Utilization by Team
              </Typography>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <BarChart
                  width={config.width}
                  height={config.height}
                  series={[
                    {
                      data: filteredCapacityData.map(d =>
                        Number.parseFloat(d.capacity_available_fte)
                      ),
                      label: 'Available Capacity',
                      id: 'availableCapacity',
                      color: '#9FA8DA',
                    },
                    {
                      data: filteredCapacityData.map(d =>
                        Number.parseFloat(d.capacity_allocated_fte)
                      ),
                      label: 'Utilized Capacity',
                      id: 'utilizedCapacity',
                      color: '#80CBC4',
                    },
                  ]}
                  xAxis={[
                    {
                      data: [
                        ...new Set(
                          filteredCapacityData.map(d =>
                            formatTeamName(
                              d.team_name,
                              dimensions.width < 400 ? 10 : 12,
                              filteredCapacityData.length
                            )
                          )
                        ),
                      ],
                      label: 'Team',
                      tickLabelStyle: config.xAxis?.tickLabelStyle,
                    },
                  ]}
                  yAxis={[
                    {
                      label: 'Capacity',
                      min: 0,
                      width: config.yAxis?.width || 50,
                      labelStyle: config.yAxis?.labelStyle,
                    },
                  ]}
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

    resourceCoverage: (
      <DashboardWidget
        onClick={() => handleChartClick('Resource Allocation Coverage')}
        minWidth={320}
        minHeight={280}
      >
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'line');
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
                      data: filteredCoverageData.map(d =>
                        parseFloat(d.coverage_pct)
                      ),
                      label: 'Coverage',
                      id: 'coverage',
                      color: '#FF884D',
                    },
                  ]}
                  xAxis={[
                    {
                      data: [
                        ...new Set(
                          filteredCoverageData.map(d => {
                            return formatTeamName(
                              d.team_name,
                              dimensions.width < 400 ? 10 : 12,
                              filteredCoverageData.length
                            );
                          })
                        ),
                      ], // Team names as x-axis labels
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
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    underAllocated: (
      <DashboardWidget minWidth={320} minHeight={280}>
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');
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
                      data: filteredUnderAllocated.map(d =>
                        Number.parseFloat(d.utilization_pct)
                      ),
                      label: 'Under-allocation',
                      id: 'underAllocation',
                      color: '#80CBC4',
                    },
                  ]}
                  xAxis={[
                    {
                      data: [
                        ...new Set(
                          filteredUnderAllocated.map(d => {
                            return formatTeamName(
                              d.team_name,
                              dimensions.width < 400 ? 10 : 12,
                              filteredUnderAllocated.length
                            );
                          })
                        ),
                      ],
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
                />
              </Box>
            </Box>
          );
        }}
      </DashboardWidget>
    ),

    overAllocated: (
      <DashboardWidget minWidth={320} minHeight={280}>
        {dimensions => {
          const config = useResponsiveChart(dimensions, 'bar');
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
                      data: filteredOverAllocated.map(d =>
                        Number.parseFloat(d.utilization_pct)
                      ),
                      label: 'Over-allocation',
                      id: 'overAllocation',
                      color: '#FF7043',
                    },
                  ]}
                  xAxis={[
                    {
                      data: [
                        ...new Set(
                          filteredOverAllocated.map(d => {
                            return formatTeamName(
                              d.team_name,
                              dimensions.width < 400 ? 10 : 12,
                              filteredOverAllocated.length
                            );
                          })
                        ),
                      ],
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

  return loadingLoginUserPrivileges ? (
    <LoadingScreen />
  ) : (
    <>
      {dashboardLoading && !initialLoad && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LoadingScreen />
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
            {Object.entries(teamCharts).filter(([queryKey, _]) =>
              hasAccessToQueryKey(queryKey)
            ).length > 0 && (
              <Tab
                value="teams"
                label="Teams"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
            )}
            {Object.entries(projectCharts).filter(([queryKey, _]) =>
              hasAccessToQueryKey(queryKey)
            ).length > 0 && (
              <Tab
                value="projects"
                label="Projects"
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
        <Topbar />
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
              layouts={layouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768 }}
              cols={{ lg: 12, md: 12, sm: 12 }}
              rowHeight={130}
              onLayoutChange={handleLayoutChange}
              isDraggable
              isResizable
              style={{ padding: '0 16px' }}
            >
              {Object.entries(overviewcharts)
                .filter(([queryKey, _]) => hasAccessToQueryKey(queryKey))
                .map(([key, component]) => (
                  <div key={key}>{component}</div>
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
              layouts={layouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768 }}
              cols={{ lg: 12, md: 12, sm: 12 }}
              rowHeight={130}
              onLayoutChange={handleLayoutChange}
              isDraggable
              isResizable
              style={{ padding: '0 16px' }}
            >
              {Object.entries(teamCharts)
                .filter(([queryKey, _]) => hasAccessToQueryKey(queryKey))
                .map(([key, component]) => (
                  <div key={key}>{component}</div>
                ))}
            </ResponsiveGridLayout>
          </>
        )}

        {activeTab === 'projects' && (
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
              Project Tracking
            </Typography>
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768 }}
              cols={{ lg: 12, md: 12, sm: 12 }}
              rowHeight={130}
              onLayoutChange={handleLayoutChange}
              isDraggable
              isResizable
              style={{ padding: '0 16px' }}
            >
              {Object.entries(projectCharts)
                .filter(([queryKey, _]) => hasAccessToQueryKey(queryKey))
                .map(([key, component]) => (
                  <div key={key}>{component}</div>
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
    </>
  );
}
