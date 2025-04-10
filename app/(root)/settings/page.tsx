'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Box, Typography, Divider, List } from '@mui/material';
import AllocationTheme, {
  type AllocationRange,
} from '@/app/components/Settings/AllocationTheme';
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

// Initial allocation ranges data
const initialAllocationRanges: AllocationRange[] = [
  {
    id: 1,
    from: '0.0',
    to: '0.0',
    treatment: 'Treat as No Allocation',
    color: '#FFFFFF',
  },
  {
    id: 2,
    from: '0.1',
    to: '0.4',
    treatment: 'Treat as Partially Allocated',
    color: '#DEEBF7',
  },
  {
    id: 3,
    from: '0.5',
    to: '0.8',
    treatment: 'Treat as Nearly Allocated',
    color: '#FFF2CC',
  },
  {
    id: 4,
    from: '0.9',
    to: '1.0',
    treatment: 'Treat as Fully Allocated',
    color: '#C6F5E2',
  },
  {
    id: 5,
    from: '1.1',
    to: '1.5',
    treatment: 'Treat as Over Allocated',
    color: '#F8D7D7',
  },
];

const SettingsPanel = () => {
  // State for allocation ranges
  const [allocationRanges, setAllocationRanges] = useState<AllocationRange[]>(
    initialAllocationRanges
  );
  // State to track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // Keep a backup of the original data for cancel functionality
  const [originalAllocationRanges, setOriginalAllocationRanges] = useState<
    AllocationRange[]
  >(initialAllocationRanges);

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
            content: <div>User Profile Content</div>,
            description: 'Manage your user profile',
          },
          {
            id: 'notification',
            title: 'Notification',
            headerText: 'Notification',
            icon: '',
            content: <div>Notification Content</div>,
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
            content: <div>User Management Content</div>,
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
            id: 'holiday-calendar',
            title: 'Holiday Calendar',
            headerText: 'Holiday Calendar',
            icon: '',
            content: <div>Holiday Calendar Content</div>,
            description: 'Configure holiday calendar',
          },
          {
            id: 'global-default-view',
            title: 'Global Default View',
            headerText: 'Global Default View',
            icon: '',
            content: <div>Global Default View Content</div>,
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
    console.log(`Saving changes for ${activeItem.title}`);
    if (activeItem.id === 'allocation-setting' || activeItem.id === 'theme') {
      console.log('Saving allocation ranges:', allocationRanges);
      setOriginalAllocationRanges([...allocationRanges]);
      setHasUnsavedChanges(false);
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
                <CategoryLabel>{category.name}</CategoryLabel>
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
