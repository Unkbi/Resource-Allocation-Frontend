import React from 'react';
import { Box, Chip } from '@mui/material';

interface ChipInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  chipProps?: {
    backgroundColor?: string;
    color?: string;
    fontSize?: string;
    fontWeight?: string | number;
    height?: string | number;
    borderRadius?: string | number;
  };
  containerProps?: {
    border?: string;
    borderRadius?: string;
    padding?: string;
    minHeight?: string;
    backgroundColor?: string;
  };
}

const ChipInput: React.FC<ChipInputProps> = ({
  value = [],
  onChange,
  placeholder = "No items selected",
  error = false,
  helperText,
  disabled = false,
  chipProps = {
    backgroundColor: '#E3F2FD',
    color: '#152E75',
    fontSize: '12px',
    fontWeight: 400,
    height: '22px',
    borderRadius: '5px',
  },
  containerProps = {
    border: '1px solid #E5E7EB',
    borderRadius: '5px',
    padding: '12px',
    minHeight: '56px',
    backgroundColor: '#fff',
  }
}) => {
  const handleDelete = (indexToDelete: number) => {
    if (disabled) return;
    
    const updatedValue = value.filter((_, index) => index !== indexToDelete);
    onChange(updatedValue);
  };

  const borderColor = error ? '#f44336' : containerProps.border?.includes('#') ? containerProps.border.split(' ')[2] : '#E5E7EB';
  const focusedBorderColor = error ? '#f44336' : '#1976d2';

  return (
    <Box>
      <Box
        sx={{
          ...containerProps,
          border: `1px solid ${borderColor}`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          alignItems: 'flex-start',
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
          '&:focus-within': {
            borderColor: focusedBorderColor,
            outline: 'none',
          },
        }}
      >
        {value.map((item: string, index: number) => (
          <Chip
            key={index}
            label={item}
            onDelete={() => handleDelete(index)}
            sx={{
              backgroundColor: chipProps.backgroundColor,
              color: chipProps.color,
              fontSize: chipProps.fontSize,
              borderRadius: chipProps.borderRadius,
              fontWeight: chipProps.fontWeight,
              height: chipProps.height,
              '& .MuiChip-deleteIcon': {
                color: chipProps.color,
                fontSize: '18px',
                '&:hover': {
                  color: chipProps.color === '#1565C0' ? '#0D47A1' : 'rgba(0, 0, 0, 0.7)',
                }
              },
              '& .MuiChip-label': {
                paddingLeft: '12px',
                paddingRight: '8px',
              }
            }}
          />
        ))}
        {value.length === 0 && (
          <Box
            sx={{
              color: '#9CA3AF',
              fontSize: '14px',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              minHeight: '32px'
            }}
          >
            {placeholder}
          </Box>
        )}
      </Box>
      {helperText && (
        <Box 
          sx={{ 
            color: error ? '#f44336' : '#6A7178',
            fontSize: '0.75rem', 
            mt: 0.5,
            lineHeight: '12px'
          }}
        >
          {helperText}
        </Box>
      )}
    </Box>
  );
};

export default ChipInput;