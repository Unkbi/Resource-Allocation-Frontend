'use client';

import { Box, Button, Typography } from '@mui/material';
import {
  GridCsvExportMenuItem,
  GridExcelExportMenuItem,
  GridToolbarContainer,
  GridToolbarExportContainer,
} from '@mui/x-data-grid-premium';
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
}

export default function SettingsToolbar({
  title,
  buttonLabel,
  onButtonClick,
  setFilterButtonEl,
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
      ref={setFilterButtonEl}
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
        <FilterButtonWithCount />
          <GridToolbarExportContainer
              slotProps={{
                button: {
                  variant: 'outlined',
                  startIcon: (
                    <img
                      src="/images/icons/ExportIcon.svg"
                      alt="export"
                      style={{ width: 40, height: 40 }}
                    />
                  ),
                  sx: {
                    backgroundColor: 'white',
                    border: '1px solid #D0D5DD',
                    borderRadius: '6px',
                    height: '38px',
                    width: '38px',
                    minWidth: '34px',
                    padding: '0px',
                    color: 'rgb(33, 33, 33)',
                    textTransform: 'none',
                    '& .MuiButton-startIcon': {
                      margin: 0,
                    },
                  },
                },
              }}
            >
        <GridExcelExportMenuItem
          options={{ fileName: `${title}_data` }} />
              <GridCsvExportMenuItem
                options={{ fileName: `${title}_data` }} />
            </GridToolbarExportContainer>
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
            }}
          >
            {buttonLabel}
          </Button>
        )}
      </Box>
      
    </GridToolbarContainer>
  );
}
