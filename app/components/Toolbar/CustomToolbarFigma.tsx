'use client';

import { memo, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';

// SVG Icons from Figma
const ProjectsIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 4.5H8L6.5 3H2C1.45 3 1 3.45 1 4V12C1 12.55 1.45 13 2 13H14C14.55 13 15 12.55 15 12V5.5C15 4.95 14.55 4.5 14 4.5Z"
      fill="#344665"
    />
  </svg>
);

// Add a new TeamsIcon SVG component after the ProjectsIcon
const TeamsIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 8C9.66 8 11 6.66 11 5C11 3.34 9.66 2 8 2C6.34 2 5 3.34 5 5C5 6.66 6.34 8 8 8ZM8 9.5C5.67 9.5 1 10.67 1 13V14.5H15V13C15 10.67 10.33 9.5 8 9.5Z"
      fill="#344665"
    />
  </svg>
);

const MyTeamsIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 8C9.66 8 11 6.66 11 5C11 3.34 9.66 2 8 2C6.34 2 5 3.34 5 5C5 6.66 6.34 8 8 8ZM8 9.5C5.67 9.5 1 10.67 1 13V14.5H15V13C15 10.67 10.33 9.5 8 9.5Z"
      fill="#344665"
    />
  </svg>
);

const AllTeamsIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 8C8.66 8 10 6.66 10 5C10 3.34 8.66 2 7 2C5.34 2 4 3.34 4 5C4 6.66 5.34 8 7 8ZM3 6C3 4.34 1.66 3 0 3V5C0.55 5 1 5.45 1 6C1 6.55 0.55 7 0 7V9C1.66 9 3 7.66 3 6ZM7 10C4.67 10 0 11.17 0 13.5V16H14V13.5C14 11.17 9.33 10 7 10ZM14 7V5C12.34 5 11 6.34 11 8C11 9.66 12.34 11 14 11V9C13.45 9 13 8.55 13 8C13 7.45 13.45 7 14 7Z"
      fill="#344665"
    />
  </svg>
);

const FilterIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.5 2.75V3.25H14.5V2.75H1.5ZM6 7.75H10V7.25H6V7.75ZM3.5 12.75H12.5V12.25H3.5V12.75Z"
      fill="#344665"
      stroke="#344665"
      strokeWidth="0.5"
    />
  </svg>
);

const ColumnsIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.3 5.2C13.6 5.2 13.9 5 14 4.7C14.1 4.4 14 4 13.7 3.9L8.7 1.1C8.5 1 8.2 1 8 1.1L3 3.9C2.7 4 2.6 4.4 2.7 4.7C2.8 5 3.1 5.2 3.4 5.1L8 2.6L12.6 5.1C12.8 5.2 13.1 5.2 13.3 5.2ZM7 4V13C7 13.6 7.4 14 8 14C8.6 14 9 13.6 9 13V4C9 3.4 8.6 3 8 3C7.4 3 7 3.4 7 4ZM3 6C2.4 6 2 6.4 2 7V13C2 13.6 2.4 14 3 14C3.6 14 4 13.6 4 13V7C4 6.4 3.6 6 3 6ZM11 6C10.4 6 10 6.4 10 7V13C10 13.6 10.4 14 11 14C11.6 14 12 13.6 12 13V7C12 6.4 11.6 6 11 6Z"
      fill="#344665"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2H11V1H10V2H6V1H5V2H4C3.45 2 3 2.45 3 3V13C3 13.55 3.45 14 4 14H12C12.55 14 13 13.55 13 13V3C13 2.45 12.55 2 12 2ZM12 13H4V6H12V13ZM12 5H4V3H12V5ZM5 8H7V10H5V8Z"
      fill="#344665"
    />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.5 3.5L6 8L10.5 12.5"
      stroke="#344665"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.5 12.5L10 8L5.5 3.5"
      stroke="#344665"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.5 4.5L6 8L9.5 4.5"
      stroke="#5E6C85"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SaveIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.7 4.3L11.7 3.3C11.5 3.1 11.3 3 11 3H5C4.4 3 4 3.4 4 4V12C4 12.6 4.4 13 5 13H11C11.6 13 12 12.6 12 12V5C12 4.7 11.9 4.5 11.7 4.3ZM8 12C7.4 12 7 11.6 7 11C7 10.4 7.4 10 8 10C8.6 10 9 10.4 9 11C9 11.6 8.6 12 8 12ZM10 6H6V4H10V6Z"
      fill="#344665"
    />
  </svg>
);

const HistoryIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 3.5C5.5 3.5 3.5 5.5 3.5 8C3.5 10.5 5.5 12.5 8 12.5C10.5 12.5 12.5 10.5 12.5 8C12.5 5.5 10.5 3.5 8 3.5ZM8 11.5C6.1 11.5 4.5 9.9 4.5 8C4.5 6.1 6.1 4.5 8 4.5C9.9 4.5 11.5 6.1 11.5 8C11.5 9.9 9.9 11.5 8 11.5ZM8.25 5.5H7.5V8.5L10.1 10.1L10.5 9.5L8.25 8.1V5.5Z"
      fill="#344665"
    />
  </svg>
);

const ExportIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.3 5.7L8 2.4L4.7 5.7L5.4 6.4L7.5 4.3V11H8.5V4.3L10.6 6.4L11.3 5.7ZM3 12V9H2V13H14V9H13V12H3Z"
      fill="#344665"
    />
  </svg>
);

// Styled Components
const ToolbarContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  backgroundColor: '#FFFFFF',
  borderBottom: '1px solid #DDE1E4',
  padding: theme.spacing(1),
}));

const ToolbarContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const ToolbarGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

// Update the ProjectsButton styled component to have a fixed width
const ProjectsButton = styled(Button)(({ theme }) => ({
  height: '36px',
  width: '120px', // Add fixed width to match the dropdown size
  border: '1px solid #DDE1E4',
  borderRadius: '4px',
  padding: theme.spacing(0, 1.5),
  textTransform: 'none',
  color: '#344665',
  backgroundColor: '#FFFFFF',
  '&:hover': {
    backgroundColor: '#F9FCFF',
  },
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(0.5),
  },
  '& .MuiButton-endIcon': {
    marginLeft: theme.spacing(0.5),
  },
}));

// Add a styled component for the dropdown menu
const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: '120px', // Match the width of the button
    marginTop: '4px',
    boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
  },
}));

const IconButtonStyled = styled(IconButton)(({ theme }) => ({
  height: '36px',
  width: '36px',
  border: '1px solid #DDE1E4',
  borderRadius: '4px',
  padding: theme.spacing(1),
  color: '#344665',
  backgroundColor: '#FFFFFF',
  '&:hover': {
    backgroundColor: '#F9FCFF',
  },
}));

const DateRangeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '36px',
  border: '1px solid #DDE1E4',
  borderRadius: '4px',
  overflow: 'hidden',
}));

const DateRangeButton = styled(Button)(({ theme }) => ({
  height: '100%',
  minWidth: 'auto',
  padding: theme.spacing(0, 1),
  borderRadius: 0,
  color: '#344665',
  backgroundColor: '#FFFFFF',
  '&:hover': {
    backgroundColor: '#F9FCFF',
  },
}));

const DateRangeArrowButton = styled(IconButton)(({ theme }) => ({
  height: '100%',
  width: '36px',
  padding: 0,
  borderRadius: 0,
  color: '#344665',
  backgroundColor: '#FFFFFF',
  '&:hover': {
    backgroundColor: '#F9FCFF',
  },
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  height: '36px',
  border: '1px solid #DDE1E4',
  borderRadius: '4px',
  overflow: 'hidden',
  '& .MuiToggleButton-root': {
    height: '100%',
    padding: theme.spacing(0, 1.5),
    textTransform: 'none',
    color: '#344665',
    backgroundColor: '#F9FCFF',
    border: 'none',
    '&.Mui-selected': {
      backgroundColor: '#E9EFF8',
      color: '#344665',
      '&:hover': {
        backgroundColor: '#E9EFF8',
      },
    },
    '&:hover': {
      backgroundColor: '#F1F5FA',
    },
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 120,
  height: '36px',
  '& .MuiOutlinedInput-root': {
    height: '36px',
    borderColor: '#DDE1E4',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#B0B9C5',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#298AFF',
    },
  },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  height: 24,
  margin: theme.spacing(0, 0.5),
}));

