import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Divider,
  styled,
  SelectChangeEvent,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  KeyboardArrowDown,
  History,
  FileDownload,
  Add,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';

// Define types for our state and props
interface ToolbarProps {
  setFilterButtonEl: (element: HTMLElement | null) => void;
}

interface CalendarDate {
  startDate: string;
  endDate: string;
}

interface RootState {
  allocationView: {
    view: string;
  };
  teams: {
    calendarDate: CalendarDate;
  };
  projects: {
    calendarDate: CalendarDate;
  };
}

// Styled components
const ToolbarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '56px',
  boxShadow: '0 1px 0 0 #DDE1E4',
  position: 'relative',
  zIndex: 1,
  backgroundColor: '#fafbfc',
}));

const LeftSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: '0 16px',
  alignItems: 'center',
  borderRight: '1px solid #d9d9d9',
  '& .MuiSelect-select': {
    color: '#1c2d5f',
    fontWeight: 600,
    fontSize: '15px',
    paddingRight: '24px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

const TeamButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '32px',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  overflow: 'hidden',
  marginLeft: '12px',
}));

const TeamButton = styled(Button)<{ active?: boolean }>(
  ({ theme, active }) => ({
    minWidth: '36px',
    height: '100%',
    padding: 0,
    borderRadius: 0,
    borderRight: active ? 'none' : '1px solid #d9d9d9',
    backgroundColor: active ? '#344665' : 'transparent',
    color: active ? '#ffffff' : '#9f9f9f',
    '&:last-child': {
      borderRight: 'none',
    },
    '&:hover': {
      backgroundColor: active ? '#344665' : 'rgba(52, 70, 101, 0.08)',
    },
  })
);

const CenterSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flex: 1,
  padding: '0 16px',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const ActionButtonsGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  height: '32px',
  padding: '0 12px',
  textTransform: 'none',
  backgroundColor: 'rgba(242, 245, 250, 0.3)',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  color: '#212636',
  fontWeight: 500,
  fontSize: '13px',
  '&:hover': {
    backgroundColor: 'rgba(242, 245, 250, 0.5)',
  },
}));

const DateNavigationGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const DateButton = styled(Button)(({ theme }) => ({
  height: '32px',
  padding: '0 12px',
  backgroundColor: '#ffffff',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  color: '#212636',
  fontWeight: 500,
  fontSize: '13px',
  textTransform: 'none',
}));

const NavButton = styled(IconButton)(({ theme }) => ({
  height: '32px',
  width: '32px',
  padding: 0,
  backgroundColor: 'rgba(242, 245, 250, 0.3)',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  color: '#212636',
  '&:hover': {
    backgroundColor: 'rgba(242, 245, 250, 0.5)',
  },
}));

const ViewsGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const ViewButton = styled(Button)(({ theme }) => ({
  height: '32px',
  padding: '0 12px',
  backgroundColor: 'rgba(242, 245, 250, 0.3)',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  color: '#212636',
  fontWeight: 500,
  fontSize: '13px',
  textTransform: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  '&:hover': {
    backgroundColor: 'rgba(242, 245, 250, 0.5)',
  },
}));

const RightSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: '0 16px',
  alignItems: 'center',
  gap: '8px',
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: '10px 12px',
  color: '#212636',
  fontWeight: 400,
  fontSize: '13px',
  '&:hover': {
    backgroundColor: 'rgba(52, 70, 101, 0.04)',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(52, 70, 101, 0.08)',
    fontWeight: 600,
  },
}));

