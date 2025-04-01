"use client"

import { useState } from "react"
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
} from "@mui/material"
import {
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Palette as PaletteIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material"
import { RolesSettings } from "@/app/components/Settings/RolesSettings"
import WorkingHoursSettings from "@/app/components/Settings/WorkingHoursSettings"
import { AllocationTheme } from "@/app/components/Settings/AllocationTheme"
import LayoutTheme from "@/app/components/Settings/LayoutTheme"

const PageContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  height: 'calc(100vh - 54px)',
  backgroundColor: "#ffffff",
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
})

const Header = styled(Box)({
  height: "64px",
  borderBottom: "1px solid #e0e0e0",
  display: "flex",
  alignItems: "center",
  padding: "0 24px",
  backgroundColor: "#f8f9fa",
})

const BodyContainer = styled(Box)({
  display: "flex",
  flex: 1,
  overflow: "hidden",
  minHeight: 0,
})

const Sidebar = styled(Box)(({ theme }) => ({
  width: 200,
  backgroundColor: "#f8f9fa",
  borderRight: "1px solid #e0e0e0",
  overflowY: "auto",
  "& .MuiListItem-root": {
    padding: "12px 16px",
  },
  "& .MuiListItemIcon-root": {
    minWidth: "40px",
  },
  "& .MuiListItemText-primary": {
    fontSize: "14px",
  },
}))

const ContentContainer = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column"
})

const ContentHeader = styled(Box)({
  padding: "16px 32px",
  borderBottom: "1px solid #e0e0e0",
  backgroundColor: "#ffffff"
})

const ScrollableContent = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: "24px 32px",
  backgroundColor: "#ffffff",
  overflowY: "auto",
  minHeight: 0,
}))

const ContentFooter = styled(Box)({
  padding: "16px 32px",
  borderTop: "1px solid #e0e0e0",
  backgroundColor: "#ffffff"
})

const SaveButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#0d2b5e",
  color: "white",
  textTransform: "none",
  padding: "8px 16px",
  fontSize: "14px",
  fontWeight: "medium",
  "&:hover": {
    backgroundColor: "#071a3b",
  },
}))

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  backgroundColor: selected ? "#e3f2fd" : "transparent",
  "&:hover": {
    backgroundColor: selected ? "#e3f2fd" : "#f1f1f1",
  },
}))

const SettingsPanel = () => {
  const menuItems = [
    {
      id: 'roles',
      title: 'Roles',
      icon: <PersonIcon sx={{ color: "#555555" }} />,
      selectedIcon: <PersonIcon sx={{ color: "#1976d2" }} />,
      content: <RolesSettings />,
      description: "Manage user roles and permissions"
    },
    {
      id: 'working-hours',
      title: 'Working Hours',
      icon: <TimeIcon sx={{ color: "#555555" }} />,
      selectedIcon: <TimeIcon sx={{ color: "#1976d2" }} />,
      content: <WorkingHoursSettings />,
      description: "Set your organization's working hours"
    },
    {
      id: 'allocation-theme',
      title: 'Allocation Color Theme',
      icon: <PaletteIcon sx={{ color: "#555555" }} />,
      selectedIcon: <PaletteIcon sx={{ color: "#1976d2" }} />,
      content: <AllocationTheme />,
      description: "Customize your allocation colors"
    },
    {
      id: 'layout-theme',
      title: 'Layout Theme',
      icon: <DashboardIcon sx={{ color: "#555555" }} />,
      selectedIcon: <DashboardIcon sx={{ color: "#1976d2" }} />,
      content: <LayoutTheme />,
      description: "Configure your dashboard layout"
    }
  ];

  const [activeItem, setActiveItem] = useState(menuItems[2]);

  const handleSaveChanges = () => {
    console.log(`Saving changes for ${activeItem.title}`);
  };

  return (
    <PageContainer>
      <BodyContainer>
        <Sidebar>
          <List disablePadding>
            {menuItems.map((item) => (
              <StyledListItem
                key={item.id}
                selected={activeItem.id === item.id}
                onClick={() => setActiveItem(item)}
              >
                <ListItemIcon>
                  {activeItem.id === item.id ? item.selectedIcon : item.icon}
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </StyledListItem>
            ))}
          </List>
        </Sidebar>

        <ContentContainer>
          <ContentHeader>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontSize: "18px",
                color: "#333333",
              }}
            >
              {activeItem.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: "#666666",
                fontSize: "14px",
              }}
            >
              {activeItem.description}
            </Typography>
          </ContentHeader>
          <ScrollableContent>
            {activeItem.content}
          </ScrollableContent>
          <ContentFooter>
            <SaveButton variant="contained" onClick={handleSaveChanges}>
              Save Changes
            </SaveButton>
          </ContentFooter>
        </ContentContainer>
      </BodyContainer>
    </PageContainer>
  );
};

export default SettingsPanel;