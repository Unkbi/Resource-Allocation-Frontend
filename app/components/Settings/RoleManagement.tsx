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
import AccessTable from './AccessTable';

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

const AssignRoles: Role[] = [
  { id: '1', name: 'Sahadev Admin', status: 'Active', createdDate: '2025-01-15' },
  {
    id: '2',
    name: 'Serene Admin',
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
  },
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
      style={{
        fontFamily: 'open sans',
        padding: '1.5%',
        backgroundColor: 'rgba(217, 217, 217, 0.27)',
      }}
    >
      <Box
        sx={{
          border: 'none',
          boxShadow: 1,
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          backgroundColor: '#fff',
          height: '59px',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            width: 'fit-content',
            background: 'transparent',

            '& .MuiTabs-flexContainer': {
              gap: 1.5,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2563EB',
            },
            '& .Mui-selected .tab-icon': {
              filter:
                'brightness(0) saturate(100%) invert(33%) sepia(93%) saturate(1554%) hue-rotate(197deg) brightness(100%) contrast(101%)',
            },
          }}
        >
          <Tab
            icon={
              <img
                src="/images/icons/roleManage.svg"
                alt="User"
                style={{ width: 21, height: 16, marginRight: 6 }}
                className="tab-icon"
              />
            }
            iconPosition="start"
            label="Role Management"
            value="role-management"
            sx={{
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
            icon={
              <img
                src="/images/icons/roleAssign.svg"
                alt="User"
                style={{ width: 21, height: 16, marginRight: 6 }}
                className="tab-icon"
              />
            }
            iconPosition="start"
            label="Role Assignments"
            value="role-assignments"
            sx={{
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
            icon={
              <img
                src="/images/icons/privilegeManage.svg"
                alt="User"
                style={{ width: 21, height: 16, marginRight: 6 }}
                className="tab-icon"
              />
            }
            iconPosition="start"
            label="Privilege Management"
            value="privilege-management"
            sx={{
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
            icon={
              <img
                src="/images/icons/privilegeAssign.svg"
                alt="User"
                style={{ width: 21, height: 16, marginRight: 6 }}
                className="tab-icon"
              />
            }
            iconPosition="start"
            label="Privilege Assignments"
            value="privilege-assignments"
            sx={{
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

      {tab === 'role-management' && (
        <AccessTable
          title="Role Management"
          data={roles}
          onAdd={handleAddNewRole}
          onEdit={handleEditRole}
          onDelete={handleDeleteRole}
          menuId={menuRoleId}
          setMenuId={setMenuRoleId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel="Add New Role"
          renderMenu={id => (
            <StyledMenu
              anchorEl={anchorEl}
              open={menuRoleId === id}
              onClose={() => setMenuRoleId(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <StyledMenuItem
                onClick={() => {
                  const role = roles.find(r => r.id === id);
                  if (role) handleEditRole(role);
                  setMenuRoleId(null);
                }}
              >
                <Pencil sx={{ mr: 1, fontSize: 18 }} />
                Edit
              </StyledMenuItem>
              <StyledMenuItem
                onClick={() => {
                  handleDeleteRole(id);
                  setMenuRoleId(null);
                }}
              >
                <Trash2 sx={{ mr: 1, fontSize: 18 }} />
                Delete
              </StyledMenuItem>
            </StyledMenu>
          )}
        />
      )}
      {tab === 'role-assignments' && (
        <AccessTable
          title="Role Assignments"
          data={roles}
          onAdd={handleAddNewRole}
          onEdit={handleEditRole}
          onDelete={handleDeleteRole}
          menuId={menuRoleId}
          setMenuId={setMenuRoleId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel="Assign Role"
          renderMenu={id => (
            <StyledMenu
              anchorEl={anchorEl}
              open={menuRoleId === id}
              onClose={() => setMenuRoleId(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <StyledMenuItem
                onClick={() => {
                  const role = roles.find(r => r.id === id);
                  if (role) handleEditRole(role);
                  setMenuRoleId(null);
                }}
              >
                <Pencil sx={{ mr: 1, fontSize: 18 }} />
                Edit
              </StyledMenuItem>
              <StyledMenuItem
                onClick={() => {
                  handleDeleteRole(id);
                  setMenuRoleId(null);
                }}
              >
                <Trash2 sx={{ mr: 1, fontSize: 18 }} />
                Delete
              </StyledMenuItem>
            </StyledMenu>
          )}
        />
      )}
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
