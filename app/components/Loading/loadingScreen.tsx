import React from 'react';
import { Box, Typography } from '@mui/material';

const LoadingScreen: React.FC = () => {
  return (
    <Box
      sx={{
        height: 'calc(100vh - 32px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
       <Box
        component="img"
        src="/images/icons/loaderGif.gif" 
        alt="Loading..."
        sx={{
          width: 100,
          height: 100,
        }}
      />

      <Typography
        variant="h6"
        sx={{
          color: 'text.primary', fontWeight: 500, marginLeft: '20px', fontSize: '18px',
          animation: 'fadeUp 0.8s ease-out forwards, textPulse 1.5s infinite ease-in-out',
        }}
      >
        Loading, please wait...
      </Typography>

      <style>
        {`
        @keyframes fadeUp {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes textPulse {
         0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
          }
          `}
      </style>
    </Box>
  );
};

export default LoadingScreen;
