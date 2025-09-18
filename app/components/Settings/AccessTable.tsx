'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { StyledInput } from '../Input/StyledInput';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { DataGrid, GridRowSelectionModel } from '@mui/x-data-grid';

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
  columns?: any[];
  apiRef?: any;
  loading?: boolean;
  checkboxSelection?: boolean;
  setMode?: () => void;
}

export default function AccessTable({
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
  apiRef,
  loading = false,
  checkboxSelection = false,
  setMode,
}: AccessTableProps) {
  const [search, setSearch] = useState('');
  const [gridView, setGridView] = useState<'grid' | 'list'>('grid');
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
    []
  );
  const [showToolbar, setShowToolbar] = useState(false);

  const filteredRows = useMemo(() => {
    if (!search) return data || [];
    const q = search.toLowerCase();
    return (data || []).filter(row => {
      return (
        (row.Name && String(row.Name).toLowerCase().includes(q)) ||
        (row.email && String(row.email).toLowerCase().includes(q))
      );
    });
  }, [data, search]);

  // This will be called whenever selection changes
  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    if (newSelection.length > 0) {
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }

    setSelectionModel(newSelection);
    const ids = new Set(newSelection.map(id => String(id)));
    const selected = (filteredRows || []).filter(row =>
      ids.has(String(row.id ?? row.Name ?? JSON.stringify(row)))
    );
    setSelectedRows(selected);
  };

  return (
    <Box
      sx={{ mt: 2, mb: 2, background: '#fff', borderRadius: 2, boxShadow: 1 }}
    >
      {checkboxSelection ? (
        showToolbar ? (
          // Selection action toolbar when rows are selected
          <Box
            px={2}
            py={2}
            display="flex"
            alignItems="center"
            gap={2}
            sx={{ borderBottom: '0.667px solid #E5E7EB' }}
          >
            <Typography
              sx={{ color: '#152E75', fontWeight: 700, fontSize: 13 }}
            >
              {selectedRows.length} Resources selected
            </Typography>

            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={() => onAdd()}
                sx={{
                  height: 36,
                  borderRadius: 1,
                  background: '#152E75',
                  color: '#FFF',
                  textTransform: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Add User
              </Button>

              <Button
                variant="contained"
                onClick={() => console.log('Send Invite', selectedRows)}
                sx={{
                  height: 36,
                  borderRadius: 1,
                  background: '#152E75',
                  color: '#FFF',
                  textTransform: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Send Invite
              </Button>

              <Button
                variant="contained"
                onClick={() => console.log('Re-Send Invite', selectedRows)}
                sx={{
                  height: 36,
                  borderRadius: 1,
                  background: '#152E75',
                  color: '#FFF',
                  textTransform: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Re-Send Invite
              </Button>

              <Button
                variant="contained"
                onClick={() => console.log('Deactivate', selectedRows)}
                sx={{
                  height: 36,
                  borderRadius: 1,
                  borderColor: '#152E75',
                  color: '#FFF',
                  textTransform: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Deactivate User
              </Button>
            </Box>
          </Box>
        ) : (
          // Default toolbar when no rows selected
          <Box
            px={2}
            py={2}
            display="flex"
            alignItems="center"
            gap={2}
            sx={{ borderBottom: '0.667px solid #E5E7EB' }}
          >
            <StyledInput
              as={TextField}
              name="Location"
              size="small"
              placeholder="Search by Name /or email"
              value={search}
              sx={{ width: 230 }}
              onChange={(e:any) => setSearch(e.target.value)}
            />

            <Box
              sx={{ display: 'flex', alignItems: 'center', ml: 'auto', gap: 1 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    height: 36,
                    width: '1px',
                    backgroundColor: '#E2E8F0',
                    mx: 1.5,
                  }}
                />
                <IconButton
                  size="small"
                  color={gridView === 'grid' ? 'primary' : 'default'}
                  onClick={() => setGridView('grid')}
                  sx={{
                    minWidth: 'unset',
                    width: '41px',
                    height: '36px',
                    padding: '20px 10px 20px 10px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.25)',
                    '.MuiButton-startIcon': { marginRight: '0px' },
                    '& .MuiBadge-root span': { top: '-12px', right: '-5px' },
                    '& .MuiBadge-root svg': { display: 'none' },
                  }}
                >
                  <img src="/images/icons/NewFilterIcon.svg" alt="filter" />
                </IconButton>

                <IconButton
                  size="small"
                  color={gridView === 'list' ? 'primary' : 'default'}
                  onClick={() => setGridView('list')}
                  sx={{
                    minWidth: 'unset',
                    width: '41px',
                    height: '36px',
                    padding: '20px 17px 20px 17px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.25)',
                    '& .MuiButton-startIcon': {
                      marginRight: '0px',
                    },
                    '& .MuiButton-endIcon': {
                      marginLeft: '0px',
                    },
                  }}
                >
                  <img src="images/icons/newColumnIcon.svg" alt="columns" />
                </IconButton>
                <Box
                  sx={{
                    height: 36,
                    width: '1px',
                    backgroundColor: '#E2E8F0',
                    mx: 1.5,
                  }}
                />
              </Box>
              <Button
                variant="contained"
                onClick={e => {
                  if (anchorEl && menuId === 'add-dropdown') {
                    setMenuId(null);
                    setAnchorEl(null);
                    return;
                  }
                  setAnchorEl(e.currentTarget);
                  setMenuId('add-dropdown');
                }}
                sx={{
                  height: 40,
                  borderRadius: 2,
                  background: '#152E75',
                  color: '#FFF',
                  textTransform: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  px: 2,
                }}
                endIcon={title === 'Users' ? <ArrowDropDownIcon /> : null}
              >
                {buttonLabel}
              </Button>
              {anchorEl && menuId === 'add-dropdown' && title === 'Users' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top:
                      anchorEl.getBoundingClientRect().bottom + window.scrollY,
                    left:
                      anchorEl.getBoundingClientRect().left + window.scrollX,
                    zIndex: 1300,
                    background: '#fff',
                    boxShadow: 3,
                    borderRadius: 1,
                    width: 123,
                    py: 1,
                  }}
                >
                  <Button
                    // fullWidth
                    sx={{ justifyContent: 'flex-start', fontSize: '13px' }}
                    onClick={() => {
                      setMenuId(null);
                      setAnchorEl(null);
                      setMode?.();
                    }}
                  >
                    From resource list
                  </Button>
                  <Button
                    // fullWidth
                    sx={{ justifyContent: 'flex-start', fontSize: '13px' }}
                    onClick={() => {
                      setMenuId(null);
                      setAnchorEl(null);
                      onAdd();
                    }}
                  >
                    New user
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        )
      ) : (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={2}
          py={3}
          sx={{ borderBottom: '0.667px solid #E5E7EB' }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '18px',
              color: '#1F2937',
              fontFamily: 'Open Sans',
              fontStyle: 'normal',
              lineHeight: ' 28px',
            }}
          >
            {title}
          </Typography>
          <Button
            variant="contained"
            onClick={onAdd}
            sx={{
              height: 40,
              borderRadius: 2,
              background: '#152E75',
              color: '#FFF',
              textTransform: 'none',
              fontSize: 14,
              fontWeight: 600,
              px: 2,
            }}
          >
            {buttonLabel}
          </Button>
        </Box>
      )}

        <Box sx={{ width: '100%',  height: 'calc(100vh - 355px)' }}>
        <DataGrid
          rows={filteredRows}
          checkboxSelection={checkboxSelection}
          columns={columns}
          getRowId={row => row.id ?? row.Name ?? JSON.stringify(row)}
          disableColumnMenu
          hideFooter
          disableRowSelectionOnClick
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={handleSelectionChange}
          autoHeight
          apiRef={apiRef}
          loading={loading}
          sx={{
            border: 'none',
            height: '100%',
            '.MuiDataGrid-columnHeaders': {
              color: '#6B7280',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              fontFamily: 'Open Sans',
              maxHeight: '40px',
            },
            '.MuiDataGrid-columnHeader': {
              maxHeight: '40px',
              px: checkboxSelection ? null : 2,
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
          slotProps={{
            loadingOverlay: {
              variant: 'skeleton',
              noRowsVariant: 'skeleton',
            },
          }}
        />
      </Box>
    </Box>
  );
}
