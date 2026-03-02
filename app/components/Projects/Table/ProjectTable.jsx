import {
  ColumnManagementStyles,
  FilterPanelStyles,
  StyledDataGrid,
} from '../../AllocationTable/styles/StyledDataGrid';
import { GridColumnMenu, useGridApiRef } from '@mui/x-data-grid-premium';
import ProjectToolbar from '../../Toolbar/ProjectToolbar';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { withRBAC } from '../../HOC/withRBAC';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { updatePageFilters } from '@/app/redux/actions/filterAction';

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

const ProjectTable = ({
  columns,
  rows,
  loading,
  apiRef,
  value,
  onChange = () => {},
  permissions,
}) => {
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const dispatch = useDispatch();
  const [filterModel, setFilterModel] = useState({
      items: [],
    });
  const globalFilters = useSelector((state) => state.filters.Project);
  
   useEffect(() => {
      if (globalFilters) {
        setFilterModel({
          items: globalFilters.map((filter) => ({
            ...filter,
            operatorValue: filter.operatorValue || filter.operator,
            operator: filter.operator || filter.operatorValue,
          })) ?? [],
        });
      }
    }, [globalFilters]);
  
    const handleFilterModelChange = (newModel) => {
      const filterData = (newModel.items || []).map((item) => ({
        field: item.field,
        operator: item.operator || item.operatorValue,
        operatorValue: item.operatorValue || item.operator,
        value: item.value,
        id: item.id,
      }));
      dispatch(updatePageFilters('Project', filterData));
  };
  
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
        rows={permissions['Project']?.r ? rows : []}
        hideFooter={true}
        loading={loading}
        filterModel={filterModel}
        onFilterModelChange={handleFilterModelChange}
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
              __created: false,
              __created_by: false,
              __last_modified: false,
              __last_modified_by: false,
            },
          },
        }}
        slots={{
          toolbar: ProjectToolbar,
          columnMenu: CustomColumnMenu,
        }}
        localeText={{
          toolbarFilters: '',
          toolbarColumns: '',
          toolbarExport: '',
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

export default withRBAC(ProjectTable, ['Project']);
