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
  DELETE_LOCATION,
  DELETE_LOCATION_GROUPS,
} from '@/app/redux/actions/allSettingsActions';
import { Location, LocationGroup } from '@/app/types';
import { clearHighlightedRowId } from '@/app/redux/reducers/highlightedRowReducer';
import { useGridApiRef } from '@mui/x-data-grid-premium';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { StatusPill, commonTabSx } from './styled';
import { showToast } from '@/app/redux/reducers/toastReducer';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';
import { LOCATION_VALID_TABS } from '@/app/constants/constants';
import { FETCH_EMPLOYEE_RATES } from '@/app/redux/actions/employeeRatesActions';

const baseURLAccessManagement = '/settings?menu=location-setting';
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
    entity: 'WorkLocation',
  },
  {
    label: 'Location Group',
    value: 'location-group',
    icon: '/images/icons/LocationGroupIcon.svg',
    entity: 'WorkLocationGroup',
  },
];

interface LocationSettingPageProps {
  permissions?: Record<string, CrudPermissions>;
  loadingPermissions?: boolean;
}

function LocationSettingPage({
  permissions,
  loadingPermissions,
}: LocationSettingPageProps) {
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
  const { location, locationGroups, loading } = useSelector(
    (state: any) => state.allSettings
  );
  const [locationData, setLocationData] = useState<Location[]>([]);
  const [locationGroupData, setLocationGroupData] = useState<LocationGroup[]>(
    []
  );
  const { id: highlightedRowId } = useSelector(
    (state: any) => state.highlightedRow
  );
  const apiRef = useGridApiRef();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { allResourcesDetail, loading: allResourcesDetailLoading } =
    useSelector((state: any) => state.allResourcesDetail);
  const { employeeRates, loading: employeeRatesLoading } = useSelector(
    (state: any) => state.employeeRates
  );

  useEffect(() => {
    if (loadingPermissions) return;
    const accessMap = [
      { key: 'WorkLocation', value: 'location' },
      { key: 'WorkLocationGroup', value: 'location-group' },
    ];

    const accessible = accessMap.filter(({ key }) => permissions![key]?.r);

    if (accessible.length === 0) {
      router.replace('/settings?menu=user-profile');
      return;
    }

    const tabParam = searchParams.get('tab');
    const firstAccessible = accessible[0].value;
    const isAccessible = accessible.some(({ value }) => value === tabParam);

    if (!tabParam || !LOCATION_VALID_TABS.includes(tab) || !isAccessible) {
      return;
    }

    if (tabParam !== tab) {
      setTab(tabParam);
    }
  }, [searchParams, loadingPermissions]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && LOCATION_VALID_TABS.includes(tabParam)) {
      setTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (location && location.length) {
      const formattedLocation = location.map((loc: Location) => {
        const locationGroup = locationGroups?.find(
          (group: LocationGroup) => group.Id === loc.LocationGroup
        );

        return {
          id: loc.Id,
          Id: loc.Id,
          Name: loc.Name,
          LocationGroup: locationGroup?.Name || '',
          Status: loc.Status,
        };
      });
      setLocationData(formattedLocation);
    }

    if (locationGroups && locationGroups.length) {
      const formattedLocationGroups = locationGroups.map((locGroup: any) => {
        return {
          id: locGroup.Id,
          Id: locGroup.Id,
          Name: locGroup.Name,
        };
      });
      setLocationGroupData(formattedLocationGroups);
    }
  }, [location, locationGroups]);

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

          const focusColumn = tab === 'location' ? 'Name' : 'Name';

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

  useEffect(() => {
    if (!employeeRates?.length)
      dispatch({
          type: FETCH_EMPLOYEE_RATES,
          payload: {},
        });
}, [dispatch]);

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

  const handleEditLocationGroup = (
    assignment: LocationGroup,
    title = 'Edit Location Group',
    dialogOptions = {}
  ) => {
    dispatch(
      openDialog({
        title: title,
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'edit_location_group',
        initialData: assignment,
        ...dialogOptions,
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

  const handleEditLocation = (
    assignment: Location,
    title = 'Edit Location',
    dialogOptions = {}
  ) => {
    dispatch(
      openDialog({
        title: title,
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'edit_location',
        initialData: assignment,
        ...dialogOptions,
      })
    );
  };

  const handleDeleteLocation = (Name: string) => {
    setDeletingLocation(Name);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLocation && !deletingLocationGroup) return;
    try {
      if (tab === 'location' && deletingLocation) {
        const locationId = locationData.find(
          loc => loc.Name === deletingLocation
        )?.Id;
        const isInResources = allResourcesDetail.some((res: any) => {
          return res.Resource?.WorkLocation === locationId;
        });
        const isInRates = employeeRates.some(
          (rate: any) => rate.WorkLocation === locationId
        );
        if (isInResources || isInRates) {
          dispatch(
            showToast({
              open: true,
              message: `Cannot delete "${deletingLocation}", already in use.`,
              type: 'error',
              position: 'bottom-right',
              autoHideTimer: 4000,
            })
          );
          return;
        }
        await dispatch({
          type: DELETE_LOCATION,
          payload: { locationId },
        });
      } else if (tab === 'location-group' && deletingLocationGroup) {
        const isAssigned = locationData.some(
          loc => loc.LocationGroup === deletingLocationGroup
        );

        if (isAssigned) {
          dispatch(
            showToast({
              open: true,
              message: `Cannot delete "${deletingLocationGroup}", with assigned locations.`,
              type: 'error',
              position: 'bottom-right',
              autoHideTimer: 4000,
            })
          );
          return;
        }
        const locationGroupId = locationGroupData.find(
          locG => locG.Name === deletingLocationGroup
        )?.Id;

        await dispatch({
          type: DELETE_LOCATION_GROUPS,
          payload: { locationGroupId },
        });
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
      field: 'Name',
      headerName: 'Location',
      flex: 1,
      renderCell: (params: any) => (
        <Typography
          onClick={() => {
            if (permissions!['WorkLocation'].u) {
              handleEditLocation(params.row);
            } else {
              handleEditLocation(params.row, `Location: ${params.value}`, {
                readOnly: true,
              });
            }
          }}
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
      field: 'LocationGroup',
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
      renderCell: (params: any) => (
        <StatusPill status={params.value}>{params.value}</StatusPill>
      ),
    },
    ...(permissions!['WorkLocation']?.u || permissions!['WorkLocation']?.d
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
        ]
      : []),
  ];

  const LocationGroupColumns = [
    {
      field: 'Name',
      headerName: 'Location Group',
      flex: 1,
      renderCell: (params: any) => (
        <Typography
          onClick={() => {
            if (permissions!['WorkLocationGroup'].u) {
              handleEditLocationGroup(params.row);
            } else {
              handleEditLocationGroup(
                params.row,
                `Location Group: ${params.value}`,
                {
                  readOnly: true,
                }
              );
            }
          }}
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
    ...(permissions!['WorkLocationGroup']?.u ||
    permissions!['WorkLocationGroup']?.d
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
        ]
      : []),
  ];

  const renderLocationMenu = (id: string) => (
    <StyledMenu
      anchorEl={anchorEl}
      open={menuRoleId === id}
      onClose={() => setMenuRoleId(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {permissions!['WorkLocation'].u && (
        <StyledMenuItem
          onClick={() => {
            const assignment = locationData.find(r => r.Name === id);
            if (assignment) {
              handleEditLocation(assignment);
            }
            setMenuRoleId(null);
          }}
        >
          <Pencil sx={{ mr: 1, fontSize: 18 }} />
          Edit
        </StyledMenuItem>
      )}
      {permissions!['WorkLocation'].d && (
        <StyledMenuItem
          onClick={() => {
            handleDeleteLocation(id);
            setMenuRoleId(null);
          }}
        >
          <Trash2 sx={{ mr: 1, fontSize: 18 }} />
          Delete
        </StyledMenuItem>
      )}
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
      {permissions!['WorkLocationGroup'].u && (
        <StyledMenuItem
          onClick={() => {
            const assignment = locationGroupData.find(r => r.Name === id);
            if (assignment) {
              handleEditLocationGroup(assignment);
            }
            setMenuRoleId(null);
          }}
        >
          <Pencil sx={{ mr: 1, fontSize: 18 }} />
          Edit
        </StyledMenuItem>
      )}
      {permissions!['WorkLocationGroup'].d && (
        <StyledMenuItem
          onClick={() => {
            handleDeleteLocationGroup(id);
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

  const TabHeader = ({
    tab,
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
          data={permissions!['WorkLocation'].r ? locationData : []}
          onAdd={handleAddNewLocation}
          onEdit={handleEditLocation}
          onDelete={handleDeleteLocation}
          menuId={menuRoleId}
          setMenuId={setMenuRoleId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel={permissions!['WorkLocation'].c ? 'Add Location' : ''}
          renderMenu={renderLocationMenu}
          columns={LocationPageColumns}
          apiRef={apiRef}
          loading={loading || loadingPermissions}
          toolbarType="filter"
        />
      )}
      {tab === 'location-group' && (
        <AccessTable
          title="Location Group"
          data={permissions!['WorkLocationGroup'].r ? locationGroupData : []}
          onAdd={handleAddNewLocationGroup}
          onEdit={handleEditLocationGroup}
          onDelete={handleDeleteLocationGroup}
          menuId={menuRoleId}
          setMenuId={setMenuRoleId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel={
            permissions!['WorkLocationGroup'].c ? 'Add Location Group' : ''
          }
          renderMenu={locationGroupMenu}
          columns={LocationGroupColumns}
          apiRef={apiRef}
          loading={loading || loadingPermissions}
          toolbarType="filter"
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

export default withRBAC(LocationSettingPage, [
  'WorkLocation',
  'WorkLocationGroup',
]);
