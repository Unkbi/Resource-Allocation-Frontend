import React from 'react';
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

const StyledLabel = styled(Typography)(({ theme }) => ({
  color: '#1C2D5F',
  fontWeight: 600,
  fontSize: '14px',
  fontFamily: 'Open Sans',
  fontStyle: 'normal',
  lineHeight: '20px',
  paddingBottom: '10px',
}));

export default StyledLabel;
