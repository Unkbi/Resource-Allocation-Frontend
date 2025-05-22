import { Paper, Box } from '@mui/material';
import { useRef } from 'react';

const DashboardWidget = ({ children, onClick }) => {
  const mouseDownPosition = useRef(null);

  const handleMouseDown = (event) => {
    mouseDownPosition.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseUp = (event) => {
    console.log('Mouse up detected', event);
    // if (!mouseDownPosition.current) return;
    // const dx = Math.abs(event.clientX - mouseDownPosition.current.x);
    // const dy = Math.abs(event.clientY - mouseDownPosition.current.y);
    // console.log('Mouse up detected', { dx, dy },typeof onClick);
    // // Only treat as click if movement is minimal (e.g., < 5px)
    // if (dx < 5 && dy < 5 && typeof onClick === 'function') {
    //   console.log('Click detected');
    //   onClick();
    // }
    // mouseDownPosition.current = null;
  };

  const handleMouseClick = (event) => {
    console.log('Mouse click detected', event);
    if ( event.type === 'click') {
      console.log('Click detected');
      onClick();
    }
  }

  return (
    <Box
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleMouseClick}
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
        }}
      >
        {children}
      </Paper>
    </Box>
  );
};

export default DashboardWidget;
