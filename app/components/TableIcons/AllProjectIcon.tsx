import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

interface AllProjectIconProps extends SvgIconProps {
  customColor?: string;
}

const AllProjectIcon: React.FC<AllProjectIconProps> = ({
  customColor = '#AEB5C1',
  fontSize = 'medium',
  ...props
}) => {
  return (
    <SvgIcon {...props} fontSize={fontSize} viewBox="0 0 24 24">
      <g stroke="none" strokeWidth="1" fill="#5C6777" fillRule="evenodd">
        <g
          transform="translate(3, 3)"
          stroke={customColor}
          strokeLinecap="round"
          strokeWidth="1.4"
        >
          <g fill="#FBFCFD" strokeLinejoin="round">
            <path d="M6.94852941,0 C4.88970588,0 3.34558824,0 2.31617647,0 C2.14460784,0 1.8872549,0 1.54411765,0 C0,0 0,1.54411765 0,1.54411765 L0,13.8970588 C0,14.7498515 0.691325019,15.4411765 1.54411765,15.4411765 L10.8088235,15.4411765 C11.6616162,15.4411765 12.3529412,14.7498515 12.3529412,13.8970588 L12.3529412,5.40441176 L6.94852941,0 Z" />
          </g>
          <path
            d="M12.5955882,2.64705882 C10.5367647,2.64705882 8.99264706,2.64705882 7.96323529,2.64705882 C7.79166667,2.64705882 7.53431373,2.64705882 7.19117647,2.64705882 C5.64705882,2.64705882 5.64705882,4.19117647 5.64705882,4.19117647 L5.64705882,16.5441176 C5.64705882,17.3969103 6.33838384,18.0882353 7.19117647,18.0882353 L16.4558824,18.0882353 C17.308675,18.0882353 18,17.3969103 18,16.5441176 L18,8.05147059 L12.5955882,2.64705882 Z"
            fill="#FBFCFD"
            strokeLinejoin="round"
          />
          <polyline
            points="12.5955882 2.64705882 12.5955882 8.05147059 18 8.05147059"
            strokeLinejoin="round"
          />
          <line
            x1="8.29411765"
            y1="12.3529412"
            x2="13.5882353"
            y2="12.3529412"
          />
          <line
            x1="2.29411765"
            y1="8.35294118"
            x2="5.58823529"
            y2="8.35294118"
          />
        </g>
      </g>
    </SvgIcon>
  );
};

export default AllProjectIcon;