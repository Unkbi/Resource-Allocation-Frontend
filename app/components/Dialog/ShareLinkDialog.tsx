import React from 'react';
import { Dialog, DialogTitle, DialogContent, Box, styled } from '@mui/material';

interface ShareLinkDialogProps {
  open: boolean;
  title: string;
  children?: React.ReactNode;
  onClose: () => void;
}
const StyledDialogContainer = styled(Box)(({ theme }) => ({
  width: '543px',
  flexShrink: '0',
  marginBottom: '20px',
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  color: '#202020',
  fontSize: '18px',
  fontStyle: 'normal',
  fontWeight: '600',
  lineHeight: '27px',
  marginBottom: '15px',
}));
// global delete dialog with placeholders, pass title as prop and content as children prop
const ShareLinkDialog = ({
  open,
  title,
  onClose,
  children,
}: ShareLinkDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <StyledDialogContainer>
        <StyledDialogTitle>{title}</StyledDialogTitle>
        <DialogContent>{children}</DialogContent>
        {/* <DialogActions sx={{ justifyContent: "center", pb: 4 }}>
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
        </DialogActions> */}
      </StyledDialogContainer>
    </Dialog>
  );
};

export default ShareLinkDialog;
