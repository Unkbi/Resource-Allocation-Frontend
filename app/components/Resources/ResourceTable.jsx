
import { ColumnManagementStyles, FilterPanelStyles, StyledDataGrid } from "../AllocationTable/styles/StyledDataGrid";
import {
    GridColumnMenu,
    useGridApiRef
  } from '@mui/x-data-grid-premium';
import ResourceToolbar from "../Toolbar/ResourceToolbar";
import { useState } from "react";

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
  
const ResourceTable = ({columns, rows, loading}) => {
    const apiRef = useGridApiRef();
    const [filterButtonEl, setFilterButtonEl] = useState(null);

    return (
        <StyledDataGrid
            apiRef={apiRef}
            columns={columns}
            rows={rows}
            hideFooter={false}
            hideFooterSelectedRowCount={true}
            loading={loading}
            sx={{
                height: 'auto',
                '& .MuiDataGrid-footer': {
                    display: 'block',
                },
            }}
            initialState={{
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
            }}
            localeText={{
              toolbarFilters:"",
              toolbarColumns:"",
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
