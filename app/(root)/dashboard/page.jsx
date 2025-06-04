'use client';

import Overview from '../../components/Dashboard/OverviewCards';
//import { fetchOverviewData } from "../../services/overviewService";
import { useEffect, useState } from 'react';
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
} from '@mui/material';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { LineChart, PieChart, BarChart } from '@mui/x-charts';
import DashboardWidget from '../../components/Dashboard/DashboardWidget';
import DashboardToolbar from '../../components/Toolbar/DashboardToolbar';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardChart } from '../../redux/actions/dashboardAction';
import { allowedQueries as queries } from '@/app/utils/queries';
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

dayjs.extend(isoWeek);
dayjs.extend(weekday);

const ResponsiveGridLayout = WidthProvider(Responsive);

dayjs.extend(quarterOfYear);

// Dynamically generate layouts for all charts in allowedQueries
const chartKeys = [...Object.keys(queries), 'underAllocated', 'overAllocated'];

const layouts = {
  lg: chartKeys.map((key, idx) => ({
    i: key,
    x: (idx % 2) * 6,
    y: Math.floor(idx / 2) * 3,
    w: 6,
    h: 3,
  })),
  md: chartKeys.map((key, idx) => ({
    i: key,
    x: 0,
    y: idx * 3,
    w: 12,
    h: 3,
  })),
  sm: chartKeys.map((key, idx) => ({
    i: key,
    x: 0,
    y: idx * 3,
    w: 12,
    h: 3,
  })),
};

