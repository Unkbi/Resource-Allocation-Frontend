'use client';

import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Select,
  Typography,
  styled,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Description, KeyboardArrowDown } from '@mui/icons-material';
import { ReportType, SummaryType } from '@/app/types/dashboardTypes';
import { CrudPermissions, withRBAC } from '../../HOC/withRBAC';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/redux/store';
import { deleteSavedReport } from '@/app/redux/actions/savedReportsActions';
import { showToast } from '@/app/redux/reducers/toastReducer';

interface ReportBuilderToolbarProps {
  reportType?: string;
  onGenerateReport: () => void;
  onReportTypeChange?: (reportType: ReportType) => void;
  onSummaryTypeChange?: (summaryType: SummaryType) => void;
  onCustomReportTypeChange?: (customReportType: 'percentageAllocation' | 'allocationCapacity') => void;
  customReportType?: 'percentageAllocation' | 'allocationCapacity';
  onExport?: (format: 'pdf' | 'excel') => void;
  onShare?: () => void;
  onLoadReport?: (reportId: string) => void;
  tab: string;
  isLoading?: boolean;
  selectedFiltersCount?: number;
  permissions?: Record<string, CrudPermissions>;
  loadingPermissions?: boolean;
}

const commonButtonStyles = {
  backgroundColor: 'rgba(242, 245, 250, 0.3)',
  border: '1px solid rgb(214, 220, 225)',
  borderRadius: '4px',
  height: '32px',
  width: '34px',
  padding: '5px',
  fontSize: '13px',
  color: 'rgb(33, 33, 33)',
  fontWeight: '600',
  textTransform: 'none',
  minWidth: '0px',
};

const StyledIconButton = styled(IconButton)({
  ...commonButtonStyles,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    backgroundColor: 'rgba(242, 245, 250, 0.6)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '20px',
    color: '#344665',
  },
});

