"use client";
import ProjectTable from "@/app/components/Projects/Table/ProjectTable";
import { Box, styled } from "@mui/system";
import { IconButton, Menu, MenuItem, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import { generateRandomColor, getInitials } from "@/app/utils/common";
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProjects } from '@/app/redux/actions/fetchProjectsAction';
import { closeDialog, openDialog } from "@/app/redux/reducers/dialogReducer";
import CustomAvatar from "@/app/components/Avatar/CustomAvatar";

const demoProjects = {
    "result": [
        {
            "CostCurrency": "USD",
            "StartDate": "2025-01-01",
            "Id": "413918b5-310b-487a-bc6d-e6638abc5370",
            "Owner": "john",
            "AllowOvertime": true,
            "Manager": "Ravi",
            "Name": "Sap Upgrade",
            "__path__": ":ResourceAllocation.Core/Project,413918b5-310b-487a-bc6d-e6638abc5370",
            "Description": "A project to integrate AI features into existing software platforms.",
            "Type": "RTB",
            "EndDate": "2025-06-30",
            "Cost": null,
            "Location": null,
            "__parent__": null,
            "Status": "Active"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2025-01-01",
            "Id": "ade64c29-ddf2-4f14-86f3-d2e113fbf68e",
            "Owner": "Dev",
            "AllowOvertime": true,
            "Manager": "John",
            "Name": "Contentful",
            "__path__": ":ResourceAllocation.Core/Project,ade64c29-ddf2-4f14-86f3-d2e113fbf68e",
            "Description": "A project to integrate AI features into existing software platforms.",
            "Type": "RTB",
            "EndDate": "2025-06-30",
            "Cost": null,
            "Location": null,
            "__parent__": null,
            "Status": "Active"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2023-02-27",
            "Id": "c9bdcf58-075a-4856-b86c-82c97af47632",
            "Owner": "Logan Thomas",
            "AllowOvertime": false,
            "Manager": "Josh Franklin",
            "Name": "AI Chatbot Development",
            "__path__": ":ResourceAllocation.Core/Project,c9bdcf58-075a-4856-b86c-82c97af47632",
            "Description": "",
            "Type": "Key Initiative",
            "EndDate": "2027-01-03",
            "Cost": null,
            "Location": "Central America",
            "__parent__": null,
            "Status": "Proposed"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2023-10-29",
            "Id": "00d192f3-dcce-45d9-9ba0-25847aee93a1",
            "Owner": "Harper Taylor",
            "AllowOvertime": true,
            "Manager": "Dave Clements",
            "Name": "Cloud Infrastructure Upgrade",
            "__path__": ":ResourceAllocation.Core/Project,00d192f3-dcce-45d9-9ba0-25847aee93a1",
            "Description": "",
            "Type": "RTB",
            "EndDate": "2025-11-24",
            "Cost": null,
            "Location": "India",
            "__parent__": null,
            "Status": "Paused"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2023-11-15",
            "Id": "5ec0fc97-1cdf-4376-a4f2-7d3526f2c089",
            "Owner": "Ellie Parker",
            "AllowOvertime": false,
            "Manager": "Chuck Sosa",
            "Name": "Cybersecurity Enhancement",
            "__path__": ":ResourceAllocation.Core/Project,5ec0fc97-1cdf-4376-a4f2-7d3526f2c089",
            "Description": "",
            "Type": "RTB",
            "EndDate": "2026-04-27",
            "Cost": null,
            "Location": "USA-Remote",
            "__parent__": null,
            "Status": "Paused"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2023-07-30",
            "Id": "b242805b-c50f-4c2a-9860-bd2612bbfd56",
            "Owner": "Ash Ward",
            "AllowOvertime": true,
            "Manager": "Eli Garcia",
            "Name": "Data Warehouse Optimization",
            "__path__": ":ResourceAllocation.Core/Project,b242805b-c50f-4c2a-9860-bd2612bbfd56",
            "Description": "",
            "Type": "Key Initiative",
            "EndDate": "2025-03-21",
            "Cost": null,
            "Location": "Central America",
            "__parent__": null,
            "Status": "Paused"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2024-02-11",
            "Id": "8a2b0d2a-168f-45fd-ab75-701777fa2293",
            "Owner": "Grace Clark",
            "AllowOvertime": false,
            "Manager": "Charlie Gonzalez",
            "Name": "ERP System Migration",
            "__path__": ":ResourceAllocation.Core/Project,8a2b0d2a-168f-45fd-ab75-701777fa2293",
            "Description": "",
            "Type": "RTB",
            "EndDate": "2025-12-11",
            "Cost": null,
            "Location": "Central America",
            "__parent__": null,
            "Status": "Proposed"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2024-01-22",
            "Id": "adb1732a-ecbb-4ea7-a02e-63675101ce02",
            "Owner": "Sophie Miller",
            "AllowOvertime": false,
            "Manager": "Chris Townsend",
            "Name": "Microservices Implementation",
            "__path__": ":ResourceAllocation.Core/Project,adb1732a-ecbb-4ea7-a02e-63675101ce02",
            "Description": "",
            "Type": "RTB",
            "EndDate": "2026-10-02",
            "Cost": null,
            "Location": "USA-Remote",
            "__parent__": null,
            "Status": "Proposed"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2024-12-03",
            "Id": "eb65600f-ca7c-464e-8916-15dc3cca7d03",
            "Owner": "Isa Rodriguez",
            "AllowOvertime": true,
            "Manager": "Olive Williams",
            "Name": "Mobile App Revamp",
            "__path__": ":ResourceAllocation.Core/Project,eb65600f-ca7c-464e-8916-15dc3cca7d03",
            "Description": "",
            "Type": "RTB",
            "EndDate": "2024-12-03",
            "Cost": null,
            "Location": "India",
            "__parent__": null,
            "Status": "Paused"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2023-07-10",
            "Id": "fcd30aac-a320-4dd5-a7ee-00b370698ec8",
            "Owner": "Ellie Parker",
            "AllowOvertime": false,
            "Manager": "Chuck Sosa",
            "Name": "Network Security Audit",
            "__path__": ":ResourceAllocation.Core/Project,fcd30aac-a320-4dd5-a7ee-00b370698ec8",
            "Description": "",
            "Type": "RTB",
            "EndDate": "2024-06-20",
            "Cost": null,
            "Location": "India",
            "__parent__": null,
            "Status": "Paused"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2024-10-10",
            "Id": "9323696a-0247-4147-8952-b10eba318b07",
            "Owner": "Ellie Parker",
            "AllowOvertime": true,
            "Manager": "Chuck Sosa",
            "Name": "Performance Monitoring System",
            "__path__": ":ResourceAllocation.Core/Project,9323696a-0247-4147-8952-b10eba318b07",
            "Description": "",
            "Type": "RTB",
            "EndDate": "2026-12-31",
            "Cost": null,
            "Location": "Central America",
            "__parent__": null,
            "Status": "Completed"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2024-01-05",
            "Id": "4319a81c-7ded-4259-a6c1-6990a3896745",
            "Owner": "Vicky Lewis",
            "AllowOvertime": true,
            "Manager": "Charlie Gonzalez",
            "Name": "Predictive Maintenance",
            "__path__": ":ResourceAllocation.Core/Project,4319a81c-7ded-4259-a6c1-6990a3896745",
            "Description": "",
            "Type": "RTB",
            "EndDate": "2024-03-29",
            "Cost": null,
            "Location": "India",
            "__parent__": null,
            "Status": "Active"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2023-06-03",
            "Id": "67ee04d4-2af8-4b23-adc8-1ee99fba3e96",
            "Owner": "Ben Martinez",
            "AllowOvertime": true,
            "Manager": "Olive Williams",
            "Name": "RPA Automation",
            "__path__": ":ResourceAllocation.Core/Project,67ee04d4-2af8-4b23-adc8-1ee99fba3e96",
            "Description": "",
            "Type": "Key Initiative",
            "EndDate": "2023-11-05",
            "Cost": null,
            "Location": "India",
            "__parent__": null,
            "Status": "Paused"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2024-05-08",
            "Id": "1dbc6624-0134-459b-ab51-6afdf9a26cec",
            "Owner": "Alex Moore",
            "AllowOvertime": false,
            "Manager": "Dave Clements",
            "Name": "SaaS Platform Development",
            "__path__": ":ResourceAllocation.Core/Project,1dbc6624-0134-459b-ab51-6afdf9a26cec",
            "Description": "",
            "Type": "RTB",
            "EndDate": "2026-03-23",
            "Cost": null,
            "Location": "USA-Remote",
            "__parent__": null,
            "Status": "Paused"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2024-09-29",
            "Id": "c2152096-b803-4d91-b6b4-1e7c5d0aa96e",
            "Owner": "Amy Anderson",
            "AllowOvertime": true,
            "Manager": "Josh Franklin",
            "Name": "Serverless Architecture",
            "__path__": ":ResourceAllocation.Core/Project,c2152096-b803-4d91-b6b4-1e7c5d0aa96e",
            "Description": "",
            "Type": "Key Initiative",
            "EndDate": "2026-07-15",
            "Cost": null,
            "Location": "USA-Remote",
            "__parent__": null,
            "Status": "Completed"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2025-01-10",
            "Id": "dae5467d-04ad-4918-9085-357a9e16b377",
            "Owner": "Ellie Parker",
            "AllowOvertime": false,
            "Manager": "Chuck Sosa",
            "Name": "Software Quality Initiative",
            "__path__": ":ResourceAllocation.Core/Project,dae5467d-04ad-4918-9085-357a9e16b377",
            "Description": "",
            "Type": "Key Initiative",
            "EndDate": "2026-01-17",
            "Cost": null,
            "Location": "India",
            "__parent__": null,
            "Status": "Proposed"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2024-02-09",
            "Id": "cbc15c53-757c-4540-afcd-917ae4b7e860",
            "Owner": "James Davis",
            "AllowOvertime": false,
            "Manager": "Sophie Miller",
            "Name": "Tech Debt Reduction",
            "__path__": ":ResourceAllocation.Core/Project,cbc15c53-757c-4540-afcd-917ae4b7e860",
            "Description": "",
            "Type": "RTB",
            "EndDate": "2025-01-22",
            "Cost": null,
            "Location": "Central America",
            "__parent__": null,
            "Status": "Active"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2024-04-06",
            "Id": "eff18843-dbe7-4e7e-9eca-c8fe94907468",
            "Owner": "Ellie Parker",
            "AllowOvertime": false,
            "Manager": "Chuck Sosa",
            "Name": "Unified Authentication System",
            "__path__": ":ResourceAllocation.Core/Project,eff18843-dbe7-4e7e-9eca-c8fe94907468",
            "Description": "",
            "Type": "RTB",
            "EndDate": "2025-10-24",
            "Cost": null,
            "Location": "India",
            "__parent__": null,
            "Status": "Active"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2024-06-27",
            "Id": "0c494189-b45c-4a77-9ec4-a200606fc99f",
            "Owner": "Logan Thomas",
            "AllowOvertime": true,
            "Manager": "Josh Franklin",
            "Name": "User Experience Redesign",
            "__path__": ":ResourceAllocation.Core/Project,0c494189-b45c-4a77-9ec4-a200606fc99f",
            "Description": "",
            "Type": "RTB",
            "EndDate": "2025-09-25",
            "Cost": null,
            "Location": "India",
            "__parent__": null,
            "Status": "Active"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2025-01-05",
            "Id": "ae55a3b3-d884-4993-8672-0597037492de",
            "Owner": "Cal Howard",
            "AllowOvertime": true,
            "Manager": "Noah Brown",
            "Name": "Web API Development",
            "__path__": ":ResourceAllocation.Core/Project,ae55a3b3-d884-4993-8672-0597037492de",
            "Description": "",
            "Type": "RTB",
            "EndDate": "2025-02-09",
            "Cost": null,
            "Location": "Central America",
            "__parent__": null,
            "Status": "Proposed"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2023-03-29",
            "Id": "fb17ea5c-bd83-4f54-89de-9f8370b63653",
            "Owner": "Ellie Parker",
            "AllowOvertime": false,
            "Manager": "Chuck Sosa",
            "Name": "Zero Trust Security Model",
            "__path__": ":ResourceAllocation.Core/Project,fb17ea5c-bd83-4f54-89de-9f8370b63653",
            "Description": "",
            "Type": "Key Initiative",
            "EndDate": "2025-07-29",
            "Cost": null,
            "Location": "India",
            "__parent__": null,
            "Status": "Proposed"
        },
        {
            "CostCurrency": "USD",
            "StartDate": "2024-09-25",
            "Id": "d9ce501e-7de4-467e-885e-b0f17c0237a9",
            "Owner": "Eve Jackson",
            "AllowOvertime": false,
            "Manager": "Dave Clements",
            "Name": "5G Network Expansion",
            "__path__": ":ResourceAllocation.Core/Project,d9ce501e-7de4-467e-885e-b0f17c0237a9",
            "Description": "",
            "Type": "RTB",
            "EndDate": "2024-12-30",
            "Cost": null,
            "Location": "USA-Remote",
            "__parent__": null,
            "Status": "Completed"
        }
    ],
    "status": "ok",
    "type": "ResourceAllocation.Core/Project"
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

const StatusPill = styled('div')(({ theme, status }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 500,
    minWidth: '100px',
    height: '28px',
    backgroundColor:
      status === 'Approved' || status === 'Completed' ? '#ecf9ef' : '#fff8e7',
    color: status === 'Approved' || status === 'Completed' ? '#229e60' : '#d88e32',
  }));

