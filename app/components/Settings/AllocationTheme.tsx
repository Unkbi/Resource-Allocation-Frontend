'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import type {
  GridColDef,
  GridRenderCellParams,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { TextField, Typography, Popover, Tooltip } from '@mui/material';
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
import { fetchAllocationTheme } from '@/app/redux/actions/settingsAction';
import { AppDispatch } from '@/app/redux/store';
import { useDispatch } from 'react-redux';
import { AllocationRange } from '@/app/types';
import { showToastAction } from '@/app/redux/actions/toastAction';
import { formatStringToFloat } from '@/app/utils/common';

interface ColorPair {
  pastel: string;
  dark: string;
}

const colorPairs: ColorPair[] = [
  { pastel: '#FADCB9', dark: '#F5B544' },
  { pastel: '#D9F1B7', dark: '#93CB41' },
  { pastel: '#B2D0FF', dark: '#2772F0' },
  { pastel: '#FBB7AE', dark: '#C55858' },
  { pastel: '#45C0CD', dark: '#45COCD' },
  { pastel: '#FFE685', dark: '#FFE685' },
  { pastel: '#FFA8DE', dark: '#FFA8DE' },
  // { pastel: '#847ODE', dark: '#8470DE' },
  { pastel: '#959AA3', dark: '#959AA3' },
  { pastel: '#FFFFFF', dark: '#FFFFFF' },
];

interface AllocationThemeProps {
  allocationRanges: AllocationRange[];
  onAllocationRangesChange: (ranges: AllocationRange[]) => void;
  onDataChanged: () => void;
}

// Interface for validation errors
interface ValidationErrors {
  [key: number]: {
    From?: boolean;
    To?: boolean;
    message?: string;
  };
}

export default function AllocationTheme({
  allocationRanges,
  onAllocationRangesChange,
  onDataChanged,
}: AllocationThemeProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [activeColorRow, setActiveColorRow] = React.useState<string | null>(
    null
  );
  const dispatch: AppDispatch = useDispatch();
  const [validationErrors, setValidationErrors] =
    React.useState<ValidationErrors>({});

  // Get currently used colors
  const usedColors = React.useMemo(() => {
    return allocationRanges.map(row => row?.Color);
  }, [allocationRanges]);

  const formatValues = (
    e: React.FocusEvent<HTMLInputElement>,
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

    onAllocationRangesChange(updatedRanges);
    const newErrors = validateRanges(updatedRanges);
    setValidationErrors(newErrors);
    onDataChanged();
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

      let updatedRanges = allocationRanges.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      );

      if (field === 'To') {
        const currentRow = updatedRanges.find(row => row.id === id);
        if (currentRow && currentRow.To !== '2.0') {
          let currentTo = parseFloat(value);
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
            onAllocationRangesChange(updatedRanges);
            const newErrors = validateRanges(updatedRanges);
            setValidationErrors(newErrors);
            onDataChanged();
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

      onAllocationRangesChange(updatedRanges);
      const newErrors = validateRanges(updatedRanges);
      setValidationErrors(newErrors);
      onDataChanged();
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
        onAllocationRangesChange(
          allocationRanges.map(row =>
            row.id === activeColorRow
              ? { ...row, Color: pastelColor, DarkColor: colorPair.dark }
              : row
          )
        );
        onDataChanged();
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
      onAllocationRangesChange(updatedRanges);

      // Re-validate after deletion
      const newErrors = validateRanges(updatedRanges);
      setValidationErrors(newErrors);

      onDataChanged();
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

    onAllocationRangesChange(updatedRanges);
    const newErrors = validateRanges(updatedRanges);
    setValidationErrors(newErrors);
    onDataChanged();
  };

  // Handle label field changes
  const handleLabelChange = (id: string, value: string) => {
    onAllocationRangesChange(
      allocationRanges.map(row =>
        row.id === id ? { ...row, Label: value } : row
      )
    );
    onDataChanged();
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
    onAllocationRangesChange(updated);
    onDataChanged();
    return newRow;
  };

  return (
    <MainContent>
      <ContentPaper elevation={0}>
        <StyledTableHeader>Allocation Range</StyledTableHeader>
        <Box sx={{ height: 'auto', width: '100%' }}>
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
      </ContentPaper>
    </MainContent>
  );
}
