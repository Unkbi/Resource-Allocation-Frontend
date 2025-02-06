import React from 'react';
import { Tooltip, Button } from '@mui/material';

const TooltipButton = ({ msg, className, onClick, children, ...rest }) => {
  return (
    <Tooltip title={msg} placement="top" arrow>
      <Button className={className} {...rest} onClick={onClick}>
        {children}
      </Button>
    </Tooltip>
  );
};

export default TooltipButton;
