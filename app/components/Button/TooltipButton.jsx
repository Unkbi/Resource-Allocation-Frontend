import React from 'react';
import { Tooltip, Button, styled, tooltipClasses } from '@mui/material';
const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#142B51',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#142B51',
  },
}));

const TooltipButton = ({ msg, className, onClick, children, ...rest }) => {
  return (
    <StyledTooltip title={msg} placement="top" arrow>
      <Button className={className} {...rest} onClick={onClick}>
        {children}
      </Button>
    </StyledTooltip>
  );
};

export default TooltipButton;
