"use client"

import { Radio, FormControlLabel, Box } from "@mui/material"
import { styled } from "@mui/system"
import type { FC, ReactNode } from 'react';

interface StyledBoxProps {
  selected: boolean;
  backgroundColor: string;
  borderColor: string;
}


const StyledBox = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'selected' && prop !== 'backgroundColor' && prop !== 'borderColor',
})<StyledBoxProps>(({ selected, backgroundColor, borderColor }) => ({
  width: '60px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: selected ? backgroundColor : `${backgroundColor}80`, // 80 is for 50% opacity
  border: selected ? `2px solid ${borderColor}` : `1px solid ${borderColor}`,
  borderRadius: '4px',
  fontWeight: selected ? 'bold' : 'normal',
  cursor: 'pointer',
}));

interface StyledRadioButtonProps {
  value: string;
  label: ReactNode;
  selectedValue: string;
  onChange: (event: React.SyntheticEvent<Element, Event>, checked: boolean) => void;
  backgroundColor: string;
  borderColor: string;
}


const StyledRadioButton: FC<StyledRadioButtonProps> = ({ value, label, selectedValue, onChange, backgroundColor, borderColor }) => {
  const isSelected = selectedValue === value

  return (
     <FormControlLabel
      value={value}
      control={<Radio sx={{ display: 'none' }} />}
      label={
        <StyledBox selected={isSelected} backgroundColor={backgroundColor} borderColor={borderColor}>
          {label}
        </StyledBox>
      }
      sx={{ margin: 0 }}
      onChange={onChange}
    />
  )
}

export default StyledRadioButton