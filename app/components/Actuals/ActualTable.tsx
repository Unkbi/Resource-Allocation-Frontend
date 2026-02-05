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
  Skeleton,
  Link,
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
import { ActualAllocationTableRow, Resource } from '@/app/types';
import {
  generateFirstAndLastMonthYear,
  isCurrentWeek,
  getMondayOfISO,
  getSundayOfISO,
  isFutureWeek,
} from '@/app/utils/common';
//@ts-ignore
import { parseISO, format, isSameWeek, startOfWeek, isBefore } from 'date-fns';
import { useRouter } from 'next/navigation';
import NoActualsRowsOverlay from '../ResourceAllocation/component/NoActualsRowsOverlay';
import ProjectActualsStatusCell from './ProjectActualsStatusCell';
import CustomDateRangePicker from '../DatePicker/CustomDateRangePicker';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { updateStartAndEndDate } from '@/app/redux/reducers/teamsReducer';
import ActualsErrorPage from '../ErrorPage/ActualsErrorPage';
import {
  current,
  FAR_FUTURE_DATE,
  FAR_PAST_DATE,
  future,
  HOURS,
  OTHER_WORK,
  past,
  PERSONAL_TIME,
  TOTAL_HOURS_IN_WEEK,
  UNPLANNED_PROJECT,
} from '@/app/constants/constants';
import {
  format2,
  isPeriodWithinRange,
  roundToStep05,
} from '@/app/utils/actualsUtils';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';

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
  currentResource: Resource | null;
  dataProcessing: boolean;
  rows: ActualAllocationTableRow[];
  setRows: React.Dispatch<React.SetStateAction<ActualAllocationTableRow[]>>;
  rowValidationErrors: Record<
    string,
    { planned: boolean; actuals: boolean; comments: boolean }
  >;
  setRowValidationErrors: React.Dispatch<
    React.SetStateAction<
      Record<string, { planned: boolean; actuals: boolean; comments: boolean }>
    >
  >;
  startDate: string | null | any;
  endDate: string | null | any;
  apiRef: React.RefObject<GridApi>;
  disableView?: boolean;
  enablePlannedColumn?: boolean;
  onValidationChange?: (hasInvalidRows: boolean) => void;
  setShow?: (val: boolean) => void;
  onModificationChange?: (isModified: boolean) => void;
  confirmSignal?: number;
  handleProcessRowUpdate: (
    newRow: GridValidRowModel,
    oldRow: GridValidRowModel
  ) => GridValidRowModel;
  formattingActualAllocations: any;
  handlePrev: () => void;
  handleNext: () => void;
  isModified: boolean;
  setDialogSource: (source: 'prev' | 'next') => void;
  setDeleteDialogOpen: (open: boolean) => void;
  actualsErrorType?: any;
  disablePrev?: boolean;
  disableNext?: boolean;
  handledRevertStatus: () => void;
  permissions?: Record<string, CrudPermissions>;
  loadingPermissions?: boolean;
}

