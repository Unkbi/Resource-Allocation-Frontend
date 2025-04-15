"use client";
import ResourceTable from "@/app/components/Resources/ResourceTable";
import { Box, styled } from "@mui/system";
import { IconButton, Menu, MenuItem, Stack, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import { generateRandomColor, getInitials } from "@/app/utils/common";
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { useDispatch, useSelector } from "react-redux";
import { closeDialog, openDialog } from "@/app/redux/reducers/dialogReducer";
import CustomAvatar from "@/app/components/Avatar/CustomAvatar";
import DeleteDialog from "@/app/components/Dialog/DeleteDialog";
import { fetchAllResources } from "@/app/redux/actions/fetchResourcesAction";
import { getAllTeams } from "@/app/services/teamServices";

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


export default function Resources() {
    const dispatch = useDispatch();
    const {resources,updating,loading} =useSelector(state=> state.resources);
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedRow, setSelectedRow] = useState(null)
    const [rows, setRows] = useState(resources?.result || null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);   
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

    const handleConfirmDelete = () => {
    setDeleteDialogOpen(false)
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
          filterable : 'true',
          renderCell: (params) => {
            return <CustomAvatar value={params.value} showFullName={true} />;
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
         <IconButton size="small" onClick={(e) => handleMenuClick(e, params.row.id)}>
          <MoreVertIcon fontSize="small" />
         </IconButton>
         <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl) && selectedRow === params.row.id}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
            }}
          >
            Edit Resource
          </MenuItem>
          <MenuItem
            onClick={() => {
              setDeleteDialogOpen(true);
              handleMenuClose();
            }}
          >
            Delete Resource
          </MenuItem>
        </Menu>
      </>
    );
  },
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
        <Stack spacing={2} sx={{ padding: 2 }}>
        <Box sx={{
            marginLeft:'10px',
            backgroundColor: '#fff',
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
            }}>
            <ResourceTable loading={loading }columns={columns} rows={modifyData(rows)}  />
            <DeleteDialog
              open={deleteDialogOpen}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
              title="Are you sure you want to delete this Resource?"
              >
              This will permanently delete the Resource.
              </DeleteDialog>
        </Box>
        </Stack>
    )
}