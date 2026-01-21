import { useEffect, useState } from 'react';
import React from 'react';
import { Grid, Paper, Box, Typography, Avatar } from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import GroupIcon from '@mui/icons-material/Group';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PercentIcon from '@mui/icons-material/Percent';
import { navigateToReport } from '../../utils/reportNavigation';
import { useRouter } from 'next/navigation';

// Stable icon mapping by label so filtering doesn't shift icons by index
const iconByLabel = {
  'Active Projects': <ShowChartIcon fontSize="inherit" />,
  'Active Resources': <GroupIcon fontSize="inherit" />,
  'Total Resource Cost': <AttachMoneyIcon fontSize="inherit" />,
  'Allocation %': <PercentIcon fontSize="inherit" />,
  'Actuals Confirmed': <PercentIcon fontSize="inherit" />,
};

// Helper to format currency without decimals
const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (err) {
    console.error('Currency formatting error:', err);
    return '$0';
  }
};

export default function Overview({
  activeProjects,
  activeResources,
  actualsConfirmed,
  totalResourceCost,
  allocationPercentage,
  hasAccessToQueryKey,
  advancedFilters,
  onClick,
  selectedDate,
}) {
  const [overview, setOverview] = useState([]);
 const router = useRouter();
  // Map card labels to report types
  const reportTypeMap = {
    'Active Projects': 'projectsOnly',
    'Active Resources': 'resourceOnly',
    'Total Resource Cost': 'resourceProjectPeriodCost',
    'Allocation %': 'resourceProjectPeriod',
    'Actuals Confirmed': 'resourceProjectPeriod',
  };

  
const getMonday = date => {
    const day = date.day();
    return date.subtract(day === 0 ? 6 : day - 1, 'day'); // Adjust for Sunday (day 0)
  };
  
  const handleCardClick = (label) => {

      const currentWeekMonday = getMonday(selectedDate);
      const currentWeekSunday = currentWeekMonday.add(6, 'day');
      const lastWeekMonday = currentWeekMonday.subtract(1, 'week');
      const lastWeekSunday = lastWeekMonday.add(6, 'day');

    if (onClick) {
      onClick(label);
    }
    let additionalFilters = {};
    if (label === 'Active Resources') {
      additionalFilters = { resourceStatuses: ['Active'] };
    }
    else if (label === 'Active Projects') {
      additionalFilters = { projectStatuses: ['Active','Approved'], project: activeProjects?.[0]?.project_uuids || [] };
    }

    if (advancedFilters) {
      const reportType = reportTypeMap[label];
      if (reportType) {
        navigateToReport(advancedFilters, { reportType, period: 'custom', customStartDate: label === 'Actuals Confirmed' ? lastWeekMonday.format('YYYY-MM-DD') : currentWeekMonday.format('YYYY-MM-DD'), customEndDate: label === 'Actuals Confirmed' ? lastWeekSunday.format('YYYY-MM-DD') : currentWeekSunday.format('YYYY-MM-DD'), additionalFilters }, false, router );
      }
    }
  };

  useEffect(() => {
    const cost = parseInt(totalResourceCost?.[0]?.total_cost) || 0;
    const currency = totalResourceCost?.[0]?.currency || 'USD';

    const confirmedPct = parseFloat(actualsConfirmed?.[0]?.pct_confirmed);
    const confirmedDisplay = isNaN(confirmedPct) ? '0%' : `${Math.round(confirmedPct)}%`;
    
    const confirmedallocationPct = parseFloat(
      allocationPercentage?.[0]?.pct_allocated
    );
    const allocationDisplay = isNaN(confirmedallocationPct) 
      ? '0%' 
      : `${Math.round(confirmedallocationPct)}%`;

    const data = [
      {
        label: 'Active Projects',
        value: activeProjects?.[0]?.count ?? 0,
        hasAccess: hasAccessToQueryKey('activeProjects'),
      },
      {
        label: 'Active Resources',
        value: activeResources?.[0]?.active_resource ?? 0,
        hasAccess: hasAccessToQueryKey('activeResources'),
      },
      {
        label: 'Total Resource Cost',
        value: formatCurrency(cost, currency),
        hasAccess: hasAccessToQueryKey('totalResourceCost'),
      },
      {
        label: 'Allocation %',
        value: allocationDisplay,
        hasAccess: hasAccessToQueryKey('allocationPercentage'),
      },
      {
        label: 'Actuals Confirmed',
        value: confirmedDisplay,
        hasAccess: hasAccessToQueryKey('actualsConfirmed'),
      },
    ];
    setOverview(data);
  }, [
    activeProjects,
    activeResources,
    actualsConfirmed,
    totalResourceCost,
    allocationPercentage,
  ]);

  return (
    <Box m={3}
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: 'repeat(1, minmax(0, 1fr))',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(auto-fit, minmax(160px, 1fr))',
          lg: 'repeat(auto-fit, minmax(200px, 1fr))',
        },
        alignItems: 'stretch',
      }}
    >
      {overview
        .filter(item => item.hasAccess)
        .map((item, idx) => (
          <Paper
            key={item.label || idx}
            elevation={3}
            onClick={() => handleCardClick(item.label)}
            sx={{
              borderRadius: 3,
              px: 2,
              py: 2,
              height: '136px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              cursor: 'pointer',
              // minWidth: 220,
            }}
          >
            <Avatar
              sx={{
                bgcolor: '#DBEAFE',
                color: 'black',
                width: 36,
                height: 36,
                mb: 1,
                fontSize: '1.5rem',
                borderRadius: 1.5,
              }}
              variant="rounded"
            >
              {iconByLabel[item.label] || <ShowChartIcon fontSize="inherit" />}
            </Avatar>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ fontWeight: 400, fontSize: '0.875rem' }}
            >
              {item.label === 'Actuals Confirmed' ? (
                <>
                  {item.label}{' '}
                  <span style={{ fontSize: '0.75rem', lineHeight: 0 }}>
                    (Previous week)
                  </span>
                </>
              ) : (
                item.label
              )}
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                mt: 1,
                fontSize: '1.5rem',
                color: item.label === 'Total Resource Cost' ? '#000' : '#111',
              }}
            >
              {item.value}
            </Typography>
          </Paper>
        ))}
    </Box>
  );
}
