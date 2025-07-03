import React from 'react';
import LinearProgress from '@mui/material/LinearProgress';

const CenteredLoader = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div style={{ width: '50%' }}>
        <LinearProgress />
      </div>
    </div>
  );
};

export default CenteredLoader;
