import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

interface MyTeamsIconProps extends SvgIconProps {
  customColor?: string;
}

const MyTeamsIcon: React.FC<MyTeamsIconProps> = ({
  customColor = '#344665',
  fontSize = 'medium',
  ...props
}) => {
  return (
    <SvgIcon
      {...props}
      fontSize={fontSize}
      viewBox="0 0 14 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 14.5V13C13 11.3431 11.6569 10 10 10H4C2.34315 10 1 11.3431 1 13V14.5"
        stroke={customColor}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle
        cx="7"
        cy="4"
        r="3"
        stroke={customColor}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </SvgIcon>
  );
};

export default MyTeamsIcon;