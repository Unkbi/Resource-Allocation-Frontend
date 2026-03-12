'use client';

import { Box, Typography, Tooltip } from '@mui/material';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/redux/store';
import LoadingScreen from '@/app/components/Loading/loadingScreen';
import {GridColDef } from '@mui/x-data-grid-premium';
import { StyledDataGrid, ColumnManagementStyles, FilterPanelStyles } from '../../AllocationTable/styles/StyledDataGrid';
import { formatAISummaryResponse, getScoreColor, WeekColumn, ProjectSummaryTableRow } from '@/app/utils/aiSummaryFormatter';
import ReportBuilderDataGridToolbar from './ReportBuilderDataGridToolbar';
import AISummaryDetailDialog from './AISummaryDetailDialog';
import { getProjectPeriodDetail } from '@/app/services/aiSummaryServices';

export default function AISummaryTab() {
  const dispatch = useDispatch();
  const { currentSummary, loading, error } = useSelector(
    (state: RootState) => state.aiSummary
  );
  
  const { projects } = useSelector((state: RootState) => state.projects);
  const [isFullscreenGrid, setIsFullscreenGrid] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSummaryData, setSelectedSummaryData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Format the API response for table display
  const formattedData = useMemo(() => {
    
    if (!currentSummary) {
      return { rows: [], weekColumns: [] };
    }
    
    // currentSummary should be an array from the API
    const apiResponse = Array.isArray(currentSummary) ? currentSummary : [currentSummary];
    
    const formatted = formatAISummaryResponse(apiResponse);
    
    return formatted;
  }, [currentSummary]);

  const { rows, weekColumns } = formattedData;

  // Handle click on week score to open summary detail dialog
  const handleScoreClick = useCallback(async (row: ProjectSummaryTableRow, weekCol: WeekColumn) => {
    const weekData = row[weekCol.field];
    
    if (!weekData || weekData.score === null || !weekData.aiSummary) {
      return; // Only open dialog when AISummary === true
    }

    // Open dialog immediately with base data; SummaryHtml fetched from API
    setSelectedSummaryData({
      projectName: row.project_name,
      projectManager: row.project_manager,
      weekLabel: weekCol.headerName,
      weekNumber: weekCol.weekNumber,
      weekDate: weekCol.date,
      score: weekData.score,
      alignmentScore: weekData.alignmentScore,
      healthScore: weekData.healthScore,
      scoreBand: weekData.scoreBand,
      summaryHtml: null,
    });
    setLoadingDetail(true);
    setDialogOpen(true);

    try {
      const summaryHtml = await getProjectPeriodDetail(weekData.periodId);
      setSelectedSummaryData((prev: any) => ({ ...prev, summaryHtml }));
    } catch (error) {
      console.error('Failed to fetch period detail:', error);
      setSelectedSummaryData((prev: any) => ({ ...prev, summaryHtml: null }));
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // Build dynamic columns for the data grid
  const columns: GridColDef[] = useMemo(() => {
    
    const baseColumns: GridColDef[] = [
      {
        field: 'project_name',
        headerName: 'Project Name',
        minWidth: 200,
        flex: 2,
        renderCell: (params: any) => (
          <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'project_manager',
        headerName: 'Project Manager',
        minWidth: 180,
        flex: 1.5,
        renderCell: (params: any) => (
          <Typography sx={{ fontSize: '14px' }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'project_category',
        headerName: 'Project Category',
        minWidth: 150,
        flex: 1,
        renderCell: (params: any) => (
          <Typography sx={{ fontSize: '14px' }}>
            {params.value}
          </Typography>
        ),
      },
    ];

    // Add dynamic week columns
    const weekCols: GridColDef[] = weekColumns.map((weekCol: WeekColumn, idx: number) => {
      return {
        field: weekCol.field,
        headerName: weekCol.headerName,
        minWidth: 151,
        maxWidth:151,
        flex: 1,
        valueGetter: (value: any) => {
          // For export: return only the score value or empty string
          if (!value || value.score === null || value.score === undefined) {
            return '';
          }
          return value.score;
        },
        renderHeader: () => {
            const toolTipContent = (
              <>
                <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                  {weekCol.headerName}
                </Typography>
                <Typography sx={{ fontSize: '11px' }}>
                  {weekCol.date} - {weekCol.dateTo}
                </Typography>
              </>
            );
            return (
              <Tooltip
                title={
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    {toolTipContent}
                  </Box>
                }
              >
                <Box
                  sx={{
                    ml: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <>
                    <Typography
                      sx={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#374151',
                      }}
                    >
                      {weekCol.headerName}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>
                      {weekCol.date} - {weekCol.dateTo}
                    </Typography>
                  </>
                </Box>
              </Tooltip>
            );
          },
        renderCell: (params: any) => {
          const weekData = params.row[weekCol.field];
          if (!weekData || weekData.score === null || weekData.score === undefined) {
            return (
              <Typography sx={{ fontSize: '14px', color: '#9CA3AF', textAlign: 'center' }}>
                -
              </Typography>
            );
          }

          const isClickable = weekData.aiSummary === true;

          return (
              <Typography
                onClick={isClickable ? () => handleScoreClick(params.row, weekCol) : undefined}
                sx={{
                  fontSize: '16px',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: getScoreColor(weekData.score),
                  cursor: isClickable ? 'pointer' : 'default',
                  ...(isClickable && {
                    textDecoration: 'underline',
                    '&:hover': {
                      
                      opacity: 0.8,
                    },
                  }),
                }}
              >
                {weekData.score}
              </Typography>
          );
        },
      };
    });
    
    return [...baseColumns, ...weekCols];
  }, [weekColumns, handleScoreClick]);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          flex: 1,
          backgroundColor: '#F9FAFB',
          overflow: 'auto',
        }}
      >
        {!currentSummary && !loading ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#6B7280',
                mb: 2,
              }}
            >
              Select filters and generate an AI summary
            </Typography>
            <Typography
              sx={{
                fontSize: '13px',
                color: '#9CA3AF',
              }}
            >
              Configure your filters and click Generate Summary to see AI-generated project insights
            </Typography>
          </Box>
        ) : loading ? (
          <LoadingScreen />
        ) : error ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ color: '#EF4444', fontSize: '14px' }}>
              {error}
            </Typography>
          </Box>
        ) : rows.length > 0 ? (
          <Box
            sx={{
              height: isFullscreenGrid ? '100vh' : '100%',
              minHeight: 400,
              backgroundColor: '#ffffff',
              borderRadius: isFullscreenGrid ? 0 : '8px',
              overflow: 'hidden',
              position: isFullscreenGrid ? 'fixed' : 'relative',
              top: isFullscreenGrid ? 0 : 'auto',
              left: isFullscreenGrid ? 0 : 'auto',
              right: isFullscreenGrid ? 0 : 'auto',
              bottom: isFullscreenGrid ? 0 : 'auto',
              zIndex: isFullscreenGrid ? 1300 : 'auto',
            }}
          >
            <StyledDataGrid
              rows={rows}
              columns={columns}
              hideFooter
              loading={loading}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25, page: 0 },
                },
                sorting: {
                  sortModel: [
                    {
                      field: 'project_name',
                      sort: 'asc',
                    },
                  ],
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              localeText={{
                noRowsLabel: 'No data found',
              }}
              slots={{
                toolbar: ReportBuilderDataGridToolbar,
              }}
              slotProps={{
                toolbar: {
                  isFullscreen: isFullscreenGrid,
                  onToggleFullscreen: () => setIsFullscreenGrid((prev) => !prev),
                  GridRowCount: rows.length,
                  tab: 'aisummary',
                } as any,
                columnsPanel: {
                  className: 'styleColumnMenu',
                  sx: ColumnManagementStyles,
                },
                panel: {
                  className: 'parent-grid-panel',
                  placement: 'bottom-end',
                  sx: {
                    transform: 'translate3d(-50px, 250px, 0px) !important',
                    top: '40px !important',
                  },
                },
                filterPanel: {
                  columnsSort: 'asc',
                  sx: FilterPanelStyles,
                },
                loadingOverlay: {
                  variant: 'skeleton',
                  noRowsVariant: 'skeleton',
                },
              }}
              sx={{
                height: '100%',
                '& .MuiDataGrid-virtualScrollerContent': {
                  backgroundColor: '#F7FBFF',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#F7FBFF',
                },
                '& .MuiDataGrid-cell': {
                  border: '0.5px solid #E5E7EB !important',
                  padding: '8px 16px',
                },
                '& .MuiDataGrid-columnHeaders': {
                  position: 'sticky',
                  top: 0,
                  zIndex: 3,
                  backgroundColor: '#F1F6FF',
                },
                '& .MuiDataGrid-cell--textRight': {
                  textAlign: 'right !important',
                },
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
              No summary data available for the selected filters
            </Typography>
          </Box>
        )}
      </Box>

      {/* AI Summary Detail Dialog */}
      <AISummaryDetailDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        loading={loadingDetail}
        data={selectedSummaryData || {}}
      />
    </Box>
  );
}
