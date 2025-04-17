'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
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
  StyledTableHeader,
} from './styled';
import type { AllocationRange } from '@/app/redux/reducers/settingsReducer';

// Color pairs from the image (pastel and corresponding darker colors)
interface ColorPair {
  pastel: string; // Cell color (lighter)
  dark: string; // Line/Total color (darker)
}

const colorPairs: ColorPair[] = [
  { pastel: '#D9E1F2', dark: '#8497B0' }, // Light blue-gray / Dark blue-gray
  { pastel: '#DEEBF7', dark: '#7B9CB9' }, // Light blue / Dark blue
  { pastel: '#C5F2F7', dark: '#45C4D7' }, // Light teal / Dark teal
  { pastel: '#C6F5E2', dark: '#3CB371' }, // Light mint / Dark green
  { pastel: '#E2F1C5', dark: '#9BC13A' }, // Light lime / Dark lime
  { pastel: '#FFF2CC', dark: '#F0D776' }, // Light yellow / Dark yellow
  { pastel: '#FCE8D2', dark: '#C08457' }, // Light peach / Dark brown
  { pastel: '#F8D7D7', dark: '#D66E6E' }, // Light pink-red / Dark red
  { pastel: '#F5D9F0', dark: '#E56EBF' }, // Light pink / Dark pink
  { pastel: '#E1D5F5', dark: '#8470DE' }, // Light purple / Dark purple
  { pastel: '#FFFFFF', dark: '#FFFFFF' }, // White / White (transparent)
];

interface AllocationThemeProps {
  allocationRanges: AllocationRange[];
  onAllocationRangesChange: (ranges: AllocationRange[]) => void;
  onDataChanged: () => void;
}

// Interface for validation errors
interface ValidationErrors {
  [key: number]: {
    from?: boolean;
    to?: boolean;
    message?: string;
  };
}

