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
import type { AllocationRange } from '@/app/redux/reducers/settingsReducer';
import { validateRanges } from '@/app/(root)/settings/page';

interface ColorPair {
  pastel: string;
  dark: string;
}

const colorPairs: ColorPair[] = [
  { pastel: '#D9E1F2', dark: '#8497B0' },
  { pastel: '#DEEBF7', dark: '#7B9CB9' },
  { pastel: '#C5F2F7', dark: '#45C4D7' },
  { pastel: '#C6F5E2', dark: '#3CB371' },
  { pastel: '#E2F1C5', dark: '#9BC13A' },
  { pastel: '#FFF2CC', dark: '#F0D776' },
  { pastel: '#FCE8D2', dark: '#C08457' },
  { pastel: '#F8D7D7', dark: '#D66E6E' },
  { pastel: '#F5D9F0', dark: '#E56EBF' },
  { pastel: '#E1D5F5', dark: '#8470DE' },
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
      let updatedRanges = allocationRanges.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      );

      if (field === 'to') {
        const currentRow = updatedRanges.find(row => row.id === id);
        if (currentRow && currentRow.to !== '2.0') {
          let currentTo = parseFloat(value);
          if (!isNaN(currentTo)) {
            // Update subsequent rows in sequence
            const currentIndex = updatedRanges.findIndex(row => row.id === id);
            let nextIndex = currentIndex + 1;

            while (nextIndex < updatedRanges.length) {
              const newFromValue = (currentTo + 0.1).toFixed(1);

              updatedRanges = updatedRanges.map((row, index) =>
                index === nextIndex
                  ? {
                      ...row,
                      from: newFromValue,
                      to: row.to === '2.0' ? row.to : '', // Clear subsequent to values
                    }
                  : row
              );

              currentTo = parseFloat(newFromValue);
              nextIndex++;
            }
          }
        }
      }

      // Update base row based on max to value from all rows
      const baseRow = updatedRanges.find(row => row.to === '2.0');
      if (baseRow) {
        const nonBaseRows = updatedRanges.filter(row => row.to !== '2.0');
        const toValues = nonBaseRows
          .map(row => parseFloat(row.to))
          .filter(v => !isNaN(v));

        if (toValues.length > 0) {
          const maxTo = Math.max(...toValues);
          const newBaseFrom = (maxTo + 0.1).toFixed(1);

          updatedRanges = updatedRanges.map(row =>
            row.to === '2.0' ? { ...row, from: newBaseFrom } : row
          );
        } else {
          // Reset base row if no valid ranges
          updatedRanges = updatedRanges.map(row =>
            row.to === '2.0' ? { ...row, from: '0.0' } : row
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
          value={row.from}
          disabled={
            (row.from === '0.0' && row.to === '0.0') ||
            row.to === '2.0' ||
            (row.from !== '' && row.to !== '2.0')
          }
          onChange={e => handleRangeChange(id, 'from', e.target.value)}
          error={error?.from}
        />
        <Typography variant="body2">TO</Typography>
        <StyledRangeField
          onKeyDown={e => {
            e.stopPropagation();
          }}
          size="small"
          value={row.to}
          disabled={
            (row.from === '0.0' && row.to === '0.0') || row.to === '2.0'
          }
          onChange={e => handleRangeChange(id, 'to', e.target.value)}
          error={error?.to}
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
    const baseRow = allocationRanges.find(row => row.to === '2.0');
    const hasBaseRow = !!baseRow;

    // Find unused color
    const unusedColors = colorPairs
      .filter(pair => !usedColors.includes(pair.pastel))
      .map(pair => pair);
    const nextColorPair =
      unusedColors.length > 0
        ? unusedColors[0]
        : { pastel: '#FFFFFF', dark: '#FFFFFF' };

    // Set initial values for the new row
    let newFrom = '';
    let newTo = '';
    if (hasBaseRow) {
      const previousRow = allocationRanges[allocationRanges.length - 2];
      newFrom = previousRow?.to
        ? `${(parseFloat(previousRow.to) + 0.1).toFixed(1)}`
        : baseRow.from;
      // newTo = baseRow.from;
    } else {
      newFrom = '0.0';
      newTo = '2.0';
    }

    // If baseRow exists, insert before it and shift IDs
    let updatedRanges: AllocationRange[];
    if (hasBaseRow) {
      const baseRowIndex = allocationRanges.findIndex(row => row === baseRow);

      const newRow: AllocationRange = {
        ...baseRow,
        id: baseRow.id, // New row takes base row's current ID
        from: newFrom,
        to: newTo,
        label: '',
        color: nextColorPair.pastel,
        darkColor: nextColorPair.dark,
      };

      // Shift IDs of base row and all following rows
      updatedRanges = allocationRanges.map((row, index) => {
        if (index >= baseRowIndex) {
          return { ...row, id: row.id + 1 };
        }
        return row;
      });

      updatedRanges.splice(baseRowIndex, 0, newRow); // insert new row
    } else {
      // No base row, just append at the end
      const maxId = Math.max(0, ...allocationRanges.map(row => row.id));
      const newRow: AllocationRange = {
        id: maxId + 1,
        from: newFrom,
        to: newTo,
        label: '',
        color: nextColorPair.pastel,
        darkColor: nextColorPair.dark,
      };
      updatedRanges = [...allocationRanges, newRow];
    }

    onAllocationRangesChange(updatedRanges);
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

  const handleProcessRowUpdate = (
    newRow: GridValidRowModel
  ): GridValidRowModel => {
    const updated = allocationRanges.map(row =>
      row.id === newRow.id ? { ...row, label: newRow.label as string } : row
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
