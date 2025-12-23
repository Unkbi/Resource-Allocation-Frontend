import React, { useMemo, useCallback } from 'react';
import { Box, Chip, styled, Tooltip, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector, useDispatch } from 'react-redux';
import {
  setAdvancedFilters,
  clearAdvancedFilters,
} from '@/app/redux/reducers/dashboardReducer';
import { PORTFOLIO_DISPLAY_NAME } from '@/app/constants/constants';
import { RootState, AppDispatch } from '@/app/redux/store';

const StyledChip = styled(Chip)(({ theme }) => ({
  height: '32px',
  borderRadius: '6px',
  backgroundColor: '#F1F5F9',
  border: '1px solid #E2E8F0',
  fontFamily: 'Open Sans',
  fontSize: '13px',
  fontWeight: 400,
  color: '#334665',
  maxWidth: '400px',
  '& .MuiChip-label': {
    padding: '6px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '& .MuiChip-deleteIcon': {
    color: '#64748B',
    fontSize: '16px',
    margin: '0 4px 0 -2px',
    '&:hover': {
      color: '#475569',
    },
  },
}));

const CountBadge = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: '4px',
  padding: '2px 6px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#334665',
  marginLeft: '4px',
  flexShrink: 0,
});

const ClearAllButton = styled(Button)(({ theme }) => ({
  background: 'none',
  border: '1px solid #0000001A',
  color: '#0A0A0A',
  fontFamily: 'Open Sans',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
  textTransform: 'none',
  padding: '6px 8px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: '#F3F4F6',
  },
}));

interface FilterChipsProps {
  filters?: Record<string, any>;
  filterLabels?: Record<string, string>;
  onFilterRemove?: (key: string) => void;
  onClearAll?: () => void;
  getDisplayValue?: (key: string, value: any) => string | string[];
  filterType?: 'advanced' | 'report';
  showClearButton?: boolean;
}

interface ActiveFilter {
  key: string;
  value: any;
  label: string;
  displayName: string[];
  displayText: string;
  count: number;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  filterLabels,
  onFilterRemove,
  onClearAll,
  getDisplayValue,
  filterType = 'advanced',
  showClearButton = true,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Use Redux for advanced filters, or use provided filters for report builder
  const isAdvancedMode = filterType === 'advanced';
  
  const { advancedFilters = {}, defualtAdvancedFilters } = useSelector(
    (state: RootState) => state.dashboard
  );

  // Get all the data needed for display names
  const { projectTypeGroups, projectTypes } = useSelector(
    (state: RootState) => state.allSettings
  );
  const { teams } = useSelector((state: RootState) => state.teams);
  const { resources } = useSelector((state: RootState) => state.resources);
  const { portfolios } = useSelector((state: RootState) => state.portfolios);
  const { organisations } = useSelector((state: RootState) => state.organisations);
  const { projects } = useSelector((state: RootState) => state.projects);
  const { scalarSettings } = useSelector((state: RootState) => state.allSettings);

  // Default filter labels for advanced filters mode
  const defaultFilterLabels: Record<string, string> = {
    ProjectTypeGroup: 'Project Type Group',
    ProjectType: 'Project Type',
    Team: 'Team Name',
    Resource: 'Resource',
    AllocationManager: 'Allocation Manager',
    ProjectManager: 'Project Manager',
    Project: 'Project Name',
    Portfolio: `${scalarSettings?.Portfolio_Name || PORTFOLIO_DISPLAY_NAME}`,
    Organization: 'Organization',
  };

  // Use props filters if provided (for report builder), otherwise use Redux (for advanced filters)
  const currentFilters = useMemo(() => isAdvancedMode ? advancedFilters : (filters || {}), [isAdvancedMode, advancedFilters, filters]);
  const currentFilterLabels = filterLabels || defaultFilterLabels;

