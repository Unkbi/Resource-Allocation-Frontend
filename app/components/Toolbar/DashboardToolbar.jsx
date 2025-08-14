'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Paper,
  Grid,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const DashboardToolbar = ({
  onFilterChange,
  teamNames = [],
  projectTypes = [],
  teamfilter: externalTeamFilter = 'all',
}) => {
  const [timeFilter, setTimeFilter] = useState('week');
  const [teamFilter, setTeamFilter] = useState(externalTeamFilter);
  const [projectTypeFilter, setProjectTypeFilter] = useState('all');

  useEffect(() => {
    setTeamFilter(externalTeamFilter);
  }, [externalTeamFilter]);

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
        borderRadius: 0,
        width: '100%',
        position: 'relative',
        backgroundColor: 'inherit',
        overflowX: 'auto', 
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap', 
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: { xs: 1, sm: 2, md: 4 }, 
          width: '100%',
          minWidth: 0, 
        }}
      >
        {/* Teams Filter */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 200, 
            flex: 1, 
            maxWidth: 300,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontSize: '14px', whiteSpace: 'nowrap' }}
          >
            Teams
          </Typography>
          <Select
            value={teamFilter}
            onChange={handleTeamFilterChange}
            displayEmpty
            size="small"
            fullWidth
            IconComponent={KeyboardArrowDownIcon}
            sx={{
              borderRadius: 1.5,
              bgcolor: 'white',
              borderColor: '#D1D5DB',
              fontSize: '14px',
              ml: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#D1D5DB',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#D1D5DB',
              },
            }}
            MenuProps={{
              disableScrollLock: true,
              PaperProps: {
                sx: {
                  '& .MuiMenuItem-root': { fontSize: '16px' },
                },
              },
            }}
          >
            <MenuItem value="all" sx={{ color: '#344665' }}>
              All Teams
            </MenuItem>
            {teamNames.map(team => (
              <MenuItem key={team} value={team} sx={{ color: '#344665' }}>
                {team}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Project Types Filter */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 200,
            flex: 1,
            maxWidth: 300,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontSize: '14px', whiteSpace: 'nowrap' }}
          >
            Project Types
          </Typography>
          <Select
            value={projectTypeFilter}
            onChange={handleProjectTypeFilterChange}
            displayEmpty
            IconComponent={KeyboardArrowDownIcon}
            size="small"
            fullWidth
            sx={{
              borderRadius: 1.5,
              bgcolor: 'white',
              borderColor: '#D1D5DB',
              fontSize: '14px',
              ml: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#D1D5DB',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#D1D5DB',
              },
            }}
            MenuProps={{
              disableScrollLock: true,
              PaperProps: {
                sx: {
                  '& .MuiMenuItem-root': { fontSize: '16px' },
                },
              },
            }}
          >
            <MenuItem value="all" sx={{ color: '#344665' }}>
              All Project Type
            </MenuItem>
            {projectTypes.map(type => (
              <MenuItem key={type} value={type} sx={{ color: '#344665' }}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
    </Paper>
  );
};

export default DashboardToolbar;
