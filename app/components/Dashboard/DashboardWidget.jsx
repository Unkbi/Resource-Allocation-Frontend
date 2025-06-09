import { Paper, Box } from '@mui/material';
import { useRef } from 'react';

const DashboardWidget = ({ children, onClick }) => {
  const mouseDownPosition = useRef(null);

  const handleMouseDown = (event) => {
    mouseDownPosition.current = { x: event.clientX, y: event.clientY };
  };


  return (
    <Box
      onMouseDown={handleMouseDown}
      sx={{
        cursor: 'pointer',
        height: '100%',
        width: '100%',
        userSelect: 'none',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 2,
          height: '100%',
          boxSizing: 'border-box',
          width: '100%',
          minWidth: 350, // Prevents the chart from shrinking below 350px
          minHeight: 250,
        }}
      >
        {children}
      </Paper>
    </Box>
  );
};

export default DashboardWidget;
