import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,
  title: '',
  submitButtonText: '',
  secondaryButtonText: '',
  cancelButtonText: '',
  formState: {
    formType: '',
    initialData: {},
  },
};

const dialogSlice = createSlice({
  name: 'dialog',
  initialState,
  reducers: {
    openDialog: (state, action) => {
      const {
        title,
        submitButtonText,
        secondaryButtonText,
        cancelButtonText,
        formType,
        initialData,
      } = action.payload;
      state.isOpen = true;
      state.title = title || '';
      state.submitButtonText = submitButtonText || 'Submit';
      state.secondaryButtonText = secondaryButtonText || '';
      state.cancelButtonText = cancelButtonText || 'Cancel';
      state.formState.formType = formType || '';
      state.formState.initialData = initialData || {};
    },
    closeDialog: state => {
      state.isOpen = false;
      state.title = '';
      state.submitButtonText = '';
      state.secondaryButtonText = '';
      state.cancelButtonText = '';
      state.formState.formType = '';
      state.formState.initialData = {};
    },
    updateDialogData: (state, action) => {
      const {
        title,
        submitButtonText,
        secondaryButtonText,
        cancelButtonText,
        formType,
        initialData,
      } = action.payload;

      state.title = title ?? state.title;
      state.submitButtonText = submitButtonText ?? state.submitButtonText;
      state.secondaryButtonText =
        secondaryButtonText ?? state.secondaryButtonText;
      state.cancelButtonText = cancelButtonText ?? state.cancelButtonText;
      state.formState.formType = formType ?? state.formState.formType;
      state.formState.initialData = initialData ?? state.formState.initialData;
    },
  },
});

// Export the actions
export const { openDialog, closeDialog, updateDialogData } =
  dialogSlice.actions;

// Export the reducer
export default dialogSlice.reducer;
