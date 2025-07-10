import React from 'react';
import { Avatar, Box } from '@mui/material';

interface CustomAvatarProps {
  value: string;
  showFullName?: boolean;
  avatarSx?: React.CSSProperties;
}

const CustomAvatar: React.FC<CustomAvatarProps> = ({
  value,
  showFullName = false,
  avatarSx = {},
}) => {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const getInitialsColor = (name: string): string => {
    const colors = [
      '#816CB3',
      '#B56A9B',
      '#1C2D5F',
      '#4779CD',
      '#6BB6B2',
      '#DD5091',
      '#828F95',
      '#7B90DE',
      '#E59D6D',
    ];

    const hash = name
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return colors[hash % colors.length];
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
      <Avatar
        sx={{
          width: 20,
          height: 20,
          fontSize: 8,
          marginRight: 1,
          backgroundColor: getInitialsColor(value),
          flexShrink: 0,
          ...avatarSx,
        }}
      >
        {getInitials(value)}
      </Avatar>
      {showFullName && (
        <Box
          component="span"
          sx={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            minWidth: 0,
          }}
        >
          {value}
        </Box>
      )}
    </Box>
  );
};

export default CustomAvatar;
