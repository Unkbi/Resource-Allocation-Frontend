import { Box, Tabs, Tab, styled, Button } from '@mui/material';
import { useState } from 'react';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { useDispatch } from 'react-redux';
import { PORTFOLIO_DISPLAY_NAME } from '@/app/constants/constants';
import CommonToolbar from './CommonToolbar';

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

const portfolioButtonStyle = {
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

const tabTypographyStyle = {
  color: 'var(--text-secondary, rgba(0, 0, 0, 0.60))',
  fontFamily: 'Open Sans',
  fontSize: '14px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '24px',
  textTransform: 'uppercase',
  '&.Mui-selected': {
    fontWeight: 600,
    color: '#182752',
  },
};

const ProjectToolbar = ({ setFilterButtonEl, value, onChange = () => {} }) => {
  const dispatch = useDispatch();
  const handleAddPortfolio = () => {
    dispatch(
      openDialog({
        title: `Add ${PORTFOLIO_DISPLAY_NAME}`,
        submitButtonText: 'Add',
        cancelButtonText: 'Cancel',
        formType: 'add_portfolio',
        initialData: '',
      })
    );
  };
  return (
    <CommonToolbar>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px',
          pl: 2,
          pr: 1.75,
          flexGrow: 1,
        }}
      >
        <Box
          className="tabsMenu"
          sx={{
            marginTop: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            flex: '1 0 0',
          }}
        >
          <Tabs
            value={value}
            onChange={onChange}
            textColor="primary"
            indicatorColor="primary"
            aria-label="secondary tabs example"
          >
            <Tab value="project" label="Projects" sx={tabTypographyStyle} />
            <Tab value="portfolio" label="Portfolio" sx={tabTypographyStyle} />
            <Tab
              value="businessImpact"
              label="Business Impact"
              disabled
              sx={tabTypographyStyle}
            />
          </Tabs>
        </Box>

        <Box className="line" sx={{ marginRight: '16px', height: '64px' }}>
          <img src="/images/icons/LinePeople.svg" />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box className="filterColBlock">
            <GridToolbarContainer ref={setFilterButtonEl} sx={{ gap: '12px' }}>
              <GridToolbarFilterButton
                slotProps={{
                  tooltip: { title: 'Filter' },
                  button: {
                    variant: 'outlined',
                    sx: { color: '#555', borderColor: '#ddd' },
                    startIcon: (
                      <img
                        src="/images/icons/newFilterPeople.svg"
                        alt="filter"
                        style={{ marginLeft: '8px' }}
                      />
                    ),
                    className: 'columns-button',
                    sx: commonButtonStyles,
                  },
                }}
              />
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
              {value === 'portfolio' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddPortfolio}
                  sx={portfolioButtonStyle}
                >
                  Add Portfolio
                </Button>
              )}
            </GridToolbarContainer>
          </Box>
        </Box>
      </Box>
    </CommonToolbar>
  );
};

export default ProjectToolbar;
