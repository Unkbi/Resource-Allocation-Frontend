'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Box, Typography, Divider, List } from '@mui/material';
import {
  BodyContainer,
  BottomActions,
  CancelButton,
  CategoryLabel,
  ContentContainer,
  ContentFooter,
  ContentHeader,
  ListItemLabel,
  PageContainer,
  SaveButton,
  ScrollableContent,
  SettingsSidebar,
  StyledListItem,
} from '@/app/components/Settings/styled';
import AllocationTheme from '@/app/components/Settings/AllocationTheme';
import {
  type AllocationRange,
  updateAllocationTheme,
} from '@/app/redux/reducers/settingsReducer';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/redux/store';
import { useDispatch } from 'react-redux';
import { showToast } from '@/app/redux/reducers/toastReducer';

interface MenuItem {
  id: string;
  title: string;
  headerText: string;
  icon: string;
  content: React.ReactNode;
  description: string;
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

// Interface for validation errors
interface ValidationErrors {
  [key: number]: {
    from?: boolean;
    to?: boolean;
    message?: string;
  };
}

// Function to validate ranges
const validateRanges = (ranges: AllocationRange[]): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Convert string values to numbers for comparison
  const numericRanges = ranges.map(range => ({
    id: range.id,
    from: Number.parseFloat(range.from),
    to: Number.parseFloat(range.to),
  }));

  // Check each range against all others
  numericRanges.forEach((range, index) => {
    // Skip invalid numbers
    if (isNaN(range.from) || isNaN(range.to)) {
      errors[range.id] = {
        from: isNaN(range.from),
        to: isNaN(range.to),
        message: 'Invalid number format',
      };
      return;
    }

    // Check if from is greater than to
    if (range.from > range.to) {
      errors[range.id] = {
        from: true,
        to: true,
        message: 'FROM value cannot be greater than TO value',
      };
      return;
    }

    // Check for overlaps with other ranges
    for (let i = 0; i < numericRanges.length; i++) {
      if (i === index) continue; // Skip comparing with self

      const otherRange = numericRanges[i];

      // Check for overlap
      const hasOverlap = !(
        range.to < otherRange.from || range.from > otherRange.to
      );

      // Check for subset (this range is inside another range)
      const isSubset =
        range.from >= otherRange.from && range.to <= otherRange.to;

      // Check for superset (another range is inside this range)
      const isSuperset =
        range.from <= otherRange.from && range.to >= otherRange.to;

      if (hasOverlap || isSubset || isSuperset) {
        errors[range.id] = {
          from: true,
          to: true,
          message: hasOverlap
            ? 'Range overlaps with another range'
            : isSubset
              ? 'Range is a subset of another range'
              : 'Range is a superset of another range',
        };
        break;
      }
    }
  });

  return errors;
};