export default function AllocationTheme({
  allocationRanges,
  onAllocationRangesChange,
  onDataChanged,
}: AllocationThemeProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [activeColorRow, setActiveColorRow] = React.useState<number | null>(
    null
  );
  const [validationErrors, setValidationErrors] =
    React.useState<ValidationErrors>({});

  // Get currently used colors
  const usedColors = React.useMemo(() => {
    return allocationRanges.map(row => row.color);
  }, [allocationRanges]);

  // Validate ranges for overlaps, subsets, and supersets
  const validateRanges = (ranges: AllocationRange[]): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Convert string values to numbers for comparison
    const numericRanges = ranges.map(range => ({
      id: range.id,
      from: Number.parseFloat(range.from),
      to: Number.parseFloat(range.to),
    }));

    // Check each range against all others
    numericRanges.forEach((range, index) => {
      // Skip invalid numbers
      if (isNaN(range.from) || isNaN(range.to)) {
        errors[range.id] = {
          from: isNaN(range.from),
          to: isNaN(range.to),
          message: 'Invalid number format',
        };
        return;
      }

      // Check if from is greater than to
      if (range.from > range.to) {
        errors[range.id] = {
          from: true,
          to: true,
          message: 'FROM value cannot be greater than TO value',
        };
        return;
      }

      // Check for overlaps with other ranges
      for (let i = 0; i < numericRanges.length; i++) {
        if (i === index) continue; // Skip comparing with self

        const otherRange = numericRanges[i];

        // Check for overlap
        const hasOverlap = !(
          range.to < otherRange.from || range.from > otherRange.to
        );

        // Check for subset (this range is inside another range)
        const isSubset =
          range.from >= otherRange.from && range.to <= otherRange.to;

        // Check for superset (another range is inside this range)
        const isSuperset =
          range.from <= otherRange.from && range.to >= otherRange.to;

        if (hasOverlap || isSubset || isSuperset) {
          errors[range.id] = {
            from: true,
            to: true,
            message: hasOverlap
              ? 'Range overlaps with another range'
              : isSubset
                ? 'Range is a subset of another range'
                : 'Range is a superset of another range',
          };
          break;
        }
      }
    });

    return errors;
  };

  // Update the handleRangeChange function in the RangeCell component
  const RangeCell = (params: GridRenderCellParams) => {
    const { id, field, value } = params;
    const row = params.row;
    const rowId = id as number;
    const error = validationErrors[rowId];

    const handleRangeChange = (
      id: number | string,
      field: 'from' | 'to',
      value: string
    ) => {
      const updatedRanges = allocationRanges.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      );

      onAllocationRangesChange(updatedRanges);
      const newErrors = validateRanges(updatedRanges);
      setValidationErrors(newErrors);
      onDataChanged();
    };

    return (
      <RangeInputGroup>
        <Typography variant="body2">FROM</Typography>
        <TextField
          size="small"
          value={row.from}
          onChange={e => handleRangeChange(id, 'from', e.target.value)}
          error={error?.from}
          sx={{
            width: '48px',
            height: '27px',
            '& .MuiInputBase-root': {
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              borderColor: error?.from ? 'red' : undefined,
            },
            '& .Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: 'red !important',
              borderWidth: '2px',
            },
          }}
          inputProps={{
            style: {
              color: '#000',
              textAlign: 'center',
              fontFamily: 'Open Sans',
              fontSize: '13px',
              fontStyle: 'normal',
              fontWeight: '600',
              lineHeight: '30px',
            },
          }}
        />
        <Typography variant="body2">TO</Typography>
        <TextField
          size="small"
          value={row.to}
          onChange={e => handleRangeChange(id, 'to', e.target.value)}
          error={error?.to}
          sx={{
            width: '48px',
            height: '27px',
            '& .MuiInputBase-root': {
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              borderColor: error?.to ? 'red' : undefined,
            },
            '& .Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: 'red !important',
              borderWidth: '2px',
            },
          }}
          inputProps={{
            style: {
              color: '#000',
              textAlign: 'center',
              fontFamily: 'Open Sans',
              fontSize: '13px',
              fontStyle: 'normal',
              fontWeight: '600',
              lineHeight: '30px',
            },
          }}
        />
        {error?.message && (
          <Tooltip title={error.message}>
            <Typography
              variant="caption"
              color="error"
              sx={{
                position: 'absolute',
                bottom: '-18px',
                left: '0',
                fontSize: '10px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {error.message}
            </Typography>
          </Tooltip>
        )}
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
      setActiveColorRow(id as number);
    };

    const handleColorSelect = (pastelColor: string) => {
      const colorPair = colorPairs.find(pair => pair.pastel === pastelColor);
      if (colorPair) {
        onAllocationRangesChange(
          allocationRanges.map(row =>
            row.id === activeColorRow
              ? { ...row, color: pastelColor, darkColor: colorPair.dark }
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
                  ?.color !== pair.pastel;

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

  // Delete Cell Renderer
  const DeleteCell = (params: GridRenderCellParams) => {
    const { id } = params;

    const handleDelete = () => {
      const updatedRanges = allocationRanges.filter(row => row.id !== id);
      onAllocationRangesChange(updatedRanges);

      // Re-validate after deletion
      const newErrors = validateRanges(updatedRanges);
      setValidationErrors(newErrors);

      onDataChanged();
    };

    return (
      <Tooltip title="Delete">
        <Box sx={{ paddingTop: '7px' }} onClick={handleDelete}>
          <img src="/images/icons/delete.svg" style={{ height: '24px' }} />
        </Box>
      </Tooltip>
    );
  };

  // Add new allocation range
  const handleAddAllocationRange = () => {
    const id = Math.max(0, ...allocationRanges.map(row => row.id)) + 1;

    // Find a color that's not already used
    const unusedColors = colorPairs
      .filter(pair => !usedColors.includes(pair.pastel))
      .map(pair => pair);

    // Use the first unused color pair, or white if all are used
    const nextColorPair =
      unusedColors.length > 0
        ? unusedColors[0]
        : { pastel: '#FFFFFF', dark: '#FFFFFF' };

    const newRow: AllocationRange = {
      id,
      from: '0.0',
      to: '0.0',
      label: '',
      color: nextColorPair.pastel,
      darkColor: nextColorPair.dark,
    };

    const updatedRanges = [...allocationRanges, newRow];
    onAllocationRangesChange(updatedRanges);
    // Validate after adding
    const newErrors = validateRanges(updatedRanges);
    setValidationErrors(newErrors);
    onDataChanged();
  };

  // Handle label field changes
  const handleLabelChange = (id: number, value: string) => {
    onAllocationRangesChange(
      allocationRanges.map(row =>
        row.id === id ? { ...row, label: value } : row
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
      field: 'label',
      headerName: 'Label',
      flex: 1,
      width: 286,
      editable: true,
      sortable: false,
      preProcessEditCellProps: params => {
        const { id, value } = params.props;
        handleLabelChange(id as number, value as string);
        return { ...params.props };
      },
    },
    {
      field: 'color',
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
