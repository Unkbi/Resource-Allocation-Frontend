'use client';

import { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import ConfirmDialog from '../Dialog/ConfirmDialog';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  MoreVert as MoreHorizontal,
  Edit as Pencil,
  Delete as Trash2,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import AccessTable from './AccessTable';
import {
  DELETE_PRIVILEGE,
  DELETE_PRIVILEGEASSIGNMENT,
  DELETE_ROLE,
  DELETE_ROLESASSIGNMENT,
  FETCH_PRIVILEGEASSIGNMENTS,
  FETCH_PRIVILEGES,
  FETCH_ROLES,
  FETCH_ROLESASSIGNMENTS,
  GET_USER,
} from '@/app/redux/actions/rbacActions';
import {
  Privilege,
  PrivilegeAssignment,
  Role,
  RoleAssignment,
  UserRbac,
} from '@/app/types';
import { clearHighlightedRowId } from '@/app/redux/reducers/highlightedRowReducer';
import { useGridApiRef } from '@mui/x-data-grid-premium';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { StatusPill, commonTabSx } from './styled';
import { getUserDisplayName } from '@/app/utils/authUtils';

const tabMenuNames = [
  'role-assignments',
  'role-management',
  'privilege-assignments',
  'privilege-management',
];
const baseURLAccessManagement = '/settings?menu=access-management';
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
  height: '100%',
};

