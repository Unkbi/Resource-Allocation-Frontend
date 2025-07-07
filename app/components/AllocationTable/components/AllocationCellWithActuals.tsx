import { Box, Typography } from '@mui/material';

interface AllocationCellWithActualsProps {
  params: any;
}
const AllocationCellWithActuals = ({
  params,
}: AllocationCellWithActualsProps) => {
  const getBackgroundColor = (value: number, actuals: number) => {
    if (isNaN(value) || isNaN(actuals)) {
      return 'transparent';
    }
    if (value === 0 && actuals === 0) {
      return 'transparent';
    }
    if (value === actuals) {
      return '#F0FFEC';
    } else if (value < actuals) {
      return '#FFF5F5';
    } else if (value > actuals) {
      return '#FFF8D6';
    } else {
      return 'transparent';
    }
  };

  // const notes = (parseFloat(params?.formattedValue as string) * 10) % 2;
  const notes = (params?.notes as string) || '';

  return (
    <div>
      <Box
        sx={{
          ...(notes ? { position: 'relative' } : {}),
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          padding: '0px !important',
        }}
      >
        <Box sx={{ position: 'relative', top: 0, left: 0, zIndex: 1 }}>
          <Typography sx={{ fontWeight: 600 }}>
            {params?.value as string}
          </Typography>
        </Box>
        <Box
          sx={{
            width: '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: getBackgroundColor(
              Number.parseFloat(params?.value as string),
              Number.parseFloat(params?.actuals as string)
            ),
            flex: 1,
          }}
        >
          <Typography
            sx={{
              fontStyle: 'italic',
            }}
          >
            {params?.actuals as string}
          </Typography>
        </Box>
      </Box>
    </div>
  );
};

export default AllocationCellWithActuals;
