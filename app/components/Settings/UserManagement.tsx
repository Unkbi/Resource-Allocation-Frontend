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
import {
  SEND_INVITATION,
  FETCH_USER,
  DEACTIVATE_USER,
  ACTIVATE_USER,
  FETCH_USER_RESOURCE,
  RESEND_INVITATION,
  DELETE_USER,
  FETCH_LOCATION,
} from '@/app/redux/actions/allSettingsActions';
import { showToast } from '@/app/redux/reducers/toastReducer';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';
// @ts-ignore
import { parseISO } from 'date-fns';
import CustomAvatar from '../Avatar/CustomAvatar';
import EllipsisNameCell from '../ResourceAllocation/component/EllipsisNameCell';

const tabMenuNames = ['users', 'resources'];
const baseURLAccessManagement = '/settings?menu=user-management';
const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 4,
    boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
    width: '128px',
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

interface UserManagementPageProps {
  permissions?: Record<string, CrudPermissions>;
  loadingPermissions?: boolean;
}

function UserManagementPage({
  permissions,
  loadingPermissions,
}: UserManagementPageProps) {
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
  const { location } = useSelector((state: any) => state.allSettings);
  const usersDataFromRedux = useSelector(
    (state: any) => state.allSettings.users
  );
  const UsersData = useMemo(
    () => usersDataFromRedux || [],
    [usersDataFromRedux]
  );
  const ResourcesData =
    useSelector((state: any) => state.allSettings.userResources) || [];
  const { isOpen: dialogIsOpen } = useSelector(
    (state: any) => state.globalDialog
  );

  const loading = false;
  const { id: highlightedRowId } = useSelector(
    (state: any) => state.highlightedRow
  );
  const apiRef = useGridApiRef();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Clear checkbox selection when dialog closes
  useEffect(() => {
    if (!dialogIsOpen) {
      setSelectedRowIds(new Set());
    }
  }, [dialogIsOpen]);

  useEffect(() => {
    if (loadingPermissions || !permissions!['User']?.r) return;
    if (UsersData.length === 0) {
      dispatch({
        type: FETCH_USER,
      });
    }
  }, []);

  useEffect(() => {
    if (loadingPermissions || !permissions!['User']?.r) return;
    if (ResourcesData.length === 0) {
      dispatch({
        type: FETCH_USER_RESOURCE,
      });
    }
  }, []);

  useEffect(() => {
    if (loadingPermissions || !permissions!['User']?.r) return;
    if (location.length === 0) {
      dispatch({
        type: FETCH_LOCATION,
      });
    }
  }, []);

  useEffect(() => {
    if (loadingPermissions || !permissions!['User']?.r) return;
    const menuParam = searchParams.get('menu');
    // Only process if this is the active menu
    if (menuParam !== 'user-management') return;

    const tabParam = searchParams.get('tab');

    // If no tab parameter in URL, set the default tab
    if (!tabParam || !tabMenuNames.includes(tabParam)) {
      const newUrl = `${baseURLAccessManagement}&tab=${tab}`;
      router.replace(newUrl);
      return;
    }
    if (tabParam !== tab) {
      setTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (loadingPermissions || !permissions!['User']?.r) return;
    const menuParam = searchParams.get('menu');
    // Only process if this is the active menu
    if (menuParam !== 'user-management') return;

    // Ensure URL stays in sync with tab state
    const currentTabParam = searchParams.get('tab');
    if (currentTabParam !== tab && tabMenuNames.includes(tab)) {
      const newUrl = `${baseURLAccessManagement}&tab=${tab}`;
      router.replace(newUrl);
    }
  }, [tab]);

  useEffect(() => {
    if (loadingPermissions || !permissions!['User']?.r) return;
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
      // Helper function to show toast messages
      const showToastMessage = (message: string, type: 'success' | 'error') => {
        dispatch(
          showToast({
            open: true,
            message,
            type,
            position: 'bottom-left',
            autoHideTimer: 4000,
          })
        );
      };

      // Helper function to handle batch operations with detailed feedback
      const handleBatchOperation = async (
        items: any[],
        actionType: 'deactivate' | 'reactivate',
        entityType: 'user' | 'resource'
      ) => {
        const actionVerb =
          actionType === 'deactivate' ? 'deactivated' : 'reactivated';
        const reduxAction =
          actionType === 'deactivate' ? DEACTIVATE_USER : ACTIVATE_USER;

        const results = await Promise.allSettled(
          items.map(
            (item: any) =>
              new Promise((resolve, reject) => {
                dispatch({
                  type: reduxAction,
                  payload: {
                    userData: {
                      userId: entityType === 'user' ? item.id : item.UserId,
                    },
                    resolve,
                    reject,
                  },
                });
              })
          )
        );

        const successCount = results.filter(
          r => r.status === 'fulfilled'
        ).length;
        const failureCount = results.filter(
          r => r.status === 'rejected'
        ).length;

        if (failureCount === 0) {
          showToastMessage(
            `${entityType}(s) ${actionVerb} successfully`,
            'success'
          );
        } else if (successCount === 0) {
          showToastMessage(`Failed to ${actionType} ${entityType}(s)`, 'error');
        } else {
          showToastMessage(
            `${successCount} ${entityType}(s) ${actionVerb} successfully, ${failureCount} failed`,
            'success'
          );
        }
      };

      // Handle delete action
      if (actionType === 'delete' && tab === 'users' && deletingUsers) {
        const user = UsersData.find((user: any) => user.Name === deletingUsers);

        if (!user) {
          showToastMessage('User not found', 'error');
          return;
        }

        await new Promise((resolve, reject) => {
          dispatch({
            type: DELETE_USER,
            payload: { userId: user.id, resolve, reject },
          });
        });

        showToastMessage('User deleted successfully', 'success');
      }
      // Handle deactivate action
      else if (actionType === 'deactivate') {
        if (tab === 'users' && deactivatingUser) {
          await handleBatchOperation(deactivatingUser, 'deactivate', 'user');
        } else if (tab === 'resources' && deactivatingResource) {
          await handleBatchOperation(
            deactivatingResource,
            'deactivate',
            'resource'
          );
        }
      }
      // Handle reactivate action
      else if (actionType === 'reactivate') {
        if (tab === 'users' && reactivatingUser) {
          await handleBatchOperation(reactivatingUser, 'reactivate', 'user');
        } else if (tab === 'resources' && reactivatingResource) {
          await handleBatchOperation(
            reactivatingResource,
            'reactivate',
            'resource'
          );
        }
      }
    } catch (error) {
      console.error(`${actionType} operation failed:`, error);

      // Specific error messages based on action type
      const errorMessages: Record<typeof actionType, string> = {
        delete: 'Failed to delete user',
        deactivate: `Failed to deactivate ${tab === 'users' ? 'user(s)' : 'resource(s)'}`,
        reactivate: `Failed to reactivate ${tab === 'users' ? 'user(s)' : 'resource(s)'}`,
      };

      dispatch(
        showToast({
          open: true,
          message: errorMessages[actionType],
          type: 'error',
          position: 'bottom-left',
          autoHideTimer: 4000,
        })
      );
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

      const finaldata = rowOrRows.map(async (row: any) => {
        const [firstName, lastName] = row.Name.split(' ') || [];
        return {
          email: row.email,
          firstName: firstName,
          lastName: lastName,
          role: row.role,
        };
      });
      const userData = {
        users: [...finaldata],
      };

      await new Promise((resolve, reject) => {
        dispatch({
          type: SEND_INVITATION,
          payload: {
            userData,
            resolve,
            reject,
          },
        });
      });
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
    try {
      rowOrRows = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows];
      await Promise.all(
        rowOrRows.map(async (row: any) => {
          const postData = {
            email: row.email,
          };
          dispatch({
            type: RESEND_INVITATION,
            payload: {
              userData: postData,
            },
          });
        })
      );
      dispatch(
        showToast({
          open: true,
          message: `User invitation resent successfully`,
          type: 'success',
          position: 'bottom-left',
          autoHideTimer: 4000,
        })
      );
    } catch (error) {
      console.error('Error resending invite:', error);
      dispatch(
        showToast({
          open: true,
          message: `Failed to resend user invitation`,
          type: 'error',
          position: 'bottom-left',
          autoHideTimer: 4000,
        })
      );
    }
  };

  const handleDeactivateUser = (rowOrRows: any) => {
    if (Array.isArray(rowOrRows)) {
      tab === 'users'
        ? setDeactivatingUser(rowOrRows)
        : setDeactivatingResource(rowOrRows);
    } else {
      tab === 'users'
        ? setDeactivatingUser([rowOrRows])
        : setDeactivatingResource([rowOrRows]);
    }
    setActionType('deactivate');
    setIsDialogOpen(true);
  };

  const handleReactivateUser = (rowOrRows: any) => {
    if (Array.isArray(rowOrRows)) {
      tab === 'users'
        ? setReactivatingUser(rowOrRows)
        : setReactivatingResource(rowOrRows);
    } else {
      tab === 'users'
        ? setReactivatingUser([rowOrRows])
        : setReactivatingResource([rowOrRows]);
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
      flex: 1.75,
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
          <EllipsisNameCell value={params.value} showAvatar={false} />
        </Typography>
      ),
    },
    {
      field: 'email',
      headerName: 'Email ID',
      flex: 2,
      renderCell: (params: any) => (
        // <Typography sx={{ ...commonCellStyle }}>{params.value}</Typography>
        <EllipsisNameCell value={params.value} showAvatar={false} />
      ),
    },
    // {
    //   field: 'resourceLink',
    //   headerName: 'Resource Link',
    //   flex: 1,
    //   renderCell: (params: any) => (
    //     <Typography sx={commonCellStyle}>{params.value}</Typography>
    //   ),
    // },
    {
      field: '__created',
      headerName: 'Created On',
      flex: 1,
      minWidth: 140,
      renderCell: (params: any) => {
        if (params && params.value) {
          const date = parseISO(params.value);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          if (month === 'NaN' || day === 'NaN' || year === 'NaN') return '';
          const hours = date.getHours(); 
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const AM__PM = hours >= 12 ? 'PM' : 'AM';
          let hour12 = hours % 12;
          if (hour12 === 0) hour12 = 12;
          const hourStr = String(hour12).padStart(2, '0');
          return `${month}/${day}/${year} ${hourStr}:${minutes} ${AM__PM}`;
        }
        return '';
      },
    },
    {
      field: '__created_by',
      headerName: 'Created By',
      flex: 1,
      minWidth: 160,
      renderCell: (params: any) => {
        if (params && params.value) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ mr: 0.1, flexShrink: 0 }}>
                <CustomAvatar value={params.value} showFullName={false} />
              </Box>
              <Box>
                <EllipsisNameCell value={params.value} showAvatar={false} />
              </Box>
            </Box>
          );
        }
      },
    },
    {
      field: '__last_modified',
      headerName: 'Last Modified On',
      flex: 1,
      minWidth: 145,
      renderCell: (params: any) => {
        if (params && params.value) {
          const date = parseISO(params.value);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          if (month === 'NaN' || day === 'NaN' || year === 'NaN') return '';
          const hours = date.getHours(); 
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const AM__PM = hours >= 12 ? 'PM' : 'AM';
          let hour12 = hours % 12;
          if (hour12 === 0) hour12 = 12;
          const hourStr = String(hour12).padStart(2, '0');
          return `${month}/${day}/${year} ${hourStr}:${minutes} ${AM__PM}`;
        }
        return '';
      },
    },
    {
      field: '__last_modified_by',
      headerName: 'Last Modified By',
      flex: 1,
      minWidth: 160,
      renderCell: (params: any) => {
        if (params && params.value) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ mr: 0.1, flexShrink: 0 }}>
                <CustomAvatar value={params.value} showFullName={false} />
              </Box>
              <Box>
                <EllipsisNameCell value={params.value} showAvatar={false} />
              </Box>
            </Box>
          );
        }
      },
    },
    {
      field: 'lastLoginTime',
      headerName: 'Last Login Time',
      flex: 1,
      minWidth: 160,
      renderCell: (params: any) => {
        if (params && params.value) {
          const date = parseISO(params.value);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          if (month === 'NaN' || day === 'NaN' || year === 'NaN') return '';
          const hours = date.getHours();
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const ampm = hours >= 12 ? 'PM' : 'AM';
          let hour12 = hours % 12;
          if (hour12 === 0) hour12 = 12;
          const hourStr = String(hour12).padStart(2, '0');
          return `${month}/${day}/${year} ${hourStr}:${minutes} ${ampm}`;
        }
        return '';
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1.5,
      renderCell: (params: any) => (
        <StatusPill status={params.value}>{params.value}</StatusPill>
      ),
    },

    ...(permissions!['User']?.u || permissions!['User']?.d
      ? [
          {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            flex: 0.5,
            sortable: false,
            filterable: false,
            renderCell: (params: any) => {
              return (
                <Box sx={{ ...commonCellStyle }}>
                  <IconButton
                    onClick={e => {
                      setAnchorEl(e.currentTarget);
                      setMenuUserId(params.row.Name);
                    }}
                    sx={{
                      color: '#1C2D5F',
                    }}
                  >
                    <MoreHorizontal sx={{ fontSize: 20 }} />
                  </IconButton>
                  {renderUsersMenu(params.row.Name, params.row)}
                </Box>
              );
            },
          },
        ]
      : []),
  ];

  const ResourcesColumns = [
    {
      field: 'Name',
      headerName: 'Resource',
      flex: 1.5,
      renderCell: (params: any) => (
        <EllipsisNameCell value={params.value} showAvatar={false} />
      ),
    },
    {
      field: 'email',
      headerName: 'Email ID',
      flex: 1.5,
      renderCell: (params: any) => (
        <EllipsisNameCell value={params.value} showAvatar={false} />
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      renderCell: (params: any) => {
        const locationName =
          location.find((loc: any) => loc.Id === params.value)?.Name || '';
        return <EllipsisNameCell value={locationName} showAvatar={false} />;
      },
    },
    {
      field: '__created',
      headerName: 'Created On',
      flex: 1,
      minWidth: 140,
      renderCell: (params: any) => {
        if (params && params.value) {
          const date = parseISO(params.value);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          if (month === 'NaN' || day === 'NaN' || year === 'NaN') return '';
          const hours = date.getHours(); 
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const AM__PM = hours >= 12 ? 'PM' : 'AM';
          let hour12 = hours % 12;
          if (hour12 === 0) hour12 = 12;
          const hourStr = String(hour12).padStart(2, '0');
          return `${month}/${day}/${year} ${hourStr}:${minutes} ${AM__PM}`;
        }
        return '';
      },
    },
    {
      field: '__created_by',
      headerName: 'Created By',
      flex: 1,
      minWidth: 200,
      renderCell: (params: any) => {
        if (params && params.value) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ mr: 0.1, flexShrink: 0 }}>
                <CustomAvatar value={params.value} showFullName={false} />
              </Box>
              <Box>
                <EllipsisNameCell value={params.value} showAvatar={false} />
              </Box>
            </Box>
          );
        }
      },
    },
    {
      field: '__last_modified',
      headerName: 'Last Modified On',
      flex: 1,
      minWidth: 140,
      renderCell: (params: any) => {
        if (params && params.value) {
          const date = parseISO(params.value);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          if (month === 'NaN' || day === 'NaN' || year === 'NaN') return '';
          const hours = date.getHours(); 
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const AM__PM = hours >= 12 ? 'PM' : 'AM';
          let hour12 = hours % 12;
          if (hour12 === 0) hour12 = 12;
          const hourStr = String(hour12).padStart(2, '0');
          return `${month}/${day}/${year} ${hourStr}:${minutes} ${AM__PM}`;
        }
        return '';
      },
    },
    {
      field: '__last_modified_by',
      headerName: 'Last Modified By',
      flex: 1,
      minWidth: 200,
      renderCell: (params: any) => {
        if (params && params.value) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ mr: 0.1, flexShrink: 0 }}>
                <CustomAvatar value={params.value} showFullName={false} />
              </Box>
              <Box>
                <EllipsisNameCell value={params.value} showAvatar={false} />
              </Box>
            </Box>
          );
        }
      },
    },
    {
      field: 'resourceStatus',
      headerName: 'Resource Status',
      align: 'center',
      flex: 1,
      renderCell: (params: any) => (
        <Typography sx={commonCellStyle}>{params.value}</Typography>
      ),
    },
    {
      field: 'userStatus',
      headerName: 'User Status',
      flex: 1.5,
      renderCell: (params: any) => (
        <StatusPill status={params.value}>{params.value}</StatusPill>
      ),
    },
    ...(permissions!['User']?.c ||
    permissions!['User']?.u ||
    permissions!['User']?.d
      ? [
          {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            flex: 0.5,
            sortable: false,
            filterable: false,
            renderCell: (params: any) => {
              return (
                <Box sx={{ ...commonCellStyle }}>
                  <IconButton
                    onClick={e => {
                      setAnchorEl(e.currentTarget);
                      setMenuUserId(params.row.Name);
                    }}
                    disabled={params.row.resourceStatus === 'Inactive'}
                    sx={{
                      color: '#1C2D5F',
                    }}
                  >
                    <MoreHorizontal sx={{ fontSize: 20 }} />
                  </IconButton>
                  {renderResourcesMenu(params.row.Name, params.row)}
                </Box>
              );
            },
          },
        ]
      : []),
  ];

  const renderUsersMenu = (id: string, row: any) => {
    const status = row.status;
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
        {permissions!['User']?.u && (
          <StyledMenuItem
            onClick={() => {
              const user = UsersData.find((r: any) => r.Name === id);
              if (user) {
                handleEditUser(user);
              }
              setMenuUserId(null);
            }}
          >
            <Pencil sx={{ mr: 1, fontSize: 18 }} />
            Edit
          </StyledMenuItem>
        )}

        {permissions!['User']?.u && enableResendInvite && (
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

        {permissions!['User']?.u && enableDeactivate && (
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

        {permissions!['User']?.u && enableReactivate && (
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

        {permissions!['User']?.d && (
          <StyledMenuItem
            onClick={() => {
              handleDeleteUser(id);
              setMenuUserId(null);
            }}
          >
            <Trash2 sx={{ mr: 1, fontSize: 18 }} />
            Delete
          </StyledMenuItem>
        )}
      </StyledMenu>
    );
  };

  const renderResourcesMenu = (id: string, row: any) => {
    const status = row.userStatus;
    const resStatus = row.resourceStatus;
    // const enableAddUser = status === 'Not Created';
    const enableSendInvite =
      status === 'Not Created' && resStatus !== 'Inactive';
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
        {permissions!['User']?.c && enableSendInvite && (
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

        {permissions!['User']?.u && enableResendInvite && (
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

        {permissions!['User']?.u && enableDeactivate && (
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

        {permissions!['User']?.u && enableReactivate && (
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
      className="bg-[#f8f9fa] p-8"
      style={{
        minHeight: '-webkit-fill-available',
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
          buttonLabel={permissions!['User']?.c ? 'Invite User' : ''}
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
          isRowSelectable={() => true}
          initialState={{
            columns: {
              columnVisibilityModel: {
                __created: false,
                __created_by: false,
                __last_modified: false,
                __last_modified_by: false,
              },
            },
          }}
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
          isRowSelectable={params => params.row.resourceStatus !== 'Inactive'}
          initialState={{
            columns: {
              columnVisibilityModel: {
                __created: false,
                __created_by: false,
                __last_modified: false,
                __last_modified_by: false,
              },
            },
          }}
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

export default withRBAC(UserManagementPage, ['User']);
