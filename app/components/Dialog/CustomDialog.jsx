import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Box, IconButton, styled } from '@mui/material';
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
    boxShadow: '-7px -6px 7px rgba(0, 0, 0, 0.06)',
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
  fontFamily: theme.typography.fontFamily,
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
  height: '36px',
  borderRadius: '4px',
  fontFamily: theme.typography.fontFamily,
  fontWeight: '700',
  fontSize: '12px',
  lineHeight: '100%',
  letterSpacing: '0px',
  textAlign: 'center',
  textTransform: 'none',
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
  width: '86px',
  height: '36px',
  borderBlockColor: '#1C2D5F',
  borderRadius: '4px',
  borderWidth: '1px',
  fontFamily: theme.typography.fontFamily,
  fontWeight: '700',
  fontSize: '12px',
  lineHeight: '100%',
  letterSpacing: '0px',
  textAlign: 'center',
  textTransform: 'none',
}));

const StyledDialogActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignContent: 'center',
  width: '100%',
  padding: '0 12px 0 12px',
}));

const StyledSubmitButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignContent: 'center',
  width: '100%',
  gap: 5,
}));

const CustomDialog = ({
  children,
  onSubmit,
  onSecondarySubmit,
  onCancel,
  viewOnly = false,
  isSubmitting =false,
}) => {
  const dispatch = useDispatch();
  const dialogState = useSelector(state => state.globalDialog);
  const {
    isOpen,
    title,
    submitButtonText,
    secondaryButtonText,
    primarySecondButtonText,
    cancelButtonText,
  } = dialogState;

  const handleClose = (event, reason) => {
    if (reason && reason === 'backdropClick') {
      return;
    }
    dispatch(closeDialog());
    onCancel();
  };
  return (
    <React.Fragment>
      <StyledDialog open={isOpen} onClose={handleClose}>
        <StyledDialogTitle>{title}</StyledDialogTitle>
        <StyledIconButton aria-label="close" onClick={handleClose}>
          <CloseIcon />
        </StyledIconButton>
        <DialogContent>{children}</DialogContent>
        {viewOnly ? (
          <DialogActions>
            <StyledCancelButton variant="outlined" onClick={handleClose}>
              {cancelButtonText}
            </StyledCancelButton>
          </DialogActions>
        ) : (
          <DialogActions>
            {primarySecondButtonText ? (
              <StyledDialogActionsContainer>
                <StyledCancelButton variant="outlined" onClick={handleClose}>
                  {cancelButtonText}
                </StyledCancelButton>
                <StyledSubmitButtonContainer>
                  {submitButtonText && (
                    <StyledSubmitButton onClick={onSubmit} variant="contained">
                      {submitButtonText}
                    </StyledSubmitButton>
                  )}
                  <StyledSubmitButton
                    variant="contained"
                    onClick={onSecondarySubmit}
                  >
                    {primarySecondButtonText}
                  </StyledSubmitButton>
                </StyledSubmitButtonContainer>
              </StyledDialogActionsContainer>
            ) : secondaryButtonText ? (
              <StyledDialogActionsContainer>
                <StyledCancelButton variant="outlined" onClick={handleClose}>
                  {cancelButtonText}
                </StyledCancelButton>
                <StyledSubmitButtonContainer>
                  <StyledSubmitButton
                    variant="outlined"
                    onClick={onSecondarySubmit}
                  >
                    {secondaryButtonText}
                  </StyledSubmitButton>
                  {submitButtonText && (
                    <StyledSubmitButton onClick={onSubmit} variant="contained">
                      {submitButtonText}
                    </StyledSubmitButton>
                  )}
                </StyledSubmitButtonContainer>
              </StyledDialogActionsContainer>
            ) : (
              <>
                <StyledCancelButton variant="outlined" onClick={handleClose}>
                  {cancelButtonText}
                </StyledCancelButton>
                {submitButtonText && (
                  <StyledSubmitButton
                    onClick={onSubmit}
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {submitButtonText}
                  </StyledSubmitButton>
                )}
              </>
            )}
          </DialogActions>
        )}
      </StyledDialog>
    </React.Fragment>
  );
};

export default CustomDialog;
