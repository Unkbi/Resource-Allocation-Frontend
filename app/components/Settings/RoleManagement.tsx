'use client';

import { useState } from 'react';
import { styled } from '@mui/material/styles';
import ConfirmDialog from '../Dialog/ConfirmDialog';
import {
  Tabs,
  Tab,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  People as Users,
  Settings as UserCog,
  VpnKey as KeyRound,
  Link as LinkIcon,
  MoreVert as MoreHorizontal,
  Edit as Pencil,
  Delete as Trash2,
} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { useSelector, useDispatch } from 'react-redux';
import { openDialog } from '@/app/redux/reducers/dialogReducer';

type Role = {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  createdDate: string;
};

const initialRoles: Role[] = [
  { id: '1', name: 'Super Admin', status: 'Active', createdDate: '2025-01-15' },
  {
    id: '2',
    name: 'Resource Admin',
    status: 'Active',
    createdDate: '2025-01-20',
  },
  {
    id: '3',
    name: 'Project Admin',
    status: 'Active',
    createdDate: '2025-01-20',
  },
  {
    id: '4',
    name: 'Allocation Leader',
    status: 'Active',
    createdDate: '2025-01-25',
  },
  {
    id: '5',
    name: 'Project Manager',
    status: 'Active',
    createdDate: '2025-01-30',
  }
];

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 4,
    boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
    width: '120px',
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(20, 43, 81, 0.70)',
    '& .MuiTypography-root': {
      color: '#FFFFFF',
    },
    '& .MuiListItemIcon-root': {
      color: '#FFFFFF',
    },
  },
  '& .MuiTypography-root': {
    color: '#424242',
  },
  '& .MuiListItemIcon-root': {
    minWidth: 32,
    color: '#1C2D5F',
  },
}));


