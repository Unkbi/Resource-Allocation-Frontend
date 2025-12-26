'use client';

import React from 'react';
import { Paper, Typography, Box, Link as MuiLink } from '@mui/material';
import { styled } from '@mui/material/styles';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { 
  useItemTooltip, 
  useAxisTooltip,
  ChartsTooltipContainer 
} from '@mui/x-charts';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid',
  borderColor: theme.palette.divider,
  boxShadow: theme.shadows[4],
  minWidth: '200px',
  maxWidth: '400px',
}));

const TooltipRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const ColorIndicator = styled(Box)({
  width: 12,
  height: 12,
  borderRadius: '2px',
  flexShrink: 0,
});

const StyledLink = styled(MuiLink)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main,
  fontWeight: 500,
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

/**
 * Custom Tooltip Content for Item Trigger
 * Displays data when hovering over a specific item (bar, pie slice, etc.)
 */
const CustomItemTooltipContent = ({ linkGenerator }) => {
  const tooltipData = useItemTooltip();
  
  if (!tooltipData) {
    return null;
  }

  const { identifier, color, label, formattedValue } = tooltipData;
  
  // Generate link URL if linkGenerator function is provided
  const linkUrl = linkGenerator ? linkGenerator(tooltipData) : null;

  return (
    <StyledPaper elevation={3}>
      {label && (
        <Typography 
          variant="subtitle2" 
          sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}
        >
          {label}
        </Typography>
      )}
      
      <TooltipRow>
        <ColorIndicator sx={{ backgroundColor: color }} />
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
          {formattedValue}
        </Typography>
      </TooltipRow>

      {linkUrl && (
        <StyledLink
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          onPointerDown={e => e.stopPropagation()}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            window.open(linkUrl, '_blank', 'noopener,noreferrer');
          }}
        >
          View Details
          <OpenInNewIcon sx={{ fontSize: 16 }} />
        </StyledLink>
      )}
    </StyledPaper>
  );
};

/**
 * Custom Tooltip Content for Axis Trigger
 * Displays data for all series at a specific x-axis point
 */
const CustomAxisTooltipContent = ({ linkGenerator }) => {
  const tooltipData = useAxisTooltip();
  
  if (!tooltipData) {
    return null;
  }

  const { axisValue, axisFormattedValue, seriesItems } = tooltipData;
  
  // Generate link URL if linkGenerator function is provided
  // Pass the first series item for link generation context
  const linkUrl = linkGenerator && seriesItems?.length > 0 
    ? linkGenerator({ axisValue, axisFormattedValue, seriesItems }) 
    : null;

  return (
    <StyledPaper elevation={3}>
      {axisFormattedValue && (
        <Typography 
          variant="subtitle2" 
          sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}
        >
          {axisFormattedValue}
        </Typography>
      )}
      
      {seriesItems?.map((item, index) => (
        <TooltipRow key={index}>
          <ColorIndicator sx={{ backgroundColor: item.color }} />
          <Typography 
            variant="body2" 
            sx={{ color: 'text.secondary', flex: 1 }}
          >
            {item.label}:
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ color: 'text.primary', fontWeight: 500 }}
          >
            {item.formattedValue}
          </Typography>
        </TooltipRow>
      ))}

      {linkUrl && (
        <StyledLink
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(linkUrl, '_blank', 'noopener,noreferrer');
          }}
        >
          View Details
          <OpenInNewIcon sx={{ fontSize: 16 }} />
        </StyledLink>
      )}
    </StyledPaper>
  );
};

/**
 * Main Custom Tooltip Component
 * 
 * @param {string} trigger - 'item' | 'axis' - Determines which tooltip type to show
 * @param {function} linkGenerator - Optional function to generate link URLs
 *        For 'item' trigger: receives { identifier, color, label, formattedValue, value }
 *        For 'axis' trigger: receives { axisValue, axisFormattedValue, seriesItems }
 * @param {object} otherProps - Any other props to pass to ChartsTooltipContainer
 * 
 * @example Item Trigger with Link:
 * <CustomChartTooltip 
 *   trigger="item"
 *   linkGenerator={(data) => `/project/${data.identifier.dataIndex}`}
 * />
 * 
 * @example Axis Trigger with Link:
 * <CustomChartTooltip 
 *   trigger="axis"
 *   linkGenerator={(data) => `/report/${data.axisValue}`}
 * />
 */
export const CustomChartTooltip = ({ 
  trigger = 'item', 
  linkGenerator = null,
  disablePortal = true,
  ...otherProps 
}) => {
  const mergedSx = {
    pointerEvents: 'auto',
    ...otherProps.sx,
  };

  return (
    <ChartsTooltipContainer 
      trigger={trigger}
      disablePortal={disablePortal}
      {...otherProps}
      // Keep tooltip open when hovering over it (so links are clickable)
      sx={mergedSx}
    >
      {trigger === 'item' ? (
        <CustomItemTooltipContent linkGenerator={linkGenerator} />
      ) : (
        <CustomAxisTooltipContent linkGenerator={linkGenerator} />
      )}
    </ChartsTooltipContainer>
  );
};

export default CustomChartTooltip;
