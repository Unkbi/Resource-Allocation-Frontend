import { Box, Tabs, Tab, styled, Button } from '@mui/material';
import { useState,dispatch } from 'react';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { useDispatch } from 'react-redux';

const commonButtonStyles = {
  backgroundColor: 'rgba(242, 245, 250, 0.3)',
  border: '1px solid rgb(214, 220, 225)',
  borderRadius: '4px',
  height: '32px',
  width: '34px',
  padding: '5px 12px',
  fontSize: '13px',
  color: 'rgb(33, 33, 33)',
  fontFamily: theme => theme.typography.fontFamily,
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
  '& .filterColBlock': {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    '& button': commonButtonStyles,
  },
  '& .columns-button': {
    textTransform: 'none',
  },
});

const ActionButton = ({ src, alt, onClick }) => (
  <button
    style={{
      height: '32px',
      width: '34px',
      border: 'rgba(242, 245, 250, 0.3)',
      borderRadius: '4px',
      backgroundColor: 'rgba(242, 245, 250, 0.3)',
    }}
  >
    <img src={src} alt={alt} />
  </button>
);

const ratesButtonStyle = {
  width: 90,
  height: 36,
  flexShrink: 0,
  backgroundColor: '#1C2D5F', 
  color: '#FFF',
  textAlign: 'center',
  fontFamily: '"Open Sans", sans-serif',
  fontSize: 12,
  fontStyle: 'normal',
  fontWeight: 700,
  lineHeight: 'normal',
  textTransform: 'none', 
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1,
  '&:hover': {
    backgroundColor: '#16305a',
  },
};

const ResourceToolbar = ({
  setFilterButtonEl,
  value,
  onChange = () => {},
}) => {
  const dispatch = useDispatch();
 const handleAddRate =() =>{
  dispatch(
    openDialog({
      title: 'Add Rate',
      submitButtonText: 'Add',
      cancelButtonText: 'Cancel',
      formType: 'add_rates',
      initialData: '',
    })
  );
 } 
  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '12px',
      }}
    >
      <Tabs
        value={value}
        onChange={onChange}
        textColor="primary"
        indicatorColor="primary"
        aria-label="secondary tabs example"
      >
        <Tab value="resource" label="Resources" />
        <Tab value="teams" label="Teams" />
        <Tab value="rates" label="Rates" />
      </Tabs>
      <Box>
        <Box className="filterColBlock">
          <GridToolbarContainer ref={setFilterButtonEl}>
            <StyledGridToolbarColumnsButton
              slotProps={{
                tooltip: { title: 'Columns' },
                button: {
                  variant: 'outlined',
                  startIcon: (
                    <img
                      src="/images/icons/columns.svg"
                      alt="columns"
                      style={{ marginLeft: '8px' }}
                    />
                  ),
                  className: 'columns-button',
                  sx: commonButtonStyles,
                },
              }}
            />
            <GridToolbarFilterButton
              slotProps={{
                tooltip: { title: 'Filter' },
                button: {
                  variant: 'outlined',
                  sx: { color: '#555', borderColor: '#ddd' },
                  startIcon: (
                    <img
                      src="/images/icons/filter.svg"
                      alt="filter"
                      style={{ marginLeft: '8px' }}
                    />
                  ),
                  className: 'columns-button',
                  sx: commonButtonStyles,
                },
              }}
            />
            <ActionButton src="/images/icons/download.svg" alt="download" />
            <ActionButton src="/images/icons/upload.svg" alt="upload" />
            {value === 'rates' && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddRate}
                sx={ratesButtonStyle}
              >
                Add Rate
              </Button>
            )}
          </GridToolbarContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default ResourceToolbar;
