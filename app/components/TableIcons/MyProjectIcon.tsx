import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

interface MyProjectIconProps extends SvgIconProps {
  customColor?: string;
}

const MyProjectIcon: React.FC<MyProjectIconProps> = ({
  customColor = '#344665',
  fontSize = 'medium',
  ...props
}) => {
  return (
    <SvgIcon {...props} fontSize={fontSize} viewBox="0 0 24 24">
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g
          transform="translate(5, 3)"
          stroke={customColor}
          strokeLinecap="round"
          strokeWidth="1.4"
        >
          <g strokeLinejoin="round">
            <path d="M7.875,0 C5.54166667,0 3.79166667,0 2.625,0 C2.43055556,0 2.13888889,0 1.75,0 C0,0 0,1.75 0,1.75 L0,15.75 C0,16.7164983 0.783501688,17.5 1.75,17.5 L12.25,17.5 C13.2164983,17.5 14,16.7164983 14,15.75 L14,6.125 L7.875,0 Z" />
            <polyline points="7.875 0 7.875 6.125 14 6.125" />
          </g>
          <line
            x1="3"
            y1="11"
            x2="9"
            y2="11"
            stroke={customColor}
            strokeWidth="1.4"
          />
        </g>
      </g>
    </SvgIcon>
  );
};

export default MyProjectIcon;
