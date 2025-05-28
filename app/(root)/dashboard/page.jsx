'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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

const ResponsiveGridLayout = WidthProvider(Responsive);

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
    resourceUtilization = [],
    resourceActualsDeviation = [],
    resourceFTEContractorRatio = [],
    unapprovedProjectAllocation = [],
    activeProjectsByType = [],
    totalHeadcount = [],
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
  const [filteredCapacityData, setFilteredCapacityData] = useState([]);
  const [filteredUnderAllocated, setFilteredUnderAllocated] = useState([]);
  const [filteredOverAllocated, setFilteredOverAllocated] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('dashboardLayout');
    const parsed = saved ? JSON.parse(saved) : layouts.md;
    setLayout(parsed);
  }, []);

  useEffect(() => {
    try {
      Object.keys(queries).forEach(queryKey => {
        dispatch(
          fetchDashboardChart({
            chartKey: queryKey,
            queryKey: queryKey,
          })
        );
      });
    } catch {
      console.error('Error fetching dashboard data. Please try again later.');
    }
  }, [dispatch]);

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

  // Calculate the Monday of the selected week
  const getMonday = date => {
    const day = date.day();
    return date.subtract(day === 0 ? 6 : day - 1, 'day'); // Adjust for Sunday (day 0)
  };

  // Function to filter data based on the selected date
  const filterDataByDate = date => {
    const monday = getMonday(date).format('YYYY-MM-DD');

    const capacityData = capacityAvailability.filter(
      d => dayjs(d.period_start).format('YYYY-MM-DD') === monday
    );
    const underAllocated = resourceUtilization.filter(
      d =>
        d.allocation_status === 'under-allocated' &&
        dayjs(d.period_start).format('YYYY-MM-DD') === monday
    );

    const overAllocated = resourceUtilization.filter(
      d =>
        d.allocation_status === 'over-allocated' &&
        dayjs(d.period_start).format('YYYY-MM-DD') === monday
    );
    setFilteredCapacityData(capacityData);
    setFilteredUnderAllocated(underAllocated);
    setFilteredOverAllocated(overAllocated);
  };

  useEffect(() => {
    filterDataByDate(selectedDate);
  }, []);

 useEffect(() => {
    if (capacityAvailability.length > 0 && resourceUtilization.length > 0) {
      filterDataByDate(selectedDate);
    }
  }, [capacityAvailability, resourceUtilization, selectedDate]);

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

  const overviewcharts = {
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
          <Typography variant="subtitle1">
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
          yAxis={[{ min: 0, max: 150, label: 'Coverage %' }]}
          series={coverageSeries}
          height={300}
          grid={{ vertical: true, horizontal: true }}
          slotProps={{
            line: {
              // Make the line thicker and semi-transparent
              strokeWidth: 3,
              strokeOpacity: 0.8,
              // Make the marker small and solid
              markersize: 6,
              markerstyle: { fill: '#666', stroke: '#fff', strokeWidth: 1 },
            },
          }}
        />
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
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Unplanned Allocation Units
          </Typography>
          <PieChart
            series={[
              {
                data: [
                  {
                    id: 0,
                    value: unapprovedProjectAllocation?.otherProjects ?? 0.5,
                    label: 'Other Projects',
                    color: '#0080FF',
                  },
                  {
                    id: 1,
                    value: unapprovedProjectAllocation?.units_unapproved ?? 0.5,
                    label: 'Unplanned Work',
                    color: '#00C9A7',
                  },
                  {
                    id: 2,
                    value: unapprovedProjectAllocation?.personalTime ?? 0,
                    label: 'Personal Time',
                    color: '#FFC233',
                  },
                  {
                    id: 3,
                    value: unapprovedProjectAllocation?.approvedWork ?? 0,
                    label: 'Approved Work',
                    color: '#FF884D',
                  },
                ],
                innerRadius: 0, // full pie
                outerRadius: 120,
                paddingAngle: 2,
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
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Active Projects by Type
          </Typography>
          <PieChart
            series={[
              {
                data: (activeProjectsByType || []).map((item, idx) => ({
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
                paddingAngle: 2,
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
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
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
                        : undefined,
                })),
                innerRadius: 0,
                outerRadius: 120,
                paddingAngle: 2,
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
          <Typography variant="subtitle1">
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
          <Typography variant="subtitle1">
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
                  return teamName.length > maxLength
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
          <Typography variant="subtitle1">FTE vs Contractor Ratio</Typography>
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

  const teamCharts = {
    underAllocated: (
      <DashboardWidget>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle1">Under-Allocated Teams</Typography>
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
                data: filteredUnderAllocated.map(d => d.team_name), // Team names as x-axis labels
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
          <Typography variant="subtitle1">Over-Allocated Teams</Typography>
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
                data: filteredOverAllocated.map(d => d.team_name), // Team names as x-axis labels
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
        <Tab value="projects" label="Projects" sx={{ textTransform: 'none' }} />
        <DashboardToolbar
          onFilterChange={handleFilterChange}
          timeFilter={bucket}
          teamFilter={teamFilter}
          projectTypes={projectTypeNames}
          teamNames={teamNames}
        />
      </Tabs>

      {activeTab === 'overview' && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, pl: 2 }}>
            <Typography
              variant="h2"
              sx={{ fontSize: '24px', fontWeight: 700, color: '#000000' }}
            >
              Overview
            </Typography>
          </Box>
          {/* Add Date Picker below the toolbar */}
          <Box
            sx={{
              mt: -3,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['DatePicker']}>
                <DatePicker
                  label="Select a Date"
                  value={selectedDate}
                  onChange={newValue => setSelectedDate(newValue)}
                  renderInput={params => <TextField {...params} />}
                />
              </DemoContainer>
            </LocalizationProvider>
          </Box>

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
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, pl: 2 }}>
            <Typography
              variant="h2"
              sx={{ fontSize: '24px', fontWeight: 700, color: '#000000' }}
            >
              Teams Overview
            </Typography>
          </Box>
          {/* Add Date Picker below the toolbar */}
          <Box
            sx={{
              mt: -3,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['DatePicker']}>
                <DatePicker
                  label="Select a Date"
                  value={selectedDate}
                  onChange={newValue => setSelectedDate(newValue)}
                  renderInput={params => <TextField {...params} />}
                />
              </DemoContainer>
            </LocalizationProvider>
          </Box>

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
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, pl: 2 }}>
            <Typography
              variant="h2"
              sx={{ fontSize: '24px', fontWeight: 700, color: '#000000' }}
            >
              Project Tracking
            </Typography>
          </Box>
          {/* Add Date Picker below the toolbar */}
          <Box
            sx={{
              mt: -3,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['DatePicker']}>
                <DatePicker
                  label="Select a Date"
                  value={selectedDate}
                  onChange={newValue => setSelectedDate(newValue)}
                  renderInput={params => <TextField {...params} />}
                />
              </DemoContainer>
            </LocalizationProvider>
          </Box>

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
  );
}
