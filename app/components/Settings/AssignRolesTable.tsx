'use client';

import {
  Box,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SettingsToolbar from '../Toolbar/SettingsToolbar';
import { DataGridPremium } from '@mui/x-data-grid-premium';
import { FilterPanelStyles } from '../AllocationTable/styles/StyledDataGrid';


interface AccessTableProps {
  title: string;
  data: any[];
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  renderMenu: (id: string) => React.ReactNode;
  menuId: string | null;
  setMenuId: (id: string | null) => void;
  setAnchorEl: (el: HTMLElement | null) => void;
  anchorEl: HTMLElement | null;
  buttonLabel?: string;
  toolbarType?: 'filter' | 'none';
  columns?: any[];
  apiRef?: any;
  loading?: boolean;
}

export default function AssignRolesTable({
  title,
  data,
  onAdd,
  onEdit,
  onDelete,
  renderMenu,
  menuId,
  setMenuId,
  setAnchorEl,
  anchorEl,
  buttonLabel = 'Add New',
  columns = [],
  toolbarType,
  apiRef,
  loading = false,
}: AccessTableProps) {

  const AssignRoleToolbar = () => (
    <SettingsToolbar
      title={title}
      buttonLabel={buttonLabel}
      onButtonClick={onAdd}
    />
  );
  
  return (
    <Box
      sx={{ mt: 2, mb: 2, background: '#fff', borderRadius: 2, boxShadow: 1 }}
    >
      
        <Box sx={{ width: '100%', height: 'calc(100vh - 248px)' }}>
        <DataGridPremium
          rows={data}
          columns={columns}
          hideFooter
          disableRowSelectionOnClick
          apiRef={apiRef}
          loading={loading}
          slotProps={{
                loadingOverlay: {
                  variant: 'skeleton',
                  noRowsVariant: 'skeleton',
                },
                panel: {
                  className: 'parent-grid-panel',
                  placement: 'bottom-end',
                  sx: {
                    transform: 'translate3d(-50px, 250px, 0px) !important',
                    top: '40px !important',
                  },
                },
                filterPanel: {
                  columnsSort: 'asc',
                  filterFormProps: {
                    columnInputProps: { 
                      size: 'small', 
                      sx: { mt: 'auto' } 
                    },
                  operatorInputProps: { size: 'small', sx: { mt: 'auto' } },
                  valueInputProps: {
                    InputComponentProps: { size: 'small' },
                  },
                  deleteIconProps: {
                    sx: { '& .MuiSvgIcon-root': { color: '#d32f2f' } },
                  },
                },
                sx: FilterPanelStyles,
              },
            }}
            slots={{
              toolbar: toolbarType === 'filter' ? AssignRoleToolbar : undefined,
            }}
            localeText={{
                toolbarFilters: '',
              }}
          sx={{
            border: 'none',
            height: '100%',
            '.MuiDataGrid-columnHeaders': {
              color: '#6B7280',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              fontFamily: 'Open Sans',
              maxHeight: '40px',
            },
            '.MuiDataGrid-columnHeader': {
              maxHeight: '40px',
              px: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F9FAFB',
            },
            '.MuiDataGrid-columnHeader:last-of-type': {
              borderRight: 'none', // Avoid double border on last column
            },
            '.MuiDataGrid-columnSeparator': {
              display: 'block',
            },
            '.MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
              fontSize: 13,
            },
          }}
        />
      </Box>
    </Box>
  );
}
