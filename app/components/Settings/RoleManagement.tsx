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
import {
  DELETE_PRIVILEGE,
  DELETE_PRIVILEGEASSIGNMENT,
  DELETE_ROLE,
  DELETE_ROLESASSIGNMENT,
  FETCH_PRIVILEGEASSIGNMENTS,
  FETCH_PRIVILEGES,
  FETCH_ROLES,
  FETCH_ROLESASSIGNMENTS,
  GET_META,
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
import EllipsisNameCell from '../ResourceAllocation/component/EllipsisNameCell';
import AssignRolesTable from './AssignRolesTable';
import PrivilegeTable from './PrivilegeTable';
import AssignPrivilegeTable from './AssignPrivilegeTable';
import RolesTable from './RolesTable';
import { ACCESS_MANAGEMENT_VALID_TABS } from '@/app/constants/constants';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';

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
    entity: 'Role',
  },
  {
    label: 'Role Management',
    value: 'role-management',
    icon: '/images/icons/roleManage.svg',
    entity: 'Role',
  },
  {
    label: 'Privilege Assignments',
    value: 'privilege-assignments',
    icon: '/images/icons/privilegeAssign.svg',
    entity: 'Permission',
  },
  {
    label: 'Privilege Management',
    value: 'privilege-management',
    icon: '/images/icons/privilegeManage.svg',
    entity: 'Permission',
  },
];

interface RoleManagementPageProps {
  permissions?: Record<string, CrudPermissions>;
  loadingPermissions?: boolean;
}

