export const openDialog = payload => ({
  type: 'OPEN_DIALOG',
  payload,
});

export const closeDialog = () => ({
  type: 'CLOSE_DIALOG',
});