const SettingsPanel = () => {
  const { allocationTheme } = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();
  const [allocationRanges, setAllocationRanges] =
    useState<AllocationRange[]>(allocationTheme);
  // State to track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // Keep a backup of the original data for cancel functionality
  const [originalAllocationRanges, setOriginalAllocationRanges] =
    useState<AllocationRange[]>(allocationTheme);

  // Create menu items with dynamic content based on state
  const createMenuItems = () => {
    return [
      {
        name: 'General',
        items: [
          {
            id: 'user-profile',
            title: 'User Profile',
            headerText: 'User Profile',
            icon: '',
            content: '',
            description: 'Manage your user profile',
          },
          {
            id: 'notification',
            title: 'Notification',
            headerText: 'Notification',
            icon: '',
            content: '',
            description: 'Configure notification settings',
          },
        ],
      },
      {
        name: 'Admin Settings',
        items: [
          {
            id: 'user-management',
            title: 'User Management',
            headerText: 'User Management',
            icon: '',
            content: '',
            description: 'Manage users and permissions',
          },
          {
            id: 'allocation-setting',
            title: 'Allocation Setting',
            headerText: 'Color Theme: Teams View',
            icon: '',
            content: (
              <AllocationTheme
                allocationRanges={allocationRanges}
                onAllocationRangesChange={setAllocationRanges}
                onDataChanged={() => setHasUnsavedChanges(true)}
              />
            ),
            description: 'It is a color theme for organization view',
          },
          {
            id: 'theme',
            title: 'Theme',
            headerText: 'Theme',
            icon: '',
            content: '',
            description: 'It is a color theme for organization view',
          },
          {
            id: 'holiday-calendar',
            title: 'Holiday Calendar',
            headerText: 'Holiday Calendar',
            icon: '',
            content: '',
            description: 'Configure holiday calendar',
          },
          {
            id: 'global-default-view',
            title: 'Global Default View',
            headerText: 'Global Default View',
            icon: '',
            content: '',
            description: 'Configure global default view',
          },
        ],
      },
      {
        name: 'Help & Support',
        items: [
          {
            id: 'help-centre',
            headerText: 'Help Centre',
            title: 'Help Centre',
            icon: '',
            content: <div>Help Centre Content</div>,
            description: 'Get help and support',
          },
        ],
      },
    ];
  };

  const MenuItems = createMenuItems();
  const [activeItem, setActiveItem] = useState<MenuItem>(MenuItems[1].items[1]); // Default to allocation settings

  // Update menu items when allocation ranges change
  useEffect(() => {
    // This is needed to ensure the content prop of menu items is updated with the latest state
    const updatedMenuItems = createMenuItems();
    // Find and update the active item to maintain selection
    const updatedActiveItem = updatedMenuItems
      .flatMap(category => category.items)
      .find(item => item.id === activeItem.id);

    if (updatedActiveItem) {
      setActiveItem(updatedActiveItem);
    }
  }, [allocationRanges, activeItem.id]);

  const handleSaveChanges = () => {
    if (activeItem.id === 'allocation-setting' || activeItem.id === 'theme') {
      // Validate ranges before saving
      const errors = validateRanges(allocationRanges);
      const hasErrors = Object.keys(errors).length > 0;

      if (hasErrors) {
        Object.entries(errors).forEach(([rangeId, error]) => {
          dispatch(
            showToast({
              message: `${error.message}`,
              type: 'error',
            })
          );
        });
        return;
      }

      console.log('Saving allocation ranges:', allocationRanges);
      setOriginalAllocationRanges([...allocationRanges]);
      setHasUnsavedChanges(false);
      dispatch(updateAllocationTheme([...allocationRanges]));
    }

    // Add other settings save logic here based on activeItem.id
  };

  const handleCancel = () => {
    console.log('Cancelled changes');

    // Restore original data
    if (activeItem.id === 'allocation-setting' || activeItem.id === 'theme') {
      setAllocationRanges([...originalAllocationRanges]);
    }

    setHasUnsavedChanges(false);
  };

  return (
    <PageContainer>
      <BodyContainer>
        <Box sx={{ padding: '16px', borderRight: '1px solid #e0e0e0' }}>
          <SettingsSidebar>
            {MenuItems.map(category => (
              <Box key={category.name}>
                <CategoryLabel color="red">{category.name}</CategoryLabel>
                <List disablePadding>
                  {category.items.map(item => (
                    <StyledListItem
                      key={item.id}
                      selected={activeItem.id === item.id}
                      onClick={() => setActiveItem(item)}
                    >
                      <ListItemLabel
                        primary={item.title}
                        selected={activeItem.id === item.id}
                      />
                    </StyledListItem>
                  ))}
                </List>
                <Divider sx={{ mx: 2, pt: 2 }} />
              </Box>
            ))}
          </SettingsSidebar>
        </Box>
        <ContentContainer>
          <ContentHeader>
            <Typography variant="h6" fontWeight="500">
              {activeItem.headerText}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {activeItem.description}
            </Typography>
          </ContentHeader>
          <ScrollableContent>{activeItem.content}</ScrollableContent>
          <ContentFooter>
            <BottomActions>
              <CancelButton
                variant="outlined"
                onClick={handleCancel}
                disabled={!hasUnsavedChanges}
              >
                Cancel
              </CancelButton>
              <SaveButton
                variant="contained"
                onClick={handleSaveChanges}
                disabled={!hasUnsavedChanges}
              >
                Save Changes
              </SaveButton>
            </BottomActions>
          </ContentFooter>
        </ContentContainer>
      </BodyContainer>
    </PageContainer>
  );
};

export default SettingsPanel;