function RoleManagementPage({
  permissions,
  loadingPermissions,
}: RoleManagementPageProps) {
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
  const rolesLoading = useSelector((state: any) => state.rbac.rolesLoading);
  const roleAssignmentsLoading = useSelector(
    (state: any) => state.rbac.roleAssignmentsLoading
  );
  const privilegesLoading = useSelector(
    (state: any) => state.rbac.privilegesLoading
  );
  const privilegeAssignmentsLoading = useSelector(
    (state: any) => state.rbac.privilegeAssignmentsLoading
  );
  const { id: highlightedRowId } = useSelector(
    (state: any) => state.highlightedRow
  );
  const apiRef = useGridApiRef();
  const router = useRouter();
  const searchParams = useSearchParams();
  const meta = useSelector((state: any) => state.rbac.meta);

  useEffect(() => {
    if (!meta) {
      dispatch({ type: GET_META });
    }
  }, [dispatch, meta]);

  useEffect(() => {
    if (loadingPermissions) return;
    const accessMap = [
      { key: 'Role', value: 'role-assignments' },
      { key: 'Role', value: 'role-management' },
      { key: 'Permission', value: 'privilege-assignments' },
      { key: 'Permission', value: 'privilege-management' },
    ];

    const accessible = accessMap.filter(({ key }) => permissions![key]?.r);

    if (accessible.length === 0) {
      router.replace('/settings?menu=user-profile');
      return;
    }

    const tabParam = searchParams.get('tab');
    const firstAccessible = accessible[0].value;
    const isAccessible = accessible.some(({ value }) => value === tabParam);

    if (
      !tabParam ||
      !ACCESS_MANAGEMENT_VALID_TABS.includes(tab) ||
      !isAccessible
    ) {
      router.replace(`${baseURLAccessManagement}&tab=${firstAccessible}`);
      return;
    }

    if (tabParam !== tab) {
      setTab(tabParam);
    }
  }, [searchParams, loadingPermissions]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ACCESS_MANAGEMENT_VALID_TABS.includes(tabParam)) {
      setTab(tabParam);
    }
  }, [searchParams]);

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
  }, [tab]);

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
  }, [highlightedRowId, roles, roleAssignments]);

  const handleAddNewRole = () => {
    dispatch(
      openDialog({
        title: 'Add Role',
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

  const handleEditRoleAssignment = (
    row: RoleAssignment,
    title = 'Edit Role Assignment',
    dialogOptions = {}
  ) => {
    const roleName = row.Role?.split('/')[1] || row.Role;
    const userId = row.User?.split('/')[1] || row.User;
    dispatch(
      openDialog({
        title: title,
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'edit_role_assignment',
        initialData: { ...row, Role: roleName, User: userId },
        ...dialogOptions,
      })
    );
  };

  const handleAddNewPrivilege = () => {
    dispatch(
      openDialog({
        title: 'Add Privilege',
        submitButtonText: 'Create Privilege',
        cancelButtonText: 'Cancel',
        formType: 'add_privilege',
      })
    );
  };
  const handleEditPrivilege = (
    privilege: Privilege,
    title = 'Edit Privilege',
    dialogOptions = {}
  ) => {
    dispatch(
      openDialog({
        title: title,
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'edit_privilege',
        initialData: privilege,
        ...dialogOptions,
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
    row: PrivilegeAssignment,
    title = 'Edit Privilege Assignment',
    dialogOptions = {}
  ) => {
    const roleName = row.Role;
    const permissionName = row.Permission;
    dispatch(
      openDialog({
        title: title,
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'edit_privilege_assignment',
        initialData: { ...row, Role: roleName, Permission: permissionName },
        ...dialogOptions,
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
    ...(permissions!['Role'].d
      ? [
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
                    setMenuRoleId(params.row.id);
                  }}
                  size="small"
                >
                  <MoreHorizontal sx={{ fontSize: 20 }} />
                </IconButton>
                <Typography sx={commonCellStyle}>
                  {params.row.id && renderRoleMenu(params.row.id)}
                </Typography>
              </>
            ),
          },
        ]
      : []),
  ];

  const renderRoleMenu = (id: string) => (
    <StyledMenu
      anchorEl={anchorEl}
      open={menuRoleId === id}
      onClose={() => setMenuRoleId(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {/* <StyledMenuItem
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
      </StyledMenuItem> */}
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
        const handleNameClick = () => {
          if (permissions!['Role'].u) {
            handleEditRoleAssignment(params.row);
          } else {
            handleEditRoleAssignment(params.row, `Role Assignment: ${role}`, {
              readOnly: true,
            });
          }
        };
        return (
          <Box
            onClick={handleNameClick}
            sx={{
              ...commonCellStyle,
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <EllipsisNameCell value={role} showAvatar={false} />
          </Box>
        );
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
    ...(permissions!['Role'].u || permissions!['Role'].d
      ? [
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
        ]
      : []),
  ];

  const renderAssignmentMenu = (row: any) => (
    <StyledMenu
      anchorEl={anchorEl}
      open={menuRoleId === row.id}
      onClose={() => setMenuRoleId(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {permissions!['Role'].u && (
        <StyledMenuItem
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
      )}
      {permissions!['Role'].d && (
        <StyledMenuItem
          onClick={() => {
            handleDeleteRoleAssignment(row.User, row.Role);
            setMenuRoleId(null);
          }}
        >
          <Trash2 sx={{ mr: 1, fontSize: 18 }} />
          Delete
        </StyledMenuItem>
      )}
    </StyledMenu>
  );

  const privilegesColumns = [
    {
      field: 'id',
      headerName: 'Privilege Name',
      flex: 1.5,
      renderCell: (params: any) => {
        const handleNameClick = () => {
          if (permissions!['Permission'].u) {
            handleEditPrivilege(params.row);
          } else {
            handleEditPrivilege(params.row, `Privilege: ${params.value}`, {
              readOnly: true,
            });
          }
        };
        return (
          <Box
            onClick={handleNameClick}
            sx={{
              ...commonCellStyle,
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <EllipsisNameCell value={params.value} showAvatar={false} />
          </Box>
        );
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
      headerName: 'Manage',
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
    ...(permissions!['Permission'].u || permissions!['Permission'].d
      ? [
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
                  {params.row.id && renderprivilegeMenu(params.row.id)}{' '}
                </Typography>
              </>
            ),
          },
        ]
      : []),
  ];

  const privilegeAssignmentsColumns = [
    {
      field: 'Role',
      headerName: 'Role',
      flex: 0.5,
      renderCell: (params: any) => {
        const roleName = params.value?.split('/')[1];
        const handleNameClick = () => {
          if (permissions!['Permission'].u) {
            handleEditPrivilegeAssignments(params.row);
          } else {
            handleEditPrivilegeAssignments(
              params.row,
              `Privilege Assignment: ${roleName}`,
              {
                readOnly: true,
              }
            );
          }
        };
        return (
          <Box
            onClick={handleNameClick}
            sx={{
              ...commonCellStyle,
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <EllipsisNameCell value={roleName} showAvatar={false} />
          </Box>
        );
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
    ...(permissions!['Permission'].u || permissions!['Permission'].d
      ? [
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
                  {params.row.id &&
                    renderPrivilegeAssignmentMenu(params.row)}{' '}
                </Typography>
              </>
            ),
          },
        ]
      : []),
  ];

  const renderprivilegeMenu = (id: string) => (
    <StyledMenu
      anchorEl={anchorEl}
      open={menuRoleId === id}
      onClose={() => setMenuRoleId(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {permissions!['Permission'].u && (
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
      )}
      {permissions!['Permission'].d && (
        <StyledMenuItem
          onClick={() => {
            handleDeletePrivilege(id);
            setMenuRoleId(null);
          }}
        >
          <Trash2 sx={{ mr: 1, fontSize: 18 }} />
          Delete
        </StyledMenuItem>
      )}
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
      {permissions!['Permission'].u && (
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
      )}
      {permissions!['Permission'].d && (
        <StyledMenuItem
          onClick={() => {
            handleDeletePrivilegeAssignment(row.Role, row.Permission);
            setMenuRoleId(null);
          }}
        >
          <Trash2 sx={{ mr: 1, fontSize: 18 }} />
          Delete
        </StyledMenuItem>
      )}
    </StyledMenu>
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
    const tabParam = `tab=${newValue}`;
    const newUrl = `${baseURLAccessManagement}&${tabParam}`;
    router.replace(newUrl, { scroll: false });
  };

  const TabHeader = ({ tab }: { tab: string }) => (
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
        onChange={handleTabChange}
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
        {tabConfig
          .filter(tab => permissions![tab.entity].r)
          .map(({ label, value, icon }) => (
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

  return (
    <div
      className="bg-[#f8f9fa] p-8"
      style={{
        minHeight: '-webkit-fill-available',
        fontFamily: 'open sans',
        padding: '1.5%',
        backgroundColor: 'rgba(217, 217, 217, 0.27)',
      }}
    >
      <TabHeader tab={tab} />

      {tab === 'role-management' && (
        <RolesTable
          title="Role Management"
          data={permissions!['Role'].r ? data : []}
          onAdd={handleAddNewRole}
          onEdit={handleEditRole}
          onDelete={handleDeleteRole}
          menuId={menuRoleId}
          setMenuId={setMenuRoleId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel={permissions!['Role'].c ? 'Add Role' : ''}
          columns={rolesColumns}
          renderMenu={renderRoleMenu}
          apiRef={apiRef}
          loading={rolesLoading || loadingPermissions}
        />
      )}
      {tab === 'role-assignments' && (
        <AssignRolesTable
          title="Role Assignments"
          data={permissions!['Role'].r ? data : []}
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
          buttonLabel={permissions!['Role'].c ? 'Assign Role' : ''}
          renderMenu={renderAssignmentMenu}
          columns={roleAssignmentColumns}
          apiRef={apiRef}
          loading={roleAssignmentsLoading || loadingPermissions}
        />
      )}
      {tab === 'privilege-management' && (
        <PrivilegeTable
          title="Privilege Management"
          data={permissions!['Permission'].r ? data : []}
          onAdd={handleAddNewPrivilege}
          onEdit={handleEditPrivilege}
          onDelete={handleDeletePrivilege}
          menuId={menuRoleId}
          setMenuId={setMenuRoleId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel={permissions!['Permission'].c ? 'Add Privilege' : ''}
          renderMenu={renderprivilegeMenu}
          columns={privilegesColumns}
          apiRef={apiRef}
          loading={privilegesLoading || loadingPermissions}
        />
      )}
      {tab === 'privilege-assignments' && (
        <AssignPrivilegeTable
          title="Current Privilege Assignments"
          data={permissions!['Permission'].r ? data : []}
          onAdd={handleAddNewPrivilegeAssignment}
          onEdit={handleEditPrivilegeAssignments}
          onDelete={(row: any) => {
            handleDeletePrivilegeAssignment(row.Role, row.Permission);
          }}
          menuId={menuRoleId}
          setMenuId={setMenuRoleId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel={permissions!['Permission'].c ? 'Assign Privilege' : ''}
          renderMenu={renderPrivilegeAssignmentMenu}
          columns={privilegeAssignmentsColumns}
          apiRef={apiRef}
          loading={privilegeAssignmentsLoading || loadingPermissions}
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

export default withRBAC(RoleManagementPage, ['Role', 'Permission']);
