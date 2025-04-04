import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { hideToastAction } from '@/app/redux/actions/toastAction';
import { useDispatch } from 'react-redux';

export const CustomSnackbar = ({ message, type, open, position }) => {
  const dispatch = useDispatch();
  const { vertical = 'bottom', horizontal = 'left' } = position || {};

  const handleClose = () => {
    dispatch(hideToastAction());
  };

  const getBackground = (type) => {
    switch (type) {
      case 'error':
        return '#D32F2F';
      case 'warning':
        return '#EF6C00';
      case 'info':
        return '#0288D1'; 
      case 'success':
        return '#2E7D32';
      default:
        return '#1976d2';
    }
  }
  return (
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        sx={{
          '& .MuiSnackbar-root': {
            width: '320px',
            height: "48px",
            left:"74px"
          },
        }}
      >
        <Alert
          onClose={handleClose}
          severity={type}
          sx={{
            width: '320px',
            maxWidth: '500px',
            backgroundColor: getBackground(type),
            color: '#FFFFFF',
            '& .MuiAlert-icon': {
              color: '#FFFFFF',
            },
            '& .MuiAlert-message': {
              fontSize: '0.875rem',
              letterSpacing: "0.15px",
              fontSize: "14px",
              fontWeight: "500",
              color: '#FFFFFF',
            },
            '& .MuiAlert-action': {
              color: '#FFFFFF',
            },
          }}
        >
          {message}
        </Alert>
      </Snackbar>
  );
};