export default function RoleManagementPage() {
  const dispatch = useDispatch();
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [tab, setTab] = useState('role-management');

  // State for menu actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRoleId, setMenuRoleId] = useState<string | null>(null);

  const handleAddNewRole = () => {
    dispatch(
      openDialog({
        title: 'Add New Role',
        submitButtonText: 'Create Role',
        cancelButtonText: 'Cancel',
        formType: 'add_role',
      })
    );
  };

  const handleEditRole = (role: Role) => {
    dispatch(
          openDialog({
            title: 'Edit Role',
            submitButtonText: 'Save',
            cancelButtonText: 'Cancel',
            formType: 'edit_role',
            initialData: role,
          })
        );
  };

  const handleDeleteRole = (roleId: string) => {
    setEditingRole(roles.find(role => role.id === roleId) || null);
    setIsDialogOpen(true);
    // setRoles(roles.filter(role => role.id !== roleId));
  };

  const handleSaveRole = () => {
    if (editingRole) {
      setRoles(
        roles.map(role =>
          role.id === editingRole.id ? { ...role, name: roleName } : role
        )
      );
    } else {
      const newRole: Role = {
        id: (roles.length + 1).toString(),
        name: roleName,
        status: 'Active',
        createdDate: new Date().toISOString().split('T')[0],
      };
      setRoles([newRole, ...roles]);
    }
    setIsDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingRole) {
      setRoles(roles.filter(role => role.id !== editingRole.id));
    }
    setIsDialogOpen(false);
  };

  return (
    <div
      className="min-h-screen bg-[#f8f9fa] p-8"
      style={{ fontFamily: 'open sans', padding: '2%' }}
    >
      <Box
        sx={{
          border: 'none',
          boxShadow: 1,
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            // minWidth: 600,
            width: 'fit-content',
            background: 'transparent',

            '& .MuiTabs-flexContainer': {
              // justifyContent: "center",
              gap: 1.5, // gap between tabs
            },
          }}
          slotProps={{
            indicator: { style: { background: '#3b82f6', height: 1 } },
          }}
        >
          <Tab
            icon={<Users sx={{ mr: 1, fontSize: '16px' }} />}
            iconPosition="start"
            label="Role Management"
            value="role-management"
            sx={{
              // minWidth: 150,
              color: '#4B5563',
              borderRadius: 0,
              textTransform: 'none',
              px: 3,
              '&.Mui-selected': {
                background: 'transparent',
                color: '#3b82f6',
                boxShadow: 'none',
                borderBottom: '2px solid #3b82f6',
              },
            }}
          />
          <Tab
            icon={<UserCog sx={{ mr: 1, fontSize: '14px' }} />}
            iconPosition="start"
            label="Role Assignments"
            value="role-assignments"
            sx={{
              // minWidth: 150,
              color: '#4B5563',
              textTransform: 'none',
              borderRadius: 0,
              px: 3,
              '&.Mui-selected': {
                background: 'transparent',
                color: '#3b82f6',
                boxShadow: 'none',
                borderBottom: '2px solid #3b82f6',
              },
            }}
          />
          <Tab
            icon={<KeyRound sx={{ mr: 1, fontSize: '14px' }} />}
            iconPosition="start"
            label="Privilege Management"
            value="privilege-management"
            sx={{
              // minWidth: 180,
              color: '#4B5563',
              textTransform: 'none',
              borderRadius: 0,
              px: 3,
              '&.Mui-selected': {
                background: 'transparent',
                color: '#3b82f6',
                boxShadow: 'none',
                borderBottom: '2px solid #3b82f6',
              },
            }}
          />
          <Tab
            icon={<LinkIcon sx={{ mr: 1, fontSize: '14px' }} />}
            iconPosition="start"
            label="Privilege Assignments"
            value="privilege-assignments"
            sx={{
              // minWidth: 190,
              color: '#4B5563',
              textTransform: 'none',
              borderRadius: 0,
              px: 3,
              '&.Mui-selected': {
                background: 'transparent',
                color: '#3b82f6',
                boxShadow: 'none',
                borderBottom: '2px solid #3b82f6',
              },
            }}
          />
        </Tabs>
      </Box>
      {/* Tab content rendering */}
      {/* {tab !== 'role-management' && (
        <Card sx={{ mt: 2, p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {tab === 'role-assignments' &&
              'Role Assignments content goes here.'}
            {tab === 'privilege-management' &&
              'Privilege Management content goes here.'}
            {tab === 'privilege-assignments' &&
              'Privilege Assignments content goes here.'}
          </Typography>
        </Card>
      )} */}

      <Card sx={{ mt: 2, mb: 2, border: 'none', boxShadow: 1 }}>
        <CardHeader
          title={
            <Typography
              variant="h6"
              sx={{ color: '#1F2937', fontWeight: 600, fontSize: '18px' }}
            >
              Role Management
            </Typography>
          }
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: '16px' }} />}
              onClick={handleAddNewRole}
              sx={{
                background: '#152E75',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Add New Role
            </Button>
          }
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fff',
            p: 3,
          }}
        />
        <CardContent sx={{ padding: '0px !important' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: '#f8f9fa' }}>
                  <TableCell
                    sx={{
                      width: '25%',
                      px: 3,
                      py: 1.5,
                      fontSize: 12,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      color: '#6c757d',
                    }}
                  >
                    Role Name
                  </TableCell>
                  <TableCell
                    sx={{
                      px: 3,
                      py: 1.5,
                      fontSize: 12,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      color: '#6c757d',
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      px: 3,
                      py: 1.5,
                      fontSize: 12,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      color: '#6c757d',
                    }}
                  >
                    Created Date
                  </TableCell>
                  <TableCell
                    sx={{
                       width: '15%',
                      px: 3,
                      py: 1.5,
                      fontSize: 12,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      color: '#6c757d',
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
                <TableBody>
                {roles.map(role => (
                  <TableRow key={role.id} sx={{ background: '#fff' }}>
                    <TableCell
                      sx={{
                        px: 3,
                        py: 2,
                        fontWeight: 600,
                        fontSize: 14,
                        color: '#111827',
                      }}
                    >
                      {role.name}
                    </TableCell>
                    <TableCell sx={{ px: 3, py: 2 }}>
                      <Badge
                        sx={{
                          border: '1px solid none',
                          background: '#4B9F471A',
                          color: '#4B9F47',
                          px: 1.5,
                          py: 0.5,
                          fontWeight: 400,
                          fontSize: 12,
                        }}
                      >
                        {role.status}
                      </Badge>
                    </TableCell>
                    <TableCell sx={{ px: 3, py: 2, color: '#6c757d' }}>
                      {role.createdDate}
                    </TableCell>
                    <TableCell sx={{ px: 3, py: 2 }}>
                      <IconButton
                        onClick={e => {
                          setAnchorEl(e.currentTarget);
                          setMenuRoleId(role.id);
                        }}
                        size="small"
                      >
                        <MoreHorizontal sx={{ fontSize: 20 }} />
                      </IconButton>
                      <StyledMenu
                        anchorEl={anchorEl}
                        open={menuRoleId === role.id}
                        onClose={() => setMenuRoleId(null)}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                      >
                        <StyledMenuItem
                          sx={{ color: '#424242' }}
                          onClick={() => {
                            handleEditRole(role);
                            setMenuRoleId(null);
                          }}
                        >
                          <Pencil sx={{ mr: 1, fontSize: 18 }} />
                          Edit
                        </StyledMenuItem>
                        <StyledMenuItem
                          onClick={() => {
                            handleDeleteRole(role.id);
                            setMenuRoleId(null);
                          }}
                          sx={{ color: ' #424242' }}
                        >
                          <Trash2 sx={{ mr: 1, fontSize: 18 }} />
                          Delete
                        </StyledMenuItem>
                      </StyledMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      {/* You can add tab content switching logic here */}
      {/* Dialog for Add/Edit Role */}
      <ConfirmDialog
              open={isDialogOpen}
              onCancel={() => setIsDialogOpen(false)}
              onConfirm={handleConfirmDelete}
              title="Alert"
            >
              Are you sure you want to delete{' '}
              {editingRole ? editingRole.name : 'this role'}?
            </ConfirmDialog>
    </div>
  );
}
