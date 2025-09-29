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
import { StatusPill, commonTabSx } from './styled';
import {
  DELETE_PROJECT_TYPE,
  DELETE_PROJECT_TYPE_GROUPS,
} from '@/app/redux/actions/allSettingsActions';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';
import { PROJECT_TYPE_VALID_TABS } from '@/app/constants/constants';

interface ProjectSettingPageProps {
  permissions: Record<string, CrudPermissions>;
}

const baseURLAccessManagement = '/settings?menu=project-setting';
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
    label: 'Project Types',
    value: 'project-types',
    icon: '/images/icons/ProjectTypes.svg',
    entity: 'ProjectType',
  },
  {
    label: 'Project Types Group',
    value: 'project-types-group',
    icon: '/images/icons/ProjectTypesGroup.svg',
    entity: 'ProjectTypeGroup',
  },
];

function ProjectSettingPage({ permissions }: ProjectSettingPageProps) {
  const dispatch = useDispatch();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tab, setTab] = useState('project-types');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuProjectTypeId, setMenuProjectTypeId] = useState<string | null>(
    null
  );
  const [deletingProjectTypes, setDeletingProjectTypes] = useState<
    string | null
  >(null);
  const [deletingProjectTypesGroup, setDeletingProjectTypesGroup] = useState<
    string | null
  >(null);
  const { projectTypes, projectTypeGroups, loading } = useSelector(
    (state: any) => state.allSettings
  );
  const [ProjectTypesData, setProjectTypesData] = useState<any[]>([]);
  const [ProjectTypesGroupData, setProjectTypesGroupData] = useState<any[]>([]);

  const { id: highlightedRowId } = useSelector(
    (state: any) => state.highlightedRow
  );
  const apiRef = useGridApiRef();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessMap = [
      { key: 'ProjectType', value: 'project-types' },
      { key: 'ProjectTypeGroup', value: 'project-types-group' },
    ];

    const accessible = accessMap.filter(({ key }) => permissions[key]?.r);

    if (accessible.length === 0) {
      router.replace('/settings?menu=user-profile');
      return;
    }

    const tabParam = searchParams.get('tab');
    const firstAccessible = accessible[0].value;
    const isAccessible = accessible.some(({ value }) => value === tabParam);

    if (!tabParam || !PROJECT_TYPE_VALID_TABS.includes(tab) || !isAccessible) {
      router.replace(`/settings?menu=project-setting&tab=${firstAccessible}`);
      return;
    }

    if (tabParam !== tab) {
      setTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && PROJECT_TYPE_VALID_TABS.includes(tabParam)) {
      setTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const formattedData =
      projectTypes?.map((projectType: any, index: number) => {
        const projectTypeGroup = projectTypeGroups?.find(
          (group: any) => group.Id === projectType.Group
        );

        return {
          id: projectType.Id || (index + 1).toString(),
          projectTypes: projectType.Name || '',
          projectTypesGroup: projectTypeGroup?.Name || '',
          description: projectType.Description || '',
          Color: projectType.Color || '',
          Status: projectType.Status || 'Active',
          Name: projectType.Name || '',
        };
      }) || [];

    const formattedGroupData =
      projectTypeGroups?.map((group: any, index: number) => {
        return {
          id: group.Id || (index + 1).toString(),
          projectTypeGroup: group.Name || '',
          Name: group.Name || '',
        };
      }) || [];

    setProjectTypesData(formattedData);
    setProjectTypesGroupData(formattedGroupData);
  }, [projectTypes, projectTypeGroups]);

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

          const focusColumn =
            tab === 'project-types' ? 'projectTypes' : 'projectTypeGroup';

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
  }, [highlightedRowId, ProjectTypesData, tab]);

  const handleAddNewProjectTypesGroup = () => {
    dispatch(
      openDialog({
        title: 'Add Project Type Group',
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'add_project_type_group',
      })
    );
  };

  const handleEditProjectTypesGroup = (
    assignment: any,
    title = 'Edit Project Type Group',
    dialogOptions = {}
  ) => {
    dispatch(
      openDialog({
        title: title,
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'edit_project_type_group',
        initialData: assignment,
        ...dialogOptions,
      })
    );
  };

  const handleDeleteProjectTypesGroup = (Name: string) => {
    setDeletingProjectTypesGroup(Name);
    setIsDialogOpen(true);
  };

  const handleAddNewProjectTypes = () => {
    dispatch(
      openDialog({
        title: 'Add Project Type',
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'add_project_type',
      })
    );
  };

  const handleEditProjectTypes = (
    assignment: any,
    title = 'Edit Project Type',
    dialogOptions = {}
  ) => {
    dispatch(
      openDialog({
        title: title,
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'edit_project_type',
        initialData: assignment,
        ...dialogOptions,
      })
    );
  };

  const handleDeleteProjectTypes = (Name: string) => {
    setDeletingProjectTypes(Name);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProjectTypes && !deletingProjectTypesGroup) return;
    try {
      if (tab === 'project-types' && deletingProjectTypes) {
        dispatch({
          type: DELETE_PROJECT_TYPE,
          payload: {
            projectTypeId: projectTypes.find((e: any) => {
              return e.Name === deletingProjectTypes;
            })?.Id,
          },
        });
      } else if (tab === 'project-types-group' && deletingProjectTypesGroup) {
        dispatch({
          type: DELETE_PROJECT_TYPE_GROUPS,
          payload: {
            projectTypeGroupId: projectTypeGroups.find((e: any) => {
              return e.Name === deletingProjectTypesGroup;
            })?.Id,
          },
        });
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeletingProjectTypes(null);
      setDeletingProjectTypesGroup(null);
      setIsDialogOpen(false);
    }
  };

  const ProjectTypesPageColumns = [
    {
      field: 'projectTypes',
      headerName: 'Project Type',
      flex: 1,
      renderCell: (params: any) => (
        <Typography
          onClick={() => {
            if (permissions['ProjectType'].u) {
              handleEditProjectTypes(params.row);
            } else {
              handleEditProjectTypes(
                params.row,
                `Project Type: ${params.value}`,
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
    {
      field: 'projectTypesGroup',
      headerName: 'Project Type Group',
      flex: 1,
      renderCell: (params: any) => (
        <Typography sx={{ ...commonCellStyle }}>{params.value}</Typography>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      renderCell: (params: any) => (
        <Typography sx={commonCellStyle}>{params.value}</Typography>
      ),
    },
    {
      field: 'Color',
      headerName: 'Color',
      flex: 1,
      editable: false,
      renderCell: (params: any) => {
        const color = params.value;
        return color ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'start',
              paddingLeft: '5%',
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
      sortable: false,
      align: 'start',
    },
    {
      field: 'Status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params: any) => (
        <StatusPill status={params.value}>{params.value}</StatusPill>
      ),
    },
    ...(permissions['ProjectType']?.u || permissions['ProjectType']?.d
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
                    setMenuProjectTypeId(params.row.Name);
                  }}
                  size="small"
                >
                  <MoreHorizontal sx={{ fontSize: 20 }} />
                </IconButton>
                <Typography sx={commonCellStyle}>
                  {params.row.Name && renderProjectTypesMenu(params.row.Name)}
                </Typography>
              </>
            ),
          },
        ]
      : []),
  ];

  const ProjectTypesGroupColumns = [
    {
      field: 'projectTypeGroup',
      headerName: 'Project Type Group',
      flex: 1,
      renderCell: (params: any) => (
        <Typography
          onClick={() => {
            if (permissions['ProjectTypeGroup'].u) {
              handleEditProjectTypesGroup(params.row);
            } else {
              handleEditProjectTypesGroup(
                params.row,
                `Project Type Group: ${params.value}`,
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
    ...(permissions['ProjectTypeGroup']?.u || permissions['ProjectTypeGroup']?.d
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
                    setMenuProjectTypeId(params.row.Name);
                  }}
                  size="small"
                >
                  <MoreHorizontal sx={{ fontSize: 20 }} />
                </IconButton>
                <Typography sx={commonCellStyle}>
                  {params.row.Name && ProjectTypesGroupMenu(params.row.Name)}
                </Typography>
              </>
            ),
          },
        ]
      : []),
  ];

  const renderProjectTypesMenu = (id: string) => (
    <StyledMenu
      anchorEl={anchorEl}
      open={menuProjectTypeId === id}
      onClose={() => setMenuProjectTypeId(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {permissions['ProjectType'].u && (
        <StyledMenuItem
          onClick={() => {
            const assignment = ProjectTypesData.find(r => r.Name === id);
            if (assignment) {
              handleEditProjectTypes(assignment);
            }
            setMenuProjectTypeId(null);
          }}
        >
          <Pencil sx={{ mr: 1, fontSize: 18 }} />
          Edit
        </StyledMenuItem>
      )}
      {permissions['ProjectType'].d && (
        <StyledMenuItem
          onClick={() => {
            handleDeleteProjectTypes(id);
            setMenuProjectTypeId(null);
          }}
        >
          <Trash2 sx={{ mr: 1, fontSize: 18 }} />
          Delete
        </StyledMenuItem>
      )}
    </StyledMenu>
  );

  const ProjectTypesGroupMenu = (id: string) => (
    <StyledMenu
      anchorEl={anchorEl}
      open={menuProjectTypeId === id}
      onClose={() => setMenuProjectTypeId(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {permissions['ProjectTypeGroup'].u && (
        <StyledMenuItem
          onClick={() => {
            const assignment = ProjectTypesGroupData.find(r => r.Name === id);
            if (assignment) {
              handleEditProjectTypesGroup(assignment);
            }
            setMenuProjectTypeId(null);
          }}
        >
          <Pencil sx={{ mr: 1, fontSize: 18 }} />
          Edit
        </StyledMenuItem>
      )}
      {permissions['ProjectTypeGroup'].d && (
        <StyledMenuItem
          onClick={() => {
            handleDeleteProjectTypesGroup(id);
            setMenuProjectTypeId(null);
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
          .filter(tab => permissions[tab.entity].r)
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
      <TabHeader tab={tab} setTab={setTab} />

      {tab === 'project-types' && (
        <AccessTable
          title="Project Types"
          data={permissions['ProjectType'].r ? ProjectTypesData : []}
          onAdd={handleAddNewProjectTypes}
          onEdit={handleEditProjectTypes}
          onDelete={handleDeleteProjectTypes}
          menuId={menuProjectTypeId}
          setMenuId={setMenuProjectTypeId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel={permissions['ProjectType'].c ? 'Add Project Type' : ''}
          renderMenu={renderProjectTypesMenu}
          columns={ProjectTypesPageColumns}
          apiRef={apiRef}
          loading={loading}
        />
      )}
      {tab === 'project-types-group' && (
        <AccessTable
          title="Project Types Group"
          data={permissions['ProjectTypeGroup'].r ? ProjectTypesGroupData : []}
          onAdd={handleAddNewProjectTypesGroup}
          onEdit={handleEditProjectTypesGroup}
          onDelete={handleDeleteProjectTypesGroup}
          menuId={menuProjectTypeId}
          setMenuId={setMenuProjectTypeId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel={
            permissions['ProjectTypeGroup'].c ? 'Add Project Type Group' : ''
          }
          renderMenu={ProjectTypesGroupMenu}
          columns={ProjectTypesGroupColumns}
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
        {deletingProjectTypes || deletingProjectTypesGroup
          ? tab === 'project-types'
            ? `the project type "${deletingProjectTypes}"`
            : `project type group "${deletingProjectTypesGroup}"`
          : 'this item'}
        ?
      </ConfirmDialog>
    </div>
  );
}

export default withRBAC(ProjectSettingPage, [
  'ProjectType',
  'ProjectTypeGroup',
]);
