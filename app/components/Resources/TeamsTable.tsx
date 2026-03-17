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
import { Team } from '@/app/types';
import { Box } from '@mui/material';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';
import { updatePageFilters } from '@/app/redux/actions/filterAction';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

interface TeamsTableProps {
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

const TeamsTable = ({
  columns,
  rows,
  loading,
  apiRef,
  value,
  onChange = () => {},
  permissions,
}: TeamsTableProps) => {
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const dispatch = useDispatch();
  const [filterModel, setFilterModel] = useState({
    items: [],
  });
  const [search, setSearch] = useState('');
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({});
  const globalFilters = useSelector((state: any) => state.filters.Teams);
  
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
    dispatch(updatePageFilters('Teams', filterData));
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
          if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              const yyyy = d.getFullYear();
              const formattedDate = `${mm}/${dd}/${yyyy}`;
              if (formattedDate.includes(lowerSearch)) return true;
              const hours = d.getHours();
              const minutes = String(d.getMinutes()).padStart(2, '0');
              const ampm = hours >= 12 ? 'pm' : 'am';
              const formattedTime = `${formattedDate} ${hours % 12 || 12}:${minutes} ${ampm}`;
              return formattedTime.includes(lowerSearch);
            }
          }
          return String(value).toLowerCase().includes(lowerSearch);
        })
      );
    }, [rows, search, columns, columnVisibilityModel]);

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
        rows={permissions['Team'].r ? filteredRows : []}
        hideFooter={true}
        hideFooterSelectedRowCount={true}
        loading={loading}
        filterModel = {filterModel}
        onFilterModelChange={handleFilterModelChange}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
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

export default withRBAC(TeamsTable, ['Team']);
