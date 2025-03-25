import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";

// global delete dialog with placeholders, pass title as prop and content as children prop
const DeleteDialog = ({ open, onCancel, onConfirm, title, children }) => {
  return (
    <Dialog open={open} onCancel={onCancel}>
      <Box sx={{ textAlign: "center", fontFamily: "Manrope" }}>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem", pt: 4, pl: 3.5, pl: 3.5 }}>
          {title || "Are you sure you want to delete?"}
        </DialogTitle>
        <DialogContent>
          {children ? (
            <Typography sx={{ color: "#666", fontSize: "1rem" }}>
              {children}
            </Typography>
          ) : (
            <Typography sx={{ color: "#666", fontSize: "1rem" }}>
              This will be deleted from your sheet.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 4 }}>
          <Button
            onClick={onCancel}
            variant="outlined"
            sx={{
              fontWeight: 400,
              borderRadius: "6px",
              textTransform: "none",
              minWidth: "90px",
              borderColor: "#1C2D5F",
              color: "#1C2D5F",
              marginLeft: "12px",
              marginRight: "12px",
              "&:hover": { backgroundColor: "#F5F5F5", borderColor: "#1C2D5F" },
            }}
          >
            No
          </Button>
          <Button
            onClick={onConfirm}
            variant="contained"
            sx={{
              fontWeight: 400,
              borderRadius: "6px",
              textTransform: "none",
              minWidth: "90px",
              backgroundColor: "#1C2D5F",
              marginLeft: "12px",
              marginRight: "12px",
              "&:hover": { backgroundColor: "#152347" },
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default DeleteDialog;