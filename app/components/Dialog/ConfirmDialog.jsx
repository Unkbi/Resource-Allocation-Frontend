import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";

// global confirm dialog with placeholders, pass title as prop and content as children prop
const ConfirmDialog = ({ open, onCancel, onConfirm, title, children }) => {
  return (
    <Dialog open={open} onCancel={onCancel}>
      <Box sx={{ textAlign: "left", fontFamily: theme => theme.typography.fontFamily }}>
        <Box
          sx={{
            backgroundColor: "#1C2D5F",
            padding: "10px 14px 10px 14px",
            color: "#ffffff",
            borderTopLeftRadius: "4px",
          }}
        >
           {typeof title === "function" ? title(value) : (
          <Typography>
            {title || "Insert dialog title here?"}
          </Typography>)}
        </Box>
        <DialogContent>
          <Typography sx={{ color: "#000", fontSize: "1rem", marginTop: "8px", textAlign: "center" }}>
            {children || "Insert dialog content here."}
          </Typography>
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

export default ConfirmDialog;