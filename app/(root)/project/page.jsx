'use client';
import ProjectTable from '@/app/components/Projects/Table/ProjectTable';
import { Box, display, styled } from '@mui/system';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  calculateWeekRanges,
  generateDateWeekMath,
  generateRandomColor,
  getInitials,
  getResourceFromUid,
  getTotalWeeks,
} from '@/app/utils/common';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProjects } from '@/app/redux/actions/fetchProjectsAction';
import { closeDialog, openDialog } from '@/app/redux/reducers/dialogReducer';
import CustomAvatar from '@/app/components/Avatar/CustomAvatar';
import ConfirmDialog from '@/app/components/Dialog/ConfirmDialog';
import { deleteProject, getAllProjects } from '@/app/services/projectServices';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  COMPANY_DEFAULT_VIEW,
  setSplitView,
  setSplitViewCurrentProject,
  updateCurrentView,
} from '@/app/redux/reducers/allocationViewReducer';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGridApiRef } from '@mui/x-data-grid-premium';
import { clearHighlightedRowId } from '@/app/redux/reducers/highlightedRowReducer';
import EllipsisNameCell from '@/app/components/ResourceAllocation/component/EllipsisNameCell';
import { fetchProjectAllocationsForSaga } from '@/app/services/projectServices';
import { showToast } from '@/app/redux/reducers/toastReducer';
import { FETCH_PORTFOLIOS } from '@/app/redux/actions/portfolioActions';
import { DELETE_PORTFOLIOS } from '@/app/redux/actions/portfolioActions';
import {
  PORTFOLIO_DISPLAY_NAME,
  PROJECT_PAGE_VALID_TABS,
} from '@/app/constants/constants';
import { parseISO } from 'date-fns';
import { StatusPill } from '@/app/components/Settings/styled';

import {
  CREATE_ORGANISATION,
  DELETE_ORGANISATION,
  UPDATE_ORGANISATION,
} from '@/app/redux/actions/organizationsAction';
import { FETCH_ALL_RESOURCES_DETAIL } from '@/app/redux/actions/allResourcesDetailAction';
import { FETCH_PROJECT_TYPES } from '@/app/redux/actions/allSettingsActions';
import { withRBAC } from '@/app/components/HOC/withRBAC';
import PortfolioTable from '@/app/components/Projects/Table/PortfolioTable';
import LoadingScreen from '@/app/components/Loading/loadingScreen';
import ErrorPage from '@/app/components/ErrorPage/ErrorPage';
import dayjs from 'dayjs';

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

const AddAllocationIcon = () => (
  <img src="/images/icons/AddAllocation.svg" alt="AddAllocation" />
);

const accessMap = [
  { key: 'Project', value: 'project' },
  { key: 'Portfolio', value: 'portfolio' },
];

