import { Box, Tabs, Tab, styled, Button, Theme, Badge } from '@mui/material';
import { SyntheticEvent, useState, useEffect } from 'react';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  useGridApiContext,
} from '@mui/x-data-grid-premium'; 
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { useDispatch } from 'react-redux';
import {
  PORTFOLIO_DISPLAY_NAME,
  PROJECT_PAGE_VALID_TABS,
} from '@/app/constants/constants';
import CommonToolbar from './CommonToolbar';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';

interface ProjectToolbarProps {
  setFilterButtonEl?: (el: HTMLElement | null) => void;
  value: 'project' | 'portfolio' | 'businessImpact';
  onChange: (
    event: SyntheticEvent,
    newValue: 'project' | 'portfolio' | 'businessImpact'
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


const FilterButtonWithCount = () => {
  const apiRef = useGridApiContext();
  const [filterCount, setFilterCount] = useState(0);

  useEffect(() => {
    if (!apiRef?.current) return;
    const updateFilterCount = () => {
      const filters = apiRef.current.state.filter.filterModel.items;
      const activeCount = filters.filter(f => !!f.value).length;
      setFilterCount(activeCount);
    };
    updateFilterCount();
    return apiRef.current.subscribeEvent('filterModelChange', updateFilterCount);
  }, [apiRef]);

  return (
    <Badge
      badgeContent={filterCount > 0 ? filterCount : 0}
      color="primary"
      sx={{
        '& .MuiBadge-badge': {
          top: '-6px',
          right: '-6px',
          backgroundColor: '#1C2D5F',
          fontSize: '10px',
          height: '16px',
          minWidth: '16px',
        },
      }}
    >
      <GridToolbarFilterButton
        slotProps={{
          tooltip: { title: 'Filter' },
          button: {
            variant: 'outlined',
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
    </Badge>
  );
};

const ProjectToolbar = ({
  setFilterButtonEl,
  value,
  onChange = () => {},
  permissions,
}: ProjectToolbarProps) => {
  const dispatch = useDispatch();

  if (!PROJECT_PAGE_VALID_TABS.includes(value)) {
    return null; // or a fallback UI
  }

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
          {Object.keys(permissions).some(
            resourceName => permissions[resourceName]?.r
          ) && (
            <Tabs
              value={value}
              onChange={onChange}
              textColor="primary"
              indicatorColor="primary"
              aria-label="secondary tabs example"
            >
              {permissions['Project'].r && (
                <Tab value="project" label="Projects" sx={tabTypographyStyle} />
              )}
              {permissions['Portfolio'].r && (
                <Tab
                  value="portfolio"
                  label="Portfolios"
                  sx={tabTypographyStyle}
                />
              )}
              {
                // Sahadev : Hard Code, once this tab is developed remove Hard Code.
                false && (
                  <Tab
                    value="businessImpact"
                    label="Business Impact"
                    disabled
                    sx={tabTypographyStyle}
                  />
                )
              }
            </Tabs>
          )}
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
              <FilterButtonWithCount />
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
              {permissions['Portfolio']?.c && value === 'portfolio' && (
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

export default withRBAC(ProjectToolbar, ['Project', 'Portfolio']);
