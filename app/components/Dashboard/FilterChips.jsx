import React, { useMemo } from 'react';
import { Box, Chip, styled, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector, useDispatch } from 'react-redux';
import {
  setAdvancedFilters,
  clearAdvancedFilters,
} from '@/app/redux/reducers/dashboardReducer';
import { PORTFOLIO_DISPLAY_NAME } from '@/app/constants/constants';

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
  cursor: 'pointer',
  marginLeft: '4px',
  flexShrink: 0,
});

const ClearAllButton = styled('button')(({ theme }) => ({
  background: 'none',
  border: 'none',
  color: '#3B82F6',
  fontFamily: 'Open Sans',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  padding: '6px 8px',
  textDecoration: 'underline',
  '&:hover': {
    color: '#2563EB',
  },
}));

const FilterChips = () => {
  const dispatch = useDispatch();
  const { advancedFilters = {}, defualtAdvancedFilters } = useSelector(
    state => state.dashboard
  );

  // Get all the data needed for display names
  const { projectTypeGroups, projectTypes } = useSelector(
    state => state.allSettings
  );
  const { teams } = useSelector(state => state.teams);
  const { resources } = useSelector(state => state.resources);
  const { portfolios } = useSelector(state => state.portfolios);
  const { organisations } = useSelector(state => state.organisations);
  const { projects } = useSelector(state => state.projects);
  const { scalarSettings } = useSelector(state => state.allSettings);

  // Create a mapping of filter keys to display labels
  const filterLabels = {
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

  // Function to get display name from ID (handles both single values and arrays)
  const getDisplayName = (key, value) => {
    if (!value) return null;

    // Handle array of values
    if (Array.isArray(value)) {
      const names = value.map(v => getDisplayName(key, v)).filter(Boolean);
      return names.length > 0 ? names : null;
    }

    switch (key) {
      case 'ProjectTypeGroup':
        return projectTypeGroups?.find(item => item.Id === value)?.Name;
      case 'ProjectType':
        return projectTypes?.find(item => item.Id === value)?.Name;
      case 'Team':
        return teams?.find(item => item.Id === value)?.Name;
      case 'Resource':
      case 'AllocationManager':
      case 'ProjectManager':
        return resources?.find(item => item.Id === value)?.FullName;
      case 'Project':
        return projects?.find(item => item.Id === value)?.Name;
      case 'Portfolio':
        return portfolios?.find(item => item.Id === value)?.Name;
      case 'Organization':
        return organisations?.find(item => item.Id === value)?.Name;
      default:
        return value;
    }
  };

  // Get active filters (non-empty values, including arrays with items)
  const activeFilters = useMemo(() => {
    return Object.entries(advancedFilters || {})
      .filter(([key, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value && value !== '';
      })
      .map(([key, value]) => {
        const displayName = getDisplayName(key, value);
        const isArray = Array.isArray(displayName);

        return {
          key,
          value,
          label: filterLabels[key] || key,
          displayName: isArray ? displayName : [displayName],
          displayText: isArray
            ? displayName.length > 2
              ? `${displayName.slice(0, 2).join(', ')}...`
              : displayName.join(', ')
            : displayName,
          count: isArray ? displayName.length : 1,
        };
      })
      .filter(filter => filter.displayName && filter.displayName.length > 0); // Only show filters with valid display names
  }, [
    advancedFilters,
    projectTypeGroups,
    projectTypes,
    teams,
    resources,
    portfolios,
    organisations,
    projects,
  ]);

  const handleRemoveFilter = filterKey => {
    // Reset to default
    const resetValue = defualtAdvancedFilters
      ? defualtAdvancedFilters[filterKey]
      : '';

    dispatch(
      setAdvancedFilters({
        ...advancedFilters,
        [filterKey]: resetValue,
      })
    );
  };

  const handleClearAll = () => {
    dispatch(clearAdvancedFilters());
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
      {activeFilters.map(filter => {
        const showTooltip = filter.count > 2;
        const remainingCount = filter.count - 2;

        const chipLabel =
          filter.count >= 2 ? (
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
                <strong>{filter.label}:</strong>{' '}
                {filter.displayName.slice(0, 2).join(', ')}
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
                >
                  <CountBadge>+{remainingCount}</CountBadge>
                </Tooltip>
              )}
            </Box>
          ) : (
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {filter.displayText}
            </span>
          );

        return (
          <StyledChip
            key={filter.key}
            label={chipLabel}
            onDelete={() => handleRemoveFilter(filter.key)}
            deleteIcon={<CloseIcon />}
          />
        );
      })}
      <ClearAllButton onClick={handleClearAll}>Clear All</ClearAllButton>
    </Box>
  );
};

export default FilterChips;