const tabConfig = [
  {
    label: 'Role Assignments',
    value: 'role-assignments',
    icon: '/images/icons/roleAssign.svg',
  },
  {
    label: 'Role Management',
    value: 'role-management',
    icon: '/images/icons/roleManage.svg',
  },
  {
    label: 'Privilege Assignments',
    value: 'privilege-assignments',
    icon: '/images/icons/privilegeAssign.svg',
  },
  {
    label: 'Privilege Management',
    value: 'privilege-management',
    icon: '/images/icons/privilegeManage.svg',
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
      justifyContent: 'flex-start',
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
          backgroundColor: '#152E75',
        },
        '& .Mui-selected .tab-icon': {
          filter:
            'brightness(0) saturate(100%) invert(13%) sepia(45%) saturate(2864%) hue-rotate(203deg) brightness(94%) contrast(102%)',
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
  const [deletingAssignment, setDeletingAssignment] = useState<{
    User: string;
    Role: string;
  } | null>(null);
  const [deletingPrivilegeAssignment, setDeletingPrivilegeAssignment] =
    useState<{ Role: string; Permission: string } | null>(null);
  const roles: Role[] = useSelector((state: any) => state.rbac.roles);
  const roleAssignments = useSelector(
    (state: any) => state.rbac.roleAssignments
  );
  const user: UserRbac[] = useSelector((state: any) => state.rbac.user);
  const privileges: Privilege[] = useSelector(
    (state: any) => state.rbac.privileges
  );
  const privilegeAssignments = useSelector(
    (state: any) => state.rbac.privilegeAssignments
  );
  const loading = useSelector((state: any) => state.rbac.loading);
  const { id: highlightedRowId } = useSelector(
    (state: any) => state.highlightedRow
  );
  const apiRef = useGridApiRef();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabMenuNames.includes(tabParam)) {
      setTab(tabParam);
    }
  }, []);

  useEffect(() => {
    if (!user || user.length === 0) {
      dispatch({ type: GET_USER });
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (tab === 'role-management' && (!roles || roles.length === 0)) {
      dispatch({ type: FETCH_ROLES });
    }
    if (
      tab === 'role-assignments' &&
      (!roleAssignments || roleAssignments.length === 0)
    ) {
      dispatch({ type: FETCH_ROLESASSIGNMENTS });
    }
    if (
      tab === 'privilege-management' &&
      (!privileges || privileges.length === 0)
    ) {
      dispatch({ type: FETCH_PRIVILEGES });
    }
    if (
      tab === 'privilege-assignments' &&
      (!privilegeAssignments || privilegeAssignments.length === 0)
    ) {
      dispatch({ type: FETCH_PRIVILEGEASSIGNMENTS });
    }
    if (tabMenuNames.includes(tab)) {
      const newUrl = `${baseURLAccessManagement}&tab=${tab}`;
      router.replace(newUrl);
    }
  }, [tab, dispatch, roles, roleAssignments, privileges, privilegeAssignments]);

  useEffect(() => {
    if (!highlightedRowId || !apiRef?.current) return;

    const timeout = setTimeout(() => {
      requestAnimationFrame(() => {
        try {
          const sortedRowIds = apiRef.current.getSortedRowIds?.();
          if (!sortedRowIds || !Array.isArray(sortedRowIds)) return;

          const rowIndex = sortedRowIds.findIndex(
            id => id === highlightedRowId
          );
          if (rowIndex === -1) return;

          const focusColumn = tab === 'role-management' ? 'Name' : 'Role';

          apiRef.current.scrollToIndexes({ rowIndex });
          apiRef.current.setCellFocus(highlightedRowId, focusColumn);
          apiRef.current.selectRow?.(highlightedRowId, true);

          const scroller = document.querySelector(
            '.MuiDataGrid-virtualScroller'
          );
          if (scroller) {
            const original = scroller.scrollTop;
            scroller.scrollTop = original + 1;
            scroller.scrollTop = original;
          }
        } catch (error) {
          console.error('Error during row scroll/focus:', error);
        } finally {
          dispatch(clearHighlightedRowId());
        }
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [highlightedRowId, roles, roleAssignments, tab]);

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

  const handleAddNewPrivilege = () => {
    dispatch(
      openDialog({
        title: 'Add New Privilege',
        submitButtonText: 'Create Privilege',
        cancelButtonText: 'Cancel',
        formType: 'add_privilege',
      })
    );
  };
  const handleEditPrivilege = (privilege: Privilege) => {
    dispatch(
      openDialog({
        title: 'Edit Privilege',
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'edit_privilege',
        initialData: privilege,
      })
    );
  };
  const handleAddNewPrivilegeAssignment = () => {
    dispatch(
      openDialog({
        title: 'Assign Privilege',
        submitButtonText: 'Assign Privilege',
        cancelButtonText: 'Cancel',
        formType: 'assign_privilege',
      })
    );
  };

  const handleEditPrivilegeAssignments = (
    privilegeAssignments: PrivilegeAssignment
  ) => {
    dispatch(
      openDialog({
        title: 'Edit Privilege Assignment',
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'edit_privilege_assignment',
        initialData: privilegeAssignments,
      })
    );
  };

  const handleDeletePrivilege = (Name: string) => {
    setDeletingRole(Name);
    setIsDialogOpen(true);
  };

  const handleDeletePrivilegeAssignment = (
    Role: string,
    Permission: string
  ) => {
    setDeletingPrivilegeAssignment({ Role, Permission });
    setIsDialogOpen(true);
  };

  const handleDeleteRole = (Name: string) => {
    setDeletingRole(Name);
    setIsDialogOpen(true);
  };

  const handleDeleteRoleAssignment = (User: string, Role: string) => {
    setDeletingAssignment({ User, Role });
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRole && !deletingAssignment && !deletingPrivilegeAssignment)
      return;
    try {
      if (tab === 'role-management') {
        await dispatch({ type: DELETE_ROLE, payload: deletingRole });
        dispatch({ type: FETCH_ROLES });
      } else if (tab === 'role-assignments') {
        if (!deletingAssignment) return;
        await dispatch({
          type: DELETE_ROLESASSIGNMENT,
          payload: deletingAssignment,
        });
        dispatch({ type: FETCH_ROLESASSIGNMENTS });
      } else if (tab === 'privilege-management') {
        await dispatch({ type: DELETE_PRIVILEGE, payload: deletingRole });
        dispatch({ type: FETCH_PRIVILEGES });
      } else if (tab === 'privilege-assignments') {
        await dispatch({
          type: DELETE_PRIVILEGEASSIGNMENT,
          payload: deletingPrivilegeAssignment,
        });
        dispatch({ type: FETCH_PRIVILEGEASSIGNMENTS });
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeletingRole(null);
      setIsDialogOpen(false);
    }
  };

  const modifyRolesData = (userRoles: Role[] | null) =>
    userRoles?.map(role => ({ ...role, id: role.name })) || [];
  const modifyRoleAssignmentsData = (
    userRoleAssignments: RoleAssignment[] | null
  ) =>
    userRoleAssignments?.map(assignment => ({
      ...assignment,
      id: assignment.__path__,
    })) || [];
  const modifyPrivilegesData = (userPrivileges: Privilege[] | null) =>
    userPrivileges?.map(privilege => ({ ...privilege, id: privilege.id })) ||
    [];
  const modifyPrivilegeAssignmentsData = (
    userPrivilegeAssignments: PrivilegeAssignment[] | null
  ) =>
    userPrivilegeAssignments?.map(assignment => ({
      ...assignment,
      id: assignment.__path__,
    })) || [];
  const data =
    tab === 'role-management'
      ? modifyRolesData(roles)
      : tab === 'role-assignments'
        ? modifyRoleAssignmentsData(roleAssignments)
        : tab === 'privilege-management'
          ? modifyPrivilegesData(privileges)
          : modifyPrivilegeAssignmentsData(privilegeAssignments);

  const rolesColumns = [
    {
      field: 'name',
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
      renderCell: () => <StatusPill status="Active">Active</StatusPill>,
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
              setMenuRoleId(params.row.name);
            }}
            size="small"
          >
            <MoreHorizontal sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={commonCellStyle}>
            {params.row.name && renderRoleMenu(params.row.name)}
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
          const role = roles.find(r => r.name === id);
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
      renderCell: (params: any) => {
        const role = params.value?.replace('agentlang.auth$Role/', '') || '';
        return <Typography sx={{ ...commonCellStyle }}>{role}</Typography>;
      },
    },
    {
      field: 'User',
      headerName: 'Assigned User',
      flex: 1,
      renderCell: (params: any) => {
        const value = params.value;
        const userId = value?.includes('/') ? value.split('/').pop() : value;
        const matchedUser = user?.find(u => u.id === userId);
        const displayValue = matchedUser
          ? `${matchedUser.firstName} ${matchedUser.lastName}`
          : userId;

        return <Typography sx={commonCellStyle}>{displayValue}</Typography>;
      },
    },
    {
      field: 'Status',
      headerName: 'Status',
      flex: 1,
      renderCell: () => <StatusPill status="Active">Active</StatusPill>,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <>
          <IconButton
            onClick={e => {
              setAnchorEl(e.currentTarget);
              setMenuRoleId(params.row.id);
            }}
            size="small"
          >
            <MoreHorizontal sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={commonCellStyle}>
            {params.row.id && renderAssignmentMenu(params.row)}
          </Typography>
        </>
      ),
    },
  ];

  const renderAssignmentMenu = (row: any) => (
    <StyledMenu
      anchorEl={anchorEl}
      open={menuRoleId === row.id}
      onClose={() => setMenuRoleId(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <StyledMenuItem
        disabled
        onClick={() => {
          const assignment = roleAssignments.find(
            (r: any) => r.__path__ === row.__path__
          );
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
          handleDeleteRoleAssignment(row.User, row.Role);
          setMenuRoleId(null);
        }}
      >
        <Trash2 sx={{ mr: 1, fontSize: 18 }} />
        Delete
      </StyledMenuItem>
    </StyledMenu>
  );

  const privilegesColumns = [
    {
      field: 'id',
      headerName: 'Privilege Name',
      flex: 1.5,
      renderCell: (params: any) => {
        const value = params.value || '';
        return <Typography sx={{ ...commonCellStyle }}>{value}</Typography>;
      },
    },
    {
      field: 'resourceFqName',
      headerName: 'Entity',
      flex: 1,
      renderCell: (params: any) => {
        const value = Array.isArray(params.value)
          ? params.value[0]
          : params.value;
        const lastPart = value?.split('/')?.pop();
        return <Typography sx={commonCellStyle}>{lastPart}</Typography>;
      },
    },
    {
      field: 'Actions',
      headerName: 'Actions',
      flex: 0.75,
      renderCell: (params: any) => {
        const actionLetterMap: Record<string, string> = {
          c: 'C',
          r: 'R',
          u: 'U',
          d: 'D',
        };

        const actionColorMap: Record<string, { bg: string; text: string }> = {
          C: { bg: '#DBEAFE', text: '#1E40AF' },
          R: { bg: '#D1FAE5', text: '#065F46' },
          U: { bg: '#FEF3C7', text: '#92400E' },
          D: { bg: '#FEE2E2', text: '#991B1B' },
        };

        const actions: string[] = [];
        if (params.row.c) actions.push('c');
        if (params.row.r) actions.push('r');
        if (params.row.u) actions.push('u');
        if (params.row.d) actions.push('d');

        return (
          <Box
            sx={{
              display: 'flex',
              gap: 0.7,
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: '12px',
            }}
          >
            {actions.map(action => {
              const key = actionLetterMap[action];
              const color = actionColorMap[key];
              return (
                <Box
                  key={action}
                  sx={{
                    display: 'flex',
                    width: '23.44px',
                    height: '24px',
                    padding: '4px 7.44px 4px 8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    flexShrink: 0,
                    borderRadius: '4px',
                    backgroundColor: color?.bg || '#FFF',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'Open Sans',
                      fontSize: '12px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '16px',
                      color: color?.text || '#111827',
                    }}
                  >
                    {key}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Manage',
      flex: 0,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <>
          <IconButton
            onClick={e => {
              setAnchorEl(e.currentTarget);
              setMenuRoleId(params.row.id);
            }}
            size="small"
          >
            <MoreHorizontal sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={commonCellStyle}>
            {params.row.id && renderprivilegeMenu(params.row.id)}{' '}
          </Typography>
        </>
      ),
    },
  ];

  const privilegeAssignmentsColumns = [
    {
      field: 'Role',
      headerName: 'Role',
      flex: 0.5,
      renderCell: (params: any) => {
        const roleName = params.value?.split('/')[1];
        return <Typography sx={commonCellStyle}>{roleName}</Typography>;
      },
    },
    {
      field: 'Permission',
      headerName: 'Privilege',
      flex: 1,
      renderCell: (params: any) => {
        const fullPrivilege = params.value || '';
        const privilegeName =
          fullPrivilege?.split('Permission/')[1] || fullPrivilege;

        return <Typography sx={commonCellStyle}>{privilegeName}</Typography>;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <>
          <IconButton
            onClick={e => {
              setAnchorEl(e.currentTarget);
              setMenuRoleId(params.row.id);
            }}
            size="small"
          >
            <MoreHorizontal sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={commonCellStyle}>
            {params.row.id && renderPrivilegeAssignmentMenu(params.row)}{' '}
          </Typography>
        </>
      ),
    },
  ];

  const renderprivilegeMenu = (id: string) => (
    <StyledMenu
      anchorEl={anchorEl}
      open={menuRoleId === id}
      onClose={() => setMenuRoleId(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <StyledMenuItem
        onClick={() => {
          const privilege = privileges.find(r => r.id === id);
          if (privilege) {
            handleEditPrivilege(privilege);
          }
          setMenuRoleId(null);
        }}
      >
        <Pencil sx={{ mr: 1, fontSize: 18 }} />
        Edit
      </StyledMenuItem>
      <StyledMenuItem
        onClick={() => {
          handleDeletePrivilege(id);
          setMenuRoleId(null);
        }}
      >
        <Trash2 sx={{ mr: 1, fontSize: 18 }} />
        Delete
      </StyledMenuItem>
    </StyledMenu>
  );
  const renderPrivilegeAssignmentMenu = (row: any) => (
    <StyledMenu
      anchorEl={anchorEl}
      open={menuRoleId === row.id}
      onClose={() => setMenuRoleId(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <StyledMenuItem
        onClick={() => {
          const assignment = privilegeAssignments.find(
            (r: any) => r.Role === row.Role && r.Permission === row.Permission
          );
          if (assignment) {
            handleEditPrivilegeAssignments(assignment);
          }
          setMenuRoleId(null);
        }}
      >
        <Pencil sx={{ mr: 1, fontSize: 18 }} />
        Edit
      </StyledMenuItem>
      <StyledMenuItem
        onClick={() => {
          handleDeletePrivilegeAssignment(row.Role, row.Permission);
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
          data={data}
          onAdd={handleAddNewRole}
          onEdit={handleEditRole}
          onDelete={handleDeleteRole}
          menuId={menuRoleId}
          setMenuId={setMenuRoleId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel="Add Role"
          columns={rolesColumns}
          renderMenu={renderRoleMenu}
          apiRef={apiRef}
          loading={loading}
        />
      )}
      {tab === 'role-assignments' && (
        <AccessTable
          title="Role Assignments"
          data={data}
          onAdd={handleAddNewRoleAssignment}
          onEdit={handleEditRoleAssignment}
          onDelete={(id: string) => {
            const assignment = roleAssignments.find(
              (r: any) => r.__path__ === id
            );
            if (assignment) {
              handleDeleteRoleAssignment(assignment.User, assignment.Role);
            }
          }}
          menuId={menuRoleId}
          setMenuId={setMenuRoleId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel="Assign Role"
          renderMenu={renderAssignmentMenu}
          columns={roleAssignmentColumns}
          apiRef={apiRef}
          loading={loading}
        />
      )}
      {tab === 'privilege-management' && (
        <AccessTable
          title="Privilege Management"
          data={data}
          onAdd={handleAddNewPrivilege}
          onEdit={handleEditPrivilege}
          onDelete={handleDeletePrivilege}
          menuId={menuRoleId}
          setMenuId={setMenuRoleId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel="Add Privilege"
          renderMenu={renderprivilegeMenu}
          columns={privilegesColumns}
          apiRef={apiRef}
          loading={loading}
        />
      )}
      {tab === 'privilege-assignments' && (
        <AccessTable
          title="Current Privilege Assignments"
          data={data}
          onAdd={handleAddNewPrivilegeAssignment}
          onEdit={handleEditPrivilegeAssignments}
          onDelete={(row: any) => {
            handleDeletePrivilegeAssignment(row.Role, row.Permission);
          }}
          menuId={menuRoleId}
          setMenuId={setMenuRoleId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel="Assign Privilege"
          renderMenu={renderPrivilegeAssignmentMenu}
          columns={privilegeAssignmentsColumns}
          apiRef={apiRef}
          loading={loading}
        />
      )}

      <ConfirmDialog
        open={isDialogOpen}
        onCancel={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Alert"
      >
        Are you sure you want to delete{' '}
        {tab === 'role-management' && deletingRole
          ? `the Role "${deletingRole.replace('agentlang.auth$Role/', '')}"`
          : tab === 'role-assignments' && deletingAssignment
            ? `Role Assignment of "${getUserDisplayName(deletingAssignment.User, user)}"
         with Role "${deletingAssignment.Role.replace('agentlang.auth$Role/', '')}"`
            : tab === 'privilege-management' && deletingRole
              ? `the Privilege "${deletingRole}"`
              : tab === 'privilege-assignments' && deletingPrivilegeAssignment
                ? `Privilege Assignment of Role "${deletingPrivilegeAssignment.Role.replace('agentlang.auth$Role/', '')}" 
             for Privilege "${deletingPrivilegeAssignment.Permission.replace('agentlang.auth$Permission/', '')}"`
                : `this item`}
        ?
      </ConfirmDialog>
    </div>
  );
}
