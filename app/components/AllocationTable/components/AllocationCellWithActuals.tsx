import { RootState } from '@/app/redux/store';
import { AllocationGridCell, AllocationGridCellData } from '@/app/types';
import { Box, Divider, Typography } from '@mui/material';
import { GridCellParams } from '@mui/x-data-grid-premium';
import { useSelector } from 'react-redux';

interface AllocationCellWithActualsProps {
  params: GridCellParams<AllocationGridCell>;
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
  //   const CommentTagIcon = () => (
  //     // <img src="/images/icons/CommentTag.svg" alt="comment" />
  //     <svg
  //       xmlns="http://www.w3.org/2000/svg"
  //       width="12"
  //       height="9"
  //       viewBox="0 0 12 9"
  //       fill="none"
  //     >
  //       <path d="M6 8.75L0 0.75L12 0.750001L6 8.75Z" fill="#FBEDED" />
  //     </svg>
  //   );
  const CommentTagIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
    >
      <path d="M0 0 L0 10 L10 0 Z" fill="#C76C6C" />
    </svg>
  );

  const comment = (parseFloat(params?.formattedValue as string) * 10) % 2;

  return (
    <Box>
      {comment ? (
        <Box
          sx={{
            position: 'relative',
            top: -22,
            right: 0,
            zIndex: 0,
            height: '2px',
            width: '2px',
          }}
        >
          <CommentTagIcon />
        </Box>
      ) : (
        <></>
      )}
      {/* <Divider /> */}

      <Box
        sx={{
          ...(comment ? { position: 'relative', top: -2 } : {}),
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          padding: '0px !important',
        }}
      >
        <Box sx={{ position: 'relative', top: 0, left: 0, zIndex: 1 }}>
          <Typography sx={{ fontWeight: 600 }}>
            {params?.formattedValue as string}
          </Typography>
        </Box>
        <Box>
          <Typography
            sx={{
              fontStyle: 'italic',
              backgroundColor: getBackgroundColor(
                parseFloat(params?.formattedValue as string)
              ),
            }}
          >
            {params?.formattedValue as string}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AllocationCellWithActuals;
