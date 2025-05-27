
import { Box } from '@mui/material';

const NoRowsOverlay = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      color: '#888',
      fontSize: '16px',
    }}
  >
    No matching data found. Try adjusting the filters above.
  </Box>
);

export default NoRowsOverlay;
