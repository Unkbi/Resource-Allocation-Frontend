import React from 'react';
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

const StyledLabel = styled(Typography)(({ theme }) => ({
  color: '#424242',
  fontWeight: 500,
  fontSize: '12px',
  fontFamily: 'Manrope',
  fontStyle: 'normal',
  lineHeight: 'normal',
  paddingBottom: '10px',
}));

export default StyledLabel;
