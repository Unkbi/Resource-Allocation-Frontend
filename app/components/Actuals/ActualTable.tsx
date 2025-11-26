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
import { GridCellParams, GridApi } from '@mui/x-data-grid-premium';
import FolderIcon from '@mui/icons-material/Folder';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/app/redux/store';
import type { RootState } from '@/app/redux/store';
import ProjectMenu from './ProjectMenu';
import { fetchAllocationTheme } from '@/app/redux/actions/settingsAction';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { ActualAllocationTableRow } from '@/app/types';
import { isCurrentWeek } from '@/app/utils/common';
//@ts-ignore
import { getQuarter, getYear, getWeek, parseISO, format } from 'date-fns';
import NoActualsRowsOverlay from '../ResourceAllocation/component/NoActualsRowsOverlay';
import ProjectActualsStatusCell from './ProjectActualsStatusCell';

export function formatWeekRangeFromStrings(
  startDate: string | null,
  endDate: string | null
): string {
  if (!startDate || !endDate) return '';

  try {
    const start = format(parseISO(startDate), 'MMM dd');
    const end = format(parseISO(endDate), 'MMM dd');
    return `${start} - ${end}`;
  } catch {
    return '';
  }
}

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

interface ActualTableProps {
  data: ActualAllocationTableRow[];
  dataProcessing: boolean;
  rows: ActualAllocationTableRow[];
  setRows: React.Dispatch<React.SetStateAction<ActualAllocationTableRow[]>>;
  rowValidationErrors: Record<string, { actuals: boolean; comments: boolean }>;
  setRowValidationErrors: React.Dispatch<
    React.SetStateAction<
      Record<string, { actuals: boolean; comments: boolean }>
    >
  >;
  startDate: string | null;
  endDate: string | null;
  apiRef: React.RefObject<GridApi>;
  disableView?: boolean;
  onValidationChange?: (hasInvalidRows: boolean) => void;
  setShow?: (val: boolean) => void;
  onModificationChange?: (isModified: boolean) => void;
  confirmSignal?: number;
  handleProcessRowUpdate: (
    newRow: GridValidRowModel,
    oldRow: GridValidRowModel
  ) => GridValidRowModel;
}

