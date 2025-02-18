import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { hideToastAction } from '@/app/redux/actions/toastAction';
import { useDispatch } from 'react-redux';

export const CustomSnackbar = ({ message, type, open, position }) => {
  const dispatch = useDispatch();
  const { vertical = 'top', horizontal = 'center' } = position || {};

  const handleClose = () => {
    dispatch(hideToastAction());
  };
  return (
    <Snackbar
      anchorOrigin={{ vertical, horizontal }}
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
    >
      <Alert
        onClose={handleClose}
        severity={type}
        sx={{
          width: '100%',
          '& .MuiAlert-message': {
            fontSize: '0.875rem',
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};
