import {
  ColumnManagementStyles,
  FilterPanelStyles,
  StyledDataGrid,
} from '../../AllocationTable/styles/StyledDataGrid';
import { GridColumnMenu, useGridApiRef } from '@mui/x-data-grid-premium';
import ProjectToolbar from '../../Toolbar/ProjectToolbar';
import { useState } from 'react';
import { Box } from '@mui/material';
import { withRBAC } from '../../HOC/withRBAC';

function CustomColumnMenu(props) {
  return (
    <GridColumnMenu
      {...props}
      slots={{
        columnMenuAggregationItem: null,
        columnMenuGroupingItem: null,
      }}
    />
  );
}

const ProjectTable = ({
  columns,
  rows,
  loading,
  apiRef,
  value,
  onChange = () => {},
  permissions ,
}) => {
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const entity = value === 'project' ? 'Project' : 'Portfolio';
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 31px)',
      }}
    >
      <StyledDataGrid
        apiRef={apiRef}
        columns={columns}
        rows={permissions[entity]?.r ? rows : []}
        hideFooter={true}
        loading={loading}
        initialState={{
          sorting: {
            sortModel: [{ field: 'Name', sort: 'asc' }],
          },
          columns: {
            columnVisibilityModel: {
              ProjectSponsor: false,
              ProjectManager: false,
              Location: false,
              Budget: false,
              BudgetCurrency: false,
            },
          },
        }}
        slots={{
          toolbar: ProjectToolbar,
          columnMenu: CustomColumnMenu,
        }}
        localeText={{
          toolbarFilters: '',
          toolbarColumns: '',
        }}
        sx={{
          height: '95vh',
          '& .MuiDataGrid-columnHeader': {
            padding: '0 16px',
            borderRight: 'none',
          },
        }}
        slotProps={{
          loadingOverlay: {
            variant: 'skeleton',
            noRowsVariant: 'skeleton',
          },
          panel: {
            anchorEl: filterButtonEl,
            className: 'parent-grid-panel',
            placement: 'bottom-end',
          },
          toolbar: {
            setFilterButtonEl,
            value: value,
            onChange: onChange,
          },
          columnsPanel: {
            className: 'styleColumnMenu',
            sx: ColumnManagementStyles,
          },
          filterPanel: {
            columnsSort: 'asc',
            className: 'filterPopup',
            filterFormProps: {
              columnInputProps: {
                size: 'small',
                sx: { mt: 'auto' },
              },
              operatorInputProps: {
                size: 'small',
                sx: { mt: 'auto' },
              },
              valueInputProps: {
                InputComponentProps: {
                  size: 'small',
                },
              },
              deleteIconProps: {
                sx: {
                  '& .MuiSvgIcon-root': { color: '#d32f2f' },
                },
              },
            },
            sx: FilterPanelStyles,
          },
        }}
      />
    </Box>
  );
};

export default withRBAC(ProjectTable,['Project','Portfolio']);