export default function ActualTable({
  data,
  dataProcessing,
  rows,
  setRows,
  rowValidationErrors,
  setRowValidationErrors,
  startDate,
  endDate,
  apiRef,
  disableView = false,
  setShow,
  onValidationChange,
  onModificationChange,
  confirmSignal,
  handleProcessRowUpdate,
}: ActualTableProps) {
  const [mainMenuAnchor, setMainMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [projectMenuAnchor, setProjectMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const allocationTheme = useSelector(
    (state: RootState) => state.settings.allocationTheme
  );
  const { status } = useSelector((state: RootState) => state.actualAllocations);
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
  const [baselineRows, setBaselineRows] =
    useState<ActualAllocationTableRow[]>(data);
  useEffect(() => {
    if (allocationTheme.length === 1 && allocationTheme[0].__id__ === '') {
      dispatch(fetchAllocationTheme());
    }
  }, [allocationTheme]);

  useEffect(() => {
    setHasOtherWork(false);
    setHasPersonalTime(false);

    if (data) {
      setRows(data);
      setBaselineRows(data);
      if (data.length > 0 && data.find(row => row.project === 'Other Work')) {
        setHasOtherWork(true);
      }
      if (
        data.length > 0 &&
        data.find(row => row.project === 'Personal Time')
      ) {
        setHasPersonalTime(true);
      }
      onValidationChange && onValidationChange(false);
      setRowValidationErrors({});
    }
  }, [startDate, endDate, data]);

  useEffect(() => {
    if (onValidationChange) {
      const hasInvalidRows = Object.keys(rowValidationErrors).length > 0;
      onValidationChange(hasInvalidRows);
      if (hasInvalidRows) {
        setShow && setShow(false);
      }
    }
  }, [rowValidationErrors, onValidationChange]);

  useEffect(() => {
    setBaselineRows(rows);
    onModificationChange?.(false);
  }, [confirmSignal]);

  useEffect(() => {
    if (onModificationChange) {
      const isModified =
        rows.length !== baselineRows.length ||
        rows.some(
          (r, i) => JSON.stringify(r) !== JSON.stringify(baselineRows[i])
        );
      onModificationChange?.(isModified);
    }
  }, [rows, baselineRows, onModificationChange]);

  // Organize rows into sections
  const getOrganizedRows = () => {
    const plannedRows = rows.filter(
      row =>
        row.planned !== 0 &&
        row.project !== 'Other Work' &&
        row.project !== 'Personal Time'
    );
    const unplannedRows = rows.filter(
      row =>
        row.planned === 0 &&
        row.project !== 'Other Work' &&
        row.project !== 'Personal Time'
    );
    const otherRows = rows.filter(
      row => row.project === 'Other Work' || row.project === 'Personal Time'
    );

    // Mark last row of each section
    if (plannedRows.length > 0) {
      plannedRows[plannedRows.length - 1] = {
        ...plannedRows[plannedRows.length - 1],
        sectionEnd: 'planned',
      };
    }
    if (unplannedRows.length > 0) {
      unplannedRows[unplannedRows.length - 1] = {
        ...unplannedRows[unplannedRows.length - 1],
        sectionEnd: 'unplanned',
      };
    }
    if (otherRows.length > 0) {
      otherRows[otherRows.length - 1] = {
        ...otherRows[otherRows.length - 1],
        sectionEnd: 'other',
      };
    }

    const organizedRows = [...plannedRows, ...unplannedRows, ...otherRows];

    return organizedRows;
  };

  const handleCellKeyDown = (
    params: GridCellParams,
    event: React.KeyboardEvent
  ) => {
    if (
      params?.field !== 'comments' &&
      ['e', 'E', '+', '-'].includes(event.key)
    ) {
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

  const isUnplannedRow = (row: any) => {
    if (!row || typeof row !== 'object') return false;
    return row.planned === 0;
  };

  const columns: GridColDef[] = [
    {
      field: 'project',
      headerName: 'Projects',
      flex: 1,
      minWidth: 200,
      headerClassName: 'header-project',
      cellClassName: params =>
        params.id === 'total' ? 'disabled-cell-dark' : 'col-cell-project',
      renderCell: params => {
        // Don't show menu for total, divider, and initial rows
        if (
          params.row.id === 'total' ||
          params.row.type === 'divider' ||
          !isUnplannedRow(params.row) ||
          (status === 'confirmed' && !isCurrentWeek(startDate))
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
            {params.value ?? ''}
            <IconButton
              size="small"
              onClick={e => handleActionMenuOpen(e, params.row.id)}
              disabled={disableView}
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
      editable: !disableView,
      width: 68,
      align: 'center',
      headerAlign: 'center',
      headerClassName: 'header-actuals',
      cellClassName: params =>
        `col-cell-actuals ${disableView ? 'disabled-cell' : ''} ${
          rowValidationErrors[params.id as string]?.actuals ? 'error-cell' : ''
        }`,
      renderCell: params => renderAllocationCell(params, allocationTheme),
    },
    {
      field: 'projectActualsStatus',
      headerName: 'Status',
      editable: false,
      width: 120,
      align: 'center',
      headerAlign: 'center',
      headerClassName: 'header-comments',
      cellClassName: params =>
        params.id === 'total'
          ? 'disabled-cell-dark'
          : disableView
            ? 'disabled-cell'
            : '',
      renderCell: params => {
        return params.id !== 'total' ? (
          <ProjectActualsStatusCell
            disabled={disableView}
            row={params.row}
            status={params.value ?? 'No Data'}
            handleProcessRowUpdate={handleProcessRowUpdate}
            setRowValidationErrors={setRowValidationErrors}
          />
        ) : (
          <></>
        );
      },
    },
    {
      field: 'comments',
      headerName: 'Comments / Project updates',
      editable: !disableView,
      flex: 2,
      minWidth: 230,
      headerClassName: 'header-comments',
      cellClassName: params =>
        params.id === 'total'
          ? 'disabled-cell-dark'
          : `col-cell-comments ${disableView ? 'disabled-cell' : ''} ${
              rowValidationErrors[params.id as string]?.comments &&
              (!params.row.comments || !params.row.comments.trim())
                ? 'comment-error-cell'
                : ''
            }`,
      renderEditCell: params => (
        <CommentCell
          {...params}
          showInitialError={rowValidationErrors[params.id as string]?.comments}
        />
      ),
      renderCell: params =>
        params.id === 'total' ? (
          <Box sx={{ height: '100%', width: '100%' }} />
        ) : (
          <CommentCell
            {...params}
            readonly={true}
            disableView={disableView}
            showInitialError={
              rowValidationErrors[params.id as string]?.comments
            }
          />
        ),
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
    setRows((prevRows: ActualAllocationTableRow[]) => {
      const updatedRows = [...prevRows];

      updatedRows.push(newRow as ActualAllocationTableRow);
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
      if (onValidationChange) {
        onValidationChange(true);
      }
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

        // Remove validation errors for the deleted row
        setRowValidationErrors(prev => {
          const updatedErrors = { ...prev };
          delete updatedErrors[selectedRowId];
          return updatedErrors;
        });

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
      <Box borderRadius={1} overflow="hidden" width={730}>
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
            {`Q${getQuarter(parseISO(startDate || ''))} ${getYear(startDate || '')}`}
          </Typography>
          <Typography fontWeight={600} fontSize="0.875rem">
            {`Week ${getWeek(parseISO(startDate || ''), {
              weekStartsOn: 1,
            })}`}
          </Typography>
          <Typography fontWeight={600} fontSize="0.875rem">
            {formatWeekRangeFromStrings(startDate, endDate)}
          </Typography>
        </Box>

        <Box sx={{ height: 350 }}>
          <DataGridPremium
            rowHeight={60}
            apiRef={apiRef}
            rows={getOrganizedRows()}
            columns={columns}
            loading={dataProcessing}
            disableColumnMenu
            disableColumnSorting
            editMode="cell"
            onCellClick={(params, event) => {
              // prevent MUI from starting edit automatically
              event.defaultMuiPrevented = true;

              // Ignore clicks on non-editable cells
              if (!params.isEditable) return;

              const mode = apiRef.current.getCellMode(params.id, params.field);

              // Already editing? skip
              if (mode === 'edit') return;

              // Trigger edit immediately
              apiRef.current.startCellEditMode({
                id: params.id,
                field: params.field,
              });
            }}
            isRowSelectable={params =>
              params.row.type !== 'divider' &&
              params.row.id !== 'second-total-row'
            }
            isCellEditable={params => {
              if (disableView) return false;
              if (params.id === 'total' || params.row.id === 'divider')
                return false;
              return true;
            }}
            hideFooter
            disableRowSelectionOnClick
            onCellKeyDown={handleCellKeyDown}
            processRowUpdate={handleProcessRowUpdate}
            getRowClassName={params => {
              const isLastRow =
                params?.row?.id ===
                getOrganizedRows()[getOrganizedRows().length - 1]?.id;
              if (!isLastRow && params.row.sectionEnd === 'planned')
                return 'section-end-planned';
              if (!isLastRow && params.row.sectionEnd === 'unplanned')
                return 'section-end-unplanned';
              if (!isLastRow && params.row.sectionEnd === 'other')
                return 'section-end-other';
              if (isLastRow) return 'last-row';
              return 'first-header-row';
            }}
            sx={{
              fontSize: '0.875rem',
              ...actualsTableStyles,
            }}
            slots={{
              //@ts-ignore
              noRowsOverlay: NoActualsRowsOverlay,
            }}
            slotProps={{
              loadingOverlay: {
                variant: 'skeleton',
                noRowsVariant: 'skeleton',
              },
            }}
            pinnedRows={{
              top: [
                {
                  id: 'total',
                  project: 'Total',
                  planned: totalPlanned,
                  actuals: totalActuals,
                  comments: '',
                },
              ],
            }}
          />
        </Box>
      </Box>

      <Box
        px={2}
        py={1}
        sx={{
          paddingLeft: '0',
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
        }}
      >
        <Button
          variant="text"
          size="small"
          disabled={disableView}
          sx={{
            color: '#2563EB',
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
