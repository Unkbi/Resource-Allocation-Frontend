import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen: React.FC = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress size={60} thickness={5} />
      <Typography
        variant="h6"
        sx={{ mt: 2, color: 'text.primary', fontWeight: 500 }}
      >
        Loading, please wait...
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
