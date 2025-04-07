import React from 'react';
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

const StyledLabel = styled(Typography)(({ theme }) => ({
  color: '#1C2D5F',
  fontWeight: 600,
  fontSize: '12px',
  fontFamily: theme.typography.fontFamily,
  fontStyle: 'normal',
  lineHeight: '16px',
  paddingBottom: '5px',
}));

export default StyledLabel;
