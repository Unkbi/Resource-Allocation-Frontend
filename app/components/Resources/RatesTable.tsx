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
import { JSXElementConstructor, useEffect, useState } from 'react';
import { Team } from '@/app/types';
import { Box } from '@mui/material';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';
import { updatePageFilters } from '@/app/redux/actions/filterAction';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

interface RatesTableProps {
  columns: GridColDef[];
  rows: Team[];
  loading: boolean;
  apiRef: React.RefObject<GridApi>;
  value: String;
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

const RatesTable = ({
  columns,
  rows,
  loading,
  apiRef,
  value,
  onChange = () => {},
  permissions,
}: RatesTableProps) => {
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const dispatch = useDispatch();
  const [filterModel, setFilterModel] = useState({
    items: [],
  });
  const globalFilters = useSelector((state: any) => state.filters.Rates);
  
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
    dispatch(updatePageFilters('Rates', filterData));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        height: 'calc(100vh - 31px)',
      }}
    >
      <StyledDataGrid
        apiRef={apiRef}
        columns={columns}
        rows={permissions['EmployeeRate'].r ? rows : []}
        hideFooter={true}
        hideFooterSelectedRowCount={true}
        loading={loading}
        filterModel={filterModel}
        onFilterModelChange={handleFilterModelChange}
        initialState={{
          sorting: {
            sortModel: [{ field: 'Team', sort: 'asc' }],
          },
          columns: {
            columnVisibilityModel: {
              Team: true,
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
          toolbarExport: '',
        }}
        sx={{
          height: '100vh',
          '& .MuiDataGrid-columnHeader': {
            padding: '0 46px',
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

export default withRBAC(RatesTable, ['EmployeeRate']);
