import React, { ReactNode, MouseEventHandler } from 'react';
import {
  Tooltip,
  Button,
  styled,
  tooltipClasses,
  TooltipProps,
  ButtonProps,
} from '@mui/material';

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#142B51',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#142B51',
  },
}));

interface TooltipButtonProps extends ButtonProps {
  msg: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
}

const TooltipButton: React.FC<TooltipButtonProps> = ({
  msg,
  className,
  onClick,
  children,
  ...rest
}) => {
  return (
    <StyledTooltip title={msg} placement="top" arrow>
      <Button className={className} {...rest} onClick={onClick}>
        {children}
      </Button>
    </StyledTooltip>
  );
};

export default TooltipButton;
