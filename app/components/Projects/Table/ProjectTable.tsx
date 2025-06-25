'use client';

import { useState } from 'react';
import type { RefObject } from 'react';
import {
  GridColumnMenu,
  GridColumnMenuProps,
  GridColDef,
  GridRowsProp,
  GridApi,
  GridToolbarProps,
} from '@mui/x-data-grid-premium';

import { ColumnManagementStyles, FilterPanelStyles, StyledDataGrid } from '../../AllocationTable/styles/StyledDataGrid';
import ProjectToolbar from '../../Toolbar/ProjectToolbar';

type ProjectTableProps = {
  columns: GridColDef[];
  rows: GridRowsProp;
  loading: boolean;
  apiRef: RefObject<GridApi>;
};

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

const ProjectTable = ({ columns, rows, loading, apiRef }: ProjectTableProps) => {
  const [filterButtonEl, setFilterButtonEl] = useState<HTMLElement | null>(null);

  // ✅ Correct: close over setFilterButtonEl via closure, not props
  const ProjectToolbarWrapper: React.FC<GridToolbarProps> = (props) => {
    return <ProjectToolbar {...props} setFilterButtonEl={setFilterButtonEl} />;
  };

  return (
    <StyledDataGrid
      apiRef={apiRef}
      columns={columns}
      rows={rows}
      hideFooter
      loading={loading}
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
        toolbar: ProjectToolbarWrapper,
        columnMenu: CustomColumnMenu,
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
        },
        columnsPanel: {
          className: 'styleColumnMenu',
          sx: ColumnManagementStyles,
        },
        filterPanel: {
          columnsSort: 'asc',
          sx: FilterPanelStyles,
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
        },
      }}
    />
  );
};

export default ProjectTable;