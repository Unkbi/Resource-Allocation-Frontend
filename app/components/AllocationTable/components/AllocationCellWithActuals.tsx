import { RootState } from '@/app/redux/store';
import { AllocationGridCell, AllocationGridCellData } from '@/app/types';
import { Box, Divider, Typography, Tooltip, styled, PopperProps } from '@mui/material';
import { GridCellParams } from '@mui/x-data-grid-premium';
import { useSelector } from 'react-redux';

interface AllocationCellWithActualsProps {
  params: any;
}
const AllocationCellWithActuals = ({
  params,
}: AllocationCellWithActualsProps) => {
  const { allocationTheme } = useSelector((state: RootState) => state.settings);

  const getBackgroundColor = (value: number) => {
    return (
      allocationTheme?.find(
        theme =>
          value >= parseFloat(theme.From) && value <= parseFloat(theme.To)
      )?.Color + '66' || 'transparent'
    );
  };

  // const notes = (parseFloat(params?.formattedValue as string) * 10) % 2;
  const notes = params?.notes as string || "";

  return (
    <div>
      <Box
        sx={{
          ...(notes ? { position: 'relative'} : {}),
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
             width: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: getBackgroundColor(Number.parseFloat(params?.value as string)),
          flex: 1,
          }}>
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
