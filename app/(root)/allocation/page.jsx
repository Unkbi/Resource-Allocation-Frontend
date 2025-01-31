"use client"
import styles from "../../page.module.css";
import { Box } from "@mui/material";
import AllocationGrid from "@/app/components/AllocationTable/AllocationGrid";

const columnConfig = [
    { field: "project", headerName: "Project Name", width: 250 },
    { field: "resource", headerName: "Resource", width: 200, disableColumnMenu: true },
    { field: "role", headerName: "Role", width: 200, disableColumnMenu: true },
    { field: "totalEffort", headerName: "Total Effort", width: 150, disableColumnMenu: true },
];

export default function Allocation() {
    const addResource = () => {
        console.log("Add Resource");
    }
    return (
        <Box className={styles.page}>
            <main className={styles.wrapperBox}>
                <AllocationGrid
                    const groupBy="project"
                    columns={columnConfig}
                    handleAddButton={addResource}
                />
            </main>
        </Box>
    );
}
