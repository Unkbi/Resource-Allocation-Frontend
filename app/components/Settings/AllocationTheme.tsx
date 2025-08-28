'use client';

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import type {
  GridColDef,
  GridRenderCellParams,
  GridValidRowModel,
} from '@mui/x-data-grid';
import {
  TextField,
  Typography,
  Popover,
  Tooltip,
  Tab,
  Tabs,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  AddButton,
  ColorIndicator,
  ColorPickerContainer,
  ColorPickerRow,
  ColorSwatch,
  ContentPaper,
  CustomFooter,
  MainContent,
  RangeInputGroup,
  StyledDataGrid,
  StyledRangeField,
  StyledTableHeader,
} from './styled';
import { validateRanges } from '@/app/(root)/settings/page';
import { useDispatch } from 'react-redux';
import { AllocationRange } from '@/app/types';
import { showToastAction } from '@/app/redux/actions/toastAction';
import { formatStringToFloat } from '@/app/utils/common';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  BottomActions,
  CancelButton,
  SaveButton,
} from '@/app/components/Settings/styled';
import { useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/redux/store';
import { showToast } from '@/app/redux/reducers/toastReducer';
import { updateAllocationTheme } from '@/app/redux/reducers/settingsReducer';
import {
  addAllocationThemeAction,
  fetchAllocationTheme,
  updateAllocationThemeAction,
} from '@/app/redux/actions/settingsAction';
import { set } from 'date-fns';

const baseURLAccessManagement = '/settings?menu=allocation-settiings';
interface ColorPair {
  pastel: string;
  dark: string;
}

const colorPairs: ColorPair[] = [
  { pastel: '#FADCB9', dark: '#F5B544' },
  { pastel: '#D9F1B7', dark: '#93CB41' },
  { pastel: '#B2D0FF', dark: '#2772F0' },
  { pastel: '#FBB7AE', dark: '#C55858' },
  { pastel: '#C1F0F5', dark: '#45C0CD' },
  { pastel: '#F8E6A0', dark: '#D1BB67' },
  { pastel: '#FDD0EC', dark: '#FFA8DE' },
  { pastel: '#DFD8FD', dark: '#8470DE' },
  { pastel: '#D5DBE5', dark: '#959AA3' },
  { pastel: '#FFFFFF', dark: '#FFFFFF' },
];

// Interface for validation errors
interface ValidationErrors {
  [key: number]: {
    From?: boolean;
    To?: boolean;
    message?: string;
  };
}

const commonTabSx = {
  color: '#4B5563',
  textTransform: 'none',
  borderRadius: 0,
  px: 3,
  textAlign: 'center',
  fontFamily: 'Open Sans',
  fontSize: '14px',
  fontStyle: 'normal',
  fontWeight: 600,
  lineHeight: '24px',
  '&.Mui-selected': {
    background: 'transparent',
    color: '#2563EB',
    boxShadow: 'none',
    borderBottom: '2px solid #3b82f6',
    textAlign: 'center',
    fontFamily: 'Open Sans',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: '24px',
  },
};

const tabMenuNames = [
  'color-settings',
  'alerts-threshold',
  'allocation-history',
];

const tabConfig = [
  {
    label: 'Color Settings',
    value: 'color-settings',
    icon: '/images/icons/colorPalette.svg',
  },
  {
    label: 'Alert Threshold',
    value: 'alerts-threshold',
    icon: '/images/icons/alertThresholdIcon.svg',
  },
  {
    label: 'Allocation History',
    value: 'allocation-history',
    icon: '/images/icons/allocationHistoryIcon.svg',
  },
];

const TabHeader = ({
  tab,
  setTab,
  setHasUnsavedChanges,
}: {
  tab: string;
  setTab: (value: string) => void;
  setHasUnsavedChanges: (value: boolean) => void;
}) => (
  <Box
    sx={{
      boxShadow: 1,
      display: 'flex',
      justifyContent: 'flex-start',
      width: '100%',
      backgroundColor: '#fff',
      height: '59px',
      borderBottom: '0px solid #E5E7EB',
    }}
  >
    <Tabs
      value={tab}
      onChange={(_, v) => {
        setTab(v);
        setHasUnsavedChanges(false);
      }}
      sx={{
        width: 'fit-content',
        marginLeft: '20px',
        marginRight: '20px',
        background: 'transparent',
        '& .MuiTabs-flexContainer': {
          gap: 1.5,
        },
        '& .MuiTabs-indicator': {
          backgroundColor: '#2563EB',
        },
        '& .Mui-selected .tab-icon': {
          filter:
            'brightness(0) saturate(100%) invert(33%) sepia(93%) saturate(1554%) hue-rotate(197deg) brightness(100%) contrast(101%)',
        },
      }}
    >
      {tabConfig.map(({ label, value, icon }) => (
        <Tab
          key={value}
          icon={
            <img
              src={icon}
              alt={label}
              style={{ width: 21, height: 16, marginRight: 6 }}
              className="tab-icon"
            />
          }
          iconPosition="start"
          label={label}
          value={value}
          sx={commonTabSx}
        />
      ))}
    </Tabs>
  </Box>
);

export default function AllocationTheme() {
  const { allocationTheme } = useSelector((state: RootState) => state.settings);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [activeColorRow, setActiveColorRow] = React.useState<string | null>(
    null
  );
  const [maxAllocationWarning, setMaxAllocationWarning] =
    React.useState<number>(0.0);
  const [maxAllocationError, setMaxAllocationError] =
    React.useState<number>(0.0);
  // Alert threshold message states
  const [warningMessage, setWarningMessage] = React.useState<string>(
    'Allocation for x (resource name) has exceeded the warning threshold.'
  );
  const [errorMessage, setErrorMessage] = React.useState<string>(
    'Allocation for x (resource name) has exceeded the allowed threshold.'
  );
  // Retention durations (1-9 months)
  const [allocationHistoryDuration, setAllocationHistoryDuration] =
    React.useState<string>('');
  const [commentsHistoryDuration, setCommentsHistoryDuration] =
    React.useState<string>('');
  const dispatch: AppDispatch = useDispatch();
  const [tab, setTab] = React.useState('color-settings');
  const [allocationRanges, setAllocationRanges] =
    useState<AllocationRange[]>(allocationTheme);
  // State to track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // Keep a backup of the original data for cancel functionality
  const [originalAllocationRanges, setOriginalAllocationRanges] =
    useState<AllocationRange[]>(allocationTheme);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setAllocationRanges(allocationTheme);
    setOriginalAllocationRanges(allocationTheme);
  }, [allocationTheme]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabMenuNames.includes(tabParam)) {
      setTab(tabParam);
    }
  }, []);

  useEffect(() => {
    if (tab === 'color-settings') {
      // Fetch color settings data
    }
    if (tab === 'alerts-threshold') {
      // Fetch alerts threshold data
    }
    if (tab === 'allocation-history') {
      // Fetch allocation history data
    }
    if (tabMenuNames.includes(tab)) {
      const newUrl = `${baseURLAccessManagement}&tab=${tab}`;
      router.replace(newUrl);
    }
  }, [tab, dispatch]);

  // Get currently used colors
  const usedColors = React.useMemo(() => {
    return allocationRanges.map(row => row?.Color);
  }, [allocationRanges]);

  const formatValues = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    row: AllocationRange
  ) => {
    if (parseFloat(row.From) > parseFloat(row.To)) {
      e.target.focus();
      dispatch(
        showToastAction(
          true,
          `Allocation Range To : ${row.To} must be equal or greater than Allocation Range From : ${row.From}`,
          'error',
          4000
        )
      );
    }
    const updatedRanges = allocationRanges.map(r => {
      if (r.id === row.id) {
        return {
          ...r,
          From: formatStringToFloat(row.From),
          To: formatStringToFloat(row.To),
        };
      }
      return r;
    });

    setAllocationRanges(updatedRanges);
    const newErrors = validateRanges(updatedRanges);
    setValidationErrors(newErrors);
    setHasUnsavedChanges(true);
  };

  React.useEffect(() => {
    dispatch(fetchAllocationTheme());
  }, []);
  // Update the handleRangeChange function in the RangeCell component
  const RangeCell = (params: GridRenderCellParams) => {
    const { id, field, value } = params;
    const row = params.row;
    const rowId = id as number;
    const error = validationErrors[rowId];

    const handleRangeChange = (
      Id: number | string,
      field: 'From' | 'To',
      value: string
    ) => {
      function isFloatLike(value: string) {
        const regex = /^(\d+)?(\.)?(\d*)?$/;
        return regex.test(value);
      }

      function isInvalidInput(value: string) {
        const regex = /[^0-9\.\s]/;
        return regex.test(value);
      }

      function isDecimalDots(value: string) {
        const regex = /^\s*\.+$/;
        return regex.test(value);
      }

      let updatedRanges = allocationRanges.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      );

      if (field === 'To') {
        const currentRow = updatedRanges.find(row => row.id === id);
        if (currentRow && currentRow.To !== '2.0') {
          let currentTo = isDecimalDots(value)
            ? parseFloat('0.0')
            : parseFloat(value);
          if (!isNaN(currentTo)) {
            // Check if the value is a valid decimal number
            if (isInvalidInput(value) || isFloatLike(value) === false) {
              dispatch(
                showToastAction(
                  true,
                  `Invalid input. Please enter a valid number.`,
                  'error',
                  4000
                )
              );
              return;
            }

            if (
              value !== '0' &&
              value !== '0.' &&
              value !== '1' &&
              value !== '1.' &&
              value !== '.' &&
              currentTo < parseFloat(currentRow.From)
            ) {
              dispatch(
                showToastAction(
                  true,
                  `Allocation Range To : ${value} must be equal or greater than Allocation Range From : ${currentRow.From}`,
                  'error',
                  4000
                )
              );
              return;
            }
            if (parseFloat(value) >= 2.0) {
              // updatedRanges = allocationRanges;

              dispatch(
                showToastAction(
                  true,
                  `Allocation range cannot exceed 2.0 `,
                  'error',
                  4000
                )
              );
              return;
            }
            // Update subsequent rows in sequence
            const currentIndex = updatedRanges.findIndex(row => row.id === id);
            let nextIndex = currentIndex + 1;

            while (nextIndex < updatedRanges.length) {
              const newFromValue = (currentTo + 0.1).toFixed(1);

              updatedRanges = updatedRanges.map((row, index) =>
                index === nextIndex
                  ? {
                      ...row,
                      From: newFromValue,
                      To: row.To === '2.0' ? row.To : '', // Clear subsequent to values
                    }
                  : row
              );

              currentTo = parseFloat(newFromValue);
              nextIndex++;
            }
          } else {
            updatedRanges = updatedRanges.map(row =>
              row.id === id ? { ...row, To: '' } : row
            );
            setAllocationRanges(updatedRanges);
            const newErrors = validateRanges(updatedRanges);
            setValidationErrors(newErrors);
            setHasUnsavedChanges(true);
          }
        }
      }

      // Update base row based on max to value from all rows
      const baseRow = updatedRanges.find(row => row.To === '2.0');
      if (baseRow) {
        const nonBaseRows = updatedRanges.filter(row => row.To !== '2.0');
        const toValues = nonBaseRows
          .map(row => parseFloat(row.To))
          .filter(v => !isNaN(v));

        if (toValues.length > 0) {
          const maxTo = Math.max(...toValues);
          const newBaseFrom = (maxTo + 0.1).toFixed(1);

          updatedRanges = updatedRanges.map(row =>
            row.To === '2.0' ? { ...row, From: newBaseFrom } : row
          );
        } else {
          // Reset base row if no valid ranges
          updatedRanges = updatedRanges.map(row =>
            row.To === '2.0' ? { ...row, From: '0.0' } : row
          );
        }
      }

      setAllocationRanges(updatedRanges);
      const newErrors = validateRanges(updatedRanges);
      setValidationErrors(newErrors);
      setHasUnsavedChanges(true);
    };

    return (
      <RangeInputGroup>
        <Typography variant="body2">FROM</Typography>
        <StyledRangeField
          onKeyDown={e => {
            e.stopPropagation();
          }}
          size="small"
          value={row.From}
          disabled={
            (row.From === '0.0' && row.To === '0.0') ||
            row.To === '2.0' ||
            (row.From !== '' && row.To !== '2.0')
          }
          onChange={e => handleRangeChange(id, 'From', e.target.value)}
          error={error?.From}
        />
        <Typography variant="body2">TO</Typography>
        <StyledRangeField
          onKeyDown={e => {
            e.stopPropagation();
          }}
          size="small"
          value={row.To}
          disabled={row.To === '2.0'}
          onChange={e => handleRangeChange(id, 'To', e.target.value)}
          onBlur={e => formatValues(e, row)}
          error={error?.To}
        />
      </RangeInputGroup>
    );
  };

  // Custom Color Cell Renderer
  const ColorCell = (params: GridRenderCellParams) => {
    const { id, value } = params;
    const handleColorPickerClick = (
      event: React.MouseEvent<HTMLDivElement>
    ) => {
      setAnchorEl(event.currentTarget);
      setActiveColorRow(id as string);
    };

    const handleColorSelect = (pastelColor: string) => {
      const colorPair = colorPairs.find(pair => pair.pastel === pastelColor);
      if (colorPair) {
        setAllocationRanges(
          allocationRanges.map(row =>
            row.id === activeColorRow
              ? { ...row, Color: pastelColor, DarkColor: colorPair.dark }
              : row
          )
        );
        setHasUnsavedChanges(true);
      }
      handleClose();
    };

    const handleClose = () => {
      setAnchorEl(null);
      setActiveColorRow(null);
    };

    const open = Boolean(anchorEl) && activeColorRow === id;

    return (
      <ColorPickerContainer>
        <ColorIndicator
          color={value as string}
          onClick={handleColorPickerClick}
        />
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <ColorPickerRow>
            {colorPairs.map(pair => {
              const isUsed =
                usedColors.includes(pair.pastel) &&
                allocationRanges.find(row => row.id === activeColorRow)
                  ?.Color !== pair.pastel;

              return (
                <Tooltip
                  key={pair.pastel}
                  title={isUsed ? 'This color is already in use' : ''}
                >
                  <div>
                    <ColorSwatch
                      color={pair.pastel}
                      disabled={isUsed}
                      onClick={() => !isUsed && handleColorSelect(pair.pastel)}
                    />
                  </div>
                </Tooltip>
              );
            })}
          </ColorPickerRow>
        </Popover>
      </ColorPickerContainer>
    );
  };

  const fixRanges = (
    updatedRanges: AllocationRange[],
    deletedRowId: string,
    allocationRangeId: string
  ) => {
    // Init case, not more rows, add new row 0.0 to 2.0
    const newRange = updatedRanges;
    if (newRange?.length === 0) {
      const newRow: AllocationRange = {
        id: '1',
        __Id__: allocationRangeId,
        From: '0.0',
        To: '2.0',
        Label: '',
        Color: '#FBB7AE',
        DarkColor: '#C55858',
      };
      return [newRow];
    }

    // If the first row is deleted, set From to 0.0 on new first row
    if (deletedRowId === '1') {
      newRange[0] = {
        ...newRange[0],
        From: '0.0',
      };
    }

    // Adjust the Ids to be sequential.
    return newRange.map((row, index, range) => {
      const newId = (index + 1).toString();
      if (row.id !== '1' && index > 0) {
        const previousRowTo = range[index - 1]?.To;
        return {
          ...row,
          id: newId,
          From: (parseFloat(previousRowTo) + 0.1).toString(),
        };
      }
      return {
        ...row,
        id: newId,
      };
    });
  };

  // Delete Cell Renderer
  const DeleteCell = (params: GridRenderCellParams) => {
    const { id } = params;

    const handleDelete = () => {
      let updatedRanges = allocationRanges.filter(row => row.id !== id);
      updatedRanges = fixRanges(
        updatedRanges,
        id as string,
        allocationRanges[0].__Id__
      );
      setAllocationRanges(updatedRanges);

      // Re-validate after deletion
      const newErrors = validateRanges(updatedRanges);
      setValidationErrors(newErrors);

      setHasUnsavedChanges(true);
    };

    return (
      allocationRanges.find(row => row.id === id)?.To !== '2.0' && (
        <Tooltip title="Delete">
          <Box sx={{ paddingTop: '7px' }} onClick={handleDelete}>
            <img src="/images/icons/delete.svg" style={{ height: '24px' }} />
          </Box>
        </Tooltip>
      )
    );
  };

  // Add new allocation range
  const handleAddAllocationRange = () => {
    const baseRow = allocationRanges.find(row => row.To === '2.0');
    const hasBaseRow = !!baseRow;

    // Find unused color
    const unusedColors = colorPairs
      .filter(pair => !usedColors.includes(pair.pastel))
      .map(pair => pair);
    const nextColorPair =
      unusedColors.length > 0
        ? unusedColors[0]
        : { pastel: '#FFFFFF', dark: '#FFFFFF' };

    // Get the next available ID
    const getNextId = () => {
      const numericIds = allocationRanges.map(row => parseInt(row.id, 10));
      return Math.max(0, ...numericIds) + 1;
    };

    // Set initial values for the new row
    let newFrom = '';
    let newTo = '';
    if (hasBaseRow) {
      const previousRow = allocationRanges[allocationRanges.length - 2];
      newFrom = previousRow?.To
        ? `${(parseFloat(previousRow.To) + 0.1).toFixed(1)}`
        : baseRow.From;
      // newTo = baseRow.From;
    } else {
      newFrom = '0.0';
      newTo = '2.0';
    }

    // Create new row with proper ID
    const newRow: AllocationRange = {
      id: getNextId().toString(),
      __Id__: '',
      From: newFrom,
      To: newTo,
      Label: '',
      Color: nextColorPair.pastel,
      DarkColor: nextColorPair.dark,
    };

    // Insert the new row
    let updatedRanges: AllocationRange[];
    if (hasBaseRow) {
      const baseRowIndex = allocationRanges.findIndex(row => row === baseRow);
      updatedRanges = [
        ...allocationRanges.slice(0, baseRowIndex),
        newRow,
        ...allocationRanges.slice(baseRowIndex),
      ];
    } else {
      updatedRanges = [...allocationRanges, newRow];
    }

    // Re-number all rows sequentially
    updatedRanges = updatedRanges.map((row, index) => ({
      ...row,
      id: (index + 1).toString(),
    }));

    setAllocationRanges(updatedRanges);
    const newErrors = validateRanges(updatedRanges);
    setValidationErrors(newErrors);
    setHasUnsavedChanges(true);
  };

  // Handle label field changes
  const handleLabelChange = (id: string, value: string) => {
    setAllocationRanges(
      allocationRanges.map(row =>
        row.id === id ? { ...row, Label: value } : row
      )
    );
    setHasUnsavedChanges(true);
  };

  // Custom footer component with Add button
  function CustomFooterComponent() {
    return (
      <CustomFooter>
        <AddButton
          startIcon={<AddIcon sx={{ width: '16px', height: '16px' }} />}
          onClick={handleAddAllocationRange}
        >
          Add Allocation Range
        </AddButton>
      </CustomFooter>
    );
  }

  // Column definitions
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: '#',
      width: 67,
      editable: false,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
    },
    {
      field: 'range',
      headerName: 'Range',
      width: 236,
      editable: false,
      renderCell: RangeCell,
      sortable: false,
    },
    {
      field: 'Label',
      headerName: 'Label',
      flex: 1,
      width: 286,
      editable: true,
      sortable: false,
      preProcessEditCellProps: params => {
        const { value } = params.props;
        handleLabelChange(params.id as string, value as string);
        return { ...params.props };
      },
    },
    {
      field: 'Color',
      headerName: '',
      width: 40,
      editable: false,
      renderCell: ColorCell,
      sortable: false,
      align: 'center',
      headerClassName: 'border-header-icon',
    },
    {
      field: 'actions',
      headerName: '',
      width: 40,
      editable: false,
      renderCell: DeleteCell,
      sortable: false,
      align: 'center',
    },
  ];

  const handleProcessRowUpdate = (
    newRow: GridValidRowModel
  ): GridValidRowModel => {
    const updated = allocationRanges.map(row =>
      row.id === newRow.id ? { ...row, Label: newRow.Label as string } : row
    );
    setAllocationRanges(updated);
    setHasUnsavedChanges(true);
    return newRow;
  };

  const handleSaveChanges = () => {
    if (tab === 'color-settings') {
      // Validate ranges before saving
      const errors = validateRanges(allocationRanges);
      const hasErrors = Object.keys(errors).length > 0;

      if (hasErrors) {
        Object.entries(errors).forEach(([rangeId, error]) => {
          dispatch(
            showToast({
              message: `${error.message}`,
              type: 'error',
            })
          );
        });
        return;
      }
      setOriginalAllocationRanges([...allocationRanges]);
      setHasUnsavedChanges(false);
      dispatch(updateAllocationTheme([...allocationRanges]));
      const transformedAllocationRanges = allocationRanges.map(range => {
        const { __Id__, id, ...rest } = range;
        return {
          Id: id,
          ...rest,
        };
      });
      const itemsWithId = allocationRanges.filter(d => d.__Id__);
      if (itemsWithId.length > 0) {
        const payload = {
          postData: transformedAllocationRanges,
          __Id__: itemsWithId[0]?.__Id__,
        };
        dispatch(updateAllocationThemeAction(payload)).then(response => {
          if (response?.meta?.requestStatus === 'fulfilled') {
            dispatch(
              showToast({
                open: true,
                message: 'Allocation theme updated successfully',
                type: 'success',
                autoHideTimer: 4000,
              })
            );
          }
        });
      } else {
        const newItems = allocationRanges.filter(d => !d.__Id__);
        if (newItems.length > 0) {
          dispatch(addAllocationThemeAction(transformedAllocationRanges));
        }
      }
    }
    if (tab === 'alerts-threshold') {
      //save data here
    }
    if (tab === 'allocation-history') {
      //save data here
    }
  };

  const handleCancel = () => {
    // Restore original data
    if (tab === 'color-settings') {
      setAllocationRanges([...originalAllocationRanges]);
      setValidationErrors({});
    } else if (tab === 'alerts-threshold') {
      setMaxAllocationWarning(0);
      setMaxAllocationError(0);
    } else if (tab === 'allocation-history') {
      setAllocationHistoryDuration('');
      setCommentsHistoryDuration('');
    }

    setHasUnsavedChanges(false);
  };

  return (
    <div
      className="min-h-screen bg-[#f8f9fa] p-8"
      style={{
        fontFamily: 'open sans',
        padding: '1.5%',
        backgroundColor: 'rgba(217, 217, 217, 0.27)',
        height: '100%',
      }}
    >
      <TabHeader
        tab={tab}
        setTab={setTab}
        setHasUnsavedChanges={setHasUnsavedChanges}
      />
      <Box
        sx={{ mt: 2, mb: 2, background: '#fff', borderRadius: 2, boxShadow: 1 }}
      >
        {tab === 'color-settings' && (
          <Box>
            <StyledTableHeader>Allocation Range</StyledTableHeader>
            <Box sx={{ height: 'auto', width: '60%' }}>
              <StyledDataGrid
                rows={allocationRanges}
                disableColumnMenu
                columns={columns}
                editMode="row"
                processRowUpdate={handleProcessRowUpdate}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                    },
                  },
                }}
                pageSizeOptions={[10]}
                disableRowSelectionOnClick
                autoHeight
                slots={{
                  footer: CustomFooterComponent,
                }}
              />
            </Box>
          </Box>
        )}

        {/* Alert Threshold Section */}
        {tab === 'alerts-threshold' && (
          <Box
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              width: '100%',
              gap: 4,
            }}
          >
            {/* Row: Warning Threshold + Message */}
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                gap: 4,
                alignItems: 'start',
              }}
            >
              {/* Left block: numeric warning threshold + helper */}
              <Box sx={{ minWidth: 320 }}>
                <Box
                  sx={{
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Typography
                    sx={{ fontWeight: 400, fontSize: '15px', color: '#444' }}
                  >
                    Max Allocation Warning
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    placeholder="0.0"
                    value={
                      maxAllocationWarning === 0 ? '' : maxAllocationWarning
                    }
                    onChange={e => {
                      const val = e.target.value;
                      if (/^\d*\.?\d{0,1}$/.test(val)) {
                        setMaxAllocationWarning(parseFloat(val) || 0.0);
                        setHasUnsavedChanges(true);
                      }
                    }}
                    sx={{
                      background: '#fff',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        height: 36,
                        width: 129,
                        fontSize: '15px',
                        color: '#888',
                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                          {
                            WebkitAppearance: 'none',
                            margin: 0,
                          },
                        '& input[type="number"]': {
                          MozAppearance: 'textfield',
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'start',
                      bgcolor: '#FFFBEB',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.75,
                      maxWidth: 380,
                    }}
                  >
                    <img
                      src="/images/icons/WarningIcon.svg"
                      alt="Warning"
                      style={{ width: 14, height: 14, marginRight: 6 }}
                    />
                    <Typography
                      sx={{
                        fontSize: '12px',
                        color: '#92400E',
                        fontWeight: 400,
                        fontStyle: 'italic',
                        lineHeight: '16px',
                      }}
                    >
                      Threshold beyond which a warning message is displayed to
                      user making the change when total assigned capacity of a
                      resource exceeds the specified threshold value
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {/* Right block: warning message input */}
              <Box
                sx={{
                  minWidth: 320,
                  display: 'flex',
                  alignItems: 'start',
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 400,
                    fontSize: '15px',
                    color: '#444',
                    pt: 1,
                  }}
                >
                  Warning message
                </Typography>
                <TextField
                  size="small"
                  placeholder="Set warning message"
                  multiline
                  minRows={3}
                  value={warningMessage}
                  onChange={e => {
                    setWarningMessage(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      width: '200px',
                      borderRadius: '8px',
                      fontSize: '14px',
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Row: Error Threshold + Message */}
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                gap: 6.2,
                alignItems: 'start',
              }}
            >
              {/* Left block: numeric error threshold + helper */}
              <Box sx={{ minWidth: 320 }}>
                <Box
                  sx={{
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Typography
                    sx={{ fontWeight: 500, fontSize: '15px', color: '#444' }}
                  >
                    Max Allocation Error
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    placeholder="0.0"
                    value={maxAllocationError === 0 ? '' : maxAllocationError}
                    onChange={e => {
                      const val = e.target.value;
                      if (/^\d*\.?\d{0,1}$/.test(val)) {
                        setMaxAllocationError(parseFloat(val) || 0.0);
                        setHasUnsavedChanges(true);
                      }
                    }}
                    sx={{
                      background: '#fff',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        height: 36,
                        width: 129,
                        fontSize: '15px',
                        color: '#888',
                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                          {
                            WebkitAppearance: 'none',
                            margin: 0,
                          },
                        '& input[type="number"]': {
                          MozAppearance: 'textfield',
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'start',
                      bgcolor: '#FEF2F2',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.75,
                      maxWidth: 380,
                    }}
                  >
                    <img
                      src="/images/icons/ErrorIcon.svg"
                      alt="Error"
                      style={{ width: 14, height: 14, marginRight: 6 }}
                    />
                    <Typography
                      sx={{
                        color: '#d32f2f',
                        fontSize: '12px',
                        fontWeight: 400,
                        fontStyle: 'italic',
                        lineHeight: '16px',
                      }}
                    >
                      Resource allocation limit configuration that displays an
                      error message to user when total assigned capacity of a
                      resource exceeds the specified threshold value
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {/* Right block: error message input */}
              <Box
                sx={{
                  minWidth: 320,
                  display: 'flex',
                  alignItems: 'start',
                  flexDirection: 'row',
                  gap: 2,
                  justifyContent: 'space-evenly',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 400,
                    fontSize: '15px',
                    color: '#444',
                    pt: 1,
                  }}
                >
                  Error message
                </Typography>
                <TextField
                  size="small"
                  placeholder="Set error message"
                  multiline
                  minRows={3}
                  value={errorMessage}
                  onChange={e => {
                    setErrorMessage(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      width: '200px',
                      borderRadius: '8px',
                      fontSize: '14px',
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Allocation History Section */}
        {tab === 'allocation-history' && (
          <Box
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              width: '100%',
            }}
          >
            {/* Allocation History Retention */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography
                sx={{ fontSize: '14px', fontWeight: 600, color: '#4B5563' }}
              >
                Allocation History Retention
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 700,
                    minWidth: 80,
                    pt: 1,
                    color: '#374151',
                  }}
                >
                  Duration:
                </Typography>
                <TextField
                  size="small"
                  placeholder="Enter Value in number  1 to 9  month"
                  value={allocationHistoryDuration}
                  onChange={e => {
                    const v = e.target.value.trim();
                    if (/^[1-9]?$/.test(v)) {
                      setAllocationHistoryDuration(v);
                      setHasUnsavedChanges(true);
                    }
                  }}
                  sx={{
                    width: 250,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                      fontSize: '12px',
                    },
                  }}
                  inputProps={{ inputMode: 'numeric', pattern: '[1-9]?' }}
                />
              </Box>
            </Box>

            {/* Comments History Retention */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography
                sx={{ fontSize: '14px', fontWeight: 600, color: '#4B5563' }}
              >
                Comments History Retention
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 700,
                    minWidth: 80,
                    pt: 1,
                    color: '#374151',
                  }}
                >
                  Duration:
                </Typography>
                <TextField
                  size="small"
                  placeholder="Enter Value in number  1 to 9  month"
                  value={commentsHistoryDuration}
                  onChange={e => {
                    const v = e.target.value.trim();
                    if (/^[1-9]?$/.test(v)) {
                      setCommentsHistoryDuration(v);
                      setHasUnsavedChanges(true);
                    }
                  }}
                  sx={{
                    width: 250,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                      fontSize: '12px',
                    },
                  }}
                  inputProps={{ inputMode: 'numeric', pattern: '[1-9]?' }}
                />
              </Box>
            </Box>
          </Box>
        )}
        <div style={{ margin: '1.5%', width: '50%' }}>
          <BottomActions>
            <CancelButton
              variant="outlined"
              onClick={handleCancel}
              disabled={!hasUnsavedChanges}
            >
              Cancel
            </CancelButton>
            <SaveButton
              variant="contained"
              onClick={handleSaveChanges}
              disabled={!hasUnsavedChanges}
            >
              Save Changes
            </SaveButton>
          </BottomActions>
        </div>
        <br />
      </Box>
    </div>
  );
}
