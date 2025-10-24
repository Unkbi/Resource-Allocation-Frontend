import {
  ColumnManagementStyles,
  FilterPanelStyles,
  StyledDataGrid,
} from '../../AllocationTable/styles/StyledDataGrid';
import { GridApi, GridColDef, GridColumnMenu, GridColumnMenuProps, GridToolbarProps } from '@mui/x-data-grid-premium';
import ProjectToolbar from '../../Toolbar/ProjectToolbar';
import { JSXElementConstructor, useState } from 'react';
import { Box } from '@mui/material';
import {  CrudPermissions ,withRBAC } from '../../HOC/withRBAC';
import { Portfolio } from '@/app/types';

interface PortfolioTableProps{
  columns: GridColDef[];
  rows: Portfolio[];
  loading: boolean;
  apiRef: React.RefObject<GridApi>;
  value: String;
  onChange: any;
  permissions: Record<string, CrudPermissions>;
}

function CustomColumnMenu(props : GridColumnMenuProps) {
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

const PortfolioTable = ({
  columns,
  rows,
  loading,
  apiRef,
  value,
  onChange = () => {},
  permissions,
}: PortfolioTableProps) => {
  const [filterButtonEl, setFilterButtonEl] = useState(null);

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
        rows={permissions['Portfolio']?.r ? rows : []}
        hideFooter
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
          toolbar: ProjectToolbar as unknown as JSXElementConstructor<GridToolbarProps>,
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
             //@ts-ignore
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
             //@ts-ignore
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

export default withRBAC(PortfolioTable, ['Portfolio']);