function ActualTable({
  data,
  currentResource,
  dataProcessing,
  rows,
  setRows,
  rowValidationErrors,
  setRowValidationErrors,
  startDate,
  endDate,
  apiRef,
  disableView = false,
  enablePlannedColumn = false,
  setShow,
  onValidationChange,
  onModificationChange,
  confirmSignal,
  handleProcessRowUpdate,
  formattingActualAllocations,
  handlePrev,
  handleNext,
  isModified,
  setDialogSource,
  setDeleteDialogOpen,
  actualsErrorType,
  disablePrev = false,
  disableNext = false,
  handledRevertStatus,
  permissions,
  loadingPermissions,
}: ActualTableProps) {
  const router = useRouter();
  const [mainMenuAnchor, setMainMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [projectMenuAnchor, setProjectMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const allocationTheme = useSelector(
    (state: RootState) => state.settings.allocationTheme
  );
  const { actualAllocationsStatuses, actualAllocationsStatusesLoading } =
    useSelector((state: RootState) => state.actualAllocations);
  const { scalarSettings } = useSelector(
    (state: RootState) => state.allSettings
  );
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const totalPlanned = useMemo(() => {
    const sum = calculateTotal([...rows], 'planned');
    return format2(roundToStep05(sum));
  }, [rows]);

  const totalActuals = useMemo(() => {
    const sum = calculateTotal([...rows], 'actuals');
    return format2(roundToStep05(sum));
  }, [rows]);

  const [hasOtherWork, setHasOtherWork] = useState(false);
  const [hasPersonalTime, setHasPersonalTime] = useState(false);
  const [baselineRows, setBaselineRows] =
    useState<ActualAllocationTableRow[]>(data);

  function getWeekStatus(periodIso?: string): 'past' | 'current' | 'future' {
    if (!periodIso) return future;
    const period = parseISO(periodIso);
    const now = new Date();
    if (isSameWeek(period, now, { weekStartsOn: 1 })) return current;
    const periodStart = startOfWeek(period, { weekStartsOn: 1 });
    const nowStart = startOfWeek(now, { weekStartsOn: 1 });
    return isBefore(periodStart, nowStart) ? past : future;
  }

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

  const isWithinResourceRange = useMemo(() => {
    return isPeriodWithinRange(
      parseISO(getMondayOfISO(startDate)),
      currentResource?.StartDate
        ? parseISO(getMondayOfISO(currentResource?.StartDate || ''))
        : parseISO(FAR_PAST_DATE),
      currentResource?.EndDate
        ? parseISO(getMondayOfISO(currentResource?.EndDate || ''))
        : parseISO(FAR_FUTURE_DATE)
    );
  }, [startDate, currentResource]);

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
      const matched = allocationTheme.find(range =>
        scalarSettings?.Actuals_Allocation_Preference === HOURS
          ? value >= parseFloat(range.From) * TOTAL_HOURS_IN_WEEK &&
            value <= parseFloat(range.To) * TOTAL_HOURS_IN_WEEK
          : value >= parseFloat(range.From) && value <= parseFloat(range.To)
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
            flexDirection: 'column',
            fontWeight: 600,
            p: 0,
            m: 0,
            position: 'relative',
          }}
        >
          <Typography
            sx={{
              pt:
                scalarSettings?.Actuals_Allocation_Preference === HOURS
                  ? 0.5
                  : 0,
              fontWeight: 600,
            }}
          >
            {' '}
            {scalarSettings?.Actuals_Allocation_Preference === HOURS
              ? value
              : format2(roundToStep05(value))}
          </Typography>
          {scalarSettings?.Actuals_Allocation_Preference === HOURS && (
            <Typography
              sx={{
                position: 'relative',
                top: '-6px',
                fontSize: '10px',
                fontStyle: 'italic',
              }}
            >
              (hrs)
            </Typography>
          )}
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
    return scalarSettings?.Actuals_Allocation_Preference === HOURS
      ? value
      : format2(roundToStep05(value));
  };

  const isUnplannedRow = (row: any) => {
    if (!row || typeof row !== 'object') return false;
    return enablePlannedColumn
      ? row?.type
        ? [UNPLANNED_PROJECT, OTHER_WORK, PERSONAL_TIME].includes(row?.type)
        : false
      : row.planned === 0;
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
          (actualAllocationsStatuses?.[startDate] == 'confirmed' &&
            !isCurrentWeek(startDate))
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
              disabled={!enablePlannedColumn && disableView}
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
      width: 75,
      editable: enablePlannedColumn,
      align: 'center',
      headerAlign: 'center',
      headerClassName: 'header-planned',
      cellClassName: params =>
        `col-cell-actuals ${!enablePlannedColumn ? 'disabled-cell' : ''} ${
          rowValidationErrors[params.id as string]?.planned ? 'error-cell' : ''
        }`,
      valueParser: value => {
        if (value == null || value === '') return null;

        if (scalarSettings?.Actuals_Allocation_Preference !== HOURS)
          return value;

        const parsed = Math.round(Number(value));

        // prevent NaN and negative values
        if (isNaN(parsed) || parsed < 0) {
          return 0;
        }

        return parsed;
      },
      renderCell: params => renderAllocationCell(params, allocationTheme),
    },
    {
      field: 'actuals',
      headerName: 'Actuals',
      type: 'number',
      editable: !disableView,
      width: 75,
      align: 'center',
      headerAlign: 'center',
      headerClassName: 'header-actuals',
      cellClassName: params =>
        `col-cell-actuals ${disableView ? 'disabled-cell' : ''} ${
          rowValidationErrors[params.id as string]?.actuals ? 'error-cell' : ''
        }`,
      valueParser: value => {
        if (value == null || value === '') return null;

        if (scalarSettings?.Actuals_Allocation_Preference !== HOURS)
          return value;

        const parsed = Math.round(Number(value));

        // prevent NaN and negative values
        if (isNaN(parsed) || parsed < 0) {
          return 0;
        }

        return parsed;
      },
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
      editable: enablePlannedColumn || !disableView,
      flex: 2,
      minWidth: 230,
      headerClassName: 'header-comments',
      cellClassName: params =>
        params.id === 'total'
          ? 'disabled-cell-dark'
          : `col-cell-comments ${!enablePlannedColumn && disableView ? 'disabled-cell' : ''} ${
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
            disableView={!enablePlannedColumn && disableView}
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
            type: OTHER_WORK,
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
            type: PERSONAL_TIME,
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
    // Future Weeks
    if (enablePlannedColumn) {
      if (
        (newRow.planned === 0 || newRow.planned === undefined) &&
        (!newRow.comments || !newRow.comments.trim())
      ) {
        setRowValidationErrors(prev => ({
          ...prev,
          [newRow.id]: { planned: true, comments: true },
        }));
        if (onValidationChange) {
          onValidationChange(true);
        }
      } else {
        setRowValidationErrors(prev => ({
          ...prev,
          [newRow.id]: {
            planned: newRow.planned === 0 || newRow.planned === undefined,
            comments: !newRow.comments || !newRow.comments.trim(),
          },
        }));
      }
    }

    // Past or Current Weeks
    else if (
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

  const handleCopyToActuals = () => {
    apiRef.current
      .getAllRowIds()
      .map(id => apiRef.current.getRow(id))
      .filter(row => row.id !== 'total' && row.project)
      .forEach(row =>
        handleProcessRowUpdate(
          {
            ...row,
            actuals: row.planned,
            projectActualsStatus:
              !row.projectActualsStatus ||
              row.projectActualsStatus === 'No Data'
                ? 'On Track'
                : row.projectActualsStatus,
          },
          row
        )
      );
  };

  const handleDateFieldInternal = (payload: any) => {
    if (!payload) return;
    const clickedDate = payload?.startDate ?? payload;
    if (!clickedDate) return;

    const monday = getMondayOfISO(clickedDate);
    const sunday = getSundayOfISO(clickedDate);
    if (isModified) {
      setDialogSource('prev');
      setDeleteDialogOpen(true);
    } else {
      dispatch(
        updateStartAndEndDate({
          startDate: monday,
          endDate: sunday,
        })
      );

      router.replace(`/actuals?startDate=${monday}`, { scroll: false });
    }
  };

  const first = generateFirstAndLastMonthYear(
    parseISO(startDate),
    'MMM dd',
    true
  );
  const last = generateFirstAndLastMonthYear(parseISO(endDate), 'MMM dd', true);

  const currentWeekMonday = getMondayOfISO(new Date().toISOString());

  return (
    <>
      <Box overflow="hidden" width={730}>
        <Box
          sx={{
            width: '100%',
            height: '2px',
            backgroundImage: `linear-gradient(to right, rgba(202, 213, 226, 1) 0% 34.25%, ${
              getWeekStatus(startDate) === past
                ? 'rgba(202, 213, 226, 0.2)'
                : getWeekStatus(startDate) === current
                  ? 'rgba(30, 58, 139, 1)'
                  : 'rgba(251, 251, 251, 1)'
            } 34.25% 65.75%,rgba(202, 213, 226, 1) 65.75% 100%)`,
            backgroundSize: '100% 2px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top',
          }}
        ></Box>
        <Box
          display="flex"
          alignItems="center"
          bgcolor={
            getWeekStatus(startDate) === past
              ? 'rgba(202, 213, 226, 0.2)'
              : getWeekStatus(startDate) === current
                ? 'rgba(30, 58, 139, 1)'
                : 'rgba(251, 251, 251, 1)' // future
          }
          borderLeft="1px solid rgba(202, 213, 226, 1)"
          borderRight="1px solid rgba(202, 213, 226, 1)"
          borderBottom="1px solid rgba(202, 213, 226, 1)"
          color="white"
          height={50}
          px={1.2}
        >
          {/* LEFT — Status */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                fontWeight: 400,
                fontSize: '14px',
                fontFamily: 'Open Sans',
                color:
                  getWeekStatus(startDate) === current ? '#FFFFFF' : '#000000',
              }}
            >
              Status:{' '}
              {actualAllocationsStatusesLoading ||
              dataProcessing ||
              formattingActualAllocations ? (
                <Skeleton
                  variant="text"
                  sx={{
                    display: 'inline-block',
                    width: '80px',
                    height: '21px',
                    ml: '4px',
                    verticalAlign: 'middle',
                  }}
                />
              ) : (
                <span
                  style={{
                    color:
                      !isFutureWeek(parseISO(startDate)) &&
                      isWithinResourceRange
                        ? actualAllocationsStatuses?.[startDate] === 'Confirmed'
                          ? '#3CC55F'
                          : '#FF7912'
                        : '#000000',
                    fontWeight: 600,
                  }}
                >
                  {!isFutureWeek(parseISO(startDate)) && isWithinResourceRange
                    ? (actualAllocationsStatuses?.[startDate] ?? 'Not Started')
                    : 'NA'}
                </span>
              )}
            </Typography>

            {/* Sahadev :  Add once API for ActualsStatusUpdate is provided */}
            {/* {permissions &&
              (permissions['AdminActuals']?.r ||
                permissions['AllocationManagerActuals']?.r ||
                permissions['ManagerActuals']?.r) &&
              getWeekStatus(startDate) === past && (
                <IconButton
                  sx={{
                    '&:hover': { backgroundColor: 'transparent !important' },
                    pt: 1.25,
                  }}
                  onClick={() => handledRevertStatus()}
                >
                  <img
                    style={{ paddingRight: 4 }}
                    src="/images/icons/revert-status.svg"
                    alt="Revert"
                  />
                </IconButton>
              )} */}
          </Box>

          {/* CENTER — Date navigation */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '64px',
              pt: '6px',
            }}
          >
            <IconButton
              disabled={disablePrev}
              sx={{
                mb: '8px',
                color:
                  getWeekStatus(startDate) === current ? '#FFFFFF' : '#000000',
              }}
              onClick={() => {
                if (isModified) {
                  setDialogSource('prev');
                  setDeleteDialogOpen(true);
                } else {
                  handlePrev();
                }
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <Box className="rangePicker" sx={{ display: 'flex' }}>
              <CustomDateRangePicker
                placeholder={`${first} - ${last}`}
                isButton={true}
                value={{ StartDate: startDate, EndDate: endDate }}
                showCalendarIconOnlyHere
                showLabel={false}
                format="MMM DD"
                handleDateField={handleDateFieldInternal}
                singleClick={true}
                minDate={currentResource?.StartDate || null}
                maxDate={currentResource?.EndDate || null}
              />
            </Box>

            <IconButton
              disabled={disableNext}
              sx={{
                ml: '15px',
                mb: '8px',
                color:
                  getWeekStatus(startDate) === current ? '#FFFFFF' : '#000000',
              }}
              onClick={() => {
                if (isModified) {
                  setDialogSource('next');
                  setDeleteDialogOpen(true);
                } else {
                  handleNext();
                }
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>

          {/* RIGHT — Copy action */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <Link
              onClick={() =>
                isWithinResourceRange && !disableView && handleCopyToActuals()
              }
              sx={{
                cursor:
                  !isWithinResourceRange || disableView
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '14px',
                  textDecoration: 'underline',
                  color:
                    !isWithinResourceRange || enablePlannedColumn || disableView
                      ? 'rgba(121, 134, 162, 1)'
                      : 'rgba(70, 169, 250, 1)',
                }}
              >
                Copy Plan to Actuals
              </Typography>
            </Link>
          </Box>
        </Box>

        <Box sx={{ minHeight: '200px', height: 'calc(100vh - 400px)' }}>
          {actualsErrorType ? (
            <ActualsErrorPage
              type={actualsErrorType}
              redirectPath={`/actuals?startDate=${currentWeekMonday}`}
            />
          ) : (
            <DataGridPremium
              rowHeight={40}
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

                const mode = apiRef.current.getCellMode(
                  params.id,
                  params.field
                );

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
                if (disableView && !enablePlannedColumn) return false;
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
          )}
        </Box>
      </Box>

      <Box
        px={2}
        sx={{
          paddingLeft: '0',
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          {!actualsErrorType && (
            <Button
              variant="text"
              size="small"
              disabled={!enablePlannedColumn && disableView}
              sx={{
                color: '#2563EB',
                textTransform: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                paddingLeft: '8px',
              }}
              onClick={handleClick}
            >
              {enablePlannedColumn
                ? '+ Add Unplanned Work'
                : '+ Add Unplanned Actuals'}
            </Button>
          )}
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src="/images/icons/InfoRounded.svg" alt="info" />
          <Typography
            component="span"
            sx={{
              fontSize: '12px',
              color: 'rgba(64, 68, 76, 1)',
              marginLeft: '8px',
            }}
          >
            Hours per week, 40 hrs = full-time
          </Typography>
        </Box>
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

export default withRBAC(ActualTable, [
  'AdminActuals',
  'AllocationManagerActuals',
  'ManagerActuals',
]);
