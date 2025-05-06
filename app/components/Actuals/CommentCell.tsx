'use client';

import { TextField } from '@mui/material';
import { GridRenderEditCellParams } from '@mui/x-data-grid-premium';
import { useState, useEffect } from 'react';

export default function CommentCell(props: GridRenderEditCellParams) {
  const { id, value, api, field } = props;
  const [inputValue, setInputValue] = useState(value || '');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setInputValue(value || '');
    setShowError(!value); // Show error if empty initially
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value;
    setInputValue(newVal);
    setShowError(newVal.trim() === '');
    api.setEditCellValue({ id, field, value: newVal }, event);
  };

  return (
    <TextField
      value={inputValue}
      onChange={handleChange}
      variant="outlined"
      fullWidth
      required
      // multiline
      error={showError}
      placeholder="Enter Comments"
      helperText={showError ? '*Required Field' : ' '}
      className={showError ? 'comment-error-cell' : ''}
      sx={{
        zIndex: 1001,
        backgroundColor: '#fff',
        height: '100%',
        '& .MuiOutlinedInput-root': {
          height: '100%',
          padding: '0 8px',
          fontSize: 14,
          alignItems: 'center',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: showError ? '#d32f2f' : undefined,
        },
        '& input::placeholder': {
          color: showError ? '#d32f2f' : '#aaa',
          opacity: 1,
        },
        '& .MuiFormHelperText-root': {
          marginLeft: '4px',
          fontSize: '11px',
        },
      }}
    />
  );
}
