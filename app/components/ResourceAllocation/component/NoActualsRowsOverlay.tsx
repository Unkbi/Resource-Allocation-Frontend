import { Box } from '@mui/material';

interface NoRowsOverlayProps {
  text?: string;
}

const NoActualsRowsOverlay = ({
  text = 'No Allocations found.',
}: NoRowsOverlayProps) => (
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
    {text}
  </Box>
);

export default NoActualsRowsOverlay;
