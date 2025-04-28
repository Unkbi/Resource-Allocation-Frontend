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
import { useMemo } from 'react';
import { actualsTableStyles } from './actualsTableStyles';
import { GridCellParams } from '@mui/x-data-grid-premium'; 
import FolderIcon from '@mui/icons-material/Folder';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/redux/store';
import ProjectMenu from './ProjectMenu';

const initialRows: GridRowsProp = [
  { id: 1, project: 'Payroll System Infrastructure', planned: 0.3, actuals: 0.7 },
  { id: 2, project: 'Payroll Integration Automation', planned: 0.2, actuals: 0.2 },
  { id: 3, project: 'RTB', planned: 0.2, actuals: 0 },
  { id: 4, project: 'Employee Benefits System', planned: 0.1, actuals: 0.1 },
  { id: 5, project: 'Schwab to Dayforce Integration', planned: 0.1, actuals: 0.1 },
  { id: 55, project: 'test project check ', planned: 0.22, actuals: 0.1 },
  { id: 56, project: 'test project check ', planned: 0, actuals: 0.1 },
  { id: 57, project: 'test project check ', planned: 0, actuals: 0.1 },
  { id: 58, project: 'test project check ', planned: 0.1, actuals: 0.1 },
];

const calculateTotal = (data: GridValidRowModel[], columnName: string) => {
  return data.reduce((total, row) => total + (row[columnName] || 0), 0);
};
const roundToOneDecimal = (num: number) => {
    return num.toFixed(1);
  };

export default function ActualTable() {
 const [rows, setRows] = useState(initialRows);
 const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
 const allocationTheme = useSelector((state: RootState) => state.settings.allocationTheme)
 const [showProjectMenu, setShowProjectMenu] = useState(false);

const totalPlanned = useMemo(() => {
     return roundToOneDecimal(calculateTotal([...rows], 'planned'));
  }, [rows]);
  
  const totalActuals = useMemo(() => {
    return roundToOneDecimal(calculateTotal([...rows], 'actuals'));
  }, [rows]);


const handleProcessRowUpdate = (newRow: GridValidRowModel,oldRow: GridValidRowModel) => {
    if (newRow.id === 'total' || newRow.id === 'second-total') {
        return oldRow;
      }
    setRows((prev) => {
      const existingRow = prev.find((r) => r.id === newRow.id);
      if (JSON.stringify(existingRow) === JSON.stringify(newRow)) return prev; 
      return prev.map((row) => (row.id === newRow.id ? newRow : row));
     });
     return newRow;
     };
     
  const handleCellKeyDown = (params: GridCellParams, event: React.KeyboardEvent) => {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
    if (event.key === 'Enter') {
      return;
    }
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
      renderCell: (params) => {
        const value = Number(params.value);
        const isAboveLimit = value > 1.5;
        if (params.id === 'total' && !isNaN(value) && allocationTheme.length) {
          const matched = allocationTheme.find(
            (range) => value >= parseFloat(range.from) && value <= parseFloat(range.to)
          );
          return (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: isAboveLimit ? '#de6d6d' : matched?.color || 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                
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
              backgroundColor: isAboveLimit? '#963d3d':matched?.darkColor || 'rgba(0,0,0,0.2)',
            }}
          />
            </Box>
          );
        }
        return roundToOneDecimal(value); 
      },
    },
    {
      field: 'actuals',
      headerName: 'Actuals',
      type: 'number',
      editable: true,
      width: 66,
      align: 'center',
      headerAlign: 'center',
      headerClassName: 'header-actuals',
      cellClassName: 'col-cell-actuals',
      renderCell: (params) => {
        const value = Number(params.value);
        const isAboveLimit = value > 1.5;
        if (params.id === 'total' && !isNaN(value) && allocationTheme.length) {
          const matched = allocationTheme.find(
            (range) => value >= parseFloat(range.from) && value <= parseFloat(range.to)
          );
          return (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: isAboveLimit ? '#de6d6d' : matched?.color || 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                p: 0,
          m: 0,
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
              backgroundColor: isAboveLimit ? '#963d3d':matched?.darkColor || 'rgba(0,0,0,0.2)',
            }}
          />
            </Box>
          );
        }
        return roundToOneDecimal(value); 
      },
    },
    {
      field: 'comments',
      headerName: 'Comments',
      editable: true,
      flex: 1,
      minWidth: 180,
      headerClassName: 'header-comments',
      cellClassName: 'col-cell-comments',
      renderEditCell: (params) => <CommentCell {...params} />,
    },
  ];

  const menuOpen = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (label: string) => {
    switch (label) {
      case 'Project':
        setShowProjectMenu(true); 
        setAnchorEl(null); 
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
    <Box borderRadius={2} overflow="hidden" border="1px solid #e0e0e0" boxShadow={1}>
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

      <Box sx={{ height: 580 ,overflow:'auto',}}>
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
          hideFooter
          disableRowSelectionOnClick
          onCellKeyDown={handleCellKeyDown}
          processRowUpdate={handleProcessRowUpdate}
          getRowClassName={(params) => {
            if (params.id === 'total') return 'second-total-row';
            return 'first-header-row';
          }}
          sx={actualsTableStyles}
          
        />
      </Box>
    </Box>
     
      <Box px={2} py={1} sx={{paddingBottom :"0",paddingLeft:'0'}}>
        <Button variant="text" size="small" sx={{color:'#0D1F52',textTransform :'none',fontWeight:600}}  onClick={handleClick}>
          + Add Unplanned Actuals
        </Button>
        <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
            sx: {
                mt: '-8px',
                borderRadius: '4px',
                boxShadow: '0px 4px 4px -1px rgba(0, 0, 0, 0.10), 0px 4px 4px -2px rgba(0, 0, 0, 0.10)',
                minWidth: 212,
                height: 131,
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
      <KeyboardArrowRightIcon fontSize="small" className="menu-icon" />
    </MenuItem>
   ))}
    </Menu>
      </Box>
      {showProjectMenu &&
       <ProjectMenu 
       onClose={() => setShowProjectMenu(false)} 
       anchorEl={anchorEl}
       setRows={setRows}
       existingRows={rows}/>}

    </>
  );
}
