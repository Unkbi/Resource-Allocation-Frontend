import { useEffect, useState } from "react";
import * as React from "react";
import { Grid, Paper, Box, Typography, Avatar } from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import GroupIcon from "@mui/icons-material/Group";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PercentIcon from "@mui/icons-material/Percent";

// Icon/label map to match your layout
const iconMap = [
  <ShowChartIcon fontSize="inherit" />,
  <GroupIcon fontSize="inherit" />,
  <AttachMoneyIcon fontSize="inherit" />,
  <PercentIcon fontSize="inherit" />,
  <PercentIcon fontSize="inherit" />,
];

const iconLabels = [
  "Active Projects",
  "Active Resources",
  "Total Resource Cost",
  "Allocation %",
  "Actuals Confirmed"
];

export default function Overview({activeProjects, activeResources, actualsConfirmed }) {
  const [overview, setOverview] = useState([]);

  useEffect(() => {
    const data = [
      { label: "Active Projects", value: activeProjects[0]?.active_project || 0 },
      { label: "Active Resources", value: activeResources[0]?.active_resource || 0 },
      { label: "Total Resource Cost", value: "$125,000" },
      { label: "Allocation %", value: "87%" },
      { label: "Actuals Confirmed", value: "92%" },
    ];
    setOverview(data);
  }, [activeProjects, activeResources]);
  return (
    <Box mb={3}>
      <Grid container spacing={3}>
        {overview.map((item, idx) => (
          <Grid item xs={12} sm={6} md={2.4} key={item.label || idx}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 3,
                height: 150,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                minWidth: 180,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#e7ecfd",
                  color: "#4562db",
                  width: 48,
                  height: 48,
                  mb: 1,
                  fontSize: 32,
                  borderRadius: 2,
                }}
                variant="rounded"
              >
                {iconMap[idx]}
              </Avatar>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  mt: 1,
                  fontSize: "2rem",
                  color: item.label === "Total Resource Cost" ? "#000" : "#111",
                }}
              >
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}