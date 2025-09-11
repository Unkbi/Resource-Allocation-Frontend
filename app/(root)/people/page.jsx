'use client';
import ResourceTable from '@/app/components/Resources/ResourceTable';
import OrganisationsTable from '@/app/components/Resources/OrganisationTable';
import { Box, styled } from '@mui/system';
import {
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  generateRandomColor,
  getInitials,
  getOrganisationForResource,
  getTeamForResource,
} from '@/app/utils/common';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useDispatch, useSelector } from 'react-redux';
import { closeDialog, openDialog } from '@/app/redux/reducers/dialogReducer';
import CustomAvatar from '@/app/components/Avatar/CustomAvatar';
import ConfirmDialog from '@/app/components/Dialog/ConfirmDialog';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';

import { DELETE_ORGANISATION } from '@/app/redux/actions/organizationsAction';

import { FETCH_ORGANISATIONS } from '@/app/redux/actions/organizationsAction';

import {
  deleteTeam,
  getAllTeams,
  getResourcesAgainstTeams,
} from '@/app/services/teamServices';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteResource } from '@/app/services/resourceServices';
import { clearHighlightedRowId } from '@/app/redux/reducers/highlightedRowReducer';
import { useGridApiRef } from '@mui/x-data-grid-premium';
import TeamsTable from '@/app/components/Resources/TeamsTable';
import { getAllocationManagerFromPath } from '@/app/utils/common';
import {
  DELETE_EMPLOYEE_RATES,
  FETCH_EMPLOYEE_RATES,
} from '@/app/redux/actions/employeeRatesActions';
import EllipsisNameCell from '@/app/components/ResourceAllocation/component/EllipsisNameCell';
import { FETCH_ALL_RESOURCES_DETAIL } from '@/app/redux/actions/allResourcesDetailAction';
import { fetchAllTeams } from '@/app/redux/actions/fetchTeamsAction';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { showToast } from '@/app/redux/reducers/toastReducer';
import { fetchTeamAllocationsForSaga } from '@/app/services/teamServices';
import { StatusPill } from '@/app/components/Settings/styled';

const demoResources = {
  result: [
    {
      AverageWeeklyHours: 40,
      ContractorHourlyRate: null,
      ContractorHourlyRateCurrency: 'USD',
      Department: 'Lyft',
      Email: 'Adrian@test.com',
      EndDate: null,
      FirstName: 'Adrian',
      FullName: 'Adrian Olvera',
      HRLevel: '1',
      Id: '6ddc14d8-dd9e-4df8-bf3e-f18723f10603',
      LastName: 'Olvera',
      LocationCategory: 'Onsite',
      Manager: 'Kishan Vallabhaneni',
      PhoneNumber: '',
      Role: 'Sales Technology Lead',
      StartDate: '2021-01-01',
      Status: 'Active',
      Type: 'FTE',
      WorkLocation: null,
      __parent__: null,
      __path__:
        ':ResourceAllocation.Core/Resource,6ddc14d8-dd9e-4df8-bf3e-f18723f10603',
    },
  ],
};

const AvatarCircle = styled('div')(({ bgcolor }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: bgcolor,
  color: 'white',
  fontSize: '12px',
  fontWeight: '500',
  marginRight: '8px',
}));

const PersonContainer = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
}));

// const StatusPill = styled('div')(({ theme, status }) => {
//   let backgroundColor, textColor;
//   switch (status) {
//     case 'Active':
//       backgroundColor = '#4B9F471A';
//       textColor = '#4B9F47';
//       break;
//     case 'Proposed':
//       backgroundColor = '#5041AB1A';
//       textColor = '#5041AB';
//       break;
//     case 'Approved':
//       backgroundColor = '#2772F01A';
//       textColor = '#2772F0';
//       break;
//     case 'Paused':
//       backgroundColor = '#E6521F1A';
//       textColor = '#E6521F';
//       break;
//     case 'Completed':
//       backgroundColor = '#F5B5441A';
//       textColor = '#F5B544';
//       break;
//     case 'Inactive':
//       backgroundColor = '#FCF0ED';
//       textColor = '#C73732';
//       break;
//     default:
//       backgroundColor = '#e0e0e0';
//       textColor = '#6c757d';
//   }

