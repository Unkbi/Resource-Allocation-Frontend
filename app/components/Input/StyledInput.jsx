import { styled, TextField } from '@mui/material';

export const StyledInput = styled(TextField)(
  ({ theme, width, margin, padding, height }) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: '4px',
      height: height || '36px',
      backgroundColor: '#FFF',
      fontSize: '12px',
    },
    width: width || '100%',
    margin: margin || '0',
    padding: padding || '0',
  })
);
