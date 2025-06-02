import { Box } from '@mui/material';
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';

const SplitProjectToolbar = ({
  setFilterButtonEl,
}: {
  setFilterButtonEl: any;
}) => {
  return (
    <Box
    // style={{
    //   display: 'none',
    // }}
    >
      <GridToolbarContainer ref={setFilterButtonEl}>
        <GridToolbarFilterButton />
      </GridToolbarContainer>
    </Box>
  );
};

export default SplitProjectToolbar;
