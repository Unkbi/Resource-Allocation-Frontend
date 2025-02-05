import React from "react";
import { Avatar, Box } from "@mui/material";

const CustomAvatar = ({ value, showFullName = false }) => {
  const getInitials = (name) => {
    return (
      name &&
      name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    );
  };

  const getInitialsColor = (name) => {
    const colors = [
      "#816CB3",
      "#B56A9B",
      "#1C2D5F",
      "#4779CD",
      "#6BB6B2",
      "#DD5091",
      "#828F95",
      "#7B90DE",
      "#E59D6D",
    ];

    // Generate a hash from the name to pick a color
    const hash =
      name && name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Avatar
        sx={{
          width: 20,
          height: 20,
          fontSize: 8,
          marginRight: 1,
          backgroundColor: getInitialsColor(value),
        }}
      >
        {getInitials(value)}
      </Avatar>
      {showFullName && <span>{value}</span>}
    </Box>
  );
};

export default CustomAvatar;
