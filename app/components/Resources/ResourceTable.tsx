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
  GridColumnVisibilityModel,
  GridToolbarProps,
} from '@mui/x-data-grid-premium';
import ResourceToolbar from '../Toolbar/ResourceToolbar';
import { JSXElementConstructor, useEffect, useMemo, useState } from 'react';
import { Resource } from '@/app/types';
import { Box, TextField } from '@mui/material';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';
import { useDispatch, useSelector } from 'react-redux';
import { updatePageFilters } from '@/app/redux/actions/filterAction';

interface ResourceTableProps {
  columns: GridColDef[];
  rows: Resource[];
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

const ResourceTable = ({
  columns,
  rows,
  loading,
  apiRef,
  value,
  onChange = () => {},
  permissions,
}: ResourceTableProps) => {
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const dispatch = useDispatch();
  const [filterModel, setFilterModel] = useState({
    items: [],
  });
  const [search, setSearch] = useState('');
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({});
  
  const globalFilters = useSelector((state: any) => state.filters.Resource);
  
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
    dispatch(updatePageFilters('Resource', filterData));
  };

  const filteredRows = useMemo(() => {
    if (!rows) return [];

    if (!search.trim()) return rows;

    const lowerSearch = search.toLowerCase();

    const visibleFields = columns
      .filter(col => columnVisibilityModel[col.field] !== false)
      .map(col => col.field);

    return rows.filter(row =>
      visibleFields.some(field => {
        const value = (row as any)[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerSearch);
      })
    );
  }, [rows, search, columns, columnVisibilityModel]);

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
        rows={permissions['Resource'].r ? filteredRows : []}
        // rows={filteredRows}
        hideFooter={true}
        hideFooterSelectedRowCount={true}
        loading={loading}
        filterModel = {filterModel}
        onFilterModelChange={handleFilterModelChange}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        initialState={{
          sorting: {
            sortModel: [{ field: 'FullName', sort: 'asc' }],
          },
          columns: {
            columnVisibilityModel: {
              team: false,
              organization: false,
              Manager: false,
              AverageWeeklyHours: false,
              ContractorHourlyRate: false,
              PhoneNumber: false,
              __created: false,
              __created_by: false,
              __last_modified: false,
              __last_modified_by: false,
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
            search: search,
            setSearch,
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

export default withRBAC(ResourceTable, ['Resource']);
