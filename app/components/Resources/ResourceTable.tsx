import {
  ColumnManagementStyles,
  FilterPanelStyles,
  StyledDataGrid,
} from '../AllocationTable/styles/StyledDataGrid';
import {
  GridApi,
  GridColDef,
  GridColumnMenu,
  GridColumnMenuProps,
  GridToolbarProps,
} from '@mui/x-data-grid-premium';
import ResourceToolbar from '../Toolbar/ResourceToolbar';
import { JSXElementConstructor, useState } from 'react';
import { Resource } from '@/app/types';
import { Box } from '@mui/material';

interface ResourceTableProps {
  columns: GridColDef[];
  rows: Resource[];
  loading: boolean;
  apiRef: React.RefObject<GridApi>;
  value: String;
  onChange: any;
}

function CustomColumnMenu(props: GridColumnMenuProps) {
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

const ResourceTable = ({
  columns,
  rows,
  loading,
  apiRef,
  value,
  onChange = () => {},
}: ResourceTableProps) => {
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  return (
       <Box sx={{ display: 'flex', flexDirection: 'column',height:'100vh' }}>
    <StyledDataGrid
      apiRef={apiRef}
      columns={columns}
      rows={rows}
      hideFooter={true}
      hideFooterSelectedRowCount={true}
      loading={loading}
      initialState={{
        sorting: {
          sortModel: [{ field: 'FullName', sort: 'asc' }],
        },
        columns: {
          columnVisibilityModel: {
            team: false,
            organization: false,
            WorkLocation: false,
            AverageWeeklyHours: false,
            ContractorHourlyRate:false,
            PhoneNumber:false,
          },
        },
      }}
      slots={{
        toolbar:
          ResourceToolbar as unknown as JSXElementConstructor<GridToolbarProps>,
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
        '& .MuiDataGrid-footer': {
          display: 'block',
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
          },
        }}
        slots={{
          toolbar:
            ResourceToolbar as unknown as JSXElementConstructor<GridToolbarProps>,
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
          '& .MuiDataGrid-footer': {
            display: 'block',
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

export default ResourceTable;
