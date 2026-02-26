import {
  formatMin1Max2,
  normalizeAllocationValue,
} from '@/app/utils/actualsUtils';
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

  const rawValue =
    params.value !== '' && params.value !== null && params.value !== undefined
      ? normalizeAllocationValue(params.value)
      : 0;

  const rawActuals =
    params.actuals !== '' &&
    params.actuals !== null &&
    params.actuals !== undefined
      ? normalizeAllocationValue(params.actuals)
      : 0;

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
          <Typography>{formatMin1Max2(rawValue)}</Typography>
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
            {formatMin1Max2(rawActuals)}
          </Typography>
        </Box>
      </Box>
    </div>
  );
};

export default AllocationCellWithActuals;
