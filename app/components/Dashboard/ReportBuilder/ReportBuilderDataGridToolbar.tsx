'use client';

import React, { useState, useEffect } from 'react';
import { Tooltip, styled, IconButton, Button, Box, Menu } from '@mui/material';
import {
  GridToolbarContainer,
  useGridApiContext,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarProps,
  GridColumnsPanel,
  useGridSelector,
} from '@mui/x-data-grid-premium';
import { download, mkConfig } from 'export-to-csv';
import ReportBuilderExport from './ReportBuilderExport';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useDispatch, useSelector } from 'react-redux';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { RootState } from '@/app/redux/store';
import { ReportType } from '@/app/types/dashboardTypes';
import { ColumnManagementStyles, FilterPanelStyles } from '../../AllocationTable/styles/StyledDataGrid';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface ReportBuilderDataGridToolbarExtraProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  GridRowCount?: number;
  reportType?: ReportType;
  tab?: string;
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
  reportType,
  tab,
}: ReportBuilderDataGridToolbarProps) {
  const apiRef = useGridApiContext();
  const dispatch = useDispatch();
  const [columnsAnchorEl, setColumnsAnchorEl] = useState<null | HTMLElement>(null);

  // Get the current report filters from Redux based on tab
  const reportSlice = useSelector((state: RootState) => state.dashboard.report);
  const aiSummaryState = useSelector((state: RootState) => state.aiSummary);
  const customReportState = useSelector((state: RootState) => state.customReport);
  const currentLoadedReport = useSelector((state: RootState) => state.savedReports.currentLoadedReport);
  
  const currentReport = reportType ? reportSlice?.[reportType] : null;

  const handleToggleFullscreen = () => {
    onToggleFullscreen?.();
  };

  const handleOpenColumns = (event: React.MouseEvent<HTMLElement>) => {
    setColumnsAnchorEl(event.currentTarget);
  };

  const handleCloseColumns = () => {
    setColumnsAnchorEl(null);
  };

  const handleSaveReport = () => {
    // Get currently visible columns from the DataGrid
    const allColumns = apiRef.current.getAllColumns();
    const columnVisibilityModel = apiRef.current.state.columns.columnVisibilityModel;
    
    // Filter visible columns (columns are visible by default unless explicitly hidden)
    const visibleColumns = allColumns
      .filter(col => {
        // Column is visible if not in the model or if explicitly set to true
        return columnVisibilityModel[col.field] !== false;
      })
      .map(col => col.field);

    let dialogData: any = {
      columns: visibleColumns,
      tab: tab,
    };

    // Handle different tabs
    if (tab === 'reports') {
      const filters = currentReport?.uiFilters || {};
      
      dialogData = {
        ...dialogData,
        filters: filters,
        reportType: reportType,
      };
    } else if (tab === 'aisummary') {
      // For AI Summary, get filters from aiSummaryState
      const filters = aiSummaryState?.uiFilters || {};
      
      dialogData = {
        ...dialogData,
        filters: filters,
        summaryType: filters?.summaryType || 'project',
        reportType: 'aisummary', // Use a consistent identifier for AI Summary
      };
    } else if (tab === 'custom') {
      // For Custom Reports, get filters from customReportState
      const filters = customReportState?.uiFilters || {};
      
      dialogData = {
        ...dialogData,
        filters: filters,
        reportType: filters?.reportType || 'percentageAllocation',
      };
    }

    dispatch(
      openDialog({
        title: 'Save Report',
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'save_reports',
        initialData: dialogData,
      })
    );
  }

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
          {(() => {
            // Check if currentLoadedReport belongs to the current tab
            if (currentLoadedReport) {
              const reportType = currentLoadedReport.ReportType;
              let belongsToCurrentTab = false;
              
              if (tab === 'reports') {
                belongsToCurrentTab = reportType !== 'aisummary' && 
                                     reportType !== 'percentageAllocation' && 
                                     reportType !== 'allocationCapacity';
              } else if (tab === 'aisummary') {
                belongsToCurrentTab = reportType === 'aisummary';
              } else if (tab === 'custom') {
                belongsToCurrentTab = reportType === 'percentageAllocation' || 
                                     reportType === 'allocationCapacity';
              }
              
              if (belongsToCurrentTab) {
                return (
                  <>
                    <Box
                      sx={{
                        fontSize: 14,
                        fontWeight: 400,
                        color: '#2B5BA6',
                      }}
                    >
                      {currentLoadedReport.Name}
                    </Box>
                    <Box
                      sx={{
                        width: '1px',
                        height: 40,
                        bgcolor: '#CEDCE9',
                      }}
                    />
                  </>
                );
              }
            }
            
            if (tab === 'aisummary') {
              return (
                <>
                  <Box
                    sx={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: '#2B5BA6',
                    }}
                  >
                    Projects Summaries
                  </Box>
                  <Box
                    sx={{
                      width: '1px',
                      height: 40,
                      bgcolor: '#CEDCE9',
                    }}
                  />
                </>
              );
            }
            
            return null;
          })()}
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
         {tab === 'aisummary' && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                paddingRight: 2,
              }}
            >
              <InfoOutlinedIcon sx={{fontSize: 14, color: '#1C2D5F8F'}}/>
              <Box
                sx={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: '#1C2D5F',
                }}
              >
                Click the underlined score to view the weekly AI summary.
              </Box>
            </Box>
          )}
        <Tooltip title="Save Report">
          <SmallIconButton onClick={handleSaveReport} aria-label="save report">
            <img
              src="/images/icons/SaveIcon.svg"
              alt="save report"
              style={{ width: 36, height: 40 }}
            />
          </SmallIconButton>
        </Tooltip>

        <GridToolbarFilterButton
          slotProps={{
            tooltip: { title: 'Filters' },
            button: {
              variant: 'outlined',
              sx: {
                backgroundColor: '#fff',
                minWidth: 'unset',
                width: '36px',
                height: '33px',
                padding: '16px',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
                borderRadius: '6px',
                border: '1px solid rgb(214, 220, 225)',
                boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.25)',
                '& .MuiButton-startIcon': { 
                  marginRight: '0px', 
                  marginLeft: '0px',
                  margin: '0px',
                },
                '& .MuiBadge-root span': { 
                  top: '-15px', 
                  right: '0px',
                  backgroundColor: '#152E75',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 600,
                  minWidth: 16,
                  height: 16,
                },
                '& .MuiBadge-root svg': { display: 'none' },
                // Hide the button text, keep only icon
                '& .MuiButton-text': {
                  display: 'none',
                },
                fontSize: 0,
                '& > span:not(.MuiButton-startIcon)': {
                  display: 'none',
                },
              },
              component: props => (
                <Button
                  {...props}
                  startIcon={
                    <img
                      src="/images/icons/NewFilterIcon.svg"
                      alt="filter"
                      style={{ width: 36, height: 40 }}
                    />
                  }
                />
              ),
            },
          }}
        />

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
