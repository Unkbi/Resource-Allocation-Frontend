"use client"

import { Radio, FormControlLabel, Box } from "@mui/material"
import { styled } from "@mui/system"

const StyledBox = styled(Box)(({ selected, backgroundColor, borderColor }) => ({
  width: "60px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: selected ? backgroundColor : `${backgroundColor}80`, // 80 is for 50% opacity
  border: selected ? `2px solid ${borderColor}` : `1px solid ${borderColor}`,
  borderRadius: "4px",
  cursor: "pointer",
}))

const StyledRadioButton = ({ value, label, selectedValue, onChange, backgroundColor, borderColor }) => {
  const isSelected = selectedValue === value

  return (
    <FormControlLabel
      value={value}
      control={<Radio sx={{ display: "none" }} />}
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