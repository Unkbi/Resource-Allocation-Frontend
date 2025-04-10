'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { TextField, Typography, Popover, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  AddButton,
  ColorIndicator,
  ColorPickerContainer,
  ColorPickerRow,
  ColorSwatch,
  ContentPaper,
  CustomFooter,
  DeleteButton,
  MainContent,
  RangeInputGroup,
  StyledDataGrid,
  StyledTableHeader,
} from './styled';

// Types
export interface AllocationRange {
  id: number;
  from: string;
  to: string;
  treatment: string;
  color: string;
}

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

export default function AllocationTheme({
  allocationRanges,
  onAllocationRangesChange,
  onDataChanged,
}: AllocationThemeProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [activeColorRow, setActiveColorRow] = React.useState<number | null>(
    null
  );

  // Get currently used colors
  const usedColors = React.useMemo(() => {
    return allocationRanges.map(row => row.color);
  }, [allocationRanges]);

  // Update the handleRangeChange function in the RangeCell component
  const RangeCell = (params: GridRenderCellParams) => {
    const { id, field, value } = params;
    const row = params.row;

    const handleRangeChange = (
      id: number | string,
      field: 'from' | 'to',
      value: string
    ) => {
      onAllocationRangesChange(
        allocationRanges.map(row =>
          row.id === id ? { ...row, [field]: value } : row
        )
      );
      onDataChanged();
    };

    return (
      <RangeInputGroup>
        <Typography variant="body2">FROM</Typography>
        <TextField
          size="small"
          value={row.from}
          onChange={e => handleRangeChange(id, 'from', e.target.value)}
          sx={{
            width: '48px',
            height: '27px',
            '& .MuiInputBase-root': {
              height: '32px',
              display: 'flex',
              alignItems: 'center',
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
          sx={{
            width: '48px',
            height: '27px',
            '& .MuiInputBase-root': {
              height: '32px',
              display: 'flex',
              alignItems: 'center',
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
      // Find the corresponding dark color
      const colorPair = colorPairs.find(pair => pair.pastel === pastelColor);

      if (colorPair) {
        // Update the row with the selected pastel color
        onAllocationRangesChange(
          allocationRanges.map(row =>
            row.id === activeColorRow ? { ...row, color: pastelColor } : row
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
              // Check if this color is already used by another row
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
      onAllocationRangesChange(allocationRanges.filter(row => row.id !== id));
      onDataChanged();
    };

    return (
      <Tooltip title="Delete">
        <DeleteButton onClick={handleDelete} size="small">
          <DeleteIcon />
        </DeleteButton>
      </Tooltip>
    );
  };

  // Add new allocation range
  const handleAddAllocationRange = () => {
    const id = Math.max(0, ...allocationRanges.map(row => row.id)) + 1;

    // Find a color that's not already used
    const unusedColors = colorPairs
      .map(pair => pair.pastel)
      .filter(color => !usedColors.includes(color));

    // Use the first unused color, or white if all are used
    const nextColor = unusedColors.length > 0 ? unusedColors[0] : '#FFFFFF';

    const newRow: AllocationRange = {
      id,
      from: '0.0',
      to: '0.0',
      treatment: '',
      color: nextColor,
    };
    onAllocationRangesChange([...allocationRanges, newRow]);
    onDataChanged();
  };

  // Handle treatment field changes
  const handleTreatmentChange = (id: number, value: string) => {
    onAllocationRangesChange(
      allocationRanges.map(row =>
        row.id === id ? { ...row, treatment: value } : row
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
      field: 'treatment',
      headerName: 'Treat as',
      flex: 1,
      width: 286,
      editable: true,
      preProcessEditCellProps: params => {
        const { id, value } = params.props;
        handleTreatmentChange(id as number, value as string);
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
            columns={columns}
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
