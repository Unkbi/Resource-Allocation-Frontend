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
import { KeyboardArrowDown } from '@mui/icons-material';
import { ReportType, SummaryType } from '@/app/types/dashboardTypes';
import { CrudPermissions, withRBAC } from '../../HOC/withRBAC';

interface ReportBuilderToolbarProps {
  reportType?: string;
  onGenerateReport: () => void;
  onReportTypeChange?: (reportType: ReportType) => void;
  onSummaryTypeChange?: (summaryType: SummaryType) => void;
  onExport?: (format: 'pdf' | 'excel') => void;
  onShare?: () => void;
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

// Saved reports data
const savedReports = [
  { id: 1, name: 'My Reports'},
  { id: 2, name: 'Resource Productivity Report' },
  { id: 3, name: 'Team Productivity Analysis' },
  { id: 4, name: 'Monthly Revenue Breakdown' },
];

function ReportBuilderToolbar({
  reportType = 'resourceProjectPeriod',
  onGenerateReport,
  onReportTypeChange,
  onSummaryTypeChange,
  onExport,
  onShare,
  tab,
  isLoading = false,
  selectedFiltersCount = 0,
  permissions,
}: ReportBuilderToolbarProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedReport, setSelectedReport] = useState(reportType);
  const [selectedSummary, setSelectedSummary] = useState('project');
  const [selectedSavedReport, setSelectedSavedReport] = useState<number>(1);

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

  const handleReportSelect = (reportId: number) => {
    setSelectedSavedReport(reportId);
    // TODO: Load report configuration
    handleMenuClose();
  };

  const handleReportEdit = (reportId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    // TODO: Open edit dialog
  };

  const handleReportDelete = (reportId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    // TODO: Show confirmation dialog
  };

  const selectedReportName = savedReports.find(r => r.id === selectedSavedReport)?.name || 'My Reports';

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
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
          <Typography
            sx={{
              fontSize: '12px',
              color: '#4A5565',
            }}
          >
            {tab === 'reports' ?
            'Choose a report type, period and to analyze your data based on your requirements.'
            : 'Choose a summary type, period and to analyze your data based on your requirements.'}
          </Typography>
        </Box>
        
        {/* Report Type and Select - horizontal */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            sx={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#1C2D5F',
            }}
          >
            {tab === 'reports' ? 'Report Type' : 'Summary Type'}
          </Typography>
          {tab === 'reports' ? (
          <Select
            disabled={permissions?.['Reports'].r === false}
            value={selectedReport}
            onChange={(e) => {setSelectedReport(e.target.value); onReportTypeChange?.(e.target.value as ReportType);}}
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
            <MenuItem value="resourceProjectPeriod">Allocation & Actuals Analysis</MenuItem>
            <MenuItem value="resourceProjectPeriodCost">Allocation & Actuals Cost Analysis</MenuItem>
            <MenuItem value="resourcePeriod" sx={{ pl: 4 }}>Resource & Period</MenuItem>
            <MenuItem value="projectPeriod" sx={{ pl: 4 }}>Project & Period</MenuItem>
            <MenuItem value="resourceOnly" sx={{ pl: 4 }}>Resource Roster</MenuItem>
            <MenuItem value="projectsOnly" sx={{ pl: 4 }}>Project Roster</MenuItem>
          </Select>
          )
        : (
          <Select
            value={selectedSummary}
            onChange={(e) => {setSelectedSummary(e.target.value); onSummaryTypeChange?.(e.target.value as SummaryType);}}
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
            <MenuItem value="project" sx={{ pl: 4 }}>Project</MenuItem>
            {/* <MenuItem value="team" sx={{ pl: 4 }}>Team</MenuItem> */}
          </Select>
          )}
        </Box>
      </Box>
      {/* Right side - Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* My Reports Dropdown */}
        {/* <Button
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
        </Button> */}

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
          {savedReports.map((report) => (
            <MenuItem
              key={report.id}
              onClick={() => handleReportSelect(report.id)}
              selected={selectedSavedReport === report.id}
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
                {report.name}
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
                  onClick={(e) => handleReportEdit(report.id, e)}
                >
                  <img src="/images/icons/pencil_underline.svg" alt="edit" style={{ width: 16, height: 16 }} />
                </IconButton>
                <IconButton 
                  size="small" 
                  sx={{ p: 0.5 }}
                  onClick={(e) => handleReportDelete(report.id, e)}
                >
                  <img src="/images/icons/delete.svg" alt="delete" style={{ width: 16, height: 16 }} />
                </IconButton>
              </Box>
            </MenuItem>
          ))}
        </Menu>

        {/* Generate Report Button */}
        <Button
          variant="contained"
          onClick={onGenerateReport}
          disabled={isLoading}
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
          {isLoading ? 'Generating...' : tab === 'reports' ? 'Generate Report' : 'Generate Summary'}
        </Button>
      </Box>
    </Box>
  );
}

export default withRBAC(ReportBuilderToolbar, ['Reports']);