export default function Project() {
    const dispatch = useDispatch()
    const { projects, updating , loading} = useSelector(state => state.projects)
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedRow, setSelectedRow] = useState(null)
    const [rows, setRows] = useState(projects?.result || null)

    console.log("projects", projects)

    useEffect(() => {
      if(!updating){
        dispatch(fetchAllProjects());
        dispatch(closeDialog())
      }
    },[updating])

    useEffect(() => {
      setRows(projects?.result)
    }, [projects])
    
    // console.log("modifyData(rows) : ", modifyData(rows))
    const modifyData = (data) => {
      console.log("data : ", data)
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
          field: "Name",
          headerName: "Project Name",
          flex: 1,
          minWidth: 180,
        },
        {
          field: "Owner",
          headerName: "Project Sponsor",
          flex: 2,
          minWidth: 180,
          renderCell: (params) => {
            const owner = params.value
            return (
              // <PersonContainer>
              //   <AvatarCircle bgcolor={owner.bgColor}>{owner.initials}</AvatarCircle>
              //   <span>{owner.name}</span>
              // </PersonContainer>
              owner.name &&  <CustomAvatar value={owner.name} showFullName={true} />
            )
          },
        },
        {
          field: "Manager",
          headerName: "Manager",
          flex: 2,
          minWidth: 180,
          renderCell: (params) => {
            const manager = params.value
            return (
              // <PersonContainer>
              //   <AvatarCircle bgcolor={generateRandomColor()}>CS</AvatarCircle>
              //   <span>{manager}</span>
              // </PersonContainer>
              manager &&  <CustomAvatar value={manager} showFullName={true} />
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
          field: "StartDate",
          headerName: "Start Date",
          flex: 1,
          minWidth: 120,
        },
        {
          field: "EndDate",
          headerName: "End Date",
          flex: 1,
          minWidth: 120,
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
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem onClick={() => handleOpenDialog("Edit Project", "edit_project",params.row)}>Edit Project</MenuItem>
                <MenuItem onClick={() => handleMenuClose(params)}>Delete Project</MenuItem>
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
        <Box>
            <ProjectTable loading={loading }columns={columns} rows={modifyData(rows)} />
        </Box>
    )
}