'use client';

import { Box, Typography, Button,Menu, MenuItem, ListItemIcon, ListItemText  } from '@mui/material';
import {
  DataGridPremium,
  GridColDef,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid-premium';
import { useState } from 'react';
import CommentCell from  './CommentCell'
import { useMemo,useEffect } from 'react';
import { actualsTableStyles } from './actualsTableStyles';
import { GridCellParams } from '@mui/x-data-grid-premium'; 
import FolderIcon from '@mui/icons-material/Folder';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/app/redux/store';
import type { RootState } from '@/app/redux/store';
import ProjectMenu from './ProjectMenu';
import { fetchAllocationTheme } from '@/app/redux/actions/settingsAction';
import { showToastAction } from '@/app/redux/actions/toastAction';

const initialRows: GridRowsProp = [
  { id: 1, project: 'Payroll System Infrastructure', planned: 0.7, actuals: 0.7 },
  { id: 2, project: 'Payroll Integration Automation', planned: 0.2, actuals: 0.2 },
  { id: 3, project: 'RTB', planned: 0.2, actuals: 0 },
  { id: 4, project: 'Employee Benefits System', planned: 0.1, actuals: 0.1 },
];

const calculateTotal = (data: GridValidRowModel[], columnName: string) => {
  return data.reduce((total, row) => total + (row[columnName] || 0), 0);
};
const roundToOneDecimal = (num: number) => {
    return num.toFixed(1);
  };

export default function ActualTable() {
 const [rows, setRows] = useState(initialRows);
 const [mainMenuAnchor, setMainMenuAnchor] = useState<null | HTMLElement>(null);
 const [projectMenuAnchor, setProjectMenuAnchor] = useState<null | HTMLElement>(null);
 const [openMenu, setOpenMenu] = useState<string | null>(null);
 const allocationTheme = useSelector((state: RootState) => state.settings.allocationTheme)
 const [showProjectMenu, setShowProjectMenu] = useState(false);
 const dispatch: AppDispatch = useDispatch();

const totalPlanned = useMemo(() => {
     return roundToOneDecimal(calculateTotal([...rows], 'planned'));
  }, [rows]);
  
  const totalActuals = useMemo(() => {
    return roundToOneDecimal(calculateTotal([...rows], 'actuals'));
  }, [rows]);

  useEffect(()=>{
    if (allocationTheme.length === 1 && allocationTheme[0].__Id__ === "" ) {
      dispatch(fetchAllocationTheme())
    }
  },[allocationTheme]);
  
const handleProcessRowUpdate = (newRow: GridValidRowModel,oldRow: GridValidRowModel) => {
    if (newRow.id === 'total' || newRow.id === 'second-total') {
        return oldRow;
      }
  
    const actualsChanged = newRow.actuals !== oldRow.actuals;
    let newActual = parseFloat(newRow.actuals) || 0;
    if (actualsChanged) {
      newActual = Math.round(newActual * 10) / 10;
      const updatedTotal = rows.reduce((sum, row) => {
        if (row.id === newRow.id) {
          return sum + newActual;
        }
        if (row.id !== 'total' && row.id !== 'second-total') {
          return sum + (parseFloat(row.actuals) || 0);
        }
        return sum;
      }, 0);
  
      if (updatedTotal > 2.0) {
        dispatch(
          showToastAction(
            true,
            `Total of Actuals cannot exceed 2.0 (Current sum: ${updatedTotal.toFixed(1)})`,
            'error',
          )
        );
        return oldRow;
      } else if (updatedTotal >= 1.5) {
        dispatch(
          showToastAction(
            true,
            `Warning: Total actuals is approaching the maximum of 2.0. Current sum: ${updatedTotal.toFixed(1)}`,
            'warning',
          )
        );
      }
    }
  
    setRows((prev) => {
      const existingRow = prev.find((r) => r.id === newRow.id);
      if (JSON.stringify(existingRow) === JSON.stringify(newRow)) return prev; 
      return prev.map((row) =>
        row.id === newRow.id
          ? {
              ...row,
              ...newRow,
              actuals: actualsChanged ? newActual : row.actuals,
            }
          : row
      );
    });
  
    return { ...newRow, actuals: actualsChanged ? newActual : newRow.actuals };
  };
  
     
  const handleCellKeyDown = (params: GridCellParams, event: React.KeyboardEvent) => {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
    if (event.key === 'Enter') {
      return;
    }
  };

  const renderAllocationCell = (params: any, allocationTheme: any[]) => {
    if (params.row.type === 'divider') return null;
    const value = parseFloat(params.value);
    if (isNaN(value)) return ''; 
    if (params.row.id === 'total' && allocationTheme.length) {
      const matched = allocationTheme.find(
        (range) => value >= parseFloat(range.From) && value <= parseFloat(range.To)
      );

      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: matched?.Color || 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            p: 0,
            m: 0,
            position: 'relative',
          }}
        >
          {roundToOneDecimal(value)}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '4px',
              width: '100%',
              backgroundColor: matched?.DarkColor || 'rgba(0,0,0,0.2)',
            }}
          />
        </Box>
      );
    }
    return roundToOneDecimal(value);
  };
      
  const columns: GridColDef[] = [
    {
      field: 'project',
      headerName: 'Projects',
      flex: 1,
      minWidth: 200,
      headerClassName: 'header-project',
      cellClassName: 'col-cell-project',
    },
    {
      field: 'planned',
      headerName: 'Planned',
      type: 'number',
      width: 70,
      align: 'center',
      headerAlign: 'center',
      headerClassName: 'header-planned',
      cellClassName: 'col-cell-planned',
      renderCell: (params) => renderAllocationCell(params, allocationTheme),
    },
    {
      field: 'actuals',
      headerName: 'Actuals',
      type: 'number',
      editable: true,
      width: 68,
      align: 'center',
      headerAlign: 'center',
      headerClassName: 'header-actuals',
      cellClassName: 'col-cell-actuals',
      renderCell: (params) => renderAllocationCell(params, allocationTheme),
    },
    {
      field: 'comments',
      headerName: 'Comments',
      editable: true,
      flex: 1,
      minWidth: 178,
      headerClassName: 'header-comments',
      cellClassName: 'col-cell-comments',
      renderEditCell: (params) => <CommentCell {...params} />,
    },
  ];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMainMenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setMainMenuAnchor(null);
    setOpenMenu(null);
  };

  const handleMenuClick = (label: string) => {
    setMainMenuAnchor(null);
    setOpenMenu(label);
    switch (label) {
      case 'Project':
        setMainMenuAnchor(null); 
        setProjectMenuAnchor(mainMenuAnchor); 
        setShowProjectMenu(true); 
       break;
      case 'Other Work':
       alert('Navigate to other work page');  
       break;
      case 'Personal Time':
        alert('Navigate to personal time page'); 
        break;
      default:
        console.log(`Clicked on ${label}`);
    }
  };
  

  const menuItems = [
    { label: 'Project', icon: <FolderIcon fontSize="small" sx={{ color: '#1C2D5F' }} /> },
    { label: 'Other Work', icon: <Box component="img" src="/images/icons/otherWork.svg" alt="Other Work" sx={{ width: 20, height: 20 }} />  },
    { label: 'Personal Time', icon: <Box component="img" src="/images/icons/Personal.svg" alt="Other Work" sx={{ width: 20, height: 20 }} />  },
  ];
  
  return (
    <>
    <Box borderRadius={1} overflow="hidden" border="1px solid #e0e0e0" >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bgcolor="#1976d2"
        color="white"
        px={2}
        py={1}
      >
        <Typography fontWeight={600}>Q2 2025</Typography>
        <Typography fontWeight={600}>Week 12</Typography>
        <Typography fontWeight={600}>Apr 08 - Apr 14</Typography>
      </Box>

      <Box sx={{ height: 350 }}>
        <DataGridPremium
          rows={[
            {
              id: 'total',
              project: 'Total',
              planned: totalPlanned,
              actuals: totalActuals,
              comments: '',
            },
            ...rows,
          ]}
          columns={columns}
          disableColumnMenu
          disableColumnSorting
          isRowSelectable={(params) =>
            params.row.type !== 'divider' && params.row.id !== 'second-total-row'
          }          
          hideFooter
          disableRowSelectionOnClick
          onCellKeyDown={handleCellKeyDown}
          processRowUpdate={handleProcessRowUpdate}
          getRowClassName={(params) => {
            if (params.id === 'total') return 'second-total-row';
            if (params.id === 'divider') return 'divider-row';
            if (params.row.id === rows[rows.length - 1].id) return 'last-row';
            return 'first-header-row';
          }}
          sx={actualsTableStyles}
          
        />
      </Box>
    </Box>
     
      <Box px={2} py={1} sx={{paddingBottom :"0",paddingLeft:'0'}}>
        <Button variant="text" size="small" sx={{color:'#0D1F52',textTransform :'none',fontWeight:600, cursor: 'pointer',}}  onClick={handleClick}>
          + Add Unplanned Actuals
        </Button>
        <Menu
        anchorEl={mainMenuAnchor}
        open={Boolean(mainMenuAnchor) && !showProjectMenu}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
            sx: {
                mt: '-8px',
                borderRadius: '4px',
                boxShadow: '0px 4px 4px -1px rgba(0, 0, 0, 0.10), 0px 4px 4px -2px rgba(0, 0, 0, 0.10)',
                minWidth: 212,
                backgroundColor: '#FFF',
                flexShrink: 0,
            },
            }}
            >
   {menuItems.map((item) => (
    <MenuItem
      key={item.label}
      onClick={() => handleMenuClick(item.label)} 
      sx={{
        '&:hover': {
          backgroundColor: 'rgba(20, 43, 81, 0.7)',
          '& .menu-icon': {
            filter: 'brightness(0) invert(1)',
          },
          '& .menu-text': {
            color: 'white',
          },
        },
      }}
    >
      <ListItemIcon className="menu-icon">
        {typeof item.icon === 'string' ? (
          <Box
            component="img"
            src={item.icon}
            alt={item.label}
            sx={{ width: 20, height: 20 }}
          />
        ) : (
          item.icon 
        )}
      </ListItemIcon>
      <ListItemText primary={item.label} className="menu-text" />
      <img src="images/icons/small-arrowForward.svg" className="menu-icon" />
    </MenuItem>
   ))}
    </Menu>
      </Box>
      {showProjectMenu &&
       <ProjectMenu 
       onClose={() => {
        setShowProjectMenu(false);
        setMainMenuAnchor(null);
      }} 
       anchorEl={projectMenuAnchor}
       setRows={setRows}
       existingRows={rows}/>}

    </>
  );
}