const ResourceToolbar = ({ setFilterButtonEl }) => {
  const [dateRange, setDateRange] = useState('Jan 25 - Jan 31');
  const [viewType, setViewType] = useState('default');
  const [teamFilter, setTeamFilter] = useState('myTeams');
  const [anchorEl, setAnchorEl] = useState(null);
  const [viewsAnchorEl, setViewsAnchorEl] = useState(null);

  // Add this to the state declarations at the beginning of the ResourceToolbar function
  const [selectedOption, setSelectedOption] = useState('Projects');

  const handleProjectsClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleProjectsClose = () => {
    setAnchorEl(null);
  };

  const handleViewsClick = event => {
    setViewsAnchorEl(event.currentTarget);
  };

  const handleViewsClose = () => {
    setViewsAnchorEl(null);
  };

  const handleTeamFilterChange = (event, newValue) => {
    if (newValue !== null) {
      setTeamFilter(newValue);
    }
  };

  return (
    <ToolbarContainer>
      <ToolbarContent>
        <ToolbarGroup>
          {/* Projects/Teams Dropdown */}
          <ProjectsButton
            startIcon={
              selectedOption === 'Projects' ? <ProjectsIcon /> : <TeamsIcon />
            }
            endIcon={<ChevronDownIcon />}
            onClick={handleProjectsClick}
          >
            {selectedOption}
          </ProjectsButton>
          {/* Update the Menu component in the return statement to use the StyledMenu component */}
          {/* Replace the existing Menu component with: */}
          <StyledMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProjectsClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem
              onClick={() => {
                setSelectedOption('Projects');
                handleProjectsClose();
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ProjectsIcon />
                <Box component="span" sx={{ ml: 1 }}>
                  Projects
                </Box>
              </Box>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setSelectedOption('Teams');
                handleProjectsClose();
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TeamsIcon />
                <Box component="span" sx={{ ml: 1 }}>
                  Teams
                </Box>
              </Box>
            </MenuItem>
          </StyledMenu>

          {/* Teams/Projects Selector */}
          <StyledToggleButtonGroup
            value={teamFilter}
            exclusive
            onChange={handleTeamFilterChange}
          >
            <ToggleButton value="myTeams">
              <MyTeamsIcon />
            </ToggleButton>
            <ToggleButton value="allTeams">
              <AllTeamsIcon />
            </ToggleButton>
          </StyledToggleButtonGroup>

          {/* MUI DataGrid Filter */}
          {/* <IconButtonStyled> */}
          <Box className="filterColBlock">
            <GridToolbarContainer ref={setFilterButtonEl}>
              <GridToolbarFilterButton
                slotProps={{
                  tooltip: { title: 'Filters' },
                  button: {
                    sx: {
                      height: '32px',
                      padding: '0 12px',
                      textTransform: 'none',
                      backgroundColor: 'rgba(242, 245, 250, 0.3)',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      color: '#212636',
                      fontWeight: 500,
                      fontSize: '13px',
                    },
                    startIcon: (
                      <img
                        src="/images/icons/filter.svg"
                        alt="Filter"
                        width="16"
                        height="16"
                      />
                    ),
                  },
                }}
              />

              <GridToolbarColumnsButton
                slotProps={{
                  tooltip: { title: 'Columns' },
                  button: {
                    sx: {
                      height: '34px',
                      padding: '0 12px',
                      textTransform: 'none',
                      backgroundColor: 'rgba(242, 245, 250, 0.3)',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      color: '#212636',
                      fontWeight: 500,
                      fontSize: '13px',
                      marginLeft: '12px',
                    },
                    startIcon: (
                      <img
                        src="/images/icons/columns.svg"
                        alt="Columns"
                        width="16"
                        height="16"
                      />
                    ),
                  },
                }}
              />
            </GridToolbarContainer>
          </Box>
          {/* </IconButtonStyled> */}

          {/* MUI DataGrid Columns */}
          <IconButtonStyled>
            <ColumnsIcon />
          </IconButtonStyled>

          <StyledDivider orientation="vertical" />

          {/* Date Range with Arrows */}
          <DateRangeContainer>
            <DateRangeArrowButton>
              <ArrowLeftIcon />
            </DateRangeArrowButton>
            <DateRangeButton startIcon={<CalendarIcon />}>
              {dateRange}
            </DateRangeButton>
            <DateRangeArrowButton>
              <ArrowRightIcon />
            </DateRangeArrowButton>
          </DateRangeContainer>

          {/* Week Selector */}
          <StyledFormControl>
            <Select
              native
              defaultValue="week"
              inputProps={{
                name: 'period',
                id: 'period-select',
              }}
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
            </Select>
          </StyledFormControl>

          {/* Saved Views Dropdown */}
          <ProjectsButton
            endIcon={<ChevronDownIcon />}
            onClick={handleViewsClick}
          >
            Default View
          </ProjectsButton>
          {/* Also update the Saved Views dropdown to use the same styling */}
          {/* Replace the existing Menu for views with: */}
          <StyledMenu
            anchorEl={viewsAnchorEl}
            open={Boolean(viewsAnchorEl)}
            onClose={handleViewsClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem onClick={handleViewsClose}>Default View</MenuItem>
            <MenuItem onClick={handleViewsClose}>Chets View</MenuItem>
            <MenuItem onClick={handleViewsClose}>
              Chets Allocation View
            </MenuItem>
          </StyledMenu>

          {/* Save View Button */}
          <ProjectsButton startIcon={<SaveIcon />}>Save View</ProjectsButton>
        </ToolbarGroup>

        <ToolbarGroup>
          {/* History Button */}
          <IconButtonStyled>
            <HistoryIcon />
          </IconButtonStyled>

          {/* Export Button */}
          <IconButtonStyled>
            <ExportIcon />
          </IconButtonStyled>
        </ToolbarGroup>
      </ToolbarContent>
    </ToolbarContainer>
  );
};

export default memo(ResourceToolbar);