  // Function to get display name from ID (handles both single values and arrays)
  // Use custom getDisplayValue if provided (for report builder), otherwise use default logic (for advanced filters)
  const getDisplayName = useCallback((key: string, value: any): string | string[] | null => {
    if (!value) return null;

    // If a custom getDisplayValue function is provided, use it
    if (getDisplayValue) {
      return getDisplayValue(key, value);
    }

    // Handle array of values
    if (Array.isArray(value)) {
      const names = value.map((v: any) => getDisplayName(key, v)).filter(Boolean) as string[];
      return names.length > 0 ? names : null;
    }

    // Default logic for advanced filters
    switch (key) {
      case 'ProjectTypeGroup':
        return projectTypeGroups?.find((item: any) => item.Id === value)?.Name || null;
      case 'ProjectType':
        return projectTypes?.find((item: any) => item.Id === value)?.Name || null;
      case 'Team':
        return teams?.find((item: any) => item.Id === value)?.Name || null;
      case 'Resource':
      case 'allocationManager':
      case 'projectManager':
      case 'AllocationManager':
      case 'ProjectManager':
        return (resources as any)?.find((item: any) => item.Id === value)?.FullName || null;
      case 'Project':
      case 'project':
        return projects?.find((item: any) => item.Id === value)?.Name || null;
      case 'Portfolio':
      case 'portfolio':
        return portfolios?.find((item: any) => item.Id === value)?.Name || null;
      case 'Organization':
      case 'organization':
        return organisations?.find((item: any) => item.Id === value)?.Name || null;
      default:
        return value;
    }
  }, [getDisplayValue, projectTypeGroups, projectTypes, teams, resources, projects, portfolios, organisations]);

  // Get active filters (non-empty values, including arrays with items)
  const activeFilters = useMemo(() => {
    // Filter out default values based on filter type
    const filtersToProcess = currentFilters || {};
    
    return Object.entries(filtersToProcess)
      .filter(([key, value]) => {
        // Skip specific keys based on mode
        if (isAdvancedMode) {
          // For advanced mode, skip empty values
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return value && value !== '';
        } else {
          // For report mode, skip default values
          if (key === 'reportType') return false;
          if (key === 'period' && value === 'this_week') return false;
          if (key === 'customDateRange') return false; // Don't show as separate chip
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return value && value !== '';
        }
      })
      .map(([key, value]) => {
        const displayName = getDisplayName(key, value);
        const isArray = Array.isArray(displayName);

        return {
          key,
          value,
          label: currentFilterLabels[key] || key,
          displayName: isArray ? displayName : [displayName as string],
          displayText: isArray
            ? displayName.length > 2
              ? `${displayName.slice(0, 2).join(', ')}...`
              : displayName.join(', ')
            : displayName as string,
          count: isArray ? displayName.length : 1,
        };
      })
      .filter((filter): filter is ActiveFilter => 
        filter.displayName && 
        filter.displayName.length > 0 && 
        !!filter.displayName[0]
      ); // Only show filters with valid display names
  }, [
    currentFilters,
    currentFilterLabels,
    isAdvancedMode,
    getDisplayName,
  ]);

  const handleRemoveFilter = (filterKey: string) => {
    if (isAdvancedMode) {
      // For advanced filters mode, use Redux dispatch
      const resetValue = defualtAdvancedFilters
        ? (defualtAdvancedFilters as any)[filterKey]
        : '';

      dispatch(
        setAdvancedFilters({
          ...advancedFilters,
          [filterKey]: resetValue,
        })
      );
    } else if (onFilterRemove) {
      // For report builder mode, use provided callback
      onFilterRemove(filterKey);
    }
  };

  const handleClearAll = () => {
    if (isAdvancedMode) {
      // For advanced filters mode, use Redux dispatch
      dispatch(clearAdvancedFilters());
    } else if (onClearAll) {
      // For report builder mode, use provided callback
      onClearAll();
    }
  };

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
      }}
    >
      {activeFilters.map((filter) => {
        const showTooltip = filter.count > 2;
        const remainingCount = filter.count - 2;

        const chipLabel =
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                overflow: 'hidden',
                maxWidth: '100%',
              }}
            >
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {filter.label}:{' '}
                <strong>{filter.displayName.slice(0, 2).join(', ')}</strong>
              </span>
              {showTooltip && (
                <Tooltip
                  title={
                    <Box sx={{ maxWidth: 300 }}>
                      {filter.displayName.slice(2).map((name, index) => (
                        <div key={index}>{name}</div>
                      ))}
                    </Box>
                  }
                  arrow
                  placement="bottom"
                  disableInteractive
                >
                  <span>
                    <CountBadge>+{remainingCount}</CountBadge>
                  </span>
                </Tooltip>
              )}
            </Box>

        return (
          <StyledChip
            key={filter.key}
            label={chipLabel}
            onDelete={() => handleRemoveFilter(filter.key)}
            deleteIcon={<CloseIcon />}
          />
        );
      })}
        <ClearAllButton onClick={handleClearAll}>{showClearButton ? 'Clear All' : 'Reset Filters' }</ClearAllButton>
      
    </Box>
  );
};

export default FilterChips;
