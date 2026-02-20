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
    // if (value === 0 && actuals === 0) {
    //   return 'transparent';
    // }
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
  const rawValue = params.value ? parseFloat(params.value) : 0;
  let rawActuals = params.actuals ? parseFloat(params.actuals) : 0;
  const notes = (params?.notes as string) || '';
  if (
    (params.actuals === null || params.actuals === undefined) &&
    !isNaN(rawValue)
  ) {
    rawActuals = 0;
  }

  const formattedValue = !isNaN(rawValue) ? rawValue.toFixed(1) : '';
  const formattedActuals = !isNaN(rawActuals) ? rawActuals.toFixed(1) : '';

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
          <Typography>{formattedValue}</Typography>
        </Box>
        <Box
          sx={{
            width: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: getBackgroundColor(rawValue, rawActuals),
            flex: 1,
          }}
          className="actualsBox"
        >
          <Typography
            sx={{
              fontStyle: 'italic',
              fontWeight: 600,
            }}
          >
            {formattedActuals}
          </Typography>
        </Box>
      </Box>
    </div>
  );
};

export default AllocationCellWithActuals;
