"use client";
import styles from "../../page.module.css";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import TeamAllocation from "@/app/components/ResourceAllocation/component/TeamAllocation";
import OrganizationAllocation from "@/app/components/ResourceAllocation/component/OrganizationAllocation";
import ProjectAllocation from "@/app/components/ResourceAllocation/component/ProjectAllocation";

export default function Allocation() {
  const view = useSelector((state) => state.allocationView.view);

  const getContentByRole = (view) => {
    switch (view) {
      case "Project":
        return <ProjectAllocation />;
      case "Organization":
        return <OrganizationAllocation />;
      case "Teams":
        return <TeamAllocation />;
      default:
        return null;
    }
  };

  return (
    <Box className={styles.page}>
      <main className={styles.wrapperBox}>
        {getContentByRole(view)}
        </main>
    </Box>
  );
}
