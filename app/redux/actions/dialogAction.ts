interface OpenDialogAction {
  type: 'OPEN_DIALOG';
  payload: any; 
}

interface CloseDialogAction {
  type: 'CLOSE_DIALOG';
}

export const openDialog = (payload: any): OpenDialogAction => ({
  type: 'OPEN_DIALOG',
  payload,
});

export const closeDialog = (): CloseDialogAction => ({
  type: 'CLOSE_DIALOG',
});