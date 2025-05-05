import React, { useRef, useEffect, useState }  from 'react';
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
    left: sidebarExpanded ? '280px' : '78px',
  },
}));

export const CustomSnackbar = ({ sidebarExpanded }) => {
  const dispatch = useDispatch();
  const { open, message, type, position, autoHideTimer } = useSelector(state => state.toast);
  const { vertical = 'bottom', horizontal = 'left' } = position || {};
  const { toasts } = useSelector(state => state.toast);
  const snackbarRefs = useRef({});
  const [positions, setPositions] = useState({});

  const handleClose = (id) => {
    dispatch(hideToastAction(id));
  };

  const getBackground = (type) => {
    switch (type) {
      case 'error':
        return '#D32F2F';
      case 'warning':
        return '#FE9F51';
      case 'info':
        return '#0288D1'; 
      case 'success':
        return '#2E7D32';
      default:
        return '#1976d2';
    }
  };

  useEffect(() => {
    let topOffset = 16;
    const newPositions = {};

    toasts.forEach((toast, index) => {
      const ref = snackbarRefs.current[toast.id];
      const height = ref?.clientHeight || 48;
      newPositions[toast.id] = topOffset;
      topOffset += height + 8;
    });

    setPositions(newPositions);
  }, [toasts]);


  return (
    <>
    {toasts.map((toast, index) => (
    <StyledSnackbar
      key={toast.id}
      anchorOrigin={{ vertical, horizontal }}
      open={toast.open}
      autoHideDuration={toast.autoHideTimer}
      onClose={() => handleClose(toast.id)}
      sidebarExpanded={sidebarExpanded}
      ref={(el) => {
        if (el) snackbarRefs.current[toast.id] = el;
      }}
      sx={{
        zIndex: 1400,
        position: 'fixed',
        bottom: `${positions[toast.id] || 16}px !important` ,
      }}
    >
      <Alert
        onClose={() => handleClose(toast.id)}
        severity={toast.type}
        sx={{
          width: '320px',
          maxWidth: '500px',
          backgroundColor: getBackground(toast.type),
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
        {toast.message}
      </Alert>
    </StyledSnackbar>
    ))}
    </>
  );
};