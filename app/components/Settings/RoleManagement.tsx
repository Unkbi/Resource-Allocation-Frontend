'use client';

import { useEffect, useState } from 'react';
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
import {
  DELETE_ROLE,
  DELETE_ROLESASSIGNMENT,
  FETCH_ROLES,
  FETCH_ROLESASSIGNMENTS,
} from '@/app/redux/actions/rbacActions';
import { Role, RoleAssignment } from '@/app/types';

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 4,
    boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
    width: '120px',
  },
}));

const StatusPill = styled('div')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  fontFamily: theme.typography.fontFamily,
  fontSize: '12px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '16px',
  width: '86px',
  height: '28px',
  backgroundColor: '#4B9F471A', 
  color: '#4B9F47',            
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

const commonCellStyle = {
  color: '#111827',
  fontSize: '14px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '24px',
  fontFamily: 'Open Sans',
  px: 1,
  py: 1.1,
  display: 'flex',
  alignItems: 'center',
};

const commonTabSx = {
  color: '#4B5563',
  textTransform: 'none',
  borderRadius: 0,
  px: 3,
  textAlign: 'center',
  fontFamily: 'Open Sans',
  fontSize: '14px',
  fontStyle: 'normal',
  fontWeight: 600,
  lineHeight: '24px',
  '&.Mui-selected': {
    background: 'transparent',
    color: '#2563EB',
    boxShadow: 'none',
    borderBottom: '2px solid #3b82f6',
    textAlign: 'center',
    fontFamily: 'Open Sans',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: '24px',
  },
};

const tabConfig = [
  {
    label: 'Role Management',
    value: 'role-management',
    icon: '/images/icons/roleManage.svg',
  },
  {
    label: 'Role Assignments',
    value: 'role-assignments',
    icon: '/images/icons/roleAssign.svg',
  },
  {
    label: 'Privilege Management',
    value: 'privilege-management',
    icon: '/images/icons/privilegeManage.svg',
  },
  {
    label: 'Privilege Assignments',
    value: 'privilege-assignments',
    icon: '/images/icons/privilegeAssign.svg',
  },
];

const TabHeader = ({
  tab,
  setTab,
}: {
  tab: string;
  setTab: (value: string) => void;
}) => (
  <Box
    sx={{
      boxShadow: 1,
      display: 'flex',
      justifyContent: 'space-evenly',
      width: '100%',
      backgroundColor: '#fff',
      height: '59px',
      borderBottom: '0px solid #E5E7EB',
    }}
  >
    <Tabs
      value={tab}
      onChange={(_, v) => setTab(v)}
      sx={{
        width: 'fit-content',
        marginLeft: '20px',
        marginRight: '20px',
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
      {tabConfig.map(({ label, value, icon }) => (
        <Tab
          key={value}
          icon={
            <img
              src={icon}
              alt={label}
              style={{ width: 21, height: 16, marginRight: 6 }}
              className="tab-icon"
            />
          }
          iconPosition="start"
          label={label}
          value={value}
          sx={commonTabSx}
        />
      ))}
    </Tabs>
  </Box>
);

export default function RoleManagementPage() {
  const dispatch = useDispatch();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tab, setTab] = useState('role-management');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRoleId, setMenuRoleId] = useState<string | null>(null);
  const [deletingRole, setDeletingRole] = useState<string | null>(null);
  const roles: Role[] = useSelector((state: any) => state.rbac.roles);
  const roleAssignments: RoleAssignment[] = useSelector(
    (state: any) => state.rbac.roleAssignments
  );
  const loading = useSelector((state: any) => state.rbac.loading);

  useEffect(() => {
    if (tab === 'role-management') {
      dispatch({ type: FETCH_ROLES });
    }
    if (tab === 'role-assignments') {
      dispatch({ type: FETCH_ROLESASSIGNMENTS });
    }
  }, [tab, dispatch]);

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
  const handleAddNewRoleAssignment = () => {
    dispatch(
      openDialog({
        title: 'Assign Role',
        submitButtonText: 'Assign Role',
        cancelButtonText: 'Cancel',
        formType: 'assign_role',
      })
    );
  };

  const handleEditRoleAssignment = (assignment: RoleAssignment) => {
    dispatch(
      openDialog({
        title: 'Edit Role Assignment',
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'edit_role_assignment',
        initialData: assignment,
      })
    );
  };

  const handleDeleteRole = (Name: string) => {
    setDeletingRole(Name);
    setIsDialogOpen(true);
  };

  const handleDeleteRoleAssignment = (Name: string) => {
    setDeletingRole(Name);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRole) return;
    try {
      if (tab === 'role-management') {
        await dispatch({ type: DELETE_ROLE, payload: deletingRole });
        dispatch({ type: FETCH_ROLES });
      } else if (tab === 'role-assignments') {
        await dispatch({ type: DELETE_ROLESASSIGNMENT, payload: deletingRole });
        dispatch({ type: FETCH_ROLESASSIGNMENTS });
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeletingRole(null);
      setIsDialogOpen(false);
    }
  };
  
  const rolesColumns = [
    {
      field: 'Name',
      headerName: 'Role Name',
      flex: 1,
      headerClassName: 'custom-header',
      renderCell: (params: any) => (
        <Typography sx={commonCellStyle}>{params.value}</Typography>
      ),
    },
    {
      field: 'Status',
      headerName: 'Status',
      flex: 1,
      sortable: false,
      filterable: true,
      hideable: false,
      renderCell: () => (
        <StatusPill>Active</StatusPill>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <>
          <IconButton
            onClick={e => {
              setAnchorEl(e.currentTarget);
              setMenuRoleId(params.row.Name);
            }}
            size="small"
          >
            <MoreHorizontal sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={commonCellStyle}>
            {params.row.Name && renderRoleMenu(params.row.Name)}
          </Typography>
        </>
      ),
    },
  ];

  const renderRoleMenu = (id: string) => (
    <StyledMenu
      anchorEl={anchorEl}
      open={menuRoleId === id}
      onClose={() => setMenuRoleId(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <StyledMenuItem 
        disabled
        onClick={() => {
          const role = roles.find(r => r.Name === id);
          if (role) {
            handleEditRole(role);
          }
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
  );

  const roleAssignmentColumns = [
    {
      field: 'Role',
      headerName: 'Role',
      flex: 1,
      renderCell: (params: any) => (
        <Box
          sx={{
            fontWeight: 400,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ ...commonCellStyle, px: 0.7 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'Assignee',
      headerName: 'Assigned User',
      flex: 1,
      renderCell: (params: any) => (
        <Typography sx={commonCellStyle}>{params.value}</Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <>
          <IconButton
            onClick={e => {
              setAnchorEl(e.currentTarget);
              setMenuRoleId(params.row.Name);
            }}
            size="small"
          >
            <MoreHorizontal sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={commonCellStyle}>
            {params.row.Name && renderAssignmentMenu(params.row.Name)}
          </Typography>
        </>
      ),
    },
  ];

  const renderAssignmentMenu = (id: string) => (
    <StyledMenu
      anchorEl={anchorEl}
      open={menuRoleId === id}
      onClose={() => setMenuRoleId(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <StyledMenuItem
        disabled
        onClick={() => {
          const assignment = roleAssignments.find(r => r.Name === id);
          if (assignment) {
            handleEditRoleAssignment(assignment);
          }
          setMenuRoleId(null);
        }}
      >
        <Pencil sx={{ mr: 1, fontSize: 18 }} />
        Edit
      </StyledMenuItem>
      <StyledMenuItem
        onClick={() => {
          handleDeleteRoleAssignment(id);
          setMenuRoleId(null);
        }}
      >
        <Trash2 sx={{ mr: 1, fontSize: 18 }} />
        Delete
      </StyledMenuItem>
    </StyledMenu>
  );

  return (
    <div
      className="min-h-screen bg-[#f8f9fa] p-8"
      style={{
        fontFamily: 'open sans',
        padding: '1.5%',
        backgroundColor: 'rgba(217, 217, 217, 0.27)',
      }}
    >
      <TabHeader tab={tab} setTab={setTab} />

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
          columns={rolesColumns}
          renderMenu={renderRoleMenu}
        />
      )}
      {tab === 'role-assignments' && (
        <AccessTable
          title="Role Assignments"
          data={roleAssignments}
          onAdd={handleAddNewRoleAssignment}
          onEdit={handleEditRoleAssignment}
          onDelete={handleDeleteRoleAssignment}
          menuId={menuRoleId}
          setMenuId={setMenuRoleId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel="Assign Role"
          renderMenu={renderAssignmentMenu}
          columns={roleAssignmentColumns}
        />
      )}
      <ConfirmDialog
        open={isDialogOpen}
        onCancel={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Alert"
      >
        Are you sure you want to delete{' '}
          {deletingRole
            ? tab === 'role-management'
              ? `the Role "${deletingRole}"`
              : `Role Assignment for "${deletingRole}"`
            : 'this item'}
        ?
      </ConfirmDialog>
    </div>
  );
}
