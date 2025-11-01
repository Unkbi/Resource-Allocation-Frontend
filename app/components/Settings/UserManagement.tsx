'use client';

import { useEffect, useState, useMemo } from 'react';
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
  Button,
} from '@mui/material';
import {
  MoreVert as MoreHorizontal,
  Edit as Pencil,
  Delete as Trash2,
  Mail as MailIcon,
  PersonAdd as PersonAddIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import AccessTable from './AccessTable';
import { clearHighlightedRowId } from '@/app/redux/reducers/highlightedRowReducer';
import { useGridApiRef } from '@mui/x-data-grid-premium';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { StatusPill, commonTabSx } from './styled';
import { sendInvite } from '@/app/services/userManagementServices';
import { showToast } from '@/app/redux/reducers/toastReducer';

const tabMenuNames = ['users', 'resources'];
const baseURLAccessManagement = '/settings?menu=user-management';
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
    label: 'Users',
    value: 'users',
    icon: '/images/icons/UserIcon.svg',
  },
  {
    label: 'Resources',
    value: 'resources',
    icon: '/images/icons/ResourcesIcon.svg',
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

export default function UserManagementPage() {
  const dispatch = useDispatch();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tab, setTab] = useState('users');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);
  const [deletingUsers, setDeletingUsers] = useState<string | null>(null);
  const [deletingResources, setDeletingResources] = useState<string | null>(
    null
  );
  const [deactivatingUser, setDeactivatingUser] = useState<any>(null);
  const [reactivatingUser, setReactivatingUser] = useState<any>(null);
  const [deactivatingResource, setDeactivatingResource] = useState<any>(null);
  const [reactivatingResource, setReactivatingResource] = useState<any>(null);
  const [actionType, setActionType] = useState<
    'delete' | 'deactivate' | 'reactivate'
  >('delete');
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  const UsersData = useMemo(() => [
    {
      id: 'u1',
      Name: 'Emily Carter',
      email: 'jane.doe@company.com',
      resourceLink: 'Active',
      status: 'Active',
    },
    {
      id: 'u2',
      Name: 'Rajesh Kumar',
      email: 'rajesh.kumar@company.com',
      resourceLink: 'Active',
      status: 'Inactive',
    },
    {
      id: 'u3',
      Name: 'Samantha Lee',
      email: 'samantha.lee@company.com',
      resourceLink: 'NA',
      status: 'Invited',
    },
    {
      id: 'u4',
      Name: 'Michael Thompson',
      email: 'michael.thompson@company.com',
      resourceLink: 'Active',
      status: 'Invited',
    },
    {
      id: 'u5',
      Name: 'Jessica Taylor',
      email: 'jessica.taylor@company.com',
      resourceLink: 'NA',
      status: 'Inactive',
    },
  ], []);

  const ResourcesData: any[] = [
    {
      id: 'r1',
      Name: 'Emily Carter',
      email: 'jane.doe@company.com',
      accessLevel: 'Admin',
      location: 'Los Angeles, USA',
      resourceStatus: 'Active',
      userStatus: 'Active',
    },
    {
      id: 'r2',
      Name: 'Rajesh Kumar',
      email: 'rajesh.kumar@company.com',
      accessLevel: 'Allocation Manager',
      location: 'Chicago, USA',
      resourceStatus: 'Active',
      userStatus: 'Not Created',
    },
    {
      id: 'r3',
      Name: 'Samantha Lee',
      email: 'samantha.lee@company.com',
      accessLevel: 'Allocation Manager',
      location: 'Chicago, USA',
      resourceStatus: 'Active',
      userStatus: 'Not Created',
    },
    {
      id: 'r4',
      Name: 'Michael Thompson',
      email: 'michael.thompson@company.com',
      accessLevel: 'General User',
      location: 'Chicago, USA',
      resourceStatus: 'Active',
      userStatus: 'Invited',
    },
    {
      id: 'r5',
      Name: 'Jessica Taylor',
      email: 'jessica.taylor@company.com',
      accessLevel: 'Allocation Manager',
      location: 'Chicago, USA',
      resourceStatus: 'Active',
      userStatus: 'Inactive',
    },
  ];
  const loading = false;
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
  }, [searchParams]);

  useEffect(() => {
    // Always ensure URL has the tab parameter
    const currentTabParam = searchParams.get('tab');
    if (currentTabParam !== tab && tabMenuNames.includes(tab)) {
      const newUrl = `${baseURLAccessManagement}&tab=${tab}`;
      router.replace(newUrl);
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

          const focusColumn = tab === 'users' ? 'Name' : 'resource';

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
  }, [highlightedRowId, UsersData, tab]);

  const handleAddNewResources = () => {
    dispatch(
      openDialog({
        title: 'Add Resource',
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'add_resource',
      })
    );
  };

  const handleEditResources = (assignment: any) => {
    dispatch(
      openDialog({
        title: 'Edit Resource',
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'edit_resource_to_user',
        initialData: assignment,
      })
    );
  };

  const handleDeleteResources = (Name: string) => {
    setDeletingResources(Name);
    setIsDialogOpen(true);
  };

  const handleAddNewUsers = () => {
    dispatch(
      openDialog({
        title: 'Invite User',
        submitButtonText: 'Invite',
        cancelButtonText: 'Cancel',
        formType: 'add_user',
      })
    );
  };

  const handleEditUser = (assignment: any) => {
    dispatch(
      openDialog({
        title: 'Edit User',
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'edit_user',
        initialData: assignment,
      })
    );
  };

  const handleDeleteUser = (Name: string) => {
    setDeletingUsers(Name);
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (actionType === 'delete') {
        if (tab === 'users' && deletingUsers) {
          // Add actual delete user API call here
        } else if (tab === 'resources' && deletingResources) {
          // Add actual delete resource API call here
        }
      } else if (actionType === 'deactivate') {
        if (tab === 'users' && deactivatingUser) {
          // Add actual deactivate user API call here
          // Example: await deactivateUsersAPI(deactivatingUser.map(user => user.id));
        } else if (tab === 'resources' && deactivatingResource) {
          // Add actual deactivate resource API call here
          // Example: await deactivateResourcesAPI(deactivatingResource.map(resource => resource.id));
        }
      } else if (actionType === 'reactivate') {
        if (tab === 'users' && reactivatingUser) {
          // Add actual reactivate user API call here
          // Example: await reactivateUsersAPI(reactivatingUser.map(user => user.id));
        } else if (tab === 'resources' && reactivatingResource) {
          // Add actual reactivate resource API call here
          // Example: await reactivateResourcesAPI(reactivatingResource.map(resource => resource.id));
        }
      }
    } catch (error) {
      console.error(`${actionType} failed:`, error);
    } finally {
      // Reset all state variables
      setDeletingUsers(null);
      setDeletingResources(null);
      setDeactivatingUser(null);
      setReactivatingUser(null);
      setDeactivatingResource(null);
      setReactivatingResource(null);
      setActionType('delete');
      setIsDialogOpen(false);
    }
  };

  const handleAddUser = (rowOrRows: any) => {
    dispatch(
      openDialog({
        title: 'Invite User',
        submitButtonText: 'Invite',
        cancelButtonText: 'Cancel',
        formType: 'add_resource_to_user',
        initialData: rowOrRows,
      })
    );
  };

  const handleSendInvite = async (rowOrRows: any) => {
    try {
      rowOrRows = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows];
      await Promise.all(rowOrRows.map(async (row: any) => {
        const [firstName, lastName] = row.Name.split(' ') || [];
        const postData = {
          email: row.email,
          firstName: firstName,
          lastName: lastName
        };
        await sendInvite(postData);
      }));
      dispatch(
        showToast({
          open: true,
          message: `User invitation sent successfully`,
          type: 'success',
          position: 'bottom-left',
          autoHideTimer: 4000,
        })
      );
    } catch (error) {
      console.error('Error sending invite:', error);
      dispatch(
        showToast({
          open: true,
          message: `Failed to send user invitation`,
          type: 'error',
          position: 'bottom-left',
          autoHideTimer: 4000,
        })
      );
    }
  };

  const handleResendInvite = async (rowOrRows: any) => {
    handleSendInvite(rowOrRows);
  };

  const handleDeactivateUser = (rowOrRows: any) => {
    if (Array.isArray(rowOrRows)) {
      setDeactivatingUser(rowOrRows);
    } else {
      setDeactivatingUser([rowOrRows]);
    }
    setActionType('deactivate');
    setIsDialogOpen(true);
  };

  const handleReactivateUser = (rowOrRows: any) => {
    if (Array.isArray(rowOrRows)) {
      setReactivatingUser(rowOrRows);
    } else {
      setReactivatingUser([rowOrRows]);
    }
    setActionType('reactivate');
    setIsDialogOpen(true);
  };

  const handleBulkAddUser = (rows: any[]) => {
    handleAddUser(rows);
  };

  const handleBulkSendInvite = (rows: any[]) => {
    handleSendInvite(rows);
  };

  const handleBulkResendInvite = (rows: any[]) => {
    handleResendInvite(rows);
  };

  const handleBulkDeactivateUser = (rows: any[]) => {
    if (tab === 'users') {
      setDeactivatingUser(rows);
    } else if (tab === 'resources') {
      setDeactivatingResource(rows);
    }
    setActionType('deactivate');
    setIsDialogOpen(true);
  };

  const handleBulkReactivateUser = (rows: any[]) => {
    if (tab === 'users') {
      setReactivatingUser(rows);
    } else if (tab === 'resources') {
      setReactivatingResource(rows);
    }
    setActionType('reactivate');
    setIsDialogOpen(true);
  };

  // Handle selection changes from AccessTable
  const handleSelectionChange = (
    hasSelection: boolean,
    selectedIds: Set<string>
  ) => {
    setSelectedRowIds(selectedIds);
  };

  const UsersPageColumns = [
    {
      field: 'Name',
      headerName: 'User',
      flex: 1,
      renderCell: (params: any) => (
        <Typography
          onClick={() => handleEditUser(params.row)}
          sx={{
            ...commonCellStyle,
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'email',
      headerName: 'Email ID',
      flex: 2,
      renderCell: (params: any) => (
        <Typography sx={{ ...commonCellStyle }}>{params.value}</Typography>
      ),
    },
    {
      field: 'resourceLink',
      headerName: 'Resource Link',
      flex: 1,
      renderCell: (params: any) => (
        <Typography sx={commonCellStyle}>{params.value}</Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params: any) => (
        <StatusPill status={params.value}>{params.value}</StatusPill>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => {
        const rowId = String(
          params.row.id ?? params.row.Name ?? JSON.stringify(params.row)
        );
        const isThisRowSelected = selectedRowIds.has(rowId);

        return (
          <Box sx={{ ...commonCellStyle }}>
            <IconButton
              onClick={(e) => {
                setAnchorEl(e.currentTarget);
                setMenuUserId(params.row.Name);
              }}
              disabled={isThisRowSelected}
              sx={{
                color: isThisRowSelected ? '#D1D5DB' : '#1C2D5F',
              }}
            >
              <MoreHorizontal sx={{ fontSize: 20 }} />
            </IconButton>
            {renderUsersMenu(params.row.Name, params.row)}
          </Box>
        );
      },
    },
  ];

  const ResourcesColumns = [
    {
      field: 'Name',
      headerName: 'Resource',
      flex: 1,
      renderCell: (params: any) => (
        <Typography
          onClick={() => handleEditResources([params.row])}
          sx={{
            ...commonCellStyle,
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'email',
      headerName: 'Email ID',
      flex: 1,
      renderCell: (params: any) => (
        <Typography sx={{ ...commonCellStyle }}>{params.value}</Typography>
      ),
    },
    {
      field: 'accessLevel',
      headerName: 'Access Level',
      flex: 1,
      renderCell: (params: any) => (
        <Typography sx={commonCellStyle}>{params.value}</Typography>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      renderCell: (params: any) => (
        <Typography sx={commonCellStyle}>{params.value}</Typography>
      ),
    },
    {
      field: 'resourceStatus',
      headerName: 'Resource Status',
      flex: 1,
      renderCell: (params: any) => (
        <Typography sx={commonCellStyle}>{params.value}</Typography>
      ),
    },
    {
      field: 'userStatus',
      headerName: 'User Status',
      flex: 1,
      renderCell: (params: any) => (
        <StatusPill status={params.value}>{params.value}</StatusPill>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => {
        const rowId = String(
          params.row.id ?? params.row.Name ?? JSON.stringify(params.row)
        );
        const isThisRowSelected = selectedRowIds.has(rowId);

        return (
          <Box sx={{ ...commonCellStyle }}>
            <IconButton
              onClick={(e) => {
                setAnchorEl(e.currentTarget);
                setMenuUserId(params.row.Name);
              }}
              disabled={isThisRowSelected}
              sx={{
                color: isThisRowSelected ? '#D1D5DB' : '#1C2D5F',
              }}
            >
              <MoreHorizontal sx={{ fontSize: 20 }} />
            </IconButton>
            {renderResourcesMenu(params.row.Name, params.row)}
          </Box>
        );
      },
    },
  ];

  const renderUsersMenu = (id: string, row: any) => {
    const status = row.status;
    const enableSendInvite = status === 'Not Created';
    const enableResendInvite = status === 'Invited';
    const enableDeactivate = ['Invited', 'Active'].includes(status);
    const enableReactivate = status === 'Inactive';

    return (
      <StyledMenu
        anchorEl={anchorEl}
        open={menuUserId === id}
        onClose={() => setMenuUserId(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <StyledMenuItem
          onClick={() => {
            const user = UsersData.find(r => r.Name === id);
            if (user) {
              handleEditUser(user);
            }
            setMenuUserId(null);
          }}
        >
          <Pencil sx={{ mr: 1, fontSize: 18 }} />
          Edit
        </StyledMenuItem>

        {enableSendInvite && (
          <StyledMenuItem
            onClick={() => {
              handleSendInvite(row);
              setMenuUserId(null);
            }}
          >
            <MailIcon sx={{ mr: 1, fontSize: 18 }} />
            Invite
          </StyledMenuItem>
        )}

        {enableResendInvite && (
          <StyledMenuItem
            onClick={() => {
              handleResendInvite(row);
              setMenuUserId(null);
            }}
          >
            <MailIcon sx={{ mr: 1, fontSize: 18 }} />
            Re-invite
          </StyledMenuItem>
        )}

        {enableDeactivate && (
          <StyledMenuItem
            onClick={() => {
              handleDeactivateUser(row);
              setMenuUserId(null);
            }}
          >
            <BlockIcon sx={{ mr: 1, fontSize: 18 }} />
            Deactivate
          </StyledMenuItem>
        )}

        {enableReactivate && (
          <StyledMenuItem
            onClick={() => {
              handleReactivateUser(row);
              setMenuUserId(null);
            }}
          >
            <CheckCircleIcon sx={{ mr: 1, fontSize: 18 }} />
            Re-activate
          </StyledMenuItem>
        )}

        <StyledMenuItem
          onClick={() => {
            handleDeleteUser(id);
            setMenuUserId(null);
          }}
        >
          <Trash2 sx={{ mr: 1, fontSize: 18 }} />
          Delete
        </StyledMenuItem>
      </StyledMenu>
    );
  };

  const renderResourcesMenu = (id: string, row: any) => {
    const status = row.userStatus;
    // const enableAddUser = status === 'Not Created';
    const enableSendInvite = status === 'Not Created';
    const enableResendInvite = status === 'Invited';
    const enableDeactivate = ['Invited', 'Active'].includes(status);
    const enableReactivate = status === 'Inactive';

    return (
      <StyledMenu
        anchorEl={anchorEl}
        open={menuUserId === id}
        onClose={() => setMenuUserId(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {/* <StyledMenuItem
          onClick={() => {
            const resource = ResourcesData.find(r => r.Name === id);
            if (resource) {
              handleEditResources(resource);
            }
            setMenuUserId(null);
          }}
        >
          <Pencil sx={{ mr: 1, fontSize: 18 }} />
          Edit
        </StyledMenuItem> */}

        {enableSendInvite && (
          <StyledMenuItem
            onClick={() => {
              handleAddUser([row]);
              setMenuUserId(null);
            }}
          >
            <PersonAddIcon sx={{ mr: 1, fontSize: 18 }} />
            Invite
          </StyledMenuItem>
        )}

        {/* {enableSendInvite && (
          <StyledMenuItem
            onClick={() => {
              handleSendInvite(row);
              setMenuUserId(null);
            }}
          >
            <MailIcon sx={{ mr: 1, fontSize: 18 }} />
            Invite
          </StyledMenuItem>
        )} */}

        {enableResendInvite && (
          <StyledMenuItem
            onClick={() => {
              handleResendInvite(row);
              setMenuUserId(null);
            }}
          >
            <MailIcon sx={{ mr: 1, fontSize: 18 }} />
            Re-invite
          </StyledMenuItem>
        )}

        {enableDeactivate && (
          <StyledMenuItem
            onClick={() => {
              handleDeactivateUser(row);
              setMenuUserId(null);
            }}
          >
            <BlockIcon sx={{ mr: 1, fontSize: 18 }} />
            Deactivate
          </StyledMenuItem>
        )}

        {enableReactivate && (
          <StyledMenuItem
            onClick={() => {
              handleReactivateUser(row);
              setMenuUserId(null);
            }}
          >
            <CheckCircleIcon sx={{ mr: 1, fontSize: 18 }} />
            Re-activate
          </StyledMenuItem>
        )}

        {/* <StyledMenuItem
          onClick={() => {
            handleDeleteResources(id);
            setMenuUserId(null);
          }}
        >
          <Trash2 sx={{ mr: 1, fontSize: 18 }} />
          Delete
        </StyledMenuItem> */}
      </StyledMenu>
    );
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
      <TabHeader tab={tab} setTab={setTab} />

      {tab === 'users' && (
        <AccessTable
          title="Users"
          data={UsersData}
          checkboxSelection={true}
          onAdd={handleAddNewUsers}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          menuId={menuUserId}
          setMenuId={setMenuUserId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel="Invite User"
          renderMenu={() => null}
          columns={UsersPageColumns}
          apiRef={apiRef}
          loading={loading}
          setMode={() => setTab('resources')}
          selectedRowIds={selectedRowIds}
          onSelectionChange={handleSelectionChange}
          onBulkSendInvite={handleBulkSendInvite}
          onBulkResendInvite={handleBulkResendInvite}
          onBulkDeactivateUser={handleBulkDeactivateUser}
          onBulkReactivateUser={handleBulkReactivateUser}
        />
      )}
      {tab === 'resources' && (
        <AccessTable
          title="Resources"
          data={ResourcesData}
          checkboxSelection={true}
          onAdd={handleAddNewResources}
          onEdit={handleEditResources}
          onDelete={handleDeleteResources}
          menuId={menuUserId}
          setMenuId={setMenuUserId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel="Add Resource"
          renderMenu={() => null}
          columns={ResourcesColumns}
          apiRef={apiRef}
          loading={loading}
          onBulkAddUser={handleBulkAddUser}
          onBulkSendInvite={handleBulkSendInvite}
          onBulkResendInvite={handleBulkResendInvite}
          onBulkDeactivateUser={handleBulkDeactivateUser}
          onBulkReactivateUser={handleBulkReactivateUser}
          selectedRowIds={selectedRowIds}
          onSelectionChange={handleSelectionChange}
        />
      )}

      <ConfirmDialog
        open={isDialogOpen}
        onCancel={() => {
          setIsDialogOpen(false);
          setDeletingUsers(null);
          setDeletingResources(null);
          setDeactivatingUser(null);
          setReactivatingUser(null);
          setDeactivatingResource(null);
          setReactivatingResource(null);
          setActionType('delete');
        }}
        onConfirm={handleConfirmAction}
        title="Alert"
      >
        {actionType === 'delete' && (
          <>
            Are you sure you want to delete{' '}
            {deletingUsers || deletingResources
              ? tab === 'users'
                ? `the user "${deletingUsers}"`
                : `resource "${deletingResources}"`
              : 'this item'}
            ?
          </>
        )}
        {actionType === 'deactivate' && (
          <>
            Are you sure you want to deactivate{' '}
            {deactivatingUser || deactivatingResource
              ? tab === 'users'
                ? `${deactivatingUser?.length === 1 ? `"${deactivatingUser[0]?.Name}"` : `${deactivatingUser?.map((u: any) => u.Name).join(', ')}`}`
                : `${deactivatingResource?.length === 1 ? `"${deactivatingResource[0]?.Name}"` : `${deactivatingResource?.map((r: any) => r.Name).join(', ')}`}`
              : 'this item'}
            ?
          </>
        )}
        {actionType === 'reactivate' && (
          <>
            Are you sure you want to reactivate{' '}
            {reactivatingUser || reactivatingResource
              ? tab === 'users'
                ? `${reactivatingUser?.length === 1 ? `"${reactivatingUser[0]?.Name}"` : `${reactivatingUser?.map((u: any) => u.Name).join(', ')}`}`
                : `${reactivatingResource?.length === 1 ? `"${reactivatingResource[0]?.Name}"` : ` ${reactivatingResource?.map((r: any) => r.Name).join(', ')}`}`
              : 'this item'}
            ?
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}