function ReportBuilderToolbar({
  reportType = 'resourceProjectPeriod',
  onGenerateReport,
  onReportTypeChange,
  onSummaryTypeChange,
  onCustomReportTypeChange,
  customReportType = 'percentageAllocation',
  onExport,
  onShare,
  onLoadReport,
  tab,
  isLoading = false,
  selectedFiltersCount = 0,
  permissions,
}: ReportBuilderToolbarProps) {
  const dispatch = useDispatch();
  
  // Get saved reports from Redux
  const { savedReports, loading: savedReportsLoading } = useSelector(
    (state: RootState) => state.savedReports
  );
  
  // Filter saved reports by current tab's report type
  const filteredSavedReports = savedReports.filter(report => {
    if (tab === 'reports') {
      // For reports tab, show only reports matching the current report type
      return report?.ReportType === reportType;
    } else if (tab === 'aisummary') {
      // For AI Summary tab, show only AI summary reports
      return report?.ReportType === 'aisummary';
    } else if (tab === 'custom') {
      // For Custom tab, show only custom reports (percentageAllocation or allocationCapacity)
      return report?.ReportType === 'percentageAllocation' || report?.ReportType === 'allocationCapacity';
    }
    return true;
  });
  
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedReport, setSelectedReport] = useState(reportType);
  const [selectedSummary, setSelectedSummary] = useState('project');
  const [selectedSavedReport, setSelectedSavedReport] = useState<string | null>(null);

  // Sync selectedReport with reportType prop when it changes
  useEffect(() => {
    if (reportType) {
      setSelectedReport(reportType);
    }
  }, [reportType]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    onExport?.(format);
    handleMenuClose();
  };

  const handleReportSelect = (reportId: string) => {
    setSelectedSavedReport(reportId);
    onLoadReport?.(reportId);
    handleMenuClose();
  };

  const handleReportEdit = (reportId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const report = savedReports.find(r => r.Id === reportId);
    if (!report) return;
    
    // Prepare the same payload structure as save report
    let editDialogData: any = {
      id: report.Id,
      Name: report.Name,
      Description: report.Description || '',
      filters: report.Filters || {},
      columns: report.Columns || [],
      reportType: report.ReportType,
      tab: tab,
    };

    // For AI Summary, extract summaryType from filters if it exists
    if (tab === 'aisummary') {
      editDialogData.summaryType = report.Filters?.summaryType || 'project';
    }
    
    dispatch(
      openDialog({
        title: 'Edit Report',
        submitButtonText: 'Update',
        cancelButtonText: 'Cancel',
        formType: 'edit_reports',
        initialData: editDialogData,
      })
    );
  };

  const handleReportDelete = (reportId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const report = savedReports.find(r => r.Id === reportId);
    if (!report) return;
    
    if (window.confirm(`Are you sure you want to delete "${report.Name}"?`)) {
      dispatch(
        deleteSavedReport(
          reportId,
          () => {
            dispatch(
              showToast({
                open: true,
                message: 'Report deleted successfully.',
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
            // Reset selected if it was the deleted one
            if (selectedSavedReport === reportId) {
              setSelectedSavedReport(null);
            }
          },
          (error) => {
            dispatch(
              showToast({
                open: true,
                message: error?.response?.data?.exception || 'Failed to delete report.',
                type: 'error',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
          }
        ) as any
      );
    }
  };

  const selectedReportName = selectedSavedReport
    ? savedReports.find(r => r.Id === selectedSavedReport)?.Name || 'My Reports'
    : 'My Reports';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '12px 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      {/* Left side - Report Type Filter Dropdown */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Report Builder text - horizontal */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: '12px',
              color: '#4A5565',
            }}
          >
            {tab === 'reports'
              ? 'Choose a report type, period and to analyze your data based on your requirements.'
              : tab === 'aisummary'
                ? 'Choose a summary type, period and to analyze your data based on your requirements.'
                : 'Choose filters and period to analyze allocation data with custom visualizations.'}
          </Typography>
        </Box>

        {/* Report Type and Select - horizontal */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <>
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#1C2D5F',
                }}
              >
                {tab !== 'aisummary' ? 'Report Type' : 'Summary Type'}
              </Typography>

              {tab === 'reports' && (
                <Select
                  disabled={permissions?.['Reports'].r === false}
                  value={selectedReport}
                  onChange={e => {
                    setSelectedReport(e.target.value);
                    onReportTypeChange?.(e.target.value as ReportType);
                  }}
                  size="small"
                  displayEmpty
                  sx={{
                    minWidth: 200,
                    height: 36,
                    fontSize: '13px',
                    fontWeight: 500,
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E5E7EB',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#152E75',
                      borderWidth: '1px',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        mt: 0.1,
                        '& .MuiMenuItem-root': {
                          fontSize: '13px',
                          fontWeight: 500,
                          py: 1,
                          px: 2,
                          '&:hover': {
                            backgroundColor: '#F3F4F6',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#EEF2FF',
                            color: '#152E75',
                            '&:hover': {
                              backgroundColor: '#E0E7FF',
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="resourceProjectPeriod">
                    Allocation & Actuals Analysis
                  </MenuItem>
                  <MenuItem value="resourceProjectPeriodCost">
                    Allocation & Actuals Cost Analysis
                  </MenuItem>
                  <MenuItem value="resourcePeriod" sx={{ pl: 4 }}>
                    Resource & Period
                  </MenuItem>
                  <MenuItem value="projectPeriod" sx={{ pl: 4 }}>
                    Project & Period
                  </MenuItem>
                  <MenuItem value="resourceOnly" sx={{ pl: 4 }}>
                    Resource Roster
                  </MenuItem>
                  <MenuItem value="projectsOnly" sx={{ pl: 4 }}>
                    Project Roster
                  </MenuItem>
                  <MenuItem value="userActivity" sx={{ pl: 4 }}>
                    User Activity Report
                  </MenuItem>
                </Select>
              )
            }
              {tab === 'aisummary' && (
                <Select
                  value={selectedSummary}
                  onChange={e => {
                    setSelectedSummary(e.target.value);
                    onSummaryTypeChange?.(e.target.value as SummaryType);
                  }}
                  size="small"
                  displayEmpty
                  sx={{
                    minWidth: 200,
                    height: 36,
                    fontSize: '13px',
                    fontWeight: 500,
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E5E7EB',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#152E75',
                      borderWidth: '1px',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        mt: 0.1,
                        '& .MuiMenuItem-root': {
                          fontSize: '13px',
                          fontWeight: 500,
                          py: 1,
                          px: 2,
                          '&:hover': {
                            backgroundColor: '#F3F4F6',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#EEF2FF',
                            color: '#152E75',
                            '&:hover': {
                              backgroundColor: '#E0E7FF',
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="project" sx={{ pl: 4 }}>
                    Project
                  </MenuItem>
                  {/* <MenuItem value="team" sx={{ pl: 4 }}>Team</MenuItem> */}
                </Select>
              )}

              {tab === 'custom' && (
                <>
                  <Select
                    value={customReportType}
                    onChange={e => {
                      onCustomReportTypeChange?.(e.target.value as 'percentageAllocation' | 'allocationCapacity');
                    }}
                    size="small"
                    displayEmpty
                    sx={{
                      minWidth: 200,
                      height: 36,
                      fontSize: '13px',
                      fontWeight: 500,
                      backgroundColor: '#ffffff',
                      borderRadius: '6px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E5E7EB',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D5DB',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#152E75',
                        borderWidth: '1px',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                          borderRadius: '8px',
                          mt: 0.1,
                          '& .MuiMenuItem-root': {
                            fontSize: '13px',
                            fontWeight: 500,
                            py: 1,
                            px: 2,
                            '&:hover': {
                              backgroundColor: '#F3F4F6',
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#EEF2FF',
                              color: '#152E75',
                              '&:hover': {
                                backgroundColor: '#E0E7FF',
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="percentageAllocation">Percentage Allocation</MenuItem>
                    <MenuItem value="allocationCapacity">Allocation Capacity</MenuItem>
                  </Select>
                </>
              )}
            </>
        </Box>
      </Box>
      {/* Right side - Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* My Reports Dropdown */}
        {/* {tab === 'reports' && ( */}
          <Button
            variant="outlined"
            onClick={handleMenuOpen}
            startIcon={<img src="/images/icons/monitoring.svg" alt="reports" />}
            endIcon={<KeyboardArrowDown sx={{ fontSize: '18px !important' }} />}
            sx={{
              height: 36,
              minWidth: 140,
              maxWidth: 200,
              backgroundColor: '#ffffff',
              color: '#344665',
              textTransform: 'none',
              fontSize: 13,
              fontWeight: 500,
              px: 2,
              borderRadius: '6px',
              border: '1px solid #CBD0DB',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#F9FAFB',
                borderColor: '#CBD0DB',
                boxShadow: 'none',
              },
              '& .MuiButton-endIcon': {
                marginLeft: 'auto',
              },
            }}
          >
            <Typography
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {selectedReportName}
            </Typography>
          </Button>
        {/* )} */}

        <Menu
          anchorEl={menuAnchor}
          open={!!menuAnchor}
          onClose={handleMenuClose}
          slotProps={{
            paper: {
              sx: {
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                mt: 0.1,
                minWidth: 150,
                maxWidth: 200,
              },
            },
          }}
        >
          {filteredSavedReports.length === 0 ? (
            <MenuItem disabled sx={{ fontSize: '13px', py: 1.5, px: 2 }}>
              <Typography sx={{ fontSize: '13px', color: '#9CA3AF' }}>
                No saved reports
              </Typography>
            </MenuItem>
          ) : (
            filteredSavedReports.map(report => (
              <MenuItem
                key={report.Id}
                onClick={() => handleReportSelect(report.Id)}
                selected={selectedSavedReport === report.Id}
              sx={{
                fontSize: '13px',
                py: 1.5,
                px: 2,
                minWidth: 150,
                maxWidth: 200,
                '&:hover': {
                  backgroundColor: '#F3F4F6',
                  '& .action-buttons': {
                    display: 'flex',
                  },
                },
                '&.Mui-selected': {
                  backgroundColor: '#EEF2FF',
                  '&:hover': {
                    backgroundColor: '#E0E7FF',
                  },
                },
                position: 'relative',
              }}
            >
                <Typography
                  component="span"
                  sx={{
                    fontSize: '13px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    pr: 1,
                    display: 'block',
                    maxWidth: 'calc(100% - 48px)',
                  }}
                >
                  {report.Name}
                </Typography>
                <Box
                  className="action-buttons"
                  sx={{
                    display: 'none',
                    position: 'absolute',
                    right: 8,
                    gap: 0.5,
                    backgroundColor: 'inherit',
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{ p: 0.5 }}
                    onClick={e => handleReportEdit(report.Id, e)}
                  >
                    <img
                      src="/images/icons/pencil_underline.svg"
                      alt="edit"
                      style={{ width: 16, height: 16 }}
                    />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ p: 0.5 }}
                    onClick={e => handleReportDelete(report.Id, e)}
                  >
                    <img
                      src="/images/icons/delete.svg"
                      alt="delete"
                      style={{ width: 16, height: 16 }}
                    />
                  </IconButton>
                </Box>
              </MenuItem>
            ))
          )}
        </Menu>

        {/* Generate Report Button */}
        <Button
          variant="contained"
          onClick={onGenerateReport}
          disabled={
            (!(
              permissions &&
              (permissions['Reports'].r ||
                permissions['AISummary'].r ||
                permissions['CustomReports'].r)
            ) &&
              !(selectedFiltersCount > 0)) ||
            isLoading
          }
          sx={{
            height: 36,
            backgroundColor: '#152E75',
            color: '#fff',
            textTransform: 'none',
            fontSize: 13,
            fontWeight: 600,
            px: 3,
            borderRadius: '6px',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#1C3A8C',
              boxShadow: 'none',
            },
            '&:disabled': {
              backgroundColor: '#D1D5DB',
            },
          }}
        >
          {isLoading
            ? 'Generating...'
            : tab === 'reports'
              ? 'Generate Report'
              : tab === 'aisummary'
                ? 'Generate Summary'
                : 'Generate Report'}
        </Button>
      </Box>
    </Box>
  );
}

export default withRBAC(ReportBuilderToolbar, [
  'Reports',
  'AISummary',
  'CustomReports',
]);
