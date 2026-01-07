'use client';

import React, { useState } from 'react';
import { Tooltip, IconButton,Button, Box, Menu } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  GridToolbarContainer,
  useGridApiContext,
  GridToolbarColumnsButton,
  GridToolbarProps,
  GridColumnsPanel,
  useGridSelector,
} from '@mui/x-data-grid-premium';
import { download, mkConfig } from 'export-to-csv';
import ReportBuilderExport from './ReportBuilderExport';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { ColumnManagementStyles } from '../../AllocationTable/styles/StyledDataGrid';

interface ReportBuilderDataGridToolbarExtraProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  GridRowCount?: number;
}

type ReportBuilderDataGridToolbarProps = GridToolbarProps & ReportBuilderDataGridToolbarExtraProps;

const commonButtonStyles = {
  backgroundColor: 'rgba(242, 245, 250, 0.3)',
  border: '1px solid rgb(214, 220, 225)',
  borderRadius: '4px',
  height: '32px',
  width: '36px',
  padding: '5px 12px',
  fontSize: '13px',
  color: 'rgb(33, 33, 33)',
  fontWeight: '600',
  textTransform: 'none',
  minWidth: '0px',
};

const SmallIconButton = styled(Button)({
  ...commonButtonStyles,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    backgroundColor: 'rgba(242, 245, 250, 0.6)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: 18,
    color: '#344665',
  },
});

export default function ReportBuilderDataGridToolbar({
  isFullscreen,
  onToggleFullscreen,
  GridRowCount,
}: ReportBuilderDataGridToolbarProps) {
  const apiRef = useGridApiContext();
  const [columnsAnchorEl, setColumnsAnchorEl] = useState<null | HTMLElement>(null);

  const handleToggleFullscreen = () => {
    onToggleFullscreen?.();
  };

  const handleOpenColumns = (event: React.MouseEvent<HTMLElement>) => {
    setColumnsAnchorEl(event.currentTarget);
  };

  const handleCloseColumns = () => {
    setColumnsAnchorEl(null);
  };

  return (
    <GridToolbarContainer
      sx={{
        py: 1,
        gap: '12px',
        justifyContent: 'space-between',
        alignItems: 'center',
        display: 'flex',
        px: 3
      }}
    >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
  {/* ************* Part of save reports feature****************  */}
          {/* <Box
            sx={{
              fontSize: 14,
              fontWeight: 400,
              color: '#2B5BA6',
            }}
          >
            Resource Productivity Analysis
          </Box>
          <Box
            sx={{
              width: '1px',
              height: 40,
              bgcolor: '#CEDCE9',
            }}
          /> */}
          <Box
            sx={{
              fontSize: 14,
              fontWeight: 400,
              color: '#6A7282',
            }}
          >
            {`Total Records: ${GridRowCount ?? 0}`}
          </Box>
        </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

  {/* ************* Part of save reports feature****************  */}
         
        {/* <Tooltip title="Save Report">
          <SmallIconButton onClick={handleOpenColumns} aria-label="save report">
            <img
              src="/images/icons/SaveIcon.svg"
              alt="save report"
              style={{ width: 36, height: 40 }}
            />
          </SmallIconButton>
        </Tooltip> */}

        <Tooltip title="Columns">
          <SmallIconButton onClick={handleOpenColumns} aria-label="columns">
            <img
              src="/images/icons/newColumnPeople.svg"
              alt="columns"
              style={{ width: 36, height: 40 }}
            />
          </SmallIconButton>
        </Tooltip>

        <ReportBuilderExport />
        <Box
          sx={{
            width: '1px',
            height: 40,
            bgcolor: '#CEDCE9',
          }}
        />
        <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Expand to fullscreen'}>

          {isFullscreen ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={handleToggleFullscreen} aria-label="exit fullscreen">
              {/* <span style={{ fontSize: 14, fontWeight: 400, color: '#344665' }}>Close</span> */}
              <span style={{ fontSize: 30, color: '#344665' }}>×</span>
            </Box>
          ) : (
            <SmallIconButton onClick={handleToggleFullscreen} aria-label="toggle fullscreen">
              <img
                src="/images/icons/ExpandIcon.svg"
                alt="Expand"
                style={{ width: 36, height: 40 }}
              />

            </SmallIconButton>
          )}
        </Tooltip>
      </Box>

      <Menu
        anchorEl={columnsAnchorEl}
        open={Boolean(columnsAnchorEl)}
        onClose={handleCloseColumns}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: 2,
              boxShadow: '0px 10px 40px rgba(15, 23, 42, 0.15)',
              p: 1.5
            },
          },
        }}
      >
        <GridColumnsPanel sx={{ ...ColumnManagementStyles }} />
      </Menu>
    
    </GridToolbarContainer>
  );
}
