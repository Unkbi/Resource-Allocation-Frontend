import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { IconButton, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { closeDialog } from '@/app/redux/reducers/dialogReducer';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    justifyContent: 'flex-end',
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2.5),
    height: '100vh',
    backgroundColor: '#fff',
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
    height: '56px',
    boxShadow:'-7px -6px 7px rgba(0, 0, 0, 0.06)'
  },
  '& .MuiPaper-root': {
    margin: 0,
    borderRadius: 0,
    position: 'fixed',
    right: 0,
    top: 0,
    width: '380px',
    height: '100vh',
    maxHeight: 'none',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(2, 2.5),
  height: '52px',
  fontFamily: 'Open Sans',
  fontWeight: 600,
  fontSize: '15px',
  lineHeight: 'normal',
  letterSpacing: '0px',
  color: '#FFFF',
  display: 'flex',
  alignItems: 'center',
  fontStyle: 'normal',
  background: '#1C2D5F',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: 16,
  top: 20,
  color: '#FFF',
  width: '14px',
  height: '14px',
}));

const StyledSubmitButton = styled(Button)(({ theme }) => ({
  width: '86px',
  height: '36px',
  borderRadius: '4px',
  fontFamily: 'Open Sans',
  fontWeight: '700',
  fontSize: '12px',
  lineHeight: '100%',
  letterSpacing: '0px',
  textAlign: 'center',
  textTransform: 'none'
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
  width: '86px',
  height: '36px',
  borderBlockColor: '#1C2D5F',
  borderRadius: '4px',
  borderWidth: '1px',
  fontFamily: 'Open Sans',
  fontWeight: '700',
  fontSize: '12px',
  lineHeight: '100%',
  letterSpacing: '0px',
  textAlign: 'center',
  textTransform: 'none'
}));

const CustomDialog = ({ children, onSubmit, onCancel }) => {
  const dispatch = useDispatch();
  const dialogState = useSelector(state => state.globalDialog);
  const { isOpen, title, submitButtonText, cancelButtonText } = dialogState;

  const handleClose = () => {
    dispatch(closeDialog());
    onCancel()
  };

  return (
    <React.Fragment>
      <StyledDialog open={isOpen} onClose={handleClose}>
        <StyledDialogTitle>{title}</StyledDialogTitle>
        <StyledIconButton aria-label="close" onClick={handleClose}>
          <CloseIcon />
        </StyledIconButton>
        <DialogContent>{children}</DialogContent>
        <DialogActions>
          <StyledCancelButton variant="outlined" onClick={handleClose}>
            {cancelButtonText}
          </StyledCancelButton>
          <StyledSubmitButton onClick={onSubmit} variant="contained">
            {submitButtonText}
          </StyledSubmitButton>
        </DialogActions>
      </StyledDialog>
    </React.Fragment>
  );
};

export default CustomDialog;
