"use client";

import React, { useState } from "react";
import {
  DataGrid,
  GridToolbar,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { columns, columnGroupingModel } from "./TableHeader";
import Toolbar from "../Toolbar/CustomToolbar";
// import { rows } from "./data";
const rows = [
    {
      id: 1,
      project: "SOX FY Compliance",
      totalEffort: 25,
      W1:3,
      isGroup: true,
      // hasButton:true,
      children: [
        {
          id: 11,
          resource: "Amit Sharma",
          initials: "AS",
          color: "#F06292",
          role: "Senior Product Manager",
          totalEffort: 11,
          W1: 1, W2: 1, W3: 1, W4: 1, W5: 1, W6: 1, W7: 1, W8: 1, W9: 1, W10: 0.5, W11: 0.5, W12: 0.5, W13: 0.5, W14: 0.5, W15: 0.5
        },
        {
          id: 12,
          resource: "Nitin Kaushik",
          initials: "NK",
          color: "#42A5F5",
          role: "Product Designer",
          totalEffort: 7,
          W1: 1, W2: 1, W3: 1, W4: 1, W5: 1, W6: 1, W7: 1, W8: 1,
        },
        {
          id: 13,
          resource: "Hitesh Sharma",
          initials: "HS",
          color: "#42A5F5",
          role: "Developer",
          totalEffort: 7,
          W1: 1, W2: 1, W3: 1, W4: 1, W5: 1, W6: 1, W7: 1, W8: 1,
        },
      ],
    },
    {
      id: 2,
      project: "Website Revamp",
      isGroup: true,
      children: [
        {
          id: 21,
          resource: "Naveen Sharma",
          initials: "NS",
          color: "#E57373",
          role: "Senior Product Manager",
          totalEffort: 11,
          W1: 1, W2: 1, W3: 1, W4: 1, W5: 1, W6: 1, W7: 1, W8: 1, W9: 1,
        },
        {
          id: 22,
          resource: "Naman Kaushik",
          initials: "NK",
          color: "#FFB74D",
          role: "Product Designer",
          totalEffort: 7,
          W1: 1, W2: 1, W3: 1, W4: 1, W5: 1, W6: 1, W7: 1, W8: 1,
        },
          {
          id: 24,
          resource: "Naman Kaushik",
          initials: "NK",
          color: "#FFB74D",
          role: "Product Designer",
          totalEffort: 7,
          W1: 1, W2: 1, W3: 1, W4: 1, W5: 1, W6: 1, W7: 1, W8: 1,
        },
      ],
    },
  ];


  
function CustomToolbar() {
  return (
    <></>
  );
}

export default function AllocationTable({handleAddButton}) {
  const [editMode, setEditMode] = useState()

  const addActionRowToChildren = (rows, handleActionButton) => {
    return rows.map(group => {
      const children = group.children;
      const lastChild = children[children.length - 1];
      const nextId = lastChild.id + 1;
      const actionRow = {
        id: nextId,
        hasButton: true,
        actionName: "Add Resource",
        action: handleActionButton
      };
      group.children.push(actionRow);
      return group;
    });
  };
    
  const handleActionButton =()=>{
    console.log("here");
    
    setEditMode("row")
    handleAddButton()
  }
  const updatedRows = addActionRowToChildren(rows, handleActionButton);
  const processedRows = updatedRows.map((group) => ({
    ...group,
    project: `${group.project} (${group.children?.length || 0})`, // Adding count of resources
    children: group.children || [],
  }));


  return (
    <Box sx={{ height: 600, width: "100%", p: 2 }}>
      <DataGrid
        rows={processedRows.flatMap((group) => [group, ...group.children])}
        columns={columns}
        slots={{
          toolbar: Toolbar,
        }}
        columnGroupingModel={columnGroupingModel}
        treeData
        getTreeDataPath={(row) => (row.isGroup ? [row.project] : [row.project, row.resource])}
        getRowId={(row) => row.id} // Ensures unique row identification
        hideFooter
        editMode="row"
        rowSelection={true}
        renderRow={(params) => (
          <>
            {/* Default row rendering */}
            <div>{params.row.project}</div>
            {/* Conditionally render button if hasButton is true */}
            {params.row.hasButton && (
              <button onClick={() => handleButtonClick(params.row.id)}>
                Click Me
              </button>
            )}
          </>
        )}
        // sx={{
        //   "& .MuiDataGrid-columnHeaders": { bgcolor: "#F5F7FA", fontWeight: "bold" },
        //   "& .MuiDataGrid-cell": { borderBottom: "1px solid #E0E3E7" },
        //   "& .MuiDataGrid-cell:focus": { outline: "none" },
        // }}
        sx={{
          "& .MuiDataGrid-cell": {
            borderRight: "1px solid #e0e0e0",
            fontSize: "14px",
            padding: "0 16px",
          },
          "& .MuiDataGrid-columnHeader": {
            borderRight: "1px solid #e0e0e0",
            backgroundColor: "#f5f5f5",
            padding: "0 16px",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "600",
            fontSize: "14px",
          },
          "& .MuiDataGrid-row": {
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          },
          border: "none",
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeader:focus": {
            outline: "none",
          },
          
        }}
      />
    </Box>
  );
}
