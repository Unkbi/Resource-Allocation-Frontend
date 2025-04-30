'use client';

import { TextField } from '@mui/material';
import { GridRenderEditCellParams } from '@mui/x-data-grid-premium';

export default function CommentCell(props: GridRenderEditCellParams) {
  const { id, value, api, field } = props;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    api.setEditCellValue({ id, field, value: event.target.value }, event);
  };

  return (
    <TextField
      value={value || ''}
      onChange={handleChange}
      variant="standard"
      fullWidth
      InputProps={{
        disableUnderline: true,
        sx: { pl: 1, pr: 1, height: '100%' },
      }}
    />
  );
}
