'use client';

import { TextField } from '@mui/material';
import { GridRenderEditCellParams } from '@mui/x-data-grid-premium';
import { useState, useEffect } from 'react';

export default function CommentCell(props: GridRenderEditCellParams) {
  const { id, value, api, field } = props;
  const [inputValue, setInputValue] = useState(value || '');
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value;
    setInputValue(newVal); 
    api.setEditCellValue({ id, field, value: newVal }, event); 
  };

  return (
    <TextField
      value={inputValue}
      onChange={handleChange}
      variant="standard"
      fullWidth
      multiline
      placeholder="Enter Comments"
      slotProps={{
        input: {
          disableUnderline: true,
          sx: { pl: 1, pr: 1, height: '100%', fontSize: 14 },
        },
      }}
    />
  );
}