//   return {
//     display: 'inline-flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: '4px',
//     fontFamily: theme.typography.fontFamily,
//     fontsize: '12px',
//     fontStyle: 'normal',
//     fontweight: 400,
//     lineheight: '16px',
//     width: '86px',
//     height: '28px',
//     backgroundColor,
//     color: textColor,
//   };
// });

const menuItemStyle = {
  '&:hover': {
    backgroundColor: '#142B51B2',
    color: 'white',
  },
  color: '#424242',
  fontFamily: '"Open Sans", sans-serif',
  fontSize: '12px',
  fontStyle: 'normal',
  fontWeight: 600,
  lineHeight: '18px',
};

export default function Resources() {
  const dispatch = useDispatch();
  const apiRef = useGridApiRef();
  const { resources, updating, loading } = useSelector(
    state => state.resources
  );

  const { organisations, loading: allOrganizationsLoading } = useSelector(
    state => state.organisations
  );

  const { allResourcesDetail, loading: allResourcesDetailLoading } =
    useSelector(state => state.allResourcesDetail);
  const { teams, dataProcessing } = useSelector(state => state.teams);
  const { employeeRates, loading: employeeRatesLoading } = useSelector(
    state => state.employeeRates
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [rows, setRows] = useState(allResourcesDetail || null);
  const [teamRows, setTeamRows] = useState(teams || null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({
    id: '',
    name: '',
    type: '',
  });
  const [ratesDelete, setRatesDelete] = useState({
    id: '',
    WorkLocation: '',
    HRLevel: '',
  });
  const { id: highlightedRowId } = useSelector(state => state.highlightedRow);
  const router = useRouter();
  const searchParams = useSearchParams();
  // const initialTab = searchParams.get('tab');
  // const [value, setValue] = useState(initialTab || 'resource');
  // useEffect(() => {
  //   const newTab = searchParams.get('tab');
  //   if (newTab && newTab !== value) {
  //     setValue(newTab);
  //   }
  // }, [searchParams]);
  const VALID_TABS = ['resource', 'teams', 'organizations', 'rates'];
  const initialTab = searchParams.get('tab');
  const [value, setValue] = useState(
    VALID_TABS.includes(initialTab) ? initialTab : 'resource'
  );

  useEffect(() => {
    const newTab = searchParams.get('tab');
    if (newTab && VALID_TABS.includes(newTab) && newTab !== value) {
      setValue(newTab);
    }
  }, [searchParams]);

  const columns = [
    {
      field: 'FullName',
      headerName: 'Resource Name',
      flex: 1,
      minWidth: 200,
      hideable: false,
      filterable: true,
      renderCell: params => {
        const handleNameClick = () => {
          handleOpenDialog('Edit Resource', 'edit_resource', params.row);
        };

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 0.1, flexShrink: 0 }}>
              <CustomAvatar value={params.value} showFullName={false} />
            </Box>
            <Box
              onClick={handleNameClick}
              sx={{
                display: 'inline-block',
                maxWidth: '100%',
                color: '#152E75',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              <EllipsisNameCell value={params.value} showAvatar={false} />
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'Team',
      headerName: 'Team',
      flex: 1,
      minWidth: 180,
      renderCell: params => {
        return (
          params.value && (
            <EllipsisNameCell value={params.value} showAvatar={false} />
          )
        );
      },
    },
    {
      field: 'Email',
      headerName: 'Email ID',
      flex: 2,
      minWidth: 210,
      renderCell: params => {
        return (
          params.value && (
            <EllipsisNameCell value={params.value} showAvatar={false} />
          )
        );
      },
    },
    {
      field: 'ContractorHourlyRate',
      headerName: 'Hourly Rate',
      flex: 1,
      minWidth: 120,
      renderCell: params => {
        params.value && (
          <EllipsisNameCell value={params.value} showAvatar={false} />
        );
      },
    },
    {
      field: 'AverageWeeklyHours',
      headerName: 'Average Weekly Hours',
      flex: 1,
      minWidth: 200,
      renderCell: params => {
        params.value && (
          <EllipsisNameCell value={params.value} showAvatar={false} />
        );
      },
    },
    {
      field: 'WorkLocation',
      headerName: 'Work Location',
      flex: 1,
      minWidth: 150,
      renderCell: params => {
        params.value && (
          <EllipsisNameCell value={params.value} showAvatar={false} />
        );
      },
    },
    {
      field: 'PhoneNumber',
      headerName: 'Phone Number',
      flex: 1,
      minWidth: 150,
      renderCell: params => {
        params.value && (
          <EllipsisNameCell value={params.value} showAvatar={false} />
        );
      },
    },
    {
      field: 'Role',
      headerName: 'Role',
      flex: 1,
      minWidth: 150,
      renderCell: params =>
        params.value && (
          <EllipsisNameCell value={params.value} showAvatar={false} />
        ),
    },
    {
      field: 'HRLevel',
      headerName: 'HR Level',
      flex: 1,
      minWidth: 90,
      renderCell: params => {
        const HRLevel = params.row.HRLevel;
        return (
          HRLevel && (
            <EllipsisNameCell value={params.value} showAvatar={false} />
          )
        );
      },
    },
    {
      field: 'Type',
      headerName: 'Resource Type',
      flex: 1,
      minWidth: 130,
      renderCell: params => {
        return (
          params.value && (
            <EllipsisNameCell value={params.value} showAvatar={false} />
          )
        );
      },
    },
    {
      field: 'Organization',
      headerName: 'Organization',
      flex: 1,
      minWidth: 180,
      renderCell: params => {
        return (
          params.value && (
            <EllipsisNameCell value={params.value} showAvatar={false} />
          )
        );
      },
    },
    {
      field: 'Manager',
      headerName: 'Manager',
      width: 170,
      sortable: true,
      filterable: true,
      renderCell: params => {
        const managerId = params?.row?.Manager;
        const managerName = managerMap?.[managerId];
        return managerName ? (
          <EllipsisNameCell value={managerName} showAvatar={true} />
        ) : null;
      },
    },
    {
      field: 'StartDate',
      headerName: 'Start Date',
      flex: 1,
      minWidth: 120,
      renderCell: params => {
        if (params && params.value) {
          const date = new Date(params.value);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${month}/${day}/${year}`;
        }
        return '';
      },
    },
    {
      field: 'EndDate',
      headerName: 'End Date',
      flex: 1,
      minWidth: 120,
      renderCell: params => {
        if (params && params.value) {
          const date = new Date(params.value);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${month}/${day}/${year}`;
        }
        return '';
      },
    },
    {
      field: 'Status',
      headerName: 'Status',
      width: 170,
      sortable: false,
      filterable: true,
      hideable: false,
      renderCell: params => {
        const status = params.value;
        return (
          status && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <StatusPill status={status}>{status}</StatusPill>
              <Box>
                <IconButton
                  size="small"
                  onClick={e => handleMenuClick(e, params.row.id)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && selectedRow === params.row.id}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  sx={{
                    width: 350,
                    height: 175,
                    flexShrink: 0,
                    paddingTop: '2px',
                    paddingBottom: '4px',
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      handleOpenDialog(
                        'Edit Resource',
                        'edit_resource',
                        params.row
                      );
                    }}
                    sx={menuItemStyle}
                  >
                    <EditIcon sx={{ fontSize: 18, marginRight: '8px' }} />
                    Edit
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      setDeleteDialogOpen(true);
                      handleMenuClose();
                      setDeleteTarget({
                        id: params.row.Id,
                        name: params.row.FullName,
                      });
                    }}
                    sx={menuItemStyle}
                  >
                    <DeleteIcon sx={{ fontSize: 18, marginRight: '8px' }} />
                    Delete
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          )
        );
      },
    },
  ];

  const teamColumns = [
    {
      field: 'Team',
      headerName: 'Team Name',
      minWidth: 290,
      maxWidth: 500,
      headerAlign: 'left',
      hideable: false,
      renderCell: params => {
        const handleNameClick = () => {
          handleOpenDialog('Edit Team', 'edit_team', params.row);
        };

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'left',
            }}
          >
            <Box
              onClick={handleNameClick}
              sx={{
                display: 'inline-block',
                width: '100%',
                color: '#152E75',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                paddingLeft: '32px',

                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {params.value}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'AllocationManager',
      headerName: 'Team Allocation Manager',
      headerAlign: 'left',
      minWidth: 290,
      renderCell: params => {
        const manager =
          resources && getAllocationManagerFromPath(params.value, resources);
        if (!manager?.FullName) return <span>&nbsp;</span>;
        return (
          <Box
            sx={{ display: 'flex', alignItems: 'center', paddingLeft: '30px' }}
          >
            <Box sx={{ mr: 0.5, flexShrink: 0 }}>
              <CustomAvatar value={manager.FullName} showFullName={false} />
            </Box>
            <Box
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {manager.FullName}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'Status',
      headerName: 'Status',
      width: 170,
      flex: 1,
      sortable: true,
      filterable: true,
      headerAlign: 'left',
      renderCell: params => {
        const status = params.value;
        return (
          status && (
            <Box
              sx={{
                paddingLeft: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <StatusPill status={status}>{status}</StatusPill>
              <Box>
                <IconButton
                  size="small"
                  onClick={e => handleMenuClick(e, params.row.id)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && selectedRow === params.row.id}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      handleOpenDialog('Edit Team', 'edit_team', params.row);
                    }}
                    sx={menuItemStyle}
                  >
                    <EditIcon sx={{ fontSize: 18, marginRight: '8px' }} />
                    Edit
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      setDeleteDialogOpen(true);
                      handleMenuClose();
                      setDeleteTarget({
                        id: params.row.Id,
                        name: params.row.Team,
                        type: 'Team',
                      });
                    }}
                    sx={menuItemStyle}
                  >
                    <DeleteIcon sx={{ fontSize: 18, marginRight: '8px' }} />
                    Delete
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          )
        );
      },
    },
  ];

  const employeeRatesColumns = [
    {
      field: 'WorkLocation',
      headerName: 'Location',
      minWidth: 220,
      headerAlign: 'left',
      hideable: false,
      renderCell: params => {
        const handleNameClick = () => {
          handleOpenDialog('Edit Rate', 'edit_rates', params.row);
        };
        return (
          <Box
            onClick={handleNameClick}
            sx={{
              display: 'inline-block',
              paddingLeft: '32px',
              maxWidth: '100%',
              color: '#152E75',
              cursor: 'pointer',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      field: 'HRLevel',
      headerName: 'HR Level',
      headerAlign: 'left',
      sortable: 'false',
      filterable: 'false',
      minWidth: 155,
      renderCell: params => {
        return <Box sx={{ paddingLeft: '42px' }}>{params.value}</Box>;
      },
    },
    {
      field: 'HourlyRate',
      headerName: 'Rate/Hr',
      width: 160,
      sortable: true,
      filterable: true,
      headerAlign: 'left',
      renderCell: params => {
        return <Box sx={{ paddingLeft: '38px' }}>{params.value}</Box>;
      },
    },
    {
      field: 'HourlyRateCurrency',
      headerName: 'Currency',
      width: 160,
      sortable: true,
      filterable: true,
      headerAlign: 'left',
      renderCell: params => {
        return <Box sx={{ paddingLeft: '35px' }}>{params.value}</Box>;
      },
    },
    {
      field: 'ValidityStartDate',
      headerName: 'Valid From',
      width: 170,
      sortable: true,
      filterable: true,
      headerAlign: 'left',
      renderCell: params => {
        if (params && params.value) {
          const date = new Date(params.value);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          const formattedDate = `${month}/${day}/${year}`;

          return <Box sx={{ paddingLeft: '32px' }}>{formattedDate}</Box>;
        }
        return <Box sx={{ paddingLeft: '32px' }} />;
      },
    },
    {
      field: 'ValidityEndDate',
      headerName: 'Valid To',
      width: 170,
      sortable: true,
      filterable: true,
      headerAlign: 'left',
      renderCell: params => {
        if (params && params.value) {
          const date = new Date(params.value);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          const formattedDate = `${month}/${day}/${year}`;
          return <Box sx={{ paddingLeft: '32px' }}>{formattedDate}</Box>;
        }
        return <Box sx={{ paddingLeft: '32px' }} />;
      },
    },
    {
      field: 'Status',
      headerName: 'Status',
      width: 170,
      flex: 1,
      sortable: true,
      filterable: true,
      headerAlign: 'left',
      renderCell: params => {
        const status = params.value;
        return (
          status && (
            <Box
              sx={{
                paddingLeft: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <StatusPill status={status}>{status}</StatusPill>
              <Box>
                <IconButton
                  size="small"
                  onClick={e => handleMenuClick(e, params.row.id)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && selectedRow === params.row.id}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      handleOpenDialog('Edit Rate', 'edit_rates', params.row);
                    }}
                    sx={menuItemStyle}
                  >
                    <EditIcon sx={{ fontSize: 18, marginRight: '8px' }} />
                    Edit
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      setDeleteDialogOpen(true);
                      handleMenuClose();
                      setRatesDelete({
                        id: params.row.Id,
                        WorkLocation: params.row.WorkLocation,
                        HRLevel: params.row.HRLevel,
                      });
                    }}
                    sx={menuItemStyle}
                  >
                    <DeleteIcon sx={{ fontSize: 18, marginRight: '8px' }} />
                    Delete
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          )
        );
      },
    },
  ];

  const organizationColumns = [
    {
      field: 'Name',
      headerName: 'Organization Name',
      minWidth: 290,
      maxWidth: 500,
      headerAlign: 'left',
      hideable: false,
      renderCell: params => {
        const handleNameClick = () => {
          handleOpenDialog(
            'Edit Organization',
            'edit_organization',
            params.row
          );
        };

        return (
          <Box sx={{ display: 'flex', alignItems: 'left' }}>
            <Box
              onClick={handleNameClick}
              sx={{
                display: 'inline-block',
                width: '100%',
                color: '#152E75',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                paddingLeft: '32px',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {params.value}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'Status',
      headerName: 'Status',
      width: 170,
      flex: 1,
      sortable: true,
      filterable: true,
      headerAlign: 'left',
      renderCell: params => {
        const status = params.value;
        return (
          status && (
            <Box
              sx={{
                paddingLeft: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <StatusPill status={status}>{status}</StatusPill>
              <Box>
                <IconButton
                  size="small"
                  onClick={e => handleMenuClick(e, params.row.id)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && selectedRow === params.row.id}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      handleOpenDialog(
                        'Edit Organization',
                        'edit_organization',
                        params.row
                      );
                    }}
                    sx={menuItemStyle}
                  >
                    <EditIcon sx={{ fontSize: 18, marginRight: '8px' }} />
                    Edit
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      setDeleteDialogOpen(true);
                      handleMenuClose();
                      setDeleteTarget({
                        id: params.row.Id,
                        name: params.row.Name,
                        type: 'organizations',
                      });
                    }}
                    sx={menuItemStyle}
                  >
                    <DeleteIcon sx={{ fontSize: 18, marginRight: '8px' }} />
                    Delete
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          )
        );
      },
    },
  ];

  const managerMap = useMemo(() => {
    const map = {};
    if (resources) {
      resources.forEach(res => {
        map[res.Id] = res.FullName;
      });
    }
    return map;
  }, [resources]);

  useEffect(() => {
    if (!updating) {
      dispatch(fetchAllTeams());
      dispatch({
        type: FETCH_ALL_RESOURCES_DETAIL,
        payload: {},
      });
      dispatch(closeDialog());
    }
  }, [updating]);

  useEffect(() => {
    setRows(allResourcesDetail);
  }, [allResourcesDetail]);

  useEffect(() => {
    setTeamRows(teams);
  }, [teams]);

  useEffect(() => {
    if (!teams || teams?.length === 0) {
      dispatch(fetchAllTeams());
    }
    if (!employeeRates || employeeRates?.length === 0) {
      dispatch({
        type: FETCH_EMPLOYEE_RATES,
        payload: {},
      });
    }
    if (!organisations || organisations.length === 0) {
      dispatch({ type: FETCH_ORGANISATIONS });
    }
  }, []);

  const modifyData = data => {
    if (data) {
      return data.map(item => {
        return {
          ...item?.Resource,
          id: item?.Resource?.Id,
          Team: item?.Team?.Name || '',
          Organization: item?.Organization?.Name || '',
        };
      });
    }
    return [];
  };

  const modifyTeamData = data => {
    if (data) {
      return data.map(item => ({
        id: item.Id,
        Id: item.Id,
        Team: item.Name,
        AllocationManager: item.AllocationManager,
        Status: item.Status,
      }));
    }
    return [];
  };

  useEffect(() => {
    if (
      !highlightedRowId ||
      !apiRef?.current ||
      loading ||
      dataProcessing ||
      employeeRatesLoading ||
      allResourcesDetailLoading ||
      !(value === 'teams' || value === 'resource')
    )
      return;

    const timeout = setTimeout(() => {
      const sortedRowIds = apiRef?.current?.getSortedRowIds?.();
      const totalRows = sortedRowIds?.length ?? 0;
      const rowIndex = sortedRowIds?.findIndex(id => id === highlightedRowId);

      if (rowIndex === -1 || rowIndex === undefined) {
        dispatch(clearHighlightedRowId());
        return;
      }
      const offsetRowIndex = Math.min(Math.max(0, rowIndex + 6), totalRows - 1);

      requestAnimationFrame(() => {
        try {
          apiRef.current.scrollToIndexes({ rowIndex: offsetRowIndex });
          let focusColumn;

          if (value === 'rates') {
            focusColumn = 'WorkLocation';
          } else if (value === 'teams') {
            focusColumn = 'Team';
          } else {
            focusColumn = 'FullName';
          }

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

          dispatch(clearHighlightedRowId());
        } catch (err) {
          console.error('Scroll error:', err);
          dispatch(clearHighlightedRowId());
        }
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [
    value,
    allResourcesDetail,
    highlightedRowId,
    loading,
    dataProcessing,
    employeeRatesLoading,
    allResourcesDetailLoading,
    value,
  ]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget.id && !ratesDelete.id) {
      setDeleteDialogOpen(false);
      setDeleteTarget({ id: '', name: '' });
      setRatesDelete({ id: '', WorkLocation: '', HRLevel: '' });
      return;
    }

    switch (value) {
      case 'rates':
        try {
          dispatch({
            type: DELETE_EMPLOYEE_RATES,
            payload: ratesDelete.id,
          });
          dispatch(
            showToast({
              open: true,
              message: 'Rates deleted successfully',
              type: 'success',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
          setDeleteDialogOpen(false);
          setRatesDelete({ id: '', WorkLocation: '', HRLevel: '' });
        } catch (error) {
          dispatch(
            showToast({
              open: true,
              message: 'Failed to delete rates',
              type: 'error',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
          console.error('Error deleting rates:', error);
        }
        break;

      case 'teams':
        const teamId = deleteTarget.id;
        // Look through AllResourceDetails
        try {
          if (
            allResourcesDetail.find(resource => resource?.Team?.Id === teamId)
          ) {
            dispatch(
              showToast({
                open: true,
                message: `Cannot delete a team with resources, please reassign and try again.`,
                type: 'error',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
          } else {
            dispatch(deleteTeam({teamId}));
            dispatch(fetchAllTeams());
            dispatch(
              showToast({
                open: true,
                message: 'Team deleted successfully',
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 1000,
              })
            );
          }
        } catch (error) {
          dispatch(
            showToast({
              open: true,
              message: 'Failed to delete resource',
              type: 'error',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
        } finally {
          setDeleteDialogOpen(false);
          setDeleteTarget({ id: '', name: '', type: '' });
        }
        break;

      case 'organizations':
        try {
          dispatch({
            type: DELETE_ORGANISATION,
            payload: { id: deleteTarget.id },
          });

          dispatch({
            type: FETCH_ORGANISATIONS,
          });

          dispatch(
            showToast({
              open: true,
              message: 'Organization deleted successfully',
              type: 'success',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );

          setDeleteDialogOpen(false);
          setDeleteTarget({ id: '', name: '' });
        } catch (error) {
          dispatch(
            showToast({
              open: true,
              message: 'Failed to delete organization',
              type: 'error',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
          console.error('Error deleting organization:', error);
        }
        break;

      case 'resource':
        dispatch(
          showToast({
            open: true,
            message: 'Checking for active allocations',
            type: 'info',
            position: 'bottom-left',
            autoHideTimer: 1000,
          })
        );

        try {
          const resourceToDelete = allResourcesDetail.find(
            resource => resource.Resource.Id === deleteTarget.id
          );
          if (!resourceToDelete) {
            throw new Error('Resource not found');
          }
          const teamId = resourceToDelete.Team?.Id;

          if (!teamId) {
            await dispatch(deleteResource(deleteTarget.id)).unwrap();
            dispatch(
              showToast({
                open: true,
                message: 'Resource deleted successfully',
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 2000,
              })
            );
            dispatch({
              type: FETCH_ALL_RESOURCES_DETAIL,
              payload: {},
            });
            return;
          }
          const postData = {
            TeamId: teamId,
            StartDate: '2000-01-01',
            EndDate: '2032-01-01',
          };
          const response = await fetchTeamAllocationsForSaga(postData);
          const resourceAllocations = (response || []).filter(
            allocation => allocation.Resource === deleteTarget.id
          );
          if (resourceAllocations.length === 0) {
            await dispatch(deleteResource(deleteTarget.id)).unwrap();
            dispatch(
              showToast({
                open: true,
                message: 'Resource deleted successfully',
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 2000,
              })
            );
            dispatch({ type: FETCH_ALL_RESOURCES_DETAIL, payload: {} });
          } else {
            dispatch(
              showToast({
                open: true,
                message: 'Cannot delete resource with active allocations',
                type: 'error',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
          }
        } catch (error) {
          dispatch(
            showToast({
              open: true,
              message: 'Failed to delete resource',
              type: 'error',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
        } finally {
          setDeleteDialogOpen(false);
          setDeleteTarget({ id: '', name: '' });
        }
        break;

      default:
        alert(`unhandled delete for ${value}`);
        break;
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const handleTitle = value => {
    if (value === 'rates') {
      return (
        <>
          Are you sure you want to delete Rate for Location{' '}
          <em>{ratesDelete.WorkLocation}</em> at HR Level{' '}
          <em>{ratesDelete.HRLevel}</em> ?
        </>
      );
    }
    return (
      <>
        Are you sure you want to delete <em>{deleteTarget.name}</em>?
      </>
    );
  };

  const handleOpenDialog = (title, formType, row) => {
    dispatch(
      openDialog({
        title: title,
        submitButtonText: 'Update',
        cancelButtonText: 'Cancel',
        formType: formType,
        initialData: row,
      })
    );
  };

  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(id);
  };

  const handleMenuClose = params => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const onChange = (event, newValue) => {
    setValue(newValue);

    const tabParam = newValue === 'resource' ? '' : `?tab=${newValue}`;
    const newUrl = `/people${tabParam}`;
    router.replace(newUrl, { scroll: false });
  };

  const renderTable = () => {
    switch (value) {
      case 'resource':
        return (
          <ResourceTable
            loading={loading || dataProcessing || allResourcesDetailLoading}
            columns={columns}
            rows={modifyData(rows)}
            apiRef={apiRef}
            value={value}
            onChange={onChange}
          />
        );
      case 'teams':
        return (
          <TeamsTable
            loading={loading || dataProcessing}
            columns={teamColumns}
            rows={modifyTeamData(teamRows) || []}
            apiRef={apiRef}
            value={value}
            onChange={onChange}
            componentsProps={{
              columnHeaders: {
                sx: {
                  color: '#313F68',
                  fontFamily: '"Open Sans", sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '20px',
                  fontStyle: 'normal',
                },
              },
            }}
          />
        );
      case 'organizations':
        return (
          <OrganisationsTable
            loading={allOrganizationsLoading}
            columns={organizationColumns}
            rows={organisations.map((org, index) => ({
              Id: org.Id,
              id: org.Id,
              Name: org.Name,
              Status: org.Status,
            }))}
            apiRef={apiRef}
            value={value}
            onChange={onChange}
          />
        );
      case 'rates':
        return (
          <TeamsTable
            loading={employeeRatesLoading}
            columns={employeeRatesColumns}
            rows={
              employeeRates?.map(emp => ({
                ...emp,
                id: emp.Id,
              })) || []
            }
            apiRef={apiRef}
            value={value}
            onChange={onChange}
          />
        );
      default:
        return <></>;
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
        height: '100%',
      }}
    >
      {renderTable()}
      <ConfirmDialog
        open={deleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title={handleTitle(value)}
      >
        This will permanently delete the{' '}
        {value === 'rates'
          ? 'Rate'
          : value === 'teams'
            ? 'Team'
            : value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()}
        .
      </ConfirmDialog>
    </Box>
  );
}
