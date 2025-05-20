"use client";
import ResourceTable from "@/app/components/Resources/ResourceTable";
import { Box, styled } from "@mui/system";
import { IconButton, Menu, MenuItem, Stack, Tab, Tabs } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { generateRandomColor, getInitials } from "@/app/utils/common";
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { useDispatch, useSelector } from "react-redux";
import { closeDialog, openDialog } from "@/app/redux/reducers/dialogReducer";
import CustomAvatar from "@/app/components/Avatar/CustomAvatar";
import ConfirmDialog from "@/app/components/Dialog/ConfirmDialog";
import { fetchAllResources } from "@/app/redux/actions/fetchResourcesAction";
import { getAllTeams } from "@/app/services/teamServices";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteResource } from "@/app/services/resourceServices";
import { clearHighlightedRowId } from "@/app/redux/reducers/highlightedRowReducer";
import { useGridApiRef } from "@mui/x-data-grid-premium";

const demoResources = {
    "result" :[
        {
            "AverageWeeklyHours": 40,
            "ContractorHourlyRate": null,
            "ContractorHourlyRateCurrency": "USD",
            "Department": "Lyft",
            "Email": "Adrian@test.com",
            "EndDate": null,
            "FirstName": "Adrian",
            "FullName": "Adrian Olvera",
            "HRLevel": "1",
            "Id": "6ddc14d8-dd9e-4df8-bf3e-f18723f10603",
            "LastName": "Olvera",
            "LocationCategory": "Onsite",
            "Manager": "Kishan Vallabhaneni",
            "PhoneNumber": "",
            "Role": "Sales Technology Lead",
            "StartDate": "2021-01-01",
            "Status": "Active",
            "Type": "FTE",
            "WorkLocation": null,
            "__parent__": null,
            "__path__": ":ResourceAllocation.Core/Resource,6ddc14d8-dd9e-4df8-bf3e-f18723f10603"
          },  
    ]
}


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
    const {resources,updating,loading} =useSelector(state=> state.resources);
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedRow, setSelectedRow] = useState(null)
    const [rows, setRows] = useState(resources?.result || null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); 
    const [deleteTarget, setDeleteTarget] = useState({ id: "", name: "" });
    const { id: highlightedRowId } = useSelector((state) => state.highlightedRow);

    const managerMap = useMemo(() => {
      const map = {};
      if (resources?.result) {
        resources.result.forEach((res) => {
          map[res.Id] = res.FullName;
        });
      }
      return map;
    }, [resources]);

    useEffect(() => {
      if(!updating){
        dispatch(fetchAllResources());
        dispatch(getAllTeams());
        dispatch(closeDialog())
      }
    },[updating])

    useEffect(() => {
      setRows(resources?.result)
    }, [resources])
    
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
            apiRef.current.setCellFocus(highlightedRowId, 'FullName');
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
    }, [resources, highlightedRowId]);

    const handleConfirmDelete = () => {
      if (!deleteTarget.id) return;
      dispatch(deleteResource(deleteTarget.id))
        .then(() => {
          dispatch(fetchAllResources());
        })
        .catch((error) => {
          console.error("Error deleting resource:", error);
        });
      setDeleteDialogOpen(false);
      setDeleteTarget({ id: "", name: "" });
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
    const columns = [
      {
        field: "FullName",
        headerName: "Resource",
        flex: 1,
        minWidth: 200,
        filterable: true,
        renderCell: (params) => {
          const handleNameClick = () => {
            handleOpenDialog('Edit Resource', 'edit_resource', params.row)
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
        },
        },
        {
          field: "team",
          headerName: "Team",
          flex: 2,
          minWidth:180,
          maxWidth: 500,
          renderCell: (params) => {
         return(
          <span>fe team</span>
         )
        },
        },
        {
          field: "Email",
          headerName: "Email ID",
          flex: 2,
          minWidth: 210,
          renderCell: (params) => {
            return params.value && <span>{params.value}</span>;
          },
        },
        {
          field: "Role",
          headerName: "Role",
          flex: 1,
          minWidth: 150,
          renderCell: (params) => (
            params.value && <span>{params.value}</span>
          ),
        },
        {
          field: "HRLevel",
          headerName: "HR Level",
          flex: 1,
          minWidth: 90,
          renderCell :(params) =>{
            const HRLevel = params.row.HRLevel ;
            return(
                HRLevel &&<span>{HRLevel}</span>
            )
          }
        },
        {
          field: "Type",
          headerName: "Resource Type",
          flex: 1,
          minWidth: 130,
          renderCell: (params) => {
            return params.value && <span>{params.value}</span>;
          },
        },
        {
          field: "organization",
          headerName: "Organization",
          flex: 1,
          minWidth: 180,
         
        },
        {
            field: "Manager",
            headerName: "Manager",
            width: 170,
            sortable: true,
            filterable: true,
            renderCell: (params) => {
              const managerId = params?.row?.Manager;
              return <span>{managerMap?.[managerId] || managerId || ''}</span>;
            },
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
          field: "Status",
          headerName: "Status",
          width: 170,
          sortable: false,
          filterable: true,
          renderCell: (params) => {
          const status = params.value;
          return status &&
          (
            <>
                <StatusPill status={status}>{status}</StatusPill>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuClick(e, params.row.id)}
                >
                <MoreVertIcon fontSize="small" />
                </IconButton>
        
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && selectedRow === params.row.id}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: "top", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
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
                      handleOpenDialog('Edit Resource', 'edit_resource', params.row);
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
                      setDeleteTarget({ id: params.row.Id, name: params.row.FullName });
                    }}
                    sx={menuItemStyle}
                  >
                    <DeleteIcon sx={{ fontSize: 18, marginRight: '8px' }} />
                    Delete
                  </MenuItem>
                </Menu>
              </>
            );
          },
        }
        
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
      <Box sx={{
        backgroundColor: '#fff',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
        height: '100%'
      }}>
        <ResourceTable loading={loading }columns={columns} rows={modifyData(rows)} apiRef={apiRef} />
        <ConfirmDialog
          open={deleteDialogOpen}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          title={  <>
            Are you sure you want to delete <em>{deleteTarget.name}</em>?
          </>}
          >
          This will permanently delete the Resource.
          </ConfirmDialog>
      </Box>
    )
}