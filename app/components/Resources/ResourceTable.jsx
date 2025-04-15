
import { ColumnManagementStyles, FilterPanelStyles, StyledDataGrid } from "../AllocationTable/styles/StyledDataGrid";
import {
    GridColumnMenu,
    useGridApiRef
  } from '@mui/x-data-grid-premium';
import ResourceToolbar from "../Toolbar/ResourceToolbar";
import { useState } from "react";
import CustomPagination from "../Pagination/CustomPagination";

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
  
const ResourceTable = ({columns, rows, loading, pageSizeOptions = [5, 10, 25, 50],}) => {
    const apiRef = useGridApiRef();
    const [filterButtonEl, setFilterButtonEl] = useState(null);
    const [paginationModel, setPaginationModel] = useState({
            page: 0,
            pageSize: 10,
          });
    return (
        <StyledDataGrid
            apiRef={apiRef}
            columns={columns}
            rows={rows}
            hideFooter={false}
            hideFooterSelectedRowCount={true}
            loading={loading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50, 100]}
            pagination
            hideFooterPagination={false} 
            sx={{
                height: 'auto',
                '& .MuiDataGrid-footer': {
                    display: 'block',
                },
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 }, 
              },
                columns: {
                  columnVisibilityModel: {
                    team: false, 
                    organization: false, 
                  },
                },
              }}
            slots={{
                toolbar: ResourceToolbar,
                columnMenu: CustomColumnMenu,
                pagination: CustomPagination,
            }}
            localeText={{
              toolbarFilters:"",
              toolbarColumns:"",
            }}
            sx={{
                height: 'auto',
                '& .MuiDataGrid-columnHeader': {
                    padding: '0 16px',
                    borderRight: 'none',
                },
                '& .MuiDataGrid-footer': {
                  display: 'block', 
              },
            }}
            slotProps={{
                pagination: { apiRef }, 
                loadingOverlay: {
                variant: 'skeleton',
                noRowsVariant: 'skeleton',
                },
                panel: {
                anchorEl: filterButtonEl,
                className: 'parent-grid-panel',
                },
                toolbar: {
                    setFilterButtonEl,
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
    );
}

export default ResourceTable;
