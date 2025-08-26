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
} from '@mui/material';
import {
  MoreVert as MoreHorizontal,
  Edit as Pencil,
  Delete as Trash2,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import AccessTable from './AccessTable';
import { clearHighlightedRowId } from '@/app/redux/reducers/highlightedRowReducer';
import { useGridApiRef } from '@mui/x-data-grid-premium';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

const tabMenuNames = ['users', 'resources'];
const baseURLAccessManagement = '/settings?menu=access-management';
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
  height: '100%',
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

  const UsersData: any[] = [
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
  ];

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
      userStatus: 'In-active',
    },
    {
      id: 'r3',
      Name: 'Samantha Lee',
      email: 'samantha.lee@company.com',
      accessLevel: 'Allocation Manager',
      location: 'Chicago, USA',
      resourceStatus: 'Active',
      userStatus: 'Active',
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
      userStatus: 'Active',
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
  }, []);

  useEffect(() => {
    if (tab === 'users') {
      // Fetch users data
    }
    if (tab === 'resources') {
      // Fetch resources data
    }
    if (tabMenuNames.includes(tab)) {
      const newUrl = `${baseURLAccessManagement}&tab=${tab}`;
      router.replace(newUrl);
    }
  }, [tab, dispatch]);

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
        formType: 'edit_resource',
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
        title: 'Add User',
        submitButtonText: 'Save',
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

  const handleConfirmDelete = async () => {
    if (!deletingUsers || !deletingResources) return;
    try {
      if (tab === 'users') {
        //delete action
      } else if (tab === 'resources') {
        //delete action
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeletingUsers(null);
      setDeletingResources(null);
      setIsDialogOpen(false);
    }
  };

  const UsersPageColumns = [
    {
      field: 'Name',
      headerName: 'User',
      flex: 1,
      renderCell: (params: any) => (
        <Typography sx={{ ...commonCellStyle }}>{params.value}</Typography>
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
      field: 'resourceLink',
      headerName: 'Resource Link',
      flex: 1,
      renderCell: (params: any) => (
        <Typography sx={commonCellStyle}>{params.value}</Typography>
      ),
    },
    {
      field: 'Status',
      headerName: 'Status',
      flex: 1,
      renderCell: () => <StatusPill>Active</StatusPill>,
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
              setMenuUserId(params.row.Name);
            }}
            size="small"
          >
            <MoreHorizontal sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={commonCellStyle}>
            {params.row.Name && renderUsersMenu(params.row.Name)}
          </Typography>
        </>
      ),
    },
  ];

  const ResourcesColumns = [
    {
      field: 'Name',
      headerName: 'Resource',
      flex: 1,
      renderCell: (params: any) => (
        <Typography sx={{ ...commonCellStyle }}>{params.value}</Typography>
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
      renderCell: () => <StatusPill>Active</StatusPill>,
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
              setMenuUserId(params.row.Name);
            }}
            size="small"
          >
            <MoreHorizontal sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={commonCellStyle}>
            {params.row.Name && renderResourcesMenu(params.row.Name)}
          </Typography>
        </>
      ),
    },
  ];

  const renderUsersMenu = (id: string) => (
    <StyledMenu
      anchorEl={anchorEl}
      open={menuUserId === id}
      onClose={() => setMenuUserId(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <StyledMenuItem
        onClick={() => {
          const assignment = UsersData.find(r => r.Name === id);
          if (assignment) {
            handleEditUser(assignment);
          }
          setMenuUserId(null);
        }}
      >
        <Pencil sx={{ mr: 1, fontSize: 18 }} />
        Edit
      </StyledMenuItem>
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

  const renderResourcesMenu = (id: string) => (
    <StyledMenu
      anchorEl={anchorEl}
      open={menuUserId === id}
      onClose={() => setMenuUserId(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <StyledMenuItem
        onClick={() => {
          const assignment = ResourcesData.find(r => r.Name === id);
          if (assignment) {
            handleEditResources(assignment);
          }
          setMenuUserId(null);
        }}
      >
        <Pencil sx={{ mr: 1, fontSize: 18 }} />
        Edit
      </StyledMenuItem>
      <StyledMenuItem
        onClick={() => {
          handleDeleteResources(id);
          setMenuUserId(null);
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
          buttonLabel="Add User"
          renderMenu={renderUsersMenu}
          columns={UsersPageColumns}
          apiRef={apiRef}
          loading={loading}
          setMode={() => setTab('resources')}
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
          renderMenu={renderResourcesMenu}
          columns={ResourcesColumns}
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
        {deletingUsers || deletingResources
          ? tab === 'users'
            ? `the user "${deletingUsers}"`
            : `resource "${deletingResources}"`
          : 'this item'}
        ?
      </ConfirmDialog>
    </div>
  );
}