function Project({ permissions, loadingPermissions }) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const apiRef = useGridApiRef();

  const { id: highlightedRowId } = useSelector(state => state.highlightedRow);
  const { projects, updating, loading } = useSelector(state => state.projects);
  const { resources, loading: resourceLoading } = useSelector(
    state => state.resources
  );
  const { projectTypes } = useSelector(state => state.allSettings);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [rows, setRows] = useState(projects || null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const router = useRouter();
  const allResources = resources || [];
  const [value, setValue] = useState('project');
  const { portfolios, loading: loadingPortfolio } = useSelector(
    state => state.portfolios
  );
  const [portfolioRows, setPortfolioRows] = useState(portfolios || null);
  const [portfolioDelete, setPortfolioDelete] = useState({
    Id: '',
    Name: '',
  });

  useEffect(() => {
    if (loadingPermissions) return;

    const accessible = accessMap.filter(({ key }) => permissions[key]?.r);

    if (accessible.length === 0) {
      return;
    }

    const tab = searchParams.get('tab');
    const firstAccessible = accessible[0].value;
    const isAccessible = accessible.some(({ value }) => value === tab);

    if (!tab || !PROJECT_PAGE_VALID_TABS.includes(tab) || !isAccessible) {
      router.replace(`/project?tab=${firstAccessible}`);
      return;
    }

    if (tab !== value) {
      setValue(tab);
    }
  }, [loadingPermissions]);

  useEffect(() => {
    const newTab = searchParams.get('tab');
    if (
      newTab &&
      PROJECT_PAGE_VALID_TABS.includes(newTab) &&
      newTab !== value
    ) {
      setValue(newTab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!updating) {
      dispatch(fetchAllProjects());
      dispatch(closeDialog());
    }
  }, [updating]);

  useEffect(() => {
    if (projects?.length) {
      if (portfolios?.length) {
        setRows(
          projects?.map(project => ({
            ...project,
            Portfolio: project.PortfolioId
              ? portfolios.find(p => p.Id === project.PortfolioId)?.Name || ''
              : '',
          }))
        );
      } else {
        setRows(projects);
      }
    }
  }, [projects, portfolios]);

  useEffect(() => {
    if (!resources?.length) {
      dispatch({
        type: FETCH_ALL_RESOURCES_DETAIL,
        payload: {},
      });
    }
    if (!portfolios?.length) {
      dispatch({
        type: FETCH_PORTFOLIOS,
        payload: {},
      });
    }
    if (!projectTypes?.length) {
      dispatch({
        type: FETCH_PROJECT_TYPES,
        payload: {},
      });
    }
  }, []);

  useEffect(() => {
    dispatch({ type: FETCH_PORTFOLIOS });
  }, []);

  useEffect(() => {
    setPortfolioRows(portfolios);
  }, [portfolios]);

  // const modifyData = data => {
  //   if (data) {
  //     return data.map(item => {
  //       return {
  //         ...item,
  //         id: item.Id,
  //         ProjectSponsor: getResourceFromUid(item.ProjectSponsor, allResources)
  //           ?.FullName,
  //         ProjectManager: getResourceFromUid(item.ProjectManager, allResources)
  //           ?.FullName,
  //       };
  //     });
  //   }
  //   return [];
  // };

  const modifyData = data => {
    if (!data) return [];

    return data.map(item => {
      const project = item.Project || item;

      return {
        ...project,
        id: project.Id,
        ProjectSponsor: getResourceFromUid(project.ProjectSponsor, allResources)
          ?.FullName,
        ProjectManager: getResourceFromUid(project.ProjectManager, allResources)
          ?.FullName,
        Type:
          projectTypes?.find(pt => pt.Id === project.Type)?.Name ||
          project.Type ||
          '',
      };
    });
  };

  const modifyPortfolioData = data => {
    if (data) {
      return data.map(item => ({
        id: item.Id,
        Id: item.Id,
        SidebarColor: item.SidebarColor,
        Name: item.Name,
        Description: item.Description,
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
          apiRef.current.setCellFocus(highlightedRowId, 'Name');
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
  }, [projects, highlightedRowId]);

  const handleConfirmDelete = async id => {
    if (value === 'project') {
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
        const postData = {
          Project: id,
          StartDate: '2000-01-01',
          EndDate: '2032-01-01',
        };
        const response = await fetchProjectAllocationsForSaga(postData);
        if (!response || response.length === 0) {
          await dispatch(deleteProject({ projectId: id })).unwrap();
          dispatch(
            showToast({
              open: true,
              message: 'Project deleted successfully',
              type: 'success',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
          dispatch(fetchAllProjects());
        } else {
          const allocations = response;
          const firstPeriod = allocations[0]?.Period;
          const lastPeriod = allocations[allocations.length - 1]?.Period;
          const formattedFirst = dayjs(firstPeriod).format('MM/DD/YYYY');
          const formattedLast = dayjs(lastPeriod).format('MM/DD/YYYY');
          dispatch(
            showToast({
              open: true,
              message: `Cannot delete project with active allocations for period: ${formattedFirst} to ${formattedLast}`,
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
            message: 'Failed to delete project',
            type: 'error',
            position: 'bottom-left',
            autoHideTimer: 1000,
          })
        );
      } finally {
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
      }
    }
    if (value === 'portfolio') {
      try {
        const { Id, Name } = portfolioDelete;
        if (
          projects &&
          projects?.some(
            p =>
              p.PortfolioId === Id &&
              !['Requested', 'Paused', 'Cancelled', 'Completed'].includes(
                p.Status
              )
          )
        ) {
          dispatch(
            showToast({
              open: true,
              message:
                'This Portfolio contains active projects. Please unassign these projects or update their statuses to inactive before proceeding.',
              type: 'error',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
        } else {
          await dispatch({ type: 'DELETE_PORTFOLIOS', payload: id });
          dispatch(
            showToast({
              open: true,
              message: 'Portfolio deleted successfully',
              type: 'success',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
          dispatch({ type: 'FETCH_PORTFOLIOS' });
        }
      } catch (error) {
        dispatch(
          showToast({
            open: true,
            message: 'Failed to delete portfolio',
            type: 'error',
            position: 'bottom-left',
            autoHideTimer: 1000,
          })
        );
      } finally {
        setDeleteDialogOpen(false);
        setPortfolioDelete({ Id: '', Name: '' });
      }
    }
  };
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleOpenDialog = (title, formType, row, dialogOptions = {}) => {
    dispatch(
      openDialog({
        title: title,
        submitButtonText: 'Update',
        cancelButtonText: 'Cancel',
        formType: formType,
        initialData: row,
        ...dialogOptions,
      })
    );
  };

  const handleOpenSplitView = params => {
    dispatch(setSplitView(true));
    dispatch(setSplitViewCurrentProject(params.row));
    const { StartDate, EndDate } = params.row;
    const currentDate = new Date();

    const getDateRange = (start, end) => {
      if (start && end) {
        const weeks = getTotalWeeks(start, end);
        return weeks > 52
          ? [start, generateDateWeekMath('WEEK_PLUS', 51, new Date(start))]
          : [start, end];
      }

      if (!start && end)
        return [generateDateWeekMath('WEEK_MINUS', 20, new Date(end)), end];
      if (start && !end)
        return [start, generateDateWeekMath('WEEK_PLUS', 20, new Date(start))];

      return [
        generateDateWeekMath('WEEK_MINUS', 1, currentDate),
        generateDateWeekMath('WEEK_PLUS', 19, currentDate),
      ];
    };

    const [startRange, endRange] = getDateRange(StartDate, EndDate);

    if (startRange && endRange) {
      const { weekMinus, weekPlus } = calculateWeekRanges(
        startRange,
        endRange,
        currentDate
      );
      dispatch(
        updateCurrentView({
          ...COMPANY_DEFAULT_VIEW,
          isDynamicRange: false,
          isFixedRange: true,
          StartDate: startRange,
          EndDate: endRange,
          WeekPlus: weekPlus,
          WeekMinus: weekMinus,
        })
      );
    }
    router.replace('/allocation');
  };

  const columns = [
    {
      field: 'Name',
      headerName: 'Project Name',
      flex: 1,
      minWidth: 180,
      renderCell: params => {
        const handleNameClick = () => {
          permissions['Project']?.u
            ? handleOpenDialog('Edit Project', 'edit_project', params.row)
            : handleOpenDialog(
                `Porject: ${params.value}`,
                'edit_project',
                params.row,
                {
                  readOnly: true,
                }
              );
        };
        return (
          <Box
            sx={{
              display: 'inline-block',
              maxWidth: '100%',
              color: '#152E75',
              cursor: 'pointer',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onClick={handleNameClick}
          >
            <EllipsisNameCell value={params.value} showAvatar={false} />
          </Box>
        );
      },
    },
    {
      field: 'ProjectSponsor',
      headerName: 'Project Sponsor',
      flex: 2,
      minWidth: 180,
      renderCell: params => {
        const fullName = params.value;
        return fullName ? (
          <EllipsisNameCell showAvatar={true} value={fullName} />
        ) : (
          ''
        );
      },
    },
    {
      field: 'ProjectManager',
      headerName: 'Project Manager',
      flex: 2,
      minWidth: 180,
      renderCell: params => {
        const fullName = params.value;
        return (
          fullName && (
            <EllipsisNameCell showAvatar={!!fullName} value={fullName} />
          )
        );
      },
    },
    {
      field: 'Location',
      headerName: 'Location',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'Budget',
      headerName: 'Project Budget',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'BudgetCurrency',
      headerName: 'Budget Currency',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'Type',
      headerName: 'Type',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'Portfolio',
      headerName: PORTFOLIO_DISPLAY_NAME,
      flex: 1,
      minWidth: 150,
      renderCell: params => {
        return (
          <EllipsisNameCell
            showAvatar={false}
            value={params?.row?.Portfolio || ''}
          />
        );
      },
    },
    {
      field: 'AllowOvertime',
      headerName: 'Allow Overtime',
      flex: 1,
      minWidth: 130,
      valueGetter: params => (params ? 'Yes' : 'No'),
    },
    {
      field: 'Status',
      headerName: 'Status',
      flex: 1,
      minWidth: 140,
      renderCell: params => (
        <StatusPill status={params.value}>{params.value}</StatusPill>
      ),
    },
    {
      field: 'StartDate',
      headerName: 'Start Date',
      flex: 1,
      minWidth: 120,
      renderCell: params => {
        if (params && params.value) {
          const date = new Date(parseISO(params.value));
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
          const date = new Date(parseISO(params.value));
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${month}/${day}/${year}`;
        }
        return '';
      },
    },
  ];

  // Actions column will be added only if some Actions can be performed.
  if (
    permissions['Project']?.u ||
    permissions['Project']?.d ||
    permissions['Allocation']?.c
  ) {
    columns.push({
      field: 'actions',
      headerName: 'Action',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <>
          {(permissions['Project']?.u ||
            permissions['Project']?.d ||
            permissions['Allocation']?.c) && (
            <IconButton
              size="small"
              onClick={e => handleMenuClick(e, params.row.id)}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && selectedRow === params.row.id}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              flexShrink: 0,
              paddingTop: '2px',
              paddingBottom: '4px',
            }}
          >
            {permissions['Allocation']?.c && (
              <MenuItem
                onClick={() => handleOpenSplitView(params)}
                sx={menuItemStyle}
              >
                <AddAllocationIcon sx={{ fontSize: 18, marginRight: '8px' }} />
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#1C2D5F',
                    paddingLeft: '10px',
                  }}
                >
                  Add Allocation
                </Typography>
              </MenuItem>
            )}
            {permissions['Project']?.u && (
              <MenuItem
                onClick={() => {
                  (handleOpenDialog('Edit Project', 'edit_project', params.row),
                    handleMenuClose());
                }}
                sx={menuItemStyle}
              >
                <EditIcon
                  sx={{ fontSize: 18, marginRight: '8px', color: '#1C2D5F' }}
                />
                <Typography
                  sx={{ fontSize: '12px', fontWeight: '600', color: '#1C2D5F' }}
                >
                  Edit Project
                </Typography>
              </MenuItem>
            )}
            {permissions['Project']?.d && (
              <MenuItem
                onClick={() => {
                  setProjectToDelete(params.row);
                  setDeleteDialogOpen(true);
                  handleMenuClose();
                }}
                sx={menuItemStyle}
              >
                <DeleteIcon
                  sx={{ fontSize: 18, marginRight: '8px', color: '#1C2D5F' }}
                />
                <Typography
                  sx={{ fontSize: '12px', fontWeight: '600', color: '#1C2D5F' }}
                >
                  Delete Project
                </Typography>
              </MenuItem>
            )}
          </Menu>
        </>
      ),
    });
  }

  const portfolioColumns = [
    {
      field: 'Name',
      headerName: 'Portfolio Name',
      minWidth: 230,
      hideable: false,
      renderCell: params => {
        const handleNameClick = () => {
          if (permissions['Portfolio']?.u) {
            handleOpenDialog('Edit Portfolio', 'edit_portfolio', params.row);
          } else {
            handleOpenDialog(
              `Portfolio: ${params.value}`,
              'edit_portfolio',
              params.row,
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
            <EllipsisNameCell showAvatar={false} value={params.value} />
          </Box>
        );
      },
    },
    {
      field: 'Description',
      headerName: 'Portfolio Description',
      minWidth: 300,
      renderCell: params => {
        const description = params.value;
        return description ? (
          <EllipsisNameCell showAvatar={false} value={description} />
        ) : (
          ''
        );
      },
    },
    {
      field: 'SidebarColor',
      headerName: 'Sidebar Color',
      minWidth: 130,
      renderCell: params => {
        const color = params.value;
        return color ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '4px',
                backgroundColor: color,
                border: '1px solid #ccc',
              }}
            />
          </Box>
        ) : null;
      },
    },
    {
      field: 'Status',
      headerName: 'Status',
      width: 170,
      flex: 1,
      sortable: true,
      filterable: true,
      hideable: false,
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
                height: '100%',
              }}
            >
              <StatusPill status={status}>{status}</StatusPill>
              {(permissions['Portfolio']?.u || permissions['Portfolio']?.d) && (
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
                    {permissions['Portfolio']?.u && (
                      <MenuItem
                        onClick={() => {
                          handleMenuClose();
                          handleOpenDialog(
                            'Edit Portfolio',
                            'edit_portfolio',
                            params.row
                          );
                        }}
                        sx={menuItemStyle}
                      >
                        <EditIcon sx={{ fontSize: 18, marginRight: '8px' }} />
                        Edit
                      </MenuItem>
                    )}

                    {permissions['Portfolio']?.d && (
                      <MenuItem
                        onClick={() => {
                          setDeleteDialogOpen(true);
                          handleMenuClose();
                          setPortfolioDelete(params.row);
                        }}
                        sx={menuItemStyle}
                      >
                        <DeleteIcon sx={{ fontSize: 18, marginRight: '8px' }} />
                        Delete
                      </MenuItem>
                    )}
                  </Menu>
                </Box>
              )}
            </Box>
          )
        );
      },
    },
  ];

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

    const tabParam = `?tab=${newValue}`;
    const newUrl = `/project${tabParam}`;
    router.replace(newUrl, { scroll: false });
  };

  const renderTable = () => {
    switch (value) {
      case 'project':
        return (
          <ProjectTable
            loading={loading || resourceLoading || loadingPermissions}
            columns={columns}
            rows={modifyData(rows)}
            apiRef={apiRef}
            value={value}
            onChange={onChange}
          />
        );

      case 'portfolio':
        return (
          <PortfolioTable
            loading={loadingPortfolio || loadingPermissions}
            columns={portfolioColumns}
            rows={modifyPortfolioData(portfolioRows)}
            apiRef={apiRef}
            value={value}
            onChange={onChange}
          />
        );

      case 'businessImpact':
        return (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          ></Box>
        );

      default:
        return null;
    }
  };

  return loadingPermissions ? (
    <LoadingScreen />
  ) : accessMap.some(tab => permissions[tab.key].r) ? (
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
        onConfirm={() =>
          handleConfirmDelete(
            value === 'project' ? projectToDelete?.Id : portfolioDelete?.Id
          )
        }
        onCancel={handleCancelDelete}
        title={
          value === 'project'
            ? 'Are you sure you want to delete this project?'
            : 'Are you sure you want to delete this portfolio?'
        }
      >
        {value === 'project'
          ? 'This will permanently delete the project.'
          : `This will permanently delete ${portfolioDelete?.Name ?? 'portfolio'}.`}
      </ConfirmDialog>
    </Box>
  ) : (
    <ErrorPage type="accessDenied" redirectPath="/dashboard" />
  );
}

export default withRBAC(Project, ['Project', 'Portfolio', 'Allocation']);
