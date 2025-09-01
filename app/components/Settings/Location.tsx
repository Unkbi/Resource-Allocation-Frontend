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
  DELETE_ROLE,
  DELETE_ROLESASSIGNMENT,
  FETCH_ROLES,
  FETCH_ROLESASSIGNMENTS,
} from '@/app/redux/actions/rbacActions';
import { Location, LocationGroup } from '@/app/types';
import { clearHighlightedRowId } from '@/app/redux/reducers/highlightedRowReducer';
import { useGridApiRef } from '@mui/x-data-grid-premium';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { StatusPill, commonTabSx } from './styled';

const tabMenuNames = ['location', 'location-group'];
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
    label: 'Locations',
    value: 'location',
    icon: '/images/icons/LocationIcon.svg',
  },
  {
    label: 'Location Group',
    value: 'location-group',
    icon: '/images/icons/LocationGroupIcon.svg',
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
          filter: 'brightness(0) saturate(100%) invert(13%) sepia(45%) saturate(2864%) hue-rotate(203deg) brightness(94%) contrast(102%)',
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
  const [tab, setTab] = useState('location');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRoleId, setMenuRoleId] = useState<string | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<string | null>(null);
  const [deletingLocationGroup, setDeletingLocationGroup] = useState<
    string | null
  >(null);
  const roles = [];
  const locationData: Location[] = [];
  //   [{ Location: 'New York', LocationGroup: 'East Coast', Status: 'Active' },
  //   { Location: 'San Francisco', LocationGroup: 'West Coast', Status: 'Active' },
  //   { Location: 'London', LocationGroup: 'EMEA', Status: 'Inactive' },
  //   { Location: 'Bangalore', LocationGroup: 'APAC', Status: 'Active' },
  //   { Location: 'Berlin', LocationGroup: 'EMEA', Status: 'Active' },
  // ];
  const locationGroupData: LocationGroup[] = [];
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
    if (tab === 'location') {
      // dispatch({ type: FETCH_ROLES });
    }
    if (tab === 'location-group') {
      // dispatch({ type: FETCH_ROLESASSIGNMENTS });
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

          const focusColumn = tab === 'location' ? 'Name' : 'Role';

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
  }, [highlightedRowId, locationData, tab]);

  const handleAddNewLocationGroup = () => {
    dispatch(
      openDialog({
        title: 'Add Location Group',
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'add_location_group',
      })
    );
  };

  const handleEditLocationGroup = (assignment: LocationGroup) => {
    dispatch(
      openDialog({
        title: 'Edit Location Group',
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'edit_location_group',
        initialData: assignment,
      })
    );
  };

  const handleDeleteLocationGroup = (Name: string) => {
    setDeletingLocationGroup(Name);
    setIsDialogOpen(true);
  };

  const handleAddNewLocation = () => {
    dispatch(
      openDialog({
        title: 'Add Location',
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'add_location',
      })
    );
  };

  const handleEditLocation = (assignment: Location) => {
    dispatch(
      openDialog({
        title: 'Edit Location',
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'edit_location',
        initialData: assignment,
      })
    );
  };

  const handleDeleteLocation = (Name: string) => {
    setDeletingLocation(Name);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLocation || !deletingLocationGroup) return;
    try {
      if (tab === 'location') {
        await dispatch({ type: DELETE_ROLE, payload: deletingLocation });
        dispatch({ type: FETCH_ROLES });
      } else if (tab === 'location-group') {
        await dispatch({
          type: DELETE_ROLESASSIGNMENT,
          payload: deletingLocationGroup,
        });
        dispatch({ type: FETCH_ROLESASSIGNMENTS });
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeletingLocation(null);
      setDeletingLocationGroup(null);
      setIsDialogOpen(false);
    }
  };

  const LocationPageColumns = [
    {
      field: 'Location',
      headerName: 'Location',
      flex: 1,
      renderCell: (params: any) => (
        <Typography sx={{ ...commonCellStyle }}>{params.value}</Typography>
      ),
    },
    {
      field: 'LocationGroup ',
      headerName: 'Location Group',
      flex: 1,
      renderCell: (params: any) => (
        <Typography sx={commonCellStyle}>{params.value}</Typography>
      ),
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
              setMenuRoleId(params.row.Name);
            }}
            size="small"
          >
            <MoreHorizontal sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={commonCellStyle}>
            {params.row.Name && renderLocationMenu(params.row.Name)}
          </Typography>
        </>
      ),
    },
  ];

  const LocationGroupColumns = [
    {
      field: 'Location Group',
      headerName: 'Location Group',
      flex: 1,
      renderCell: (params: any) => (
        <Typography sx={{ ...commonCellStyle }}>{params.value}</Typography>
      ),
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
              setMenuRoleId(params.row.Name);
            }}
            size="small"
          >
            <MoreHorizontal sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={commonCellStyle}>
            {params.row.Name && locationGroupMenu(params.row.Name)}
          </Typography>
        </>
      ),
    },
  ];

  const renderLocationMenu = (id: string) => (
    <StyledMenu
      anchorEl={anchorEl}
      open={menuRoleId === id}
      onClose={() => setMenuRoleId(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <StyledMenuItem
        onClick={() => {
          const assignment = locationData.find(r => r.Location === id);
          if (assignment) {
            handleEditLocation(assignment);
          }
          setMenuRoleId(null);
        }}
      >
        <Pencil sx={{ mr: 1, fontSize: 18 }} />
        Edit
      </StyledMenuItem>
      <StyledMenuItem
        onClick={() => {
          handleDeleteLocation(id);
          setMenuRoleId(null);
        }}
      >
        <Trash2 sx={{ mr: 1, fontSize: 18 }} />
        Delete
      </StyledMenuItem>
    </StyledMenu>
  );

  const locationGroupMenu = (id: string) => (
    <StyledMenu
      anchorEl={anchorEl}
      open={menuRoleId === id}
      onClose={() => setMenuRoleId(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <StyledMenuItem
        onClick={() => {
          //   handleEditLocationGroup(assignment)
          // setMenuRoleId(null);
        }}
      >
        <Pencil sx={{ mr: 1, fontSize: 18 }} />
        Edit
      </StyledMenuItem>
      <StyledMenuItem
        onClick={() => {
          handleDeleteLocationGroup(id);
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

      {tab === 'location' && (
        <AccessTable
          title="Locations"
          data={locationData}
          onAdd={handleAddNewLocation}
          onEdit={handleEditLocation}
          onDelete={handleDeleteLocation}
          menuId={menuRoleId}
          setMenuId={setMenuRoleId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel="Add Location"
          renderMenu={renderLocationMenu}
          columns={LocationPageColumns}
          apiRef={apiRef}
          loading={loading}
        />
      )}
      {tab === 'location-group' && (
        <AccessTable
          title="Location Group"
          data={locationGroupData}
          onAdd={handleAddNewLocationGroup}
          onEdit={handleEditLocationGroup}
          onDelete={handleDeleteLocationGroup}
          menuId={menuRoleId}
          setMenuId={setMenuRoleId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel="Add Location Group"
          renderMenu={locationGroupMenu}
          columns={LocationGroupColumns}
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
        {deletingLocation || deletingLocationGroup
          ? tab === 'location'
            ? `the location "${deletingLocation}"`
            : `location group "${deletingLocationGroup}"`
          : 'this item'}
        ?
      </ConfirmDialog>
    </div>
  );
}
