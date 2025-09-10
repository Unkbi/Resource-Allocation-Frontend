import React, { SyntheticEvent } from 'react';
import { Box, Tabs, Tab, styled, Button } from '@mui/material';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { useDispatch } from 'react-redux';
import CommonToolbar from './CommonToolbar';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';

const VALID_TABS = ['resource', 'teams', 'organizations', 'rates'] as const;

interface ResourceToolbarProps {
  setFilterButtonEl?: (el: HTMLElement | null) => void;
  value: 'resource' | 'teams' | 'rates' | 'organizations';
  onChange: (
    event: SyntheticEvent,
    newValue: 'resource' | 'teams' | 'rates' | 'organizations'
  ) => void;
  permissions: Record<string, CrudPermissions>;
}

const commonButtonStyles = {
  backgroundColor: 'rgba(242, 245, 250, 0.3)',
  border: '1px solid rgb(214, 220, 225)',
  borderRadius: '4px',
  height: '32px',
  width: '34px',
  padding: '5px 12px',
  fontSize: '13px',
  color: 'rgb(33, 33, 33)',
  fontFamily: (theme: any) => theme.typography.fontFamily,
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

const ActionButton = ({
  src,
  alt,
  onClick,
}: {
  src: string;
  alt: string;
  style: any;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      height: '32px',
      width: '34px',
      border: 'rgba(242, 245, 250, 0.3)',
      borderRadius: '4px',
      backgroundColor: 'rgba(242, 245, 250, 0.3)',
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <img src={src} alt={alt} style={{ height: '36px', width: '36px' }} />
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
  onChange,
  permissions,
}: ResourceToolbarProps) => {
  const dispatch = useDispatch();

  if (!VALID_TABS.includes(value)) {
    return null; // or a fallback UI
  }

  const handleAddRate = () => {
    dispatch(
      openDialog({
        title: 'Add Rate',
        submitButtonText: 'Add',
        cancelButtonText: 'Cancel',
        formType: 'add_rates',
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
          pr: 1.5,
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
            aria-label="toolbar tabs"
          >
            <Tab value="resource" label="Resources" sx={tabTypographyStyle} />
            <Tab value="teams" label="Teams" sx={tabTypographyStyle} />
            <Tab
              value="organizations"
              label="Organizations"
              sx={tabTypographyStyle}
            />
            <Tab value="rates" label="Rates" sx={tabTypographyStyle} />
          </Tabs>
        </Box>
        <Box className="line" sx={{ marginRight: '10px', height: '64px' }}>
          <img src="/images/icons/LinePeople.svg" />
        </Box>
        <Box
          className="filterColBlock"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <GridToolbarContainer ref={setFilterButtonEl}>
            <GridToolbarFilterButton
              slotProps={{
                tooltip: { title: 'Filter' },
                button: {
                  variant: 'outlined',
                  startIcon: (
                    <img
                      src="/images/icons/newFilterPeople.svg"
                      alt="filter"
                      style={{
                        marginLeft: '10px',
                        height: '36px',
                        width: '36px',
                      }}
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
                      style={{
                        marginLeft: '10px',
                        height: '36px',
                        width: '36px',
                      }}
                    />
                  ),
                  className: 'columns-button',
                  sx: commonButtonStyles,
                },
              }}
            />
            <ActionButton
              src="/images/icons/newExportPeople.svg"
              alt="download"
              style={{ height: '36px', width: '36px' }}
            />
            {/* <ActionButton src="/images/icons/upload.svg" alt="upload" /> */}
            {permissions['EmployeeRate'].c && value === 'rates' && (
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
    </CommonToolbar>
  );
};

export default withRBAC(ResourceToolbar, ['EmployeeRate']);
