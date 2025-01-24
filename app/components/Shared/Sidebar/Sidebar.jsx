"use client";
import * as React from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";

const NAVIGATION = [
    {
        segment: "dashboard",
        title: "Dashboard",
        icon: <DashboardIcon />,
    },
    {
        segment: "allocation",
        title: "Allocation",
        icon: <ShoppingCartIcon />,
    },
    {
        segment: "project",
        title: "Projects",
        icon: <BarChartIcon />,
    },
    {
        segment: "people",
        title: "People",
        icon: <BarChartIcon />,
    },
    {
        segment: "report",
        title: "Reports",
        icon: <BarChartIcon />,
    },
];

function SideBar(props) {
    const { window } = props;

    return (
        <AppProvider navigation={NAVIGATION} window={window}>
            <DashboardLayout disableCollapsibleSidebar>
                <Box>
                    {NAVIGATION.map((item) => (
                        <Link
                            key={item.segment}
                            href={`/${item.segment}`}
                            passHref
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    color: "white",
                                    mb: 2,
                                    cursor: "pointer",
                                    textDecoration: "none", // Prevent underline on the links
                                }}
                            >
                                {item.icon}
                                <Typography
                                    sx={{
                                        color: "white",
                                        textAlign: "center",
                                        wordWrap: "break-word",
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {item.title}
                                </Typography>
                            </Box>
                        </Link>
                    ))}
                </Box>
            </DashboardLayout>
        </AppProvider>
    );
}

SideBar.propTypes = {
    window: PropTypes.func,
};

export default SideBar;
