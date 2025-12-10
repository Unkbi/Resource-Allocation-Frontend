'use client';

import { styled } from '@mui/material';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
} from '@mui/x-data-grid-premium';

const commonButtonStyles = {
  backgroundColor: 'rgba(242, 245, 250, 0.3)',
  border: '1px solid rgb(214, 220, 225)',
  borderRadius: '4px',
  height: '32px',
  width: '34px',
  padding: '5px 12px',
  fontSize: '13px',
  color: 'rgb(33, 33, 33)',
  fontWeight: '600',
  textTransform: 'none',
  minWidth: '0px',
};

const StyledGridToolbarColumnsButton = styled(GridToolbarColumnsButton)({
  '& .MuiButton-startIcon': {
    marginRight: '0px !important',
  },
  '& .MuiButton-endIcon': {
    display: 'none',
  },
  '& .MuiButton-text': {
    fontSize: 0,
    width: 0,
    padding: 0,
    overflow: 'hidden',
  },
});

export default function ReportBuilderDataGridToolbar() {
  return (
    <GridToolbarContainer 
      sx={{ 
        p: 2, 
        gap: '12px',
        justifyContent: 'flex-start',
      }}
    >
      <StyledGridToolbarColumnsButton
        slotProps={{
          tooltip: { title: 'Columns' },
          button: {
            variant: 'outlined',
            startIcon: (
              <img
                src="/images/icons/newColumnPeople.svg"
                alt="columns"
                style={{ marginLeft: '8px' }}
              />
            ),
            className: 'columns-button',
            sx: commonButtonStyles,
          },
        }}
      />
    </GridToolbarContainer>
  );
}
