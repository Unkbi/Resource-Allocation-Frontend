import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { hideToastAction } from '@/app/redux/actions/toastAction';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';


const StyledSnackbar = styled(Snackbar, {
  shouldForwardProp: (prop) => prop !== 'sidebarExpanded',
})(({ theme, sidebarExpanded }) => ({
  '&.MuiSnackbar-root': {
    width: '320px',
    height: "48px",
    left: sidebarExpanded ? '280px' : '78px',
  },
}));

export const CustomSnackbar = ({ sidebarExpanded }) => {
  const dispatch = useDispatch();
  const { open, message, type, position, autoHideTimer } = useSelector(state => state.toast);
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
  };


  return (
    <StyledSnackbar
      anchorOrigin={{ vertical, horizontal }}
      open={open}
      autoHideDuration={autoHideTimer}
      onClose={handleClose}
      sidebarExpanded={sidebarExpanded}
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
    </StyledSnackbar>
  );
};
