"use client";

import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  Typography,
} from "@mui/material";

export const RolesSettings = () => {
  // Define the list of roles
  const roles = ["Admin", "Manager", "Member", "Team"];

  // Define the list of actions with initial permissions
  const [actions, setActions] = useState([
    { id: 1, name: "Action 1", permissions: { Admin: true, Manager: false, Member: false, Team: false } },
    { id: 2, name: "Action 2", permissions: { Admin: true, Manager: true, Member: false, Team: false } },
    { id: 3, name: "Action 3", permissions: { Admin: true, Manager: true, Member: true, Team: false } },
    { id: 4, name: "Action 4", permissions: { Admin: true, Manager: true, Member: true, Team: true } },
    { id: 5, name: "Action 5", permissions: { Admin: true, Manager: false, Member: false, Team: false } },
    { id: 6, name: "Action 6", permissions: { Admin: true, Manager: true, Member: false, Team: false } },
    { id: 7, name: "Action 7", permissions: { Admin: true, Manager: true, Member: true, Team: false } },
    { id: 8, name: "Action 8", permissions: { Admin: true, Manager: true, Member: true, Team: true } },
    { id: 9, name: "Action 9", permissions: { Admin: true, Manager: false, Member: false, Team: false } },
    { id: 10, name: "Action 10", permissions: { Admin: true, Manager: true, Member: false, Team: false } },
    { id: 11, name: "Action 11", permissions: { Admin: true, Manager: true, Member: true, Team: false } },
    { id: 12, name: "Action 12", permissions: { Admin: true, Manager: true, Member: true, Team: true } },
    { id: 13, name: "Action 13", permissions: { Admin: true, Manager: false, Member: false, Team: false } },
    { id: 14, name: "Action 14", permissions: { Admin: true, Manager: true, Member: false, Team: false } },
    { id: 15, name: "Action 15", permissions: { Admin: true, Manager: true, Member: true, Team: false } },
    { id: 16, name: "Action 16", permissions: { Admin: true, Manager: true, Member: true, Team: true } },
  ]);

  // Handle permission toggle
  const handlePermissionToggle = (actionId, role) => {
    setActions(prevActions =>
      prevActions.map(action =>
        action.id === actionId
          ? {
              ...action,
              permissions: {
                ...action.permissions,
                [role]: !action.permissions[role],
              },
            }
          : action
      )
    );
  };

  return (
    <Box  sx={{ width: "100%" }}>
      <TableContainer
        component={Paper}
        sx={{
          mt: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          boxShadow: "none",
          maxHeight: 500,
          overflow: "auto",
        //   "&::-webkit-scrollbar": {
        //     width: 8,
        //     height: 8,
        //   },
        //   "&::-webkit-scrollbar-thumb": {
        //     backgroundColor: "grey.400",
        //     borderRadius: 2,
        //   },
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: "bold", 
                  bgcolor: "background.paper",
                  position: "sticky",
                  left: 0,
                  zIndex: 3,
                  borderBottom: "1px solid",
                  borderColor: "divider"
                }}
              >
                Actions
              </TableCell>
              {roles.map(role => (
                <TableCell 
                  key={role} 
                  align="center" 
                  sx={{ 
                    fontWeight: "bold", 
                    bgcolor: "background.paper",
                    borderBottom: "1px solid",
                    borderColor: "divider"
                  }}
                >
                  {role}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {actions.map(action => (
              <TableRow
                key={action.id}
                hover
                sx={{
                  "&:last-child td": {
                    borderBottom: 0,
                  },
                }}
              >
                <TableCell 
                  sx={{ 
                    position: "sticky",
                    left: 0,
                    bgcolor: "background.paper",
                    borderBottom: "1px solid",
                    borderColor: "divider"
                  }}
                >
                  {action.name}
                </TableCell>
                {roles.map(role => (
                  <TableCell 
                    key={role} 
                    align="center"
                    sx={{ borderBottom: "1px solid", borderColor: "divider" }}
                  >
                    <Checkbox
                      checked={action.permissions[role]}
                      onChange={() => handlePermissionToggle(action.id, role)}
                      color="primary"
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};