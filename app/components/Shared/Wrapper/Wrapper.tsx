import { Container } from '@mui/material';
import React, { ReactNode } from 'react';

interface WrapperProps {
  children: ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  return (
    <Container sx={{ marginLeft: '250px', width: 'calc(100vw - 250px)' }}>
      {children}
    </Container>
  );
};

export default Wrapper;