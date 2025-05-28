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

const DashboardToolbar = ({
  onFilterChange,
  teamNames = [],
  projectTypes = [],
}) => {
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
      sx={{
        mb: 1,
        borderRadius: 2,
        width: '100%',
        position: 'relative',
      }}
    >
      <Grid container spacing={4} alignItems="center" justifyContent='end'>
        {/* Teams */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{  fontSize: '14px' }} // Font size 14px
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
          </Box>
        </Grid>

        {/* Project Types */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontSize: '14px' }} // Font size 14px
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
              <MenuItem value="all">All</MenuItem>
              {projectTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DashboardToolbar;
