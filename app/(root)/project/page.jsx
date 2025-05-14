"use client";
import ProjectTable from "@/app/components/Projects/Table/ProjectTable";
import { Box, styled } from "@mui/system";
import { IconButton, Menu, MenuItem, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { generateRandomColor, getInitials } from "@/app/utils/common";
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProjects } from '@/app/redux/actions/fetchProjectsAction';
import { closeDialog, openDialog } from "@/app/redux/reducers/dialogReducer";
import CustomAvatar from "@/app/components/Avatar/CustomAvatar";
import ConfirmDialog from "@/app/components/Dialog/ConfirmDialog";
import { deleteProject, getAllProjects} from '@/app/services/projectServices';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { setSplitView, setSplitViewCurrentProject } from "@/app/redux/reducers/allocationViewReducer";
import { useRouter } from "next/navigation";
import { fetchAllResources } from "@/app/redux/actions/fetchResourcesAction";
import { useGridApiRef } from "@mui/x-data-grid-premium";
import { clearHighlightedRowId } from "@/app/redux/reducers/highlightedRowReducer";


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
    marginRight: '8px'
}))

const PersonContainer = styled('div')(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start'
}))

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

const AddAllocationIcon = () => (
  <img src="/images/icons/AddAllocation.svg" alt="AddAllocation" />
);


export default function Project() {
    const dispatch = useDispatch()
    const apiRef = useGridApiRef();
    const { id: highlightedRowId } = useSelector((state) => state.highlightedRow);
    const { projects, updating , loading} = useSelector(state => state.projects)
    const { resources } = useSelector((state) => state.resources)
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedRow, setSelectedRow] = useState(null)
    const [rows, setRows] = useState(projects?.result || null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);  
    const router = useRouter()  

    useEffect(() => {
      if(!updating){
        dispatch(fetchAllProjects());
        dispatch(closeDialog())
      }
    },[updating])

    useEffect(() => {
      setRows(projects?.result)
    }, [projects])

    useEffect(() => {
      if (!resources?.result?.length) {
        dispatch(fetchAllResources());
      }
    },[])
    
    const modifyData = (data) => {
      if(data) {
        return data.map((item) => {
            return {
                ...item,
                id: item.Id,
                Owner: {
                    name : item.Owner,
                    bgColor: "#fff",
                    initials: getInitials(item.Owner),
                },
            }
        })
      }
      return []
  }

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

          const scroller = document.querySelector('.MuiDataGrid-virtualScroller');
          if (scroller) {
            const original = scroller.scrollTop;
            scroller.scrollTop = original + 1;
            scroller.scrollTop = original;
          }

          dispatch(clearHighlightedRowId());
        } catch (err) {
          console.error("Scroll error:", err);
          dispatch(clearHighlightedRowId());
        }
      });
    }, 300); 

    return () => clearTimeout(timeout);
  }, [projects, highlightedRowId]);

  const handleConfirmDelete = () => {
    if (!projectToDelete?.Id) return;
    dispatch(deleteProject(projectToDelete.Id))
    .then(() => dispatch(getAllProjects()));
      setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };
  
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
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

    const handleOpenSplitView = (params) => {
      dispatch(setSplitView(true));
      dispatch(setSplitViewCurrentProject(params.row))
      router.replace("/allocation")
    }

    const columns = [
        {
          field: "Name",
          headerName: "Project Name",
          flex: 1,
          minWidth: 180,
          renderCell: (params) => {
            const handleNameClick = () => {
              handleOpenDialog('Edit Project', 'edit_project', params.row)
            };
            return (
              <Box sx={{ display: 'flex' }}>
                <CustomAvatar value={params.value} showFullName={false} />
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
                    minWidth: 0,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {params.value}
                </Box>
              </Box>
            );
          }
        },
        {
          field: "Owner",
          headerName: "Project Sponsor",
          flex: 2,
          minWidth: 180,
          renderCell: (params) => {
            const owner = params.value
            return (
              owner.name &&  <CustomAvatar value={owner.name} showFullName={true} />
            )
          },
        },
        {
          field: "ProjectManager",
          headerName: "Project Manager",
          flex: 2,
          minWidth: 180,
          renderCell: (params) => {
            const projectManager = params.value
            return (
              projectManager &&  <CustomAvatar value={projectManager} showFullName={true} />
            )
          },
        },
        {
          field: "Location",
          headerName: "Location",
          flex: 1,
          minWidth: 150,
        },
        {
          field: "Type",
          headerName: "Type",
          flex: 1,
          minWidth: 150,
        },
        {
          field: "AllowOvertime",
          headerName: "Allow Overtime",
          flex: 1,
          minWidth: 130,
          valueGetter: (params) => (params? "Yes" : "No"),
        },
        {
          field: "Status",
          headerName: "Status",
          flex: 1,
          minWidth: 140,
          renderCell: (params) => (
            <StatusPill status={params.value}>{params.value}</StatusPill>
          ),
        },
        {
          field: "StartDate",
          headerName: "Start Date",
          flex: 1,
          minWidth: 120,
          renderCell: (params) => {
            if(params && params.value)
            {
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
          field: "EndDate",
          headerName: "End Date",
          flex: 1,
          minWidth: 120,
          renderCell: (params) => {
            if(params && params.value)
            {
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
          field: "actions",
          headerName: "Action",
          width: 80,
          sortable: false,
          filterable: false,
          renderCell: (params) => (
            <>
              <IconButton size="small" onClick={(e) => handleMenuClick(e, params.row.id)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && selectedRow === params.row.id}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                sx={{
                  flexShrink: 0,
                  paddingTop: '2px',
                  paddingBottom: '4px',
                }}
              >
                <MenuItem onClick={() => handleOpenSplitView(params)} sx={menuItemStyle}>
                  <AddAllocationIcon sx={{ fontSize: 18, marginRight: '8px' }} />
                  <Typography sx={{fontSize: "12px", fontWeight: '600', color:'#1C2D5F', paddingLeft: '10px'}}>Add Allocation</Typography>
                  </MenuItem>
                <MenuItem onClick={() =>{ handleOpenDialog("Edit Project", "edit_project",params.row), handleMenuClose()}} sx={menuItemStyle}>
                  <EditIcon sx={{ fontSize: 18, marginRight: '8px', color:'#1C2D5F' }} />
                  <Typography sx={{fontSize: "12px", fontWeight: '600', color:'#1C2D5F'}}>Edit Project</Typography>
                  </MenuItem>
                <MenuItem onClick={() => { setProjectToDelete(params.row); setDeleteDialogOpen(true); handleMenuClose() }} sx={menuItemStyle}>
                <DeleteIcon sx={{ fontSize: 18, marginRight: '8px', color:'#1C2D5F' }} />
                <Typography sx={{fontSize: "12px", fontWeight: '600', color:'#1C2D5F'}}>Delete Project</Typography>
                 </MenuItem>
              </Menu>
            </>
          ),
        },
      ]

    const handleMenuClick = (event, id) => {
        setAnchorEl(event.currentTarget)
        setSelectedRow(id)
    }

    const handleMenuClose = (params) => {
        setAnchorEl(null)
        setSelectedRow(null)
    }

    return (
        <Box
          sx={{
            backgroundColor: '#fff',
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
            height: '100%',
          }}
        >            
            <ProjectTable loading={loading }columns={columns} rows={modifyData(rows)} apiRef={apiRef} />
            <ConfirmDialog
              open={deleteDialogOpen}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
              title="Are you sure you want to delete this project?"
              >
              This will permanently delete the project.
              </ConfirmDialog>
        </Box>
    )
}