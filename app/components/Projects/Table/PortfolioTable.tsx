import {
  ColumnManagementStyles,
  FilterPanelStyles,
  StyledDataGrid,
} from '../../AllocationTable/styles/StyledDataGrid';
import { GridApi, GridColDef, GridColumnMenu, GridColumnMenuProps, GridColumnVisibilityModel, GridToolbarProps } from '@mui/x-data-grid-premium';
import ProjectToolbar from '../../Toolbar/ProjectToolbar';
import { JSXElementConstructor, useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import {  CrudPermissions ,withRBAC } from '../../HOC/withRBAC';
import { Portfolio } from '@/app/types';
import { updatePageFilters } from '@/app/redux/actions/filterAction';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

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
  const dispatch = useDispatch();
  const [filterModel, setFilterModel] = useState({
    items: [],
  });
  const [search, setSearch] = useState('');
  const [columnVisibilityModel, setColumnVisibilityModel] =
  useState<GridColumnVisibilityModel>({});
  const globalFilters = useSelector((state: any) => state.filters.Portfolio);
  
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
    dispatch(updatePageFilters('Portfolio', filterData));
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
        height: 'calc(100vh - 31px)',
      }}
    >
      <StyledDataGrid
        apiRef={apiRef}
        columns={columns}
        rows={permissions['Portfolio']?.r ? filteredRows : []}
        hideFooter
        loading={loading}
        filterModel={filterModel}
        onFilterModelChange={handleFilterModelChange}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
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

export default withRBAC(PortfolioTable, ['Portfolio']);
