'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Paper,
  Grid,
} from '@mui/material';

const DashboardToolbar = ({ onFilterChange, teamNames = [] }) => {
  const [timeFilter, setTimeFilter] = useState('week');
  const [teamFilter, setTeamFilter] = useState('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState('all');

  const handleTimeFilterChange = filter => {
    setTimeFilter(filter);
    if (onFilterChange) {
      onFilterChange({ type: 'time', value: filter });
    }
  };

  const handleTeamFilterChange = event => {
    setTeamFilter(event.target.value);
    if (onFilterChange) {
      onFilterChange({ type: 'team', value: event.target.value });
    }
  };

  const handleProjectTypeFilterChange = event => {
    setProjectTypeFilter(event.target.value);
    if (onFilterChange) {
      onFilterChange({ type: 'projectType', value: event.target.value });
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#f8f9fa' }}
    >
      <Grid container spacing={4} alignItems="center">
        {/* Time Trends */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '14px' }}>
            Time Trends
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={timeFilter === 'week' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleTimeFilterChange('week')}
              sx={{
                borderRadius: 5,
                textTransform: 'none',
                px: 2,
                fontSize: '14px', // Font size 14px
              }}
            >
              Weeks
            </Button>
            <Button
              variant={timeFilter === 'month' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleTimeFilterChange('month')}
              sx={{
                borderRadius: 5,
                textTransform: 'none',
                px: 2,
                fontSize: '14px', // Font size 14px
              }}
            >
              Months
            </Button>
            <Button
              variant={timeFilter === 'quarter' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleTimeFilterChange('quarter')}
              sx={{
                borderRadius: 5,
                textTransform: 'none',
                px: 2,
                fontSize: '14px', // Font size 14px
              }}
            >
              Quarters
            </Button>
          </Box>
        </Grid>

        {/* Teams */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, fontSize: '14px' }} // Font size 14px
          >
            Teams
          </Typography>
          <Select
            value={teamFilter}
            onChange={handleTeamFilterChange}
            displayEmpty
            size="small"
            fullWidth
            sx={{
              borderRadius: 1,
              bgcolor: 'white',
              fontSize: '14px',
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  '& .MuiMenuItem-root': {
                    fontSize: '16px',
                  },
                },
              },
            }}
          >
            <MenuItem value="all">All Teams</MenuItem>
            {teamNames.map(team => (
              <MenuItem key={team} value={team}>
                {team}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Project Types */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, fontSize: '14px' }} // Font size 14px
          >
            Project Types
          </Typography>
          <Select
            value={projectTypeFilter}
            onChange={handleProjectTypeFilterChange}
            displayEmpty
            size="small"
            fullWidth
            sx={{
              borderRadius: 1,
              bgcolor: 'white',
              fontSize: '14px', // Font size 14px for the Select component
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  '& .MuiMenuItem-root': {
                    fontSize: '16px', // Font size 16px for dropdown options
                  },
                },
              },
            }}
          >
            <MenuItem value="all">All Project Types</MenuItem>
            <MenuItem value="development">Development</MenuItem>
            <MenuItem value="design">Design</MenuItem>
            <MenuItem value="research">Research</MenuItem>
          </Select>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DashboardToolbar;
