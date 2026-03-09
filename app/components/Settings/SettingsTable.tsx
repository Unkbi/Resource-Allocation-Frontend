'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import {
  ColumnManagementStyles,
  FilterPanelStyles,
} from '../AllocationTable/styles/StyledDataGrid';
import SettingsToolbar from '../Toolbar/SettingsToolbar';
import { DataGridPremium } from '@mui/x-data-grid-premium';
interface AccessTableProps {
  title: string;
  data: any[];
  onAdd: () => void;
  buttonLabel?: string;
  columns?: any[];
  loading?: boolean;
}

export default function SettingsTable({
  title,
  data,
  onAdd,
  buttonLabel = '',
  columns = [],
  loading = false,
}: AccessTableProps) {
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});

  const handleColumnVisibilityModelChange = (newModel: any) => {
    setColumnVisibilityModel(newModel);
  };

  // Get toggleable columns - filter out action column and include all data columns
  const getTogglableColumns = (columns: any[]) => {
    return columns
      .filter(column => column.field !== 'actions')
      .map(column => column.field);
  };

  const filterColumns = ({ columns }: { columns: any[] }) => {
    return getTogglableColumns(columns);
  };

  const Toolbar = () => (
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
      <Box sx={{ width: '100%', height: 'calc(100vh - 355px)' }}>
        <DataGridPremium
          rows={data}
          columns={columns}
          getRowId={row => row.id ?? row.Name ?? JSON.stringify(row)}
          disableColumnMenu
          hideFooter
          disableRowSelectionOnClick
          loading={loading}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={handleColumnVisibilityModelChange}
          initialState={{
            sorting: {
              sortModel: [{ field: 'Name', sort: 'asc' }],
            },
          }}
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
                filterColumns,
                columnInputProps: {
                  size: 'small',
                  sx: { mt: 'auto' },
                },
                operatorInputProps: {
                  size: 'small',
                  sx: { mt: 'auto' },
                },
                valueInputProps: {
                  InputComponentProps: { size: 'small' },
                },
                deleteIconProps: {
                  sx: { '& .MuiSvgIcon-root': { color: '#d32f2f' } },
                },
              },
              sx: FilterPanelStyles,
            },
            columnsPanel: {
              className: 'styleColumnMenu',
              sx: ColumnManagementStyles,
            },
          }}
          slots={{
            toolbar: Toolbar,
          }}
          localeText={{
            toolbarFilters: '',
            toolbarExport: '',
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
              borderRight: 'none',
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
