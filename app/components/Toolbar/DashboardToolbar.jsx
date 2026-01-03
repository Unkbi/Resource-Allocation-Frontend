import React, { useMemo, useState } from 'react';
import { Global, css } from '@emotion/react';
import { useSelector, useDispatch } from 'react-redux';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import {
  Box,
  Typography,
  Button,
  Menu,
  Select,
  MenuItem,
  styled,
  FormControl,
  Badge,
  Paper,
  TextField,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { KeyboardArrowDown } from '@mui/icons-material';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { DEFAULT_LOCALE } from '@/app/constants/constants';

dayjs.extend(isoWeek);
dayjs.extend(quarterOfYear);

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: '10px 12px',
  color: '#212121',
  fontWeight: 400,
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '&:hover': {
    backgroundColor: 'rgba(52, 70, 101, 0.04)',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(52, 70, 101, 0.08)',
    fontWeight: 600,
  },
  '&.Mui-selected:hover': {
    backgroundColor: 'rgba(52, 70, 101, 0.12)',
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  display: 'flex',
  // width: ' 128px',
  height: '34px',
  marginLeft: '6px',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '6px',
  flexShrink: 0,
  borderRadius: '8px',
  border: '1px solid #CBD0DB',
  background: '#FFF',
  '& .MuiSelect-select': {
    // marginLeft: '12px',
    padding: '0px 12px',
    display: 'flex',
    alignItems: 'center',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

const MenuItemContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 140,
  margin: 0,
}));

const DashboardToolbar = ({
  selectedDate,
  setSelectedDate,
  selectedOption,
  setSelectedOption,
  anchorEl,
  setAnchorEl,
}) => {
  const dispatch = useDispatch();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const dateButtonRef = React.useRef(null);

  const handleMenuOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = option => {
    setAnchorEl(null);
    if (option) {
      setSelectedOption(option); // Update the selected option
    }
  };

  // Get formatted date range based on selected option
  const getFormattedDateRange = () => {
    if (!selectedDate) return '';
    
    const date = dayjs(selectedDate);
    
    if (selectedOption === 'week') {
      const monday = date.startOf('isoWeek');
      const sunday = date.endOf('isoWeek');
      return `${monday.format('MMM DD')} - ${sunday.format('MMM DD')}`;
    } else if (selectedOption === 'month') {
      return date.format('MMMM YYYY');
        } else if (selectedOption === 'quarter') {
      const quarter = date.quarter();
      const year = date.year();
      const quarterStart = date.startOf('quarter');
      const quarterEnd = date.endOf('quarter');
      return `${quarterStart.format('MMM')} - ${quarterEnd.format('MMM YYYY')}`;
    }
    return date.format('MMM DD, YYYY');
  };

  // Navigate to previous/next period
  const changeCalendarDate = (direction) => {
    if (!selectedDate) return;
    
    const date = dayjs(selectedDate);
    let newDate;
    
    if (selectedOption === 'week') {
      newDate = direction === 'prev' ? date.subtract(1, 'week') : date.add(1, 'week');
    } else if (selectedOption === 'month') {
      newDate = direction === 'prev' ? date.subtract(1, 'month') : date.add(1, 'month');
    } else if (selectedOption === 'quarter') {
      newDate = direction === 'prev' ? date.subtract(3, 'months') : date.add(3, 'months');
    }
    
    setSelectedDate(newDate);
  };

  return (
    <>
      <Global
        styles={css`
          .MuiStack-root {
            overflow: unset !important; /* Override the overflow property */
            padding-top: 0 !important; /* Override the padding */
          }
        `}
      />
      <Paper
      elevation={0}
      sx={{
        borderRadius: 0,
        width: '100%',
        position: 'relative',
        backgroundColor: 'inherit',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap', 
          alignItems: 'center',
          justifyContent: 'flex-end',
          width: '100%',
          minWidth: 0, 
        }}
      >
          {/* Time Bucket Selector */}
          <Box>
            <StyledFormControl size="small">
              <StyledSelect
                value={selectedOption}
                className="projectDropdown"
                IconComponent={KeyboardArrowDown}
                MenuProps={{
                  disableScrollLock: true,
                  PaperProps: {
                    sx: {
                      backgroundColor: '#FFFFFF',
                      ml: '2px',
                    },
                  },
                }}
                renderValue={selectedOption => {
                  let displayText = '';
                  if (selectedOption === 'week') displayText = 'Weekly';
                  else if (selectedOption === 'month') displayText = 'Monthly';
                  else if (selectedOption === 'quarter')
                    displayText = 'Quarterly';
                  else displayText = selectedOption;

                  return (
                    <MenuItemContent>
                      <EventIcon sx={{ fontSize: 24, color: '#5D6979' }} />
                      <Typography
                        sx={{
                          color: '#5D6979',
                          fontFamily: 'Open Sans',
                          fontSize: '14px',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          lineHeight: '20px',
                          paddingRight: '8px',
                        }}
                      >
                        {displayText}
                      </Typography>
                    </MenuItemContent>
                  );
                }}
              >
                <StyledMenuItem onClick={() => handleMenuClose('week')}>
                  Weekly
                </StyledMenuItem>
                <StyledMenuItem onClick={() => handleMenuClose('month')}>
                  Monthly
                </StyledMenuItem>
                <StyledMenuItem onClick={() => handleMenuClose('quarter')}>
                  Quarterly
                </StyledMenuItem>
              </StyledSelect>
            </StyledFormControl>
          </Box>

          {/* Calendar Date Range Picker with Navigation */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '34px',
              // px: 1,
              ml: 2,
            }}
          >
            <IconButton
              size="small"
              onClick={() => changeCalendarDate('prev')}
              sx={{
                color: '#5D6979',
                '&:hover': {
                  backgroundColor: 'rgba(52, 70, 101, 0.04)',
                },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            
            <Box sx={{ display: 'flex' }}>
              <Button
                ref={dateButtonRef}
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                sx={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D6DCE1',
                  borderRadius: '4px',
                  height: '32px',
                  color: '#212121',
                  fontFamily: 'Open Sans',
                  fontWeight: 600,
                  fontSize: '12px',
                  lineHeight: '14px',
                  textAlign: 'center',
                  textTransform: 'none',
                  minWidth: '150px',
                  '&:hover': {
                    backgroundColor: '#f9fcff',
                    border: '1px solid #D6DCE1',
                  },
                }}
              >
                <CalendarMonthIcon sx={{ fontSize: 18, mr: 1, color: '#5D6979' }} />
                {getFormattedDateRange()}
              </Button>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={DEFAULT_LOCALE}>
                <DatePicker
                  open={isDatePickerOpen}
                  onOpen={() => setIsDatePickerOpen(true)}
                  onClose={() => setIsDatePickerOpen(false)}
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  displayWeekNumber={selectedOption === 'week'}
                  views={
                    selectedOption === 'week' 
                      ? ['year', 'month', 'day']
                      : selectedOption === 'month'
                      ? ['year', 'month']
                      : ['year']
                  }
                  sx={{
                    display: 'none',
                  }}
                  slotProps={{
                    popper: {
                      anchorEl: dateButtonRef.current,
                      placement: 'bottom-start',
                      sx: {
                        zIndex: 1300,
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>

            <IconButton
              size="small"
              onClick={() => changeCalendarDate('next')}
              sx={{
                color: '#5D6979',
                '&:hover': {
                  backgroundColor: 'rgba(52, 70, 101, 0.04)',
                },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
      </Box>
    </Paper>
    </>
  );
};

export default DashboardToolbar;
