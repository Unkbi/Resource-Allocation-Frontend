'use client';

import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  DataGridPremium,
  GridColDef,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid-premium';
import { useState } from 'react';
import CommentCell from './CommentCell';
import { useMemo, useEffect } from 'react';
import { actualsTableStyles } from './actualsTableStyles';
import { GridCellParams, useGridApiRef } from '@mui/x-data-grid-premium';
import FolderIcon from '@mui/icons-material/Folder';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/app/redux/store';
import type { RootState } from '@/app/redux/store';
import ProjectMenu from './ProjectMenu';
import { fetchAllocationTheme } from '@/app/redux/actions/settingsAction';
import { showToastAction } from '@/app/redux/actions/toastAction';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const initialRows: GridRowsProp = [
  {
    id: 1,
    project: 'Payroll System Infrastructure',
    planned: 0.7,
    actuals: 0.7,
  },
  {
    id: 2,
    project: 'Payroll Integration Automation',
    planned: 0.2,
    actuals: 0.2,
  },
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
  const apiRef = useGridApiRef();
  const [rows, setRows] = useState(initialRows);
  const [mainMenuAnchor, setMainMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [projectMenuAnchor, setProjectMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const allocationTheme = useSelector(
    (state: RootState) => state.settings.allocationTheme
  );
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const totalPlanned = useMemo(() => {
    return roundToOneDecimal(calculateTotal([...rows], 'planned'));
  }, [rows]);

  const totalActuals = useMemo(() => {
    return roundToOneDecimal(calculateTotal([...rows], 'actuals'));
  }, [rows]);

  const [hasOtherWork, setHasOtherWork] = useState(false);
  const [hasPersonalTime, setHasPersonalTime] = useState(false);
  const [rowValidationErrors, setRowValidationErrors] = useState<
    Record<string, { actuals: boolean; comments: boolean }>
  >({});

  useEffect(() => {
    if (allocationTheme.length === 1 && allocationTheme[0].__Id__ === '') {
      dispatch(fetchAllocationTheme());
    }
  }, [allocationTheme]);

  const handleProcessRowUpdate = (
    newRow: GridValidRowModel,
    oldRow: GridValidRowModel
  ) => {
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
            'error'
          )
        );
        return oldRow;
      } else if (updatedTotal >= 1.5) {
        dispatch(
          showToastAction(
            true,
            `Warning: Total actuals is approaching the maximum of 2.0. Current sum: ${updatedTotal.toFixed(1)}`,
            'warning'
          )
        );
      }
    }

    setRows(prev => {
      const existingRow = prev.find(r => r.id === newRow.id);
      if (JSON.stringify(existingRow) === JSON.stringify(newRow)) return prev;
      return prev.map(row =>
        row.id === newRow.id
          ? {
              ...row,
              ...newRow,
              actuals: actualsChanged ? newActual : row.actuals,
            }
          : row
      );
    });

    setRowValidationErrors(prev => {
      const updated = { ...prev };

      const actualsInvalid = !newRow.actuals || newRow.actuals === 0;
      const commentsInvalid = !newRow.comments || !newRow.comments.trim();

      updated[newRow.id] = {
        actuals: actualsInvalid,
        comments: commentsInvalid,
      };

      // Remove from map if both are valid
      if (!actualsInvalid && !commentsInvalid) {
        delete updated[newRow.id];
      }

      return updated;
    });

    return { ...newRow, actuals: actualsChanged ? newActual : newRow.actuals };
  };

  const handleCellKeyDown = (
    params: GridCellParams,
    event: React.KeyboardEvent
  ) => {
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
        range =>
          value >= parseFloat(range.From) && value <= parseFloat(range.To)
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
      renderCell: params => {
        // Don't show menu for total, divider, and initial rows
        if (
          params.row.id === 'total' ||
          params.row.type === 'divider' ||
          typeof params.row.id === 'number'
        ) {
          return params.value;
        }

        return (
          <p
            style={{
              overflow: 'inherit',
              textOverflow: 'ellipsis',
              position: 'relative',
              paddingRight: '32px',
              color: '#313F68',
              opacity: 1,
              fontWeight: 400,
            }}
          >
            {params.value}
            <IconButton
              size="small"
              onClick={e => handleActionMenuOpen(e, params.row.id)}
              sx={{
                padding: '0px',
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                '&:hover': {
                  backgroundColor: 'transparent',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '16px',
                  color: '#344665',
                },
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </p>
        );
      },
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
      renderCell: params => renderAllocationCell(params, allocationTheme),
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
      cellClassName: params =>
        rowValidationErrors[params.id as string]?.actuals
          ? 'error-cell'
          : 'col-cell-actuals',
      renderCell: params => renderAllocationCell(params, allocationTheme),
    },
    {
      field: 'comments',
      headerName: 'Comments',
      editable: true,
      flex: 1,
      minWidth: 158,
      headerClassName: 'header-comments',
      cellClassName: params =>
        rowValidationErrors[params.id as string]?.comments &&
        (!params.row.comments || !params.row.comments.trim())
          ? 'comment-error-cell'
          : 'col-cell-comments',
      renderEditCell: params => (
        <CommentCell
          {...params}
          showInitialError={rowValidationErrors[params.id as string]?.comments}
        />
      ),
      preProcessEditCellProps: params => {
        const hasError = !params.props.value || !params.props.value.trim();
        return { ...params.props, error: hasError };
      },
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
        if (!hasOtherWork) {
          const newOtherWorkRow = {
            id: `${Date.now()}_other_work`,
            project: 'Other Work',
            planned: 0,
            actuals: 0,
            comments: '',
          };
          addNewRow(newOtherWorkRow);
          setHasOtherWork(true);
        }
        break;
      case 'Personal Time':
        if (!hasPersonalTime) {
          const newPersonalTimeRow = {
            id: `${Date.now()}_personal_time`,
            project: 'Personal Time',
            planned: 0,
            actuals: 0,
            comments: '',
          };
          addNewRow(newPersonalTimeRow);
          setHasPersonalTime(true);
        }
        break;
      default:
        console.log(`Clicked on ${label}`);
    }
  };

  const addNewRow = (newRow: GridValidRowModel) => {
    setRows(prevRows => {
      const updatedRows = [...prevRows];
      const hasDivider = updatedRows.some(row => row.id === 'divider');

      if (!hasDivider) {
        updatedRows.push({ id: 'divider', type: 'divider' });
      }

      updatedRows.push(newRow);
      return updatedRows;
    });
    // Set validation to true immediately
    if (
      (newRow.actuals === 0 || newRow.actuals === undefined) &&
      (!newRow.comments || !newRow.comments.trim())
    ) {
      setRowValidationErrors(prev => ({
        ...prev,
        [newRow.id]: { actuals: true, comments: true },
      }));
    } else {
      setRowValidationErrors(prev => ({
        ...prev,
        [newRow.id]: {
          actuals: newRow.actuals === 0 || newRow.actuals === undefined,
          comments: !newRow.comments || !newRow.comments.trim(),
        },
      }));
    }
  };

  const handleActionMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    id: string
  ) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setSelectedRowId(id);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedRowId(null);
  };

  const handleDeleteRow = () => {
    if (selectedRowId) {
      setRows(prevRows => {
        const deletedRow = prevRows.find(row => row.id === selectedRowId);

        // Reset flags based on the deleted row
        if (deletedRow?.project === 'Other Work') {
          setHasOtherWork(false);
        } else if (deletedRow?.project === 'Personal Time') {
          setHasPersonalTime(false);
        }

        const updatedRows = prevRows.filter(row => row.id !== selectedRowId);

        // Check if we still have any unplanned rows
        const dividerIndex = updatedRows.findIndex(row => row.id === 'divider');
        const hasUnplannedRows =
          dividerIndex > -1 && updatedRows.length > dividerIndex + 1;

        return hasUnplannedRows
          ? updatedRows
          : updatedRows.filter(row => row.id !== 'divider');
      });
    }
    handleActionMenuClose();
  };

  const menuItems = [
    {
      label: 'Project',
      icon: <FolderIcon fontSize="small" sx={{ color: '#1C2D5F' }} />,
      disabled: false,
    },
    {
      label: 'Other Work',
      icon: (
        <Box
          component="img"
          src="/images/icons/otherWork.svg"
          alt="Other Work"
          sx={{ width: 20, height: 20, opacity: hasOtherWork ? 0.5 : 1 }}
        />
      ),
      disabled: hasOtherWork,
    },
    {
      label: 'Personal Time',
      icon: (
        <Box
          component="img"
          src="/images/icons/Personal.svg"
          alt="Other Work"
          sx={{ width: 20, height: 20, opacity: hasPersonalTime ? 0.5 : 1 }}
        />
      ),
      disabled: hasPersonalTime,
    },
  ];

  return (
    <>
      <Box borderRadius={1} overflow="hidden" width={530}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bgcolor="#1976d2"
          color="white"
          px={2}
          py={1}
        >
          <Typography fontWeight={600} fontSize=" 0.875rem">
            Q2 2025
          </Typography>
          <Typography fontWeight={600} fontSize="0.875rem">
            Week 12
          </Typography>
          <Typography fontWeight={600} fontSize="0.875rem">
            Apr 08 - Apr 14
          </Typography>
        </Box>

        <Box sx={{ height: 350 }}>
          <DataGridPremium
            apiRef={apiRef}
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
            isRowSelectable={params =>
              params.row.type !== 'divider' &&
              params.row.id !== 'second-total-row'
            }
            isCellEditable={params => {
              if (params.id === 'total' || params.row.id === 'divider')
                return false;
              return true;
            }}
            hideFooter
            disableRowSelectionOnClick
            onCellKeyDown={handleCellKeyDown}
            processRowUpdate={handleProcessRowUpdate}
            getRowClassName={params => {
              if (params.id === 'total') return 'second-total-row';
              if (params.id === 'divider') return 'divider-row';
              if (params.row.id === rows[rows.length - 1].id) return 'last-row';
              return 'first-header-row';
            }}
            sx={{
              fontSize: '0.875rem',
              ...actualsTableStyles,
            }}
          />
        </Box>
      </Box>

      <Box px={2} py={1} sx={{ paddingBottom: '0', paddingLeft: '0' }}>
        <Button
          variant="text"
          size="small"
          sx={{
            color: '#0D1F52',
            textTransform: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onClick={handleClick}
        >
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
              boxShadow:
                '0px 4px 4px -1px rgba(0, 0, 0, 0.10), 0px 4px 4px -2px rgba(0, 0, 0, 0.10)',
              minWidth: 212,
              backgroundColor: '#FFF',
              flexShrink: 0,
            },
          }}
        >
          {menuItems.map(item => (
            <MenuItem
              key={item.label}
              onClick={() => !item.disabled && handleMenuClick(item.label)}
              sx={{
                '&.Mui-disabled': {
                  opacity: 0.5,
                  color: 'text.disabled',
                },
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
              <ListItemText
                primary={item.label}
                className="menu-text"
                sx={{
                  opacity: item.disabled ? 0.5 : 1,
                }}
              />
              <img
                src="images/icons/small-arrowForward.svg"
                className="menu-icon"
                style={{
                  opacity: item.disabled ? 0.5 : 1,
                }}
              />
            </MenuItem>
          ))}
        </Menu>
      </Box>
      {showProjectMenu && (
        <ProjectMenu
          onClose={() => {
            setShowProjectMenu(false);
            setMainMenuAnchor(null);
          }}
          anchorEl={projectMenuAnchor}
          existingRows={rows}
          onAddProjects={newRows => {
            newRows.forEach(row => {
              addNewRow(row);
            });
          }}
        />
      )}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={handleDeleteRow}
          sx={{
            color: 'error.main',
          }}
        >
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
