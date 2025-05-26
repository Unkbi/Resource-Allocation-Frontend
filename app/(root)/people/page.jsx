'use client';
import ResourceTable from '@/app/components/Resources/ResourceTable';
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
import { getAllTeams } from '@/app/services/teamServices';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteResource } from '@/app/services/resourceServices';
import { clearHighlightedRowId } from '@/app/redux/reducers/highlightedRowReducer';
import { useGridApiRef } from '@mui/x-data-grid-premium';
import {
  FETCH_ORGANISATIONS,
  FETCH_ORGANISATIONS_RESOURCES,
} from '@/app/redux/actions/organizationsAction';
import TeamsTable from '@/app/components/Resources/TeamsTable';
import { getAllocationManagerFromPath } from '@/app/utils/common';
import { FETCH_EMPLOYEE_RATES } from '@/app/redux/actions/employeeRatesActions';
import EllipsisNameCell from '@/app/components/ResourceAllocation/component/EllipsisNameCell';

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

const StatusPill = styled('div')(({ theme, status }) => {
  let backgroundColor, textColor;
  switch (status) {
    case 'Active':
      backgroundColor = '#4B9F471A';
      textColor = '#4B9F47';
      break;
    case 'Proposed':
      backgroundColor = '#5041AB1A';
      textColor = '#5041AB';
      break;
    case 'Approved':
      backgroundColor = '#2772F01A';
      textColor = '#2772F0';
      break;
    case 'Paused':
      backgroundColor = '#E6521F1A';
      textColor = '#E6521F';
      break;
    case 'Completed':
      backgroundColor = '#F5B5441A';
      textColor = '#F5B544';
      break;
    case 'Inactive':
      backgroundColor = '#FCF0ED';
      textColor = '#C73732';
      break;
    default:
      backgroundColor = '#e0e0e0';
      textColor = '#6c757d';
  }

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    fontFamily: theme.typography.fontFamily,
    fontsize: '12px',
    fontStyle: 'normal',
    fontweight: 400,
    lineheight: '16px',
    width: '86px',
    height: '28px',
    backgroundColor,
    color: textColor,
  };
});

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
  const { teams, teamsResources, dataProcessing } = useSelector(
    state => state.teams
  );
  const {
    organisations,
    organisationsResources,
    loading: organisationLoading,
  } = useSelector(state => state.organisations);
  const { employeeRates, loading: employeeRatesLoading } = useSelector(
    state => state.employeeRates
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [rows, setRows] = useState(resources?.result || null);
  const [teamRows, setTeamRows] = useState(teams?.result || null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: '', name: '' });
  const { id: highlightedRowId } = useSelector(state => state.highlightedRow);
  const [value, setValue] = useState('resource');

  const columns = [
    {
      field: 'FullName',
      headerName: 'Resource',
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
        params.value && (
          <EllipsisNameCell value={params.value} showAvatar={false} />
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
        return (
          <EllipsisNameCell
            value={managerMap?.[managerId] || managerId || ''}
            showAvatar={false}
          />
        );
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
            <>
              <StatusPill status={status}>{status}</StatusPill>
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
            </>
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
          handleOpenDialog();
        };

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'left',
            }}
          >
            <Box
              /*
               * To Be Implemented...
               */
              // onClick={handleNameClick}
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
          resources &&
          'result' in resources &&
          getAllocationManagerFromPath(params.value, resources.result);

        if (!manager?.FullName) return <span>N/A</span>;
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
                    /*
                     * To Be Implemented...
                     */
                    // onClick={() => {
                    //   handleMenuClose();
                    //   handleOpenDialog('Edit Team', 'edit_team', params.row);
                    // }}
                    sx={menuItemStyle}
                  >
                    <EditIcon sx={{ fontSize: 18, marginRight: '8px' }} />
                    Edit
                  </MenuItem>

                  <MenuItem
                    /*
                     * To Be Implemented...
                     */
                    // onClick={() => {
                    //   setDeleteDialogOpen(true);
                    //   handleMenuClose();
                    //   setDeleteTarget({
                    //     id: params.row.Id,
                    //     name: params.row.Name,
                    //   });
                    // }}
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
        return <Box sx={{ paddingLeft: '32px' }}>{params.value}</Box>;
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
      headerName: 'Rates/Hr',
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
                    /*
                     * To Be Implemented...
                     */
                    // onClick={() => {
                    //   handleMenuClose();
                    //   handleOpenDialog('Edit Team', 'edit_team', params.row);
                    // }}
                    sx={menuItemStyle}
                  >
                    <EditIcon sx={{ fontSize: 18, marginRight: '8px' }} />
                    Edit
                  </MenuItem>

                  <MenuItem
                    /*
                     * To Be Implemented...
                     */
                    // onClick={() => {
                    //   setDeleteDialogOpen(true);
                    //   handleMenuClose();
                    //   setDeleteTarget({
                    //     id: params.row.Id,
                    //     name: params.row.Name,
                    //   });
                    // }}
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

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === 'teams') {
      dispatch(getAllTeams());
    }
  };

  const managerMap = useMemo(() => {
    const map = {};
    if (resources?.result) {
      resources.result.forEach(res => {
        map[res.Id] = res.FullName;
      });
    }
    return map;
  }, [resources]);

  useEffect(() => {
    if (!updating) {
      dispatch(fetchAllResources());
      dispatch(getAllTeams());
      dispatch(closeDialog());
    }
  }, [updating]);

  useEffect(() => {
    setRows(resources?.result);
  }, [resources]);

  useEffect(() => {
    setTeamRows(teams?.result);
  }, [teams]);

  useEffect(() => {
    if (!teamsResources || Object.keys(teamsResources).length === 0) {
      dispatch({
        type: 'FETCH_TEAM_RESOURCES',
        payload: {
          teams: [],
        },
      });
    }
    if (!teams || teams?.result?.length === 0) {
      dispatch(getAllTeams());
    }
    if (
      !organisationsResources ||
      Object.keys(organisationsResources).length === 0
    ) {
      dispatch({
        type: FETCH_ORGANISATIONS_RESOURCES,
        payload: {
          organisations: [],
        },
      });
    }
    if (!employeeRates || employeeRates?.length === 0) {
      dispatch({
        type: FETCH_EMPLOYEE_RATES,
        payload: {},
      });
    }
  }, []);

  const modifyData = data => {
    if (data) {
      return data.map(item => {
        return {
          ...item,
          id: item.Id,
          Team:
            getTeamForResource(item.Id, teams?.result, teamsResources)?.Name ||
            '',
          Organization:
            getOrganisationForResource(
              item.Id,
              organisations,
              organisationsResources
            )?.Name || '',
        };
      });
    }
    return [];
  };

  const modifyTeamData = data => {
    if (data) {
      return data.map(item => ({
        id: item.Id,
        Team: item.Name,
        AllocationManager: item.AllocationManager,
        Status: item.Status,
      }));
    }
    return [];
  };

  useEffect(() => {
    if (!highlightedRowId || !apiRef?.current) return;

    const sortedRowIds = apiRef.current.getSortedRowIds?.();
    const totalRows = sortedRowIds?.length ?? 0;
    const rowIndex = sortedRowIds?.findIndex(id => id === highlightedRowId);

    if (rowIndex === -1 || rowIndex === undefined) {
      dispatch(clearHighlightedRowId());
      return;
    }

    const offsetRowIndex = Math.min(Math.max(0, rowIndex + 6), totalRows - 1);

    const timeout = setTimeout(() => {
      requestAnimationFrame(() => {
        try {
          apiRef.current.scrollToIndexes({ rowIndex: offsetRowIndex });
          apiRef.current.setCellFocus(highlightedRowId, 'FullName');
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
    }, 300);

    return () => clearTimeout(timeout);
  }, [resources, highlightedRowId]);

  const handleConfirmDelete = () => {
    if (!deleteTarget.id) return;
    dispatch(deleteResource(deleteTarget.id))
      .then(() => {
        dispatch(fetchAllResources());
      })
      .catch(error => {
        console.error('Error deleting resource:', error);
      });
    setDeleteDialogOpen(false);
    setDeleteTarget({ id: '', name: '' });
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
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
  };

  const renderTable = () => {
    switch (value) {
      case 'resource':
        return (
          <ResourceTable
            loading={loading || dataProcessing || organisationLoading}
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
            loading={dataProcessing}
            columns={teamColumns}
            rows={modifyTeamData(teamRows) || []}
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
      case 'rates':
        return (
          <TeamsTable
            loading={employeeRatesLoading}
            columns={employeeRatesColumns}
            rows={
              employeeRates?.map((emp, index) => ({
                ...emp,
                id: index,
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
        title={
          <>
            Are you sure you want to delete <em>{deleteTarget.name}</em>?
          </>
        }
      >
        This will permanently delete the Resource.
      </ConfirmDialog>
    </Box>
  );
}
