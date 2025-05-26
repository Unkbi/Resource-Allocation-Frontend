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
} from '@mui/material';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { LineChart } from '@mui/x-charts';
import DashboardWidget from '../../components/Dashboard/DashboardWidget';
import DashboardToolbar from '../../components/Toolbar/DashboardToolbar';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardChart } from '../../redux/actions/dashboardAction';

const ResponsiveGridLayout = WidthProvider(Responsive);

const layouts = {
  lg: [
    { i: 'resourceCoverage', x: 0, y: 0, w: 6, h: 3 },
    { i: 'projectFTE', x: 6, y: 0, w: 6, h: 3 },
  ],
  md: [
    { i: 'resourceCoverage', x: 0, y: 0, w: 12, h: 3 },
    { i: 'projectFTE', x: 0, y: 3, w: 12, h: 3 },
  ],
  sm: [
    { i: 'resourceCoverage', x: 0, y: 0, w: 12, h: 3 },
    { i: 'projectFTE', x: 0, y: 3, w: 12, h: 3 },
  ],
};

export default function ExecutiveDashboardPage() {
  const dispatch = useDispatch();
  const coverageData = useSelector(
    state => state.dashboard.resourceCoverage || []
  );
  const projectFTEData = useSelector(state => state.dashboard.projectFTE || []);

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

  useEffect(() => {
    const saved = localStorage.getItem('dashboardLayout');
    const parsed = saved ? JSON.parse(saved) : layouts.md;
    setLayout(parsed);
  }, []);

  useEffect(() => {
    dispatch(
      fetchDashboardChart({
        chartKey: 'resourceCoverage',
        queryKey: 'resourceCoverage',
      })
    );
    dispatch(
      fetchDashboardChart({
        chartKey: 'projectFTE',
        queryKey: 'projectFTE',
      })
    );
    dispatch(
      fetchDashboardChart({
        chartKey: 'capacityAvailability',
        queryKey: 'capacityAvailability',
      })
    );
    dispatch(
      fetchDashboardChart({
        chartKey: 'resourceUtilization',
        queryKey: 'resourceUtilization',
      })
    );
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

  const teams = [...new Set(filteredCoverageData.map(d => d.team_name))];
  const periods = [
    ...new Set(filteredCoverageData.map(d => d.period_start)),
  ].sort();

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

  const projectSeries = filteredProjectTypes.map(type => ({
    label: type,
    data: projectPeriods.map(period => {
      const match = filteredProjectFTEData.find(
        d => d.project_type === type && d.period_start === period
      );
      const value = match ? parseFloat(match.avg_weekly_fte) : 0;
      return isNaN(value) ? 0 : value;
    }),
    area: true, // <-- Enable area shading
    stack: 'total', // <-- Enable stacking
  }));

  const charts = {
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
          <IconButton
            size="small"
            onClick={e => {
              e.stopPropagation();
              toggleChartVisibility('resourceCoverage');
            }}
          >
            {chartVisibility.resourceCoverage ? (
              <VisibilityIcon />
            ) : (
              <VisibilityOffIcon />
            )}
          </IconButton>
        </Box>
        {chartVisibility.resourceCoverage && (
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
          />
        )}
      </DashboardWidget>
    ),
    projectFTE: (
      <DashboardWidget
        onClick={() => handleChartClick('Avg Weekly FTE by Project Type')}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle1">
            Avg Weekly FTE by Project Type
          </Typography>
          <IconButton
            size="small"
            onClick={e => {
              e.stopPropagation();
              toggleChartVisibility('projectFTE');
            }}
          >
            {chartVisibility.projectFTE ? (
              <VisibilityIcon />
            ) : (
              <VisibilityOffIcon />
            )}
          </IconButton>
        </Box>
        {chartVisibility.projectFTE && (
          <LineChart
            xAxis={[
              {
                scaleType: 'point',
                data: projectPeriods.map(p => new Date(p).toLocaleDateString()),
                label: 'Period',
              },
            ]}
            yAxis={[
              {
                label: 'Avg FTE',
                min: 0,
              },
            ]}
            series={projectSeries}
            height={300}
          />
        )}
      </DashboardWidget>
    ),
  };

  const teamNames = [...new Set(coverageData.map(d => d.team_name))];
  const projectTypeNames = [
    ...new Set(projectFTEData.map(d => d.project_type)),
  ];

  return (
    <Box sx={{ p: 2 }}>
      <DashboardToolbar
        onFilterChange={handleFilterChange}
        timeFilter={bucket}
        teamFilter={teamFilter}
        projectTypes={projectTypeNames}
        teamNames={teamNames}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
        <Box
          sx={{
            width: '4px',
            height: '24px',
            bgcolor: 'blue',
            borderRadius: '2px',
            mr: 1.5,
          }}
        />
        <Typography
          variant="h6"
          sx={{ fontSize: '16px', fontWeight: 600, color: '#333' }}
        >
          Resource Allocation Insights
        </Typography>
      </Box>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 12, sm: 12 }}
        rowHeight={150}
        onLayoutChange={handleLayoutChange}
        isDraggable
        isResizable
      >
        {Object.entries(charts).map(([key, component]) => (
          <div key={key}>{component}</div>
        ))}
      </ResponsiveGridLayout>

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
