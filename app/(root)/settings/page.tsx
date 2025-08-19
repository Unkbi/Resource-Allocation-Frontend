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
import { useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/redux/store';
import { useDispatch } from 'react-redux';
import { showToast } from '@/app/redux/reducers/toastReducer';
import { AllocationRange } from '@/app/types';
import { updateAllocationTheme } from '@/app/redux/reducers/settingsReducer';
import {
  addAllocationThemeAction,
  fetchAllocationTheme,
  updateAllocationThemeAction,
} from '@/app/redux/actions/settingsAction';
import RoleManagement from '@/app/components/Settings/RoleManagement';
import ProjectSetting from '@/app/components/Settings/ProjectSettings';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Location from '@/app/components/Settings/Location';

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
    From?: boolean;
    To?: boolean;
    message?: string;
  };
}

// Function to validate ranges
export const validateRanges = (ranges: AllocationRange[]): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Convert string values to numbers for comparison
  const numericRanges = ranges.map(range => ({
    Id: Number(range.id),
    From: Number.parseFloat(range.From),
    To: Number.parseFloat(range.To),
  }));

  // Check each range against all others
  numericRanges.forEach((range, index) => {
    // Skip invalid numbers
    if (isNaN(range.From) || isNaN(range.To)) {
      errors[range.Id] = {
        From: isNaN(range.From),
        To: isNaN(range.To),
        message: 'Invalid number format',
      };
      return;
    }

    // Check if from is greater than to
    if (range.From > range.To) {
      errors[range.Id] = {
        From: true,
        To: true,
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
        range.To < otherRange.From || range.From > otherRange.To
      );

      // Check for subset (this range is inside another range)
      const isSubset =
        range.From >= otherRange.From && range.To <= otherRange.To;

      // Check for superset (another range is inside this range)
      const isSuperset =
        range.From <= otherRange.From && range.To >= otherRange.To;

      if (hasOverlap || isSubset || isSuperset) {
        errors[range.Id] = {
          From: true,
          To: true,
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
  const dispatch: AppDispatch = useDispatch();
  const [allocationRanges, setAllocationRanges] =
    useState<AllocationRange[]>(allocationTheme);
  // State to track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // Keep a backup of the original data for cancel functionality
  const [originalAllocationRanges, setOriginalAllocationRanges] =
    useState<AllocationRange[]>(allocationTheme);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    dispatch(fetchAllocationTheme());
  }, []);

  useEffect(() => {
    setAllocationRanges(allocationTheme);
    setOriginalAllocationRanges(allocationTheme);
  }, [allocationTheme]);
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
            id: 'access-management',
            title: 'Access Management',
            headerText: 'Role-Based Access Control Management',
            icon: '',
            content: <RoleManagement />,
            description: 'Comprehensive role and privilege management system',
          },
          {
            id: 'project-setting',
            title: 'Project Setting',
            headerText: 'Project Settings',
            icon: '',
            content: <ProjectSetting />,
            description:
              'Manage project types and their categories for your organization',
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
                validationErrors={validationErrors}
                setValidationErrors={setValidationErrors}
              />
            ),
            description: 'It is a color theme for organization view',
          },
          {
            id: 'location-setting',
            title: 'Location',
            headerText: 'Location Settings',
            icon: '',
            content: <Location />,
            description: 'Lorem ipsum',
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
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null); // Default to allocation settings

  // Update menu items when allocation ranges change
  useEffect(() => {
    // This is needed to ensure the content prop of menu items is updated with the latest state
    const updatedMenuItems = createMenuItems();
    // Find and update the active item to maintain selection
    const updatedActiveItem = updatedMenuItems
      .flatMap(category => category.items)
      .find(item => item.id === activeItem?.id);

    if (updatedActiveItem) {
      setActiveItem(updatedActiveItem);
    }
  }, [allocationRanges]);

  useEffect(() => {
    const menu = searchParams.get('menu');
    const updatedMenuItems = createMenuItems();
    if (menu) {
      const updatedActiveItem = updatedMenuItems
        .flatMap(category => category.items)
        .find(item => item.id === menu);

      if (updatedActiveItem) {
        setActiveItem(updatedActiveItem);
      }
    } else {
      setActiveItem(updatedMenuItems[1].items[1]);
    }
  }, []);

  useEffect(() => {
    const menu = searchParams.get('menu');
    if (activeItem && (!menu || (menu && activeItem.id !== menu))) {
      const menuParam =
        activeItem.id === 'access-management'
          ? `?menu=${activeItem.id}&tab=role-management`
          : `?menu=${activeItem.id}`;
      const newUrl = `/settings${menuParam}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [activeItem?.id]);

  const handleSaveChanges = () => {
    if (activeItem?.id === 'allocation-setting' || activeItem?.id === 'theme') {
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
      setOriginalAllocationRanges([...allocationRanges]);
      setHasUnsavedChanges(false);
      dispatch(updateAllocationTheme([...allocationRanges]));
      const transformedAllocationRanges = allocationRanges.map(range => {
        const { __Id__, id, ...rest } = range;
        return {
          Id: id,
          ...rest,
        };
      });
      const itemsWithId = allocationRanges.filter(d => d.__Id__);
      if (itemsWithId.length > 0) {
        const payload = {
          postData: transformedAllocationRanges,
          __Id__: itemsWithId[0]?.__Id__,
        };
        dispatch(updateAllocationThemeAction(payload)).then(response => {
          if (response?.meta?.requestStatus === 'fulfilled') {
            dispatch(
              showToast({
                open: true,
                message: 'Allocation theme updated successfully',
                type: 'success',
                autoHideTimer: 4000,
              })
            );
          }
        });
      } else {
        const newItems = allocationRanges.filter(d => !d.__Id__);
        if (newItems.length > 0) {
          dispatch(addAllocationThemeAction(transformedAllocationRanges));
        }
      }
    }
  };

  const handleCancel = () => {
    // Restore original data
    if (activeItem?.id === 'allocation-setting' || activeItem?.id === 'theme') {
      setAllocationRanges([...originalAllocationRanges]);
      setValidationErrors({});
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
                      selected={activeItem?.id === item.id}
                      onClick={() => setActiveItem(item)}
                    >
                      <ListItemLabel
                        primary={item.title}
                        selected={activeItem?.id === item.id}
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
            <Typography
              sx={{
                display: 'flex',
                width: '784.023px',
                height: '40px',
                flexDirection: 'column',
                justifyContent: 'center',
                color: '#333',
                fontFamily: '"Open Sans", sans-serif',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: 700,
                lineHeight: '36px',
              }}
            >
              {activeItem?.headerText}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                color: ' rgba(0, 0, 0, 0.56)',
                fontFamily: 'Open Sans',
                fontSize: '14px',
                fontStyle: ' normal',
                fontWeight: 400,
                lineHeight: '24px',
              }}
            >
              {activeItem?.description}
            </Typography>
          </ContentHeader>
          <ScrollableContent>{activeItem?.content}</ScrollableContent>
          {activeItem?.id === 'allocation-setting' && (
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
          )}
        </ContentContainer>
      </BodyContainer>
    </PageContainer>
  );
};

export default SettingsPanel;
