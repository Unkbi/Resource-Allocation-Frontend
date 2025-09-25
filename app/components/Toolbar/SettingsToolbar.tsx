'use client';

import { Box, Button, Typography } from '@mui/material';
import { GridToolbarContainer, GridToolbarFilterButton } from '@mui/x-data-grid-premium';

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
}

export default function SettingsToolbar({
  title,
  buttonLabel,
  onButtonClick,
  setFilterButtonEl
}: SettingsToolbarProps) {
  return (
    <GridToolbarContainer
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 2,
        py: 3,
        borderBottom: '0.667px solid #E5E7EB',
      }}
    >
      {/* Title */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: '18px',
          color: '#1F2937',
          fontFamily: 'Open Sans',
          fontStyle: 'normal',
          lineHeight: '28px',
        }}
      >
        {title}
      </Typography>

      {/* Right Side: Filter + Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <GridToolbarFilterButton
          slotProps={{
            tooltip: { title: 'Filter' },
            button: {
              variant: 'outlined',
              startIcon: (
                <img
                  src="/images/icons/newFilterPeople.svg"
                  alt="filter"
                  style={{
                    marginLeft: '10px',
                    height: '48px',
                    width: ' 42.5px',
                  }}
                />
              ),
              className: 'columns-button',
              sx: commonButtonStyles,
            },
          }}
        />
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
          }}
        >
          {buttonLabel}
        </Button>
      </Box>
    </GridToolbarContainer>
  );
}
