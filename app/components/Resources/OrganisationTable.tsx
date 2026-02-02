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
import { Box } from '@mui/material';
import { useState, JSXElementConstructor, useEffect } from 'react';

import { Organisation } from '@/app/types';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { updatePageFilters } from '@/app/redux/actions/filterAction';

interface OrganisationsTableProps {
  columns: GridColDef[];
  rows: Organisation[];
  loading: boolean;
  apiRef: React.RefObject<GridApi>;
  value: string;
  onChange: any;
  permissions: Record<string, CrudPermissions>;
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

const OrganisationsTable = ({
  columns,
  rows,
  loading,
  apiRef,
  value,
  onChange = () => {},
  permissions,
}: OrganisationsTableProps) => {
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const dispatch = useDispatch();
  const [filterModel, setFilterModel] = useState({
    items: [],
  });
  const globalFilters = useSelector((state: any) => state.filters.Organisations);
  
  useEffect(() => {
    if (globalFilters) {
      setFilterModel({
        items: globalFilters?.map((filter: any, index:any) => ({
          ...filter,
        })) ?? [],
      });
    }
  }, [globalFilters]);

  const handleFilterModelChange = (newModel: any) => {
    const filterData = (newModel.items || []).map((item: any) => ({
      field: item.field,
      operator: item.operator || item.operatorValue,
      operatorValue: item.operatorValue || item.operator,
      value: item.value,
      id: item.id,
    }));
    dispatch(updatePageFilters('Organisations', filterData));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <StyledDataGrid
        apiRef={apiRef}
        columns={columns}
        rows={permissions['Organization'].r ? rows : []}
        loading={loading}
        hideFooter={true}
        hideFooterSelectedRowCount={true}
        filterModel={filterModel}
        onFilterModelChange={handleFilterModelChange}
        initialState={{
          sorting: {
            sortModel: [{ field: 'Name', sort: 'asc' }],
          },
          columns: {
            columnVisibilityModel: {
              Status: true,
              // You can optionally hide fields like:
              // CreatedDate: false,
              // Owner: false,
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
            // @ts-ignore
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
            // @ts-ignore
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

export default withRBAC(OrganisationsTable, ['Organization']);
