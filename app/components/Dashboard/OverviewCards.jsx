import { useEffect, useState } from 'react';
import React from 'react';
import {
  Grid,
  Paper,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import GroupIcon from '@mui/icons-material/Group';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PercentIcon from '@mui/icons-material/Percent';

const iconMap = [
  <ShowChartIcon fontSize="inherit" />,
  <GroupIcon fontSize="inherit" />,
  <AttachMoneyIcon fontSize="inherit" />,
  <PercentIcon fontSize="inherit" />,
  <PercentIcon fontSize="inherit" />,
];

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
}) {
  const [overview, setOverview] = useState([]);

  useEffect(() => {
    const cost = parseInt(totalResourceCost?.[0]?.total_cost) || 0;
    const currency = totalResourceCost?.[0]?.currency || 'USD';

    const confirmedPct = parseInt(actualsConfirmed?.[0]?.pct_confirmed);
    const confirmedDisplay = isNaN(confirmedPct) ? '0%' : `${confirmedPct}%`;
    const confirmedallocationPct = parseInt(allocationPercentage?.[0]?.pct_allocated);

    const data = [
      {
        label: 'Active Projects',
        value: activeProjects?.[0]?.active_project ?? 0,
      },
      {
        label: 'Active Resources',
        value: activeResources?.[0]?.active_resource ?? 0,
      },
      {
        label: 'Total Resource Cost',
        value: formatCurrency(cost, currency),
      },
      {
        label: 'Allocation %',
        value: isNaN(confirmedallocationPct) ? '0%' : `${confirmedallocationPct}%`,
      },
      {
        label: 'Actuals Confirmed',
        value: confirmedDisplay,
      },
    ];
    setOverview(data);
  }, [activeProjects, activeResources, actualsConfirmed, totalResourceCost,allocationPercentage]);

  return (
    <Box m={3}>
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        {overview.map((item, idx) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={2.4}
            key={item.label || idx}
          >
            <Paper
              elevation={3}
              sx={{
                borderRadius: 3,
                px: 2,
                py: 2,
                height: '136px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                minWidth: 180,
                width: '250px',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: '#DBEAFE',
                  color: 'black',
                  width: 36,
                  height: 36,
                  mb: 1,
                  fontSize: 32,
                  borderRadius: 1.5,
                }}
                variant="rounded"
              >
                {iconMap[idx]}
              </Avatar>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ fontWeight: 400, fontSize: '0.875rem' }}
              >
                {item.label === 'Actuals Confirmed' ? (
                  <>
                    {item.label} <span style={{fontSize: '0.75rem'}}>(Previous week)</span>
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
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
