'use client';

import { Box, Button, Typography, TextField } from '@mui/material';
import { GridToolbarContainer } from '@mui/x-data-grid-premium';
import FilterButtonWithCount from './FilterButtonWithCount';

const commonButtonStyles = {
  backgroundColor: 'rgba(242, 245, 250, 0.3)',
  border: '1px solid rgb(214, 220, 225)',
  borderRadius: '4px',
  height: '38px',
  width: '34px',
  fontSize: '13px',
  color: 'rgb(33, 33, 33)',
  fontFamily: (theme: any) => theme.typography.fontFamily,
  fontWeight: '600',
  textTransform: 'none',
  minWidth: '0px',
};


interface SettingsToolbarProps {
  title: string;
  buttonLabel: string;
  onButtonClick: () => void;
  setFilterButtonEl?: (el: HTMLElement | null) => void;
  search?: string;
  setSearch?: (val: string) => void;
}

export default function SettingsToolbar({
  title,
  buttonLabel,
  onButtonClick,
  setFilterButtonEl,
  search,
  setSearch,
}: SettingsToolbarProps) {
  return (
    <GridToolbarContainer
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 2,
        py: 2,
        borderBottom: '0.667px solid #E5E7EB',
      }}
      ref={setFilterButtonEl}
    >
      {/* Left Side - Title */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: '18px',
          color: '#1F2937',
          fontFamily: 'Open Sans',
          lineHeight: '28px',
        }}
      >
        {title}
      </Typography>

      {/* Right Side: Filter + Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

        {setSearch && (
          <TextField
            size="small"
            placeholder="Search..."
            value={search ?? ''}
            onChange={e => setSearch?.(e.target.value)}
            sx={{
              width: 250,
              '& .MuiOutlinedInput-root': {
                height: 36,
              },
            }}
          />
        )}

        <FilterButtonWithCount />
        {buttonLabel && (
          <Button
            variant="contained"
            onClick={onButtonClick}
            sx={{
              height: 40,
              borderRadius: 2,
              background: '#152E75',
              color: '#FFF',
              textTransform: 'none',
              fontSize: 14,
              fontWeight: 600,
              px: 2,
              '&:hover': {
                background: '#132863',
              },
            }}
          >
            {buttonLabel}
          </Button>
        )}
      </Box>
    </GridToolbarContainer>
  );
}
