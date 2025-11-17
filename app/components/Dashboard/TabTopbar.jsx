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

const Topbar = () => {
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
      </Box>
    </>
  );
};

export default Topbar;
