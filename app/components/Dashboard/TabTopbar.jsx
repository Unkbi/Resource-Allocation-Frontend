import React, { useMemo } from 'react';
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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { KeyboardArrowDown } from '@mui/icons-material';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DEFAULT_LOCALE } from '@/app/constants/constants';
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import FilterChips from './FilterChips';

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
  height: '44px',
  marginLeft: '6px',
  justifyContent: 'center',
  alignitems: 'center',
  gap: '6px',
  flexShrink: 0,
  borderradius: '8px',
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

const Topbar = ({
  text,
  selectedDate,
  setSelectedDate,
  selectedOption,
  setSelectedOption,
  anchorEl,
  setAnchorEl,
}) => {
  const dispatch = useDispatch();
  const advancedFilters = useSelector((state) => state.dashboard.advancedFilters);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    if (!advancedFilters) return 0;

    return Object.entries(advancedFilters).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== '' && value !== null && value !== undefined;
    }).length;
  }, [advancedFilters]);

  const handleMenuOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = option => {
    setAnchorEl(null);
    if (option) {
      setSelectedOption(option); // Update the selected option
    }
  };

  const handleFilters = () => {
    dispatch(
      openDialog({
        title: 'Advanced Filters',
        submitButtonText: 'Apply Filters',
        cancelButtonText: 'Cancel',
        formType: 'advanced_filters',
        initialData: advancedFilters,
      })
    );
  }

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
      <Box
        sx={{
          display: 'flex',
          mb: 1,
          mt: 2,
          pl: 2,
          pb: 2,
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #ddd',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
          <Badge
            badgeContent=''
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                right: 3,
                display: activeFilterCount > 0 ? 'flex' : 'none',
                top: 3,
                backgroundColor: '#F86D6C',
                padding: '0 4px',
                height: '14px',
                minWidth: '14px',
                fontSize: '10px',
                fontWeight: 600,
              },
            }}
          >
            <Button
              onClick={handleFilters}
              sx={{
                minWidth: 'unset',
                width: '41px',
                height: '36px',
                padding: '20px 10px 20px 17px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.25)',
                '.MuiButton-startIcon': { marginRight: '0px' },
              }}
              alt="Filter"
              variant='outlined'
              startIcon={
                <img
                  src="/images/icons/NewFilterIcon.svg"
                  alt="filter"
                />
              }
            />
          </Badge>
          <FilterChips />
        </Box>
        <Box sx={{ display: 'flex' }}>
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
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={DEFAULT_LOCALE}>
            <DemoContainer components={['DatePicker']}>
              <DatePicker
                displayWeekNumber
                slots={{
                  openPickerIcon: CalendarMonthIcon, // Change the icon here
                }}
                // views={['']}
                label="Select a Date"
                value={selectedDate}
                sx={{
                  pl: 2.5,
                  '& .MuiInputBase-root': {
                    height: '44px',
                    width: '170px',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {},
                  '& .MuiStack-root': {
                    overflow: 'unset !important',
                  },
                  '& .MuiInputLabel-root': {
                    left: 'unset !important',
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#5D6979',
                    fontFamily: 'Open Sans',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '20px',
                  },
                }}
                onChange={newValue => setSelectedDate(newValue)}
                renderInput={params => (
                  <TextField
                    {...params}
                  />
                )}
              />
            </DemoContainer>
          </LocalizationProvider>
        </Box>
      </Box>
    </>
  );
};

export default Topbar;
