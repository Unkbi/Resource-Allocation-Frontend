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

const ResponsiveGridLayout = WidthProvider(Responsive);

const layouts = {
  lg: [
    { i: 'resourceCoverage', x: 0, y: 0, w: 6, h: 3 },
    // { i: 'revenueTrend', x: 6, y: 0, w: 6, h: 2 },
  ],
  md: [
    { i: 'resourceCoverage', x: 0, y: 0, w: 12, h: 3 },
    // { i: 'revenueTrend', x: 0, y: 2, w: 12, h: 2 },
  ],
  sm: [
    { i: 'resourceCoverage', x: 0, y: 0, w: 12, h: 3 },
    // { i: 'revenueTrend', x: 0, y: 2, w: 12, h: 2 },
  ],
};

const queryMap = {
  resourceCoverage: {
    title: 'Resource Coverage by Team',
    queryKey: 'resourceCoverage',
  },
  // revenueTrend: {
  //   title: 'Revenue Trend by Month',
  //   queryKey: 'revenueTrend',
  // },
};

export default function ExecutiveDashboardPage() {
  const [layout, setLayout] = useState([]);
  const [coverageData, setCoverageData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);
  const [bucket, setBucket] = useState('week');
  const [teamFilter, setTeamFilter] = useState('all');
  const [chartVisibility, setChartVisibility] = useState({
    resourceCoverage: true,
    // revenueTrend: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('dashboardLayout');
    const parsed = saved ? JSON.parse(saved) : layouts.md;
    setLayout(parsed);
    Object.keys(queryMap).forEach(runQuery);
  }, []);

  // useEffect(() => {
  //   Object.keys(queryMap).forEach(runQuery);
  // }, [bucket, teamFilter]);

  const runQuery = async key => {
    try {
      const query = new URLSearchParams({ bucket, team: teamFilter });
      const res = await fetch(`/api/report/${queryMap[key].queryKey}`); //?${query}
      const data = await res.json();
      console.log(data, key, 'data');
      setCoverageData(data);
    } catch (err) {
      console.error(`Failed to fetch data for ${key}`, err);
    }
  };

  const handleFilterChange = filter => {
    if (filter.type === 'time') setBucket(filter.value);
    if (filter.type === 'team') setTeamFilter(filter.value);
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
    setChartVisibility(prev => ({
      ...prev,
      [chartKey]: !prev[chartKey],
    }));
  };

  // Prepare data for LineChart
  const teams = [...new Set(coverageData.map(d => d.team_name))];
  const periods = [...new Set(coverageData.map(d => d.period_start))].sort();

  const series = teams.map(team => ({
    label: team,
    data: periods.map(period => {
      const match = coverageData.find(
        d => d.team_name === team && d.period_start === period
      );
      return match ? parseFloat(match.coverage_pct) : 0;
    }),
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
            Percentage of Coverage of Resource Allocation by Teams by Duration
            Trend
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
                data: periods.map(p => new Date(p).toLocaleDateString()),
                label: 'Time Period',
              },
            ]}
            series={series}
            height={300}
          />
        )}
      </DashboardWidget>
    ),
    // revenueTrend: (
    //   <DashboardWidget onClick={() => handleChartClick('Revenue Trend by Month')}>
    //     <Typography variant="subtitle1">Revenue Trend</Typography>
    //     <BarChart
    //       series={[{ data: (chartData.revenueTrend || []).map((d) => +d.value), label: 'Revenue' }]}
    //       xAxis={[{ data: (chartData.revenueTrend || []).map((d) => d.label), scaleType: 'band' }]}
    //       height={150}
    //     />
    //   </DashboardWidget>
    // ),
  };

  // Prepare unique team names from API data
  const teamNames = [...new Set(coverageData.map(d => d.team_name))];

  return (
    <Box sx={{ p: 2 }}>
      <DashboardToolbar
        onFilterChange={handleFilterChange}
        timeFilter={bucket}
        teamFilter={teamFilter}
        projectTypeFilter="all"
        teamNames={teamNames} // <-- pass here
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
          Resource Allocation Coverage
        </Typography>
      </Box>

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layouts.lg, md: layouts.md, sm: layouts.sm }}
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
            Drilldown details for "{selectedChart}" will appear here. (Mock
            view)
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