// Custom toolbar component
const CustomToolbar: React.FC<ToolbarProps> = ({ setFilterButtonEl }) => {
  const dispatch = useDispatch();
  const view = useSelector((state: RootState) => state.allocationView.view);
  const { calendarDate: teamsCalendar } = useSelector(
    (state: RootState) => state.teams
  );
  const { calendarDate: projectsCalendar } = useSelector(
    (state: RootState) => state.projects
  );

  const [myTeamsActive, setMyTeamsActive] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<string>('Week');
  const [defaultView, setDefaultView] = useState<string>('Default View');

  // Mock date range for the example
  const dateRange = 'Jan 25 - Jan 31';

  const viewOptions = ['Teams', 'Projects'];

  const handleViewChange = useCallback((event: SelectChangeEvent<string>) => {
    // Dispatch action to change view
    // dispatch(performChangeView(event.target.value));
    console.log('View changed to:', event.target.value);
  }, []);

  const toggleTeamView = () => {
    setMyTeamsActive(!myTeamsActive);
  };

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    // Handle date navigation logic
    console.log(`Navigate ${direction}`);
  };

  const handleViewTypeChange = (event: SelectChangeEvent<string>) => {
    setCurrentView(event.target.value);
  };

  const handleDefaultViewChange = (event: SelectChangeEvent<string>) => {
    setDefaultView(event.target.value);
  };

  const handleSaveView = () => {
    console.log('Save view');
  };

  return (
    <ToolbarContainer>
      {/* Left section with dropdown and team buttons */}
      <LeftSection>
        <FormControl size="small">
          <Select
            value={view || 'Projects'}
            onChange={handleViewChange}
            IconComponent={KeyboardArrowDown}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
                },
              },
            }}
          >
            {viewOptions.map(option => (
              <StyledMenuItem key={option} value={option}>
                {option}
              </StyledMenuItem>
            ))}
          </Select>
        </FormControl>

        <TeamButtonsContainer>
          <Tooltip title="My Teams">
            <TeamButton active={myTeamsActive} onClick={toggleTeamView}>
              <img
                src="/images/icons/my-teams.svg"
                alt="My Teams"
                width="20"
                height="20"
              />
            </TeamButton>
          </Tooltip>
          <Tooltip title="All Teams">
            <TeamButton active={!myTeamsActive} onClick={toggleTeamView}>
              <img
                src="/images/icons/all-teams.svg"
                alt="All Teams"
                width="20"
                height="20"
              />
            </TeamButton>
          </Tooltip>
        </TeamButtonsContainer>
      </LeftSection>

      {/* Center section with filter, columns, date navigation, and views */}
      <CenterSection>
        <ActionButtonsGroup>
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
                    height: '32px',
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
        </ActionButtonsGroup>

        <DateNavigationGroup>
          <NavButton onClick={() => handleDateNavigation('prev')}>
            <img
              src="/images/icons/left-arrow.svg"
              alt="Previous"
              width="16"
              height="16"
            />
          </NavButton>

          <DateButton>{dateRange}</DateButton>

          <NavButton onClick={() => handleDateNavigation('next')}>
            <img
              src="/images/icons/right-arrow.svg"
              alt="Next"
              width="16"
              height="16"
            />
          </NavButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <FormControl size="small">
            <Select
              value={currentView}
              onChange={handleViewTypeChange}
              IconComponent={KeyboardArrowDown}
              sx={{
                height: '32px',
                backgroundColor: 'rgba(242, 245, 250, 0.3)',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                '& .MuiSelect-select': {
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#212636',
                  fontWeight: 500,
                  fontSize: '13px',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
                  },
                },
              }}
            >
              <StyledMenuItem value="Day">Day</StyledMenuItem>
              <StyledMenuItem value="Week">Week</StyledMenuItem>
              <StyledMenuItem value="Month">Month</StyledMenuItem>
            </Select>
          </FormControl>
        </DateNavigationGroup>

        <ViewsGroup>
          <FormControl size="small">
            <Select
              value={defaultView}
              onChange={handleDefaultViewChange}
              IconComponent={KeyboardArrowDown}
              startAdornment={
                <img
                  src="/images/icons/view.svg"
                  alt="View"
                  width="16"
                  height="16"
                  style={{ marginRight: '8px' }}
                />
              }
              sx={{
                height: '32px',
                backgroundColor: 'rgba(242, 245, 250, 0.3)',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                '& .MuiSelect-select': {
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#212636',
                  fontWeight: 500,
                  fontSize: '13px',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
                  },
                },
              }}
            >
              <StyledMenuItem value="Default View">Default View</StyledMenuItem>
              <StyledMenuItem value="My View">My View</StyledMenuItem>
              <StyledMenuItem value="Team View">Team View</StyledMenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Save View">
            <Button
              onClick={handleSaveView}
              sx={{
                minWidth: 'auto',
                width: '32px',
                height: '32px',
                padding: 0,
                backgroundColor: 'rgba(242, 245, 250, 0.3)',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                color: '#212636',
              }}
            >
              <Add fontSize="small" />
            </Button>
          </Tooltip>
        </ViewsGroup>
      </CenterSection>

      {/* Right section with history and export buttons */}
      <RightSection>
        <Tooltip title="History">
          <IconButton
            sx={{
              width: '32px',
              height: '32px',
              backgroundColor: 'rgba(242, 245, 250, 0.3)',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              color: '#212636',
            }}
          >
            <History fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Export">
          <IconButton
            sx={{
              width: '32px',
              height: '32px',
              backgroundColor: 'rgba(242, 245, 250, 0.3)',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              color: '#212636',
            }}
          >
            <FileDownload fontSize="small" />
          </IconButton>
        </Tooltip>
      </RightSection>
    </ToolbarContainer>
  );
};

export default CustomToolbar;
