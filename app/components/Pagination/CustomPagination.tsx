'use client';

import { Pagination, Box } from '@mui/material';
import { styled } from '@mui/system';
import type { GridApiCommon } from '@mui/x-data-grid-pro';
import type { SyntheticEvent } from 'react';

const StyledPagination = styled(Pagination)(({ theme }) => ({
  '& .MuiPagination-ul': {
    justifyContent: 'center',
    padding: theme.spacing(2),
    borderRadius: '6px',
  },
  '& .MuiPaginationItem-root': {
    margin: '0 4px',
    backgroundColor: 'transparent',
    border: 'none',
  },
  '& .MuiPaginationItem-root.Mui-selected': {
    backgroundColor: '#1C2D5F',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#182752',
    },
  },
  '& .MuiPaginationItem-icon': {
    color: '#000',
  },
}));

interface CustomPaginationProps {
  apiRef: React.MutableRefObject<GridApiCommon>;
}

const CustomPagination = ({ apiRef }: CustomPaginationProps) => {
  const paginationState = apiRef.current.state.pagination;
  const page = paginationState.paginationModel?.page || 0;
  const rowCount = paginationState.rowCount || 0;
  const pageSize = paginationState.paginationModel?.pageSize || 10;
  const pageCount = Math.ceil(rowCount / pageSize);

  const handleChange = (_event: React.ChangeEvent<unknown>, page: number) => {
  apiRef.current.setPage(page - 1);
};

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'right',
        width: '100%',
        boxShadow: '0px -10px 2px #F0F0F0',
        marginTop: '10px',
      }}
    >
      <StyledPagination
        count={pageCount}
        page={page + 1}
        onChange={handleChange}
        variant="outlined"
        shape="rounded"
        color="primary"
        showFirstButton
        showLastButton
      />
    </Box>
  );
};

export default CustomPagination;