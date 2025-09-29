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
import UserManagement from '@/app/components/Settings/UserManagement';
import { FETCH_ALL_SETTINGS } from '@/app/redux/actions/allSettingsActions';
import { CrudPermissions, withRBAC } from '@/app/components/HOC/withRBAC';

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

interface SettingsPanelProps {
  permissions: Record<string, CrudPermissions>;
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

const SettingsPanel = ({ permissions }: SettingsPanelProps) => {
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
  const { scalarSettings } = useSelector(
    (state: RootState) => state.allSettings
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasAnyAccess = {
    'user-profile': true,
    notification: true,
    'access-management': true,
    'project-setting':
      permissions['ProjectType'].r || permissions['ProjectTypeGroup'].r,
    'allocation-setting':
      permissions['AllocationRangeSetting'].r || permissions['ScalarSetting'].r,
    'location-setting': true,
    theme: true,
    'holiday-calendar': true,
    'global-default-view': true,
    'help-centre': true,
  };

  useEffect(() => {
    if (scalarSettings === null) {
      // Sahadev : This is temporary, we will pobably need to call AllSettings API here.
      dispatch({
        type: FETCH_ALL_SETTINGS,
        payload: {},
      });
    }
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
            id: 'user-management',
            title: 'User Management',
            headerText: 'User Management',
            icon: '',
            content: <UserManagement />,
            description: 'Easily add and manage your users and resources in one place.',
          },
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
            headerText: 'Allocation Settings',
            icon: '',
            content: <AllocationTheme />,
            description: 'Configuration setting for resource allocation',
          },
          {
            id: 'location-setting',
            title: 'Location',
            headerText: 'Location Settings',
            icon: '',
            content: <Location />,
            description: 'Configure work location for resource',
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
      setActiveItem(updatedMenuItems[0].items[0]);
    }
  }, []);

  useEffect(() => {
    const menu = searchParams.get('menu');
    const updatedMenuItems = createMenuItems();
    // Only allow menus that are accessible
    const accessibleMenus = Object.keys(hasAnyAccess).filter(
      key => hasAnyAccess[key as keyof typeof hasAnyAccess]
    );
    if (!menu || !accessibleMenus.includes(menu)) {
      router.replace('/settings?menu=user-profile');
      setActiveItem(updatedMenuItems[0].items[0]);
    }
  }, [searchParams]);

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

  return (
    <PageContainer>
      <BodyContainer>
        <Box sx={{ padding: '16px', borderRight: '1px solid #e0e0e0' }}>
          <SettingsSidebar>
            {MenuItems.map(category => (
              <Box key={category.name}>
                <CategoryLabel color="red">{category.name}</CategoryLabel>
                <List disablePadding>
                  {category.items
                    .filter(
                      m => hasAnyAccess[m.id as keyof typeof hasAnyAccess]
                    )
                    .map(item => (
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
        </ContentContainer>
      </BodyContainer>
    </PageContainer>
  );
};

export default withRBAC(SettingsPanel, [
  'ProjectType',
  'ProjectTypeGroup',
  'AllocationRangeSetting',
  'ScalarSetting',
]);
