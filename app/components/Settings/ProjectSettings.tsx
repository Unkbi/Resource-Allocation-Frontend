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

const tabMenuNames = ['project-types', 'project-types-group'];
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
    label: 'Project Types',
    value: 'project-types',
    icon: '/images/icons/ProjectTypes.svg',
  },
  {
    label: 'Project Types Group',
    value: 'project-types-group',
    icon: '/images/icons/ProjectTypesGroup.svg',
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
            'brightness(0) saturate(100%) invert(21%) sepia(82%) saturate(1192%) hue-rotate(197deg) brightness(97%) contrast(101%)',
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

export default function ProjectSettingPage() {
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
  // Dummy data for demonstration
  const ProjectTypesData: any[] = [
    {
      id: '1',
      projectTypes: 'Internal',
      projectTypesGroup: 'Group A',
      description: 'Internal projects',
      Color: '#FADCB9',
      Status: 'Active',
      Name: 'Internal',
    },
    {
      id: '2',
      projectTypes: 'Client',
      projectTypesGroup: 'Group B',
      description: 'Client projects',
      Color: '#D9F1B7',
      Status: 'Active',
      Name: 'Client',
    },
    {
      id: '3',
      projectTypes: 'R&D',
      projectTypesGroup: 'Group C',
      description: 'Research and Development',
      Color: '#B2D0FF',
      Status: 'Inactive',
      Name: 'R&D',
    },
    {
      id: '4',
      projectTypes: 'Migration',
      projectTypesGroup: 'Group D',
      description: 'Migration projects',
      Color: '#FBB7AE',
      Status: 'Active',
      Name: 'Migration',
    },
    {
      id: '5',
      projectTypes: 'Support',
      projectTypesGroup: 'Group E',
      description: 'Support projects',
      Color: '#C1F0F5',
      Status: 'Active',
      Name: 'Support',
    },
  ];
  const ProjectTypesGroupData: any[] = [
    { id: 'g1', projectTypeGroup: 'Group A', Name: 'Group A' },
    { id: 'g2', projectTypeGroup: 'Group B', Name: 'Group B' },
    { id: 'g3', projectTypeGroup: 'Group C', Name: 'Group C' },
    { id: 'g4', projectTypeGroup: 'Group D', Name: 'Group D' },
    { id: 'g5', projectTypeGroup: 'Group E', Name: 'Group E' },
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
    if (tab === 'ProjectTypes') {
      // Fetch project types data
    }
    if (tab === 'project-types-group') {
      // Fetch project types group data
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

  const handleEditProjectTypesGroup = (assignment: any) => {
    dispatch(
      openDialog({
        title: 'Edit Project Type Group',
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'edit_project_type_group',
        initialData: assignment,
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

  const handleEditProjectTypes = (assignment: any) => {
    dispatch(
      openDialog({
        title: 'Edit Project Type',
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'edit_project_type',
        initialData: assignment,
      })
    );
  };

  const handleDeleteProjectTypes = (Name: string) => {
    setDeletingProjectTypes(Name);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProjectTypes || !deletingProjectTypesGroup) return;
    try {
      if (tab === 'project-types') {
        //delete action
      } else if (tab === 'project-types-group') {
        //delete action
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
        <Typography sx={{ ...commonCellStyle }}>{params.value}</Typography>
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
  ];

  const ProjectTypesGroupColumns = [
    {
      field: 'projectTypeGroup',
      headerName: 'Project Type Group',
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
  ];

  const renderProjectTypesMenu = (id: string) => (
    <StyledMenu
      anchorEl={anchorEl}
      open={menuProjectTypeId === id}
      onClose={() => setMenuProjectTypeId(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <StyledMenuItem
        onClick={() => {
          const assignment = ProjectTypesData.find(r => r);
          if (assignment) {
            handleEditProjectTypes(assignment);
          }
          setMenuProjectTypeId(null);
        }}
      >
        <Pencil sx={{ mr: 1, fontSize: 18 }} />
        Edit
      </StyledMenuItem>
      <StyledMenuItem
        onClick={() => {
          handleDeleteProjectTypes(id);
          setMenuProjectTypeId(null);
        }}
      >
        <Trash2 sx={{ mr: 1, fontSize: 18 }} />
        Delete
      </StyledMenuItem>
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
      <StyledMenuItem
        onClick={() => {
          handleDeleteProjectTypesGroup(id);
          setMenuProjectTypeId(null);
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

      {tab === 'project-types' && (
        <AccessTable
          title="Project Types"
          data={ProjectTypesData}
          onAdd={handleAddNewProjectTypes}
          onEdit={handleEditProjectTypes}
          onDelete={handleDeleteProjectTypes}
          menuId={menuProjectTypeId}
          setMenuId={setMenuProjectTypeId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel="Add Project Type"
          renderMenu={renderProjectTypesMenu}
          columns={ProjectTypesPageColumns}
          apiRef={apiRef}
          loading={loading}
        />
      )}
      {tab === 'project-types-group' && (
        <AccessTable
          title="Project Types Group"
          data={ProjectTypesGroupData}
          onAdd={handleAddNewProjectTypesGroup}
          onEdit={handleEditProjectTypesGroup}
          onDelete={handleDeleteProjectTypesGroup}
          menuId={menuProjectTypeId}
          setMenuId={setMenuProjectTypeId}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          buttonLabel="Add Project Type Group"
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
