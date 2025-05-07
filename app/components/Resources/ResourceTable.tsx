import {
  ColumnManagementStyles,
  FilterPanelStyles,
  StyledDataGrid,
} from '../AllocationTable/styles/StyledDataGrid';
import {
  GridColDef,
  GridColumnMenu,
  GridColumnMenuProps,
  GridToolbarProps,
  useGridApiRef,
} from '@mui/x-data-grid-premium';
import ResourceToolbar from '../Toolbar/ResourceToolbar';
import { JSXElementConstructor, useState } from 'react';
import { Resource } from '@/app/types';

interface ResourceTableProps {
  columns: GridColDef[];
  rows: Resource[];
  loading: boolean;
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

const ResourceTable = ({ columns, rows, loading }: ResourceTableProps) => {
  const apiRef = useGridApiRef();
  const [filterButtonEl, setFilterButtonEl] = useState(null);

  return (
    <StyledDataGrid
      apiRef={apiRef}
      columns={columns}
      rows={rows}
      hideFooter={true}
      hideFooterSelectedRowCount={true}
      loading={loading}
      initialState={{
        columns: {
          columnVisibilityModel: {
            team: false,
            organization: false,
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
  );
};

export default ResourceTable;
