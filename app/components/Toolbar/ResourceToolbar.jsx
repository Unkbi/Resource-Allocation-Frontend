import { Box, Tabs, Tab, styled } from '@mui/material';
import { useState } from 'react';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';

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

const ResourceToolbar = ({ setFilterButtonEl }) => {
  const [value, setValue] = useState('resource');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const clickHandler = () => {
   console.log("clicked")
  }

  return (
    <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="primary"
        indicatorColor="primary"
        aria-label="secondary tabs example"
      >
        <Tab value="resource" label="Resource" />
        <Tab value="teams" label="Teams" />
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
                    <img src="/images/icons/columns.svg" alt="columns" style={{ marginLeft: '8px' }} />
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
                    <img src="/images/icons/filter.svg" alt="filter" style={{ marginLeft: '8px' }} />
                  ),
                  className: 'columns-button',
                  sx: commonButtonStyles,
                },
              }}
            />
            <ActionButton
              src="/images/icons/download.svg"
              alt="download"
            />
            <ActionButton
              src="/images/icons/upload.svg"
              alt="upload"
            />
          </GridToolbarContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default ResourceToolbar;