export default function ExecutiveDashboardPage() {
  const dispatch = useDispatch();
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

  // const handleMenuOpen = event => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleMenuClose = option => {
  //   setAnchorEl(null);
  //   if (option) {
  //     setSelectedOption(option); // Update the selected option
  //   }
  // };

  useEffect(() => {
    const saved = localStorage.getItem('dashboardLayout');
    const parsed = saved ? JSON.parse(saved) : layouts.md;
    setLayout(parsed);
  }, []);

  // useEffect(() => {
  //   try {
  //     Object.keys(queries).forEach(queryKey => {
  //       console.log(selectedDate,selectedDate.startOf('month').format('YYYY-MM-DD'), selectedDate.startOf('week').format('YYYY-MM-DD'),"ddd")
  //       dispatch(
  //         fetchDashboardChart({
  //           chartKey: queryKey,
  //           queryKey: queryKey,
  //           startDate: selectedDate.startOf(selectedOption).add(1, 'day').format('YYYY-MM-DD'),
  //           endDate: selectedDate.endOf(selectedOption).add(1, 'day').format('YYYY-MM-DD'),
  //           bucket: selectedOption,
  //         })
  //       );
  //     });
  //   } catch {
  //     console.error('Error fetching dashboard data. Please try again later.');
  //   }
  // }, [dispatch, selectedDate, selectedOption]);

  useEffect(() => {
  try {
    // 🧠 Utility to calculate date range based on selectedOption
    const getCustomStartAndEndDate = (unit, date) => {
      let startRef = date.startOf(unit);
      let endRef = date.endOf(unit);

      // First Monday of the unit
      const startDate = startRef.day() === 1
        ? startRef
        : startRef.add((8 - startRef.day()) % 7, 'day');

      // Last Sunday of the unit
      const endDate = endRef.day() === 0
        ? endRef
        : endRef.subtract(endRef.day(), 'day');

      return {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      };
    };

    const { startDate, endDate } = getCustomStartAndEndDate(
      selectedOption,
      selectedDate
    );

    Object.keys(queries).forEach(queryKey => {
      dispatch(
        fetchDashboardChart({
          chartKey: queryKey,
          queryKey: queryKey,
          startDate,
          endDate,
          bucket: selectedOption,
        })
      );
    });
  } catch (err) {
    console.error('Error fetching dashboard data. Please try again later.', err);
  }
}, [dispatch, selectedDate, selectedOption]);

  useEffect(() => {
    if (coverageData.length > 0) {
      let filteredCoverage = coverageData;
      if (teamFilter !== 'all') {
        filteredCoverage = coverageData.filter(d => d.team_name === teamFilter);
      }
      setFilteredCoverageData(filteredCoverage);
    }
  }, [coverageData, teamFilter]);

  useEffect(() => {
    if (overAllocated.length > 0) {
      let filteredCoverage = overAllocated;
      if (teamFilter !== 'all') {
        filteredCoverage = filteredCoverage.filter(
          d => d.team_name === teamFilter
        );
      }
      setFilteredOverAllocated(filteredCoverage);
    }
    if (underAllocated.length > 0) {
      let filteredCoverage = underAllocated;
      if (teamFilter !== 'all') {
        filteredCoverage = filteredCoverage.filter(
          d => d.team_name === teamFilter
        );
      }
      setFilteredUnderAllocated(filteredCoverage);
    }

    if (originalCapacityData.length > 0) {
      let filteredCapacity = originalCapacityData;
      if (teamFilter !== 'all') {
        filteredCapacity = filteredCapacity.filter(
          d => d.team_name === teamFilter
        );
      }
      setFilteredCapacityData(filteredCapacity);
    }

    if (originalUnapprovedActualsByTeam.length > 0) {
      let filteredCapacity = originalUnapprovedActualsByTeam;
      if (teamFilter !== 'all') {
        filteredCapacity = filteredCapacity.filter(
          d => d.team_name === teamFilter
        );
      }
      setFilteredUnapprovedActualsByTeam(filteredCapacity);
    }
  }, [teamFilter]);

  useEffect(() => {
    if (projectFTEData.length > 0) {
      let filteredFTE = projectFTEData;
      if (selectedProjectType !== 'all') {
        filteredFTE = projectFTEData.filter(
          d => d.project_type === selectedProjectType
        );
      }
      setFilteredProjectFTEData(filteredFTE);
    }
  }, [projectFTEData, selectedProjectType]);

  useEffect(() => {
    if (activeProjectsByType.length > 0) {
      let filteredProjects = activeProjectsByType;
      if (selectedProjectType !== 'all') {
        filteredProjects = activeProjectsByType.filter(
          d => d._type === selectedProjectType
        );
      }
      setFilteredActiveProjectsByType(filteredProjects);
    }
  }, [activeProjectsByType, selectedProjectType]);

  // Calculate the Monday of the selected week
  const getMonday = date => {
    const day = date.day();
    return date.subtract(day === 0 ? 6 : day - 1, 'day'); // Adjust for Sunday (day 0)
  };

  // Function to filter data based on the selected date
  const filterDataByDate = date => {
    const monday = getMonday(date).format('YYYY-MM-DD');

    setTeamFilter('all');

    const capacityData = capacityAvailability.filter(
      // This is a patch to handle the timezone issue
      // To Be Implemented: Fix the timezone issue in the backend
      d =>
        getMonday(dayjs(d.period_start).add(3, 'day')).format('YYYY-MM-DD') ===
        monday
    );
    const underAllocated = resourceUtilization.filter(
      // This is a patch to handle the timezone issue
      // To Be Implemented: Fix the timezone issue in the backend
      d =>
        d.allocation_status === 'under-allocated' &&
        getMonday(dayjs(d.period_start).add(3, 'day')).format('YYYY-MM-DD') ===
          monday
    );

    const overAllocated = resourceUtilization.filter(
      // This is a patch to handle the timezone issue
      // To Be Implemented: Fix the timezone issue in the backend
      d =>
        d.allocation_status === 'over-allocated' &&
        getMonday(dayjs(d.period_start).add(3, 'day')).format('YYYY-MM-DD') ===
          monday
    );

    const unapprovedAllocation = unapprovedProjectAllocation.filter(
      // This is a patch to handle the timezone issue
      // To Be Implemented: Fix the timezone issue in the backend
      d =>
        getMonday(dayjs(d.period_start).add(3, 'day')).format('YYYY-MM-DD') ===
        monday
    );

    const actualsconfirmed = actualsConfirmed.filter(
      // This is a patch to handle the timezone issue
      // To Be Implemented: Fix the timezone issue in the backend
      d =>
        getMonday(dayjs(d.period_start).add(3, 'day')).format('YYYY-MM-DD') ===
        monday
    );

    const unapprovedActualsByTeam = unapprovedProjectActualsByTeam.filter(
      // This is a patch to handle the timezone issue
      // To Be Implemented: Fix the timezone issue in the backend
      d =>
        getMonday(dayjs(d.period_start).add(3, 'day')).format('YYYY-MM-DD') ===
        monday
    );

    const actualdeviation = resourceActualsDeviation.filter(
      // This is a patch to handle the timezone issue
      // To Be Implemented: Fix the timezone issue in the backend
      d =>
        getMonday(dayjs(d.period_start).add(3, 'day')).format('YYYY-MM-DD') ===
        monday
    );

    const filterallocationpercentage = allocationPercentage.filter(
      // This is a patch to handle the timezone issue
      // To Be Implemented: Fix the timezone issue in the backend
      d =>
        getMonday(dayjs(d.period_start).add(3, 'day')).format('YYYY-MM-DD') ===
        monday
    );

    setOverAllocated(overAllocated);
    setUnderAllocated(underAllocated);
    setFilteredCapacityData(capacityData);
    setOriginalCapacityData(capacityData);
    setFilteredUnderAllocated(underAllocated);
    setFilteredOverAllocated(overAllocated);
    setFilteredUnapprovedProjectAllocation(unapprovedAllocation);
    setFilteredActualsConfirmed(actualsconfirmed);
    setFilteredUnapprovedActualsByTeam(unapprovedActualsByTeam);
    setOriginalUnapprovedActualsByTeam(unapprovedActualsByTeam);
    setFilteredActualDeviation(actualdeviation);
    setFilteredAllocationPercentage(filterallocationpercentage);
  };

  useEffect(() => {
    filterDataByDate(selectedDate);
  }, []);

  useEffect(() => {
    if (
      capacityAvailability.length > 0 &&
      resourceUtilization.length > 0 &&
      unapprovedProjectAllocation.length > 0 &&
      actualsConfirmed.length > 0 &&
      unapprovedProjectActualsByTeam.length > 0 &&
      resourceActualsDeviation.length > 0 &&
      allocationPercentage.length > 0
    ) {
      filterDataByDate(selectedDate);
    }
  }, [
    capacityAvailability,
    resourceUtilization,
    actualsConfirmed,
    unapprovedProjectAllocation,
    unapprovedProjectActualsByTeam,
    resourceActualsDeviation,
    allocationPercentage,
    selectedDate,
  ]);

  const handleFilterChange = filter => {
    if (filter.type === 'time') setBucket(filter.value);
    if (filter.type === 'team') setTeamFilter(filter.value);
    if (filter.type === 'projectType') setSelectedProjectType(filter.value);
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

  const teams = filteredCoverageData?.length
    ? [...new Set(filteredCoverageData.map(d => d.team_name))]
    : [];
  const periods = filteredCoverageData?.length
    ? [...new Set(filteredCoverageData.map(d => d.period_start))].sort()
    : [];

  const coverageSeries = teams.map(team => ({
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
  const projectTypes = [
    ...new Set(filteredProjectFTEData.map(d => d.project_type)),
  ];
  const projectPeriods = [
    ...new Set(filteredProjectFTEData.map(d => d.period_start)),
  ].sort();

  // Ensure projectTypes and projectPeriods remain the same
  const filteredProjectTypes =
    selectedProjectType === 'all' ? projectTypes : [selectedProjectType];

  const projectSeries = filteredProjectTypes
    .filter(type => type !== null) // Filter out entries with project_type as null
    .map(type => ({
      label: type,
      data: projectPeriods.map(period => {
        const match = filteredProjectFTEData.find(
          d => d.project_type === type && d.period_start === period
        );
        const value = match ? parseFloat(match.avg_weekly_fte) : 0;
        return isNaN(value) ? 0 : value;
      }),
      area: true, // <-- Enable area shading
    }));

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
      >
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
            sx={{ mb: 1, fontSize: '18px', fontWeight: 600 }}
          >
            Actual Vs Plan Deviation
          </Typography>
          <PieChart
            series={[
              {
                data:
                  filteredActualDeviation.length > 0
                    ? [
                        {
                          id: 0,
                          value: parseFloat(
                            filteredActualDeviation[0].deviation_pct
                          ),
                          label: 'Deviation',
                          color: '#FF7043', // Orange for deviation
                        },
                        {
                          id: 1,
                          value: parseFloat(
                            filteredActualDeviation[0].in_plan_pct
                          ),
                          label: 'In Plan',
                          color: '#80CBC4', // Green for in-plan
                        },
                      ]
                    : [],
                innerRadius: 0, // Full pie chart
                outerRadius: 120,
                cornerRadius: 3,
                highlightScope: { faded: 'global', highlighted: 'item' },
                faded: { additionalRadius: -10, color: 'gray' },
              },
            ]}
            width={350}
            height={300}
            legend={{
              direction: 'column',
              position: { vertical: 'bottom', horizontal: 'middle' },
              itemmarkwidth: 24,
              itemmarkheight: 8,
              labelstyle: { fontSize: 16 },
            }}
            slotProps={{
              legend: {
                itemmarkwidth: 24,
                itemmarkheight: 8,
                labelstyle: { fontSize: 16 },
              },
            }}
          />
        </Box>
      </DashboardWidget>
    ),
    activeProjectsByType: (
      <DashboardWidget
        onClick={() => handleChartClick('Active Projects by Type')}
      >
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
            sx={{ mb: 1, fontSize: '18px', fontWeight: 600 }}
          >
            Active Projects by Type
          </Typography>
          <PieChart
            series={[
              {
                data: (filteredActiveProjectsByType || []).map((item, idx) => ({
                  id: idx,
                  value: Number(item.count),
                  label: item._type,
                  // Assign colors based on type for consistency with the image
                  color:
                    item._type === 'RTB'
                      ? '#0080FF'
                      : item._type === 'Key Initiative'
                        ? '#00C9A7'
                        : item._type === 'Ongoing'
                          ? '#FFC233'
                          : item._type === 'STB'
                            ? '#FF884D'
                            : item._type === 'CTB'
                              ? '#FFB6B6'
                              : undefined,
                })),
                innerRadius: 0,
                outerRadius: 120,
                cornerRadius: 3,
                highlightScope: { faded: 'global', highlighted: 'item' },
                faded: { additionalRadius: -10, color: 'gray' },
              },
            ]}
            width={350}
            height={300}
            legend={{
              direction: 'column',
              position: { vertical: 'bottom', horizontal: 'middle' },
              itemmarkwidth: 24,
              itemmarkheight: 8,
              labelstyle: { fontSize: 16 },
            }}
            slotProps={{
              legend: {
                itemmarkwidth: 24,
                itemmarkheight: 8,
                labelstyle: { fontSize: 16 },
              },
            }}
          />
        </Box>
      </DashboardWidget>
    ),
    totalHeadcount: (
      <DashboardWidget
        onClick={() => handleChartClick('Total Headcount Breakdown')}
      >
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
            sx={{ mb: 1, fontSize: '18px', fontWeight: 600 }}
          >
            Total Headcount Breakdown
          </Typography>
          <PieChart
            series={[
              {
                data: (totalHeadcount || []).map((item, idx) => ({
                  id: idx,
                  value: Number(item.count),
                  label: item._type,
                  color:
                    item._type === 'FTE'
                      ? '#0080FF'
                      : item._type === 'Contractor - FT'
                        ? '#00C9A7'
                        : item._type === 'Intern'
                          ? '#FF884D'
                          : item._type === 'Contractor - PT'
                            ? '#FFB6B6'
                            : undefined,
                })),
                innerRadius: 0,
                outerRadius: 120,
                cornerRadius: 3,
                highlightScope: { faded: 'global', highlighted: 'item' },
                faded: { additionalRadius: -10, color: 'gray' },
              },
            ]}
            width={350}
            height={300}
            legend={{
              direction: 'column',
              position: { vertical: 'bottom', horizontal: 'middle' },
              itemmarkwidth: 24,
              itemmarkheight: 8,
              labelstyle: { fontSize: 16 },
            }}
            slotProps={{
              legend: {
                itemmarkwidth: 24,
                itemmarkheight: 8,
                labelstyle: { fontSize: 16 },
              },
            }}
          />
        </Box>
      </DashboardWidget>
    ),
    unapprovedProjectAllocation: (
      <DashboardWidget
        onClick={() => handleChartClick('Unplanned Allocation Units')}
      >
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
            sx={{ mb: 1, fontSize: '18px', fontWeight: 600 }}
          >
            Unplanned Allocation Units
          </Typography>
          <PieChart
            series={[
              {
                data: unapprovedProjectAllocationData,
                innerRadius: 0, // full pie
                outerRadius: 120,
                // paddingAngle: 2,
                cornerRadius: 3,
                highlightScope: { faded: 'global', highlighted: 'item' },
                faded: { additionalRadius: -10, color: 'gray' },
              },
            ]}
            width={350}
            height={300}
            legend={{
              direction: 'column',
              position: { vertical: 'bottom', horizontal: 'middle' },
              itemmarkwidth: 24,
              itemmarkheight: 8,
              labelstyle: { fontSize: 16 },
            }}
            slotProps={{
              legend: {
                itemmarkwidth: 24,
                itemmarkheight: 8,
                labelstyle: { fontSize: 16 },
              },
            }}
          />
        </Box>
      </DashboardWidget>
    ),
    resourceFTEContractorRatio: (
      <DashboardWidget
        onClick={() => handleChartClick('FTE vs Contractor Ratio')}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 1, fontSize: '18px', fontWeight: 600 }}
          >
            FTE vs Contractor Ratio
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <BarChart
            height={300}
            series={[
              {
                data: resourceFTEContractorRatio.map(d =>
                  parseFloat(d.fte_cnt)
                ),
                label: 'FTE',
                id: 'fteCount',
                color: '#4CAF50',
                stack: 'total', // Green for FTE
              },
              {
                data: resourceFTEContractorRatio.map(d =>
                  parseFloat(d.contractor_cnt)
                ),
                label: 'Contractor',
                id: 'contractorCount',
                color: '#FF5722',
                stack: 'total', // Orange for Contractors
              },
            ]}
            xAxis={[
              {
                data: resourceFTEContractorRatio.map(d => d.shore_flag), // Onshore/Offshore as x-axis labels
                label: 'Workforce Distribution',
              },
            ]}
            yAxis={[
              {
                label: 'No. of Resources',
                min: 0,
                width: 50, // Adjust width for better alignment
              },
            ]}
            slotProps={{
              bar: {
                borderradius: 2,
                barwidthratio: 0.4, // Adjust bar width
              },
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
                padding: 8,
              },
            }}
          />
        </Box>
      </DashboardWidget>
    ),
  };
  const projectCharts = {
    projectFTE: (
      <DashboardWidget
        onClick={() => handleChartClick('Allocation by Project Type Over Time')}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 1, fontSize: '18px', fontWeight: 600 }}
          >
            Allocation by Project Type Over Time
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <BarChart
            height={300}
            series={projectSeries.map(series => ({
              data: series.data,
              label: series.label,
              id: series.label, // Use the label as the ID
              stack: 'total', // Enable stacking
              color:
                series.label === 'RTB'
                  ? '#0080FF'
                  : series.label === 'Key Initiative'
                    ? '#00C9A7'
                    : series.label === 'Ongoing'
                      ? '#FFC233'
                      : series.label === 'STB'
                        ? '#FF884D'
                        : '#FFB6B6',
            }))}
            xAxis={[
              {
                data: projectPeriods.map((p, idx) => `W${idx + 1}`), // Use week labels
                label: 'Week',
              },
            ]}
            yAxis={[
              {
                label: 'FTE',
                min: 0,
                width: 50, // Adjust width for better alignment
              },
            ]}
            slotProps={{
              bar: {
                borderradius: 2,
                barwidthratio: 0.4, // Adjust bar width
              },
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'left' },
                padding: 8,
              },
              highlightScope: 'none',
            }}
          />
        </Box>
      </DashboardWidget>
    ),
    budgetVsPlanVsActual: (
      <DashboardWidget
        onClick={() =>
          handleChartClick('Budget vs Planned vs Actual by Project')
        }
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 1, fontSize: '18px', fontWeight: 600 }}
          >
            Budget vs Planned vs Actual by Project
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <BarChart
            height={300}
            series={[
              {
                data: filteredbudgetVsPlanVsActual.map(d =>
                  parseFloat(d.budget_total)
                ),
                label: 'Budget',
                id: 'budget',
                color: '#9FA8DA', // Light purple
              },
              {
                data: filteredbudgetVsPlanVsActual.map(d =>
                  parseFloat(d.planned_to_date)
                ),
                label: 'Planned',
                id: 'planned',
                color: '#80CBC4', // Light green
              },
              {
                data: filteredbudgetVsPlanVsActual.map(d =>
                  parseFloat(d.actuals_to_date)
                ),
                label: 'Actuals',
                id: 'actual',
                color: '#FFB74D', // Light orange
              },
            ]}
            xAxis={[
              {
                data: filteredbudgetVsPlanVsActual.map(d => d.project_name), // Project names as x-axis labels
                label: 'Project',
              },
            ]}
            yAxis={[
              {
                // label: 'Amount (USD)',
                min: 0,
                width: 80, // Adjust width for better alignment
                valueFormatter: value => `$ ${value}`,
              },
            ]}
            slotProps={{
              bar: {
                borderradius: 2, // Add rounded corners to bars
                barwidthratio: 0.6, // Adjust bar width
              },
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
                padding: 8,
              },
            }}
          />
        </Box>
      </DashboardWidget>
    ),
  };

  const teamCharts = {
    unapprovedProjectActualsByTeam: (
      <DashboardWidget
        onClick={() => handleChartClick('Project Actuals Breakdown by Team')}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 1, fontSize: '18px', fontWeight: 600 }}
          >
            Project Actuals Breakdown by Team
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <BarChart
            height={300}
            series={[
              ...new Set(filteredUnapprovedActualsByTeam.map(d => d.category)),
            ].map(category => ({
              label: category,
              id: category,
              stack: 'total',
              data: [
                ...new Set(
                  filteredUnapprovedActualsByTeam.map(d => d.team_name)
                ),
              ].map(team => {
                const match = filteredUnapprovedActualsByTeam.find(
                  d => d.category === category && d.team_name === team
                );
                return match ? parseFloat(match.pct_of_actuals) : 0;
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
                      const teamName = d.team_name;
                      const maxLength = 10; // Set a maximum length for team names
                      return teamName.length > maxLength &&
                        filteredUnapprovedActualsByTeam.length > 4
                        ? `${teamName.slice(0, maxLength)}\n${teamName.slice(maxLength)}`
                        : teamName; // Wrap text if it exceeds maxLength
                    })
                  ),
                ],
                label: 'Team',
              },
            ]}
            yAxis={[
              {
                label: '% of Actuals',
                min: 0,
                max: 100,
                valueFormatter: value => `${value}%`,
              },
            ]}
            slotProps={{
              bar: {
                borderradius: 2,
                barwidthratio: 0.5,
              },
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
                padding: 8,
              },
            }}
          />
        </Box>
      </DashboardWidget>
    ),
    capacityAvailability: (
      <DashboardWidget
        onClick={() => handleChartClick('Capacity vs Utilization by Team')}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 1, fontSize: '18px', fontWeight: 600 }}
          >
            Capacity vs Utilization by Team
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <BarChart
            height={300}
            series={[
              {
                data: filteredCapacityData.map(d =>
                  parseFloat(d.capacity_available_fte)
                ),
                label: 'Available Capacity',
                id: 'availableCapacity',
                color: '#9FA8DA', // Light purple
              },
              {
                data: filteredCapacityData.map(d =>
                  parseFloat(d.capacity_allocated_fte)
                ),
                label: 'Utilized Capacity',
                id: 'utilizedCapacity',
                color: '#80CBC4', // Light green
                tooltip: ({ index }) => {
                  const utilization =
                    filteredCapacityData[index]?.utilization_pct || '0';
                  return `Utilization: ${utilization}%`;
                },
              },
            ]}
            xAxis={[
              {
                data: filteredCapacityData.map(d => {
                  const teamName = d.team_name;
                  const maxLength = 10; // Set a maximum length for team names
                  return teamName.length > maxLength &&
                    filteredCapacityData.length > 3
                    ? `${teamName.slice(0, maxLength)}\n${teamName.slice(maxLength)}`
                    : teamName; // Wrap text if it exceeds maxLength
                }), // Team names as x-axis labels
                label: 'Team',
              },
            ]}
            yAxis={[
              {
                label: 'Capacity',
                min: 0,
                width: 50, // Adjust width for better alignment
              },
            ]}
            slotProps={{
              bar: {
                borderradius: 2,
                barwidthratio: 0.4, // Adjust bar width
              },
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
                padding: 8,
              },
            }}
          />
        </Box>
      </DashboardWidget>
    ),
    resourceCoverage: (
      <DashboardWidget
        onClick={() => handleChartClick('Resource Allocation Coverage')}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 1, fontSize: '18px', fontWeight: 600 }}
          >
            Resource Coverage by Teams
          </Typography>
        </Box>
        <LineChart
          xAxis={[
            {
              scaleType: 'point',
              data: periods.map(p => {
                const date = new Date(p);
                const tempDate = new Date(date.getTime());
                tempDate.setHours(0, 0, 0, 0);
                // Thursday in current week decides the year
                tempDate.setDate(
                  tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7)
                );
                const week1 = new Date(tempDate.getFullYear(), 0, 4);
                // Calculate full weeks to nearest Thursday
                const weekNo =
                  1 +
                  Math.round(
                    ((tempDate.getTime() - week1.getTime()) / 86400000 -
                      3 +
                      ((week1.getDay() + 6) % 7)) /
                      7
                  );
                return `W${weekNo}`;
              }),
              label: 'Week',
            },
          ]}
          yAxis={[{ min: 0, label: 'Coverage %' }]}
          series={coverageSeries}
          height={300}
          grid={{ vertical: true, horizontal: true }}
          slotProps={{
            line: {
              strokeWidth: 3,
              strokeOpacity: 0.8,
              markersize: 2, // Reduced marker size
              markerstyle: { fill: '#666', stroke: '#fff', strokeWidth: 1 },
            },
            marker: {
              size: 2, // Reduced marker size
            },
          }}
        />
      </DashboardWidget>
    ),
    underAllocated: (
      <DashboardWidget>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 1, fontSize: '18px', fontWeight: 600 }}
          >
            Under-Allocated Teams
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <BarChart
            height={300}
            series={[
              {
                data: filteredUnderAllocated.map(d =>
                  parseFloat(d.utilization_pct)
                ),
                label: 'Under-allocation',
                id: 'underAllocation',
                color: '#80CBC4', // Light green
              },
            ]}
            xAxis={[
              {
                data: filteredUnderAllocated.map(d => {
                  const teamName = d.team_name;
                  const maxLength = 10; // Set a maximum length for team names
                  return teamName.length > maxLength &&
                    filteredUnderAllocated.length > 3
                    ? `${teamName.slice(0, maxLength)}\n${teamName.slice(maxLength)}`
                    : teamName; // Wrap text if it exceeds maxLength
                }), // Team names as x-axis labels
                label: 'Team',
              },
            ]}
            yAxis={[
              {
                // label: 'Allocation %',
                min: 0,
                width: 50,
                valueFormatter: value => `${value}%`, // Adjust width for better alignment
              },
            ]}
            slotProps={{
              bar: {
                borderradius: 2,
                barwidthratio: 0.4, // Adjust bar width
              },
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
                padding: 8,
              },
            }}
          />
        </Box>
      </DashboardWidget>
    ),
    overAllocated: (
      <DashboardWidget>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 1, fontSize: '18px', fontWeight: 600 }}
          >
            Over-Allocated Teams
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <BarChart
            height={300}
            series={[
              {
                data: filteredOverAllocated.map(d =>
                  parseFloat(d.utilization_pct)
                ),
                label: 'Over-allocation',
                id: 'overAllocation',
                color: '#FF7043', // Light orange
              },
            ]}
            xAxis={[
              {
                data: filteredOverAllocated.map(d => {
                  const teamName = d.team_name;
                  const maxLength = 10; // Set a maximum length for team names
                  return teamName.length > maxLength &&
                    filteredOverAllocated.length > 3
                    ? `${teamName.slice(0, maxLength)}\n${teamName.slice(maxLength)}`
                    : teamName; // Wrap text if it exceeds maxLength
                }), // Team names as x-axis labels
                label: 'Team',
              },
            ]}
            yAxis={[
              {
                // label: 'Allocation %',
                min: 0,
                width: 50,
                valueFormatter: value => `${value}%`, // Adjust width for better alignment
              },
            ]}
            slotProps={{
              bar: {
                borderradius: 2,
                barwidthratio: 0.4, // Adjust bar width
              },
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
                padding: 8,
              },
            }}
          />
        </Box>
      </DashboardWidget>
    ),
  };

  const teamNames = [...new Set(coverageData.map(d => d.team_name))];
  const projectTypeNames = [
    ...new Set(projectFTEData.map(d => d.project_type)),
  ];

  return (
    <>
      <Global
        styles={css`
          circle.MuiMarkElement-root {
            r: 3 !important; /* Set the radius to a smaller value */
          }
        `}
      />
      <Box sx={{ p: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          sx={{ mt: 1, mb: 1, borderBottom: '1px solid #ddd' }}
        >
          <Tab
            value="overview"
            label="Overview"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab value="teams" label="Teams" sx={{ textTransform: 'none' }} />
          <Tab
            value="projects"
            label="Projects"
            sx={{ textTransform: 'none' }}
          />
          <DashboardToolbar
            onFilterChange={handleFilterChange}
            timeFilter={bucket}
            teamfilter={teamFilter}
            projectTypes={projectTypeNames}
            teamNames={teamNames}
          />
        </Tabs>

        {activeTab === 'overview' && (
          <>
            <Topbar
              text="Overview"
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              anchorEl={anchorEl}
              setAnchorEl={setAnchorEl}
            />
            <Overview
              activeProjects={activeProjects}
              activeResources={activeResources}
              actualsConfirmed={filteredActualsConfirmed}
              totalResourceCost={totalResourceCost}
              allocationPercentage={filteredAllocationPercentage}
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
            >
              {Object.entries(overviewcharts).map(([key, component]) => (
                <div key={key}>{component}</div>
              ))}
            </ResponsiveGridLayout>
          </>
        )}

        {activeTab === 'teams' && (
          <>
            <Topbar
              text="Teams Overview"
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              anchorEl={anchorEl}
              setAnchorEl={setAnchorEl}
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
            >
              {Object.entries(teamCharts).map(([key, component]) => (
                <div key={key}>{component}</div>
              ))}
            </ResponsiveGridLayout>
          </>
        )}

        {activeTab === 'projects' && (
          <>
            <Topbar
              text="Project Tracking"
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              anchorEl={anchorEl}
              setAnchorEl={setAnchorEl}
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
            >
              {Object.entries(projectCharts).map(([key, component]) => (
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
