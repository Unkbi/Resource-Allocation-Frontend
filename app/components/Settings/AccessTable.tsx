'use client';

import {
  Box,
  Button,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid } from '@mui/x-data-grid';


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
}: {
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
}) {
  return (
    <Box
      sx={{ mt: 2, mb: 2, background: '#fff', borderRadius: 2, boxShadow: 1 }}
    >
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
          startIcon={<AddIcon sx={{ fontSize: '16px' }} />}
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

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={row => row.Name}
          disableColumnMenu
          hideFooter
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 'none',
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
