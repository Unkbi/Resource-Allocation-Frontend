import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,
  title: '',
  submitButtonText: '',
  readOnly: false,
  secondaryButtonText: '',
  primarySecondButtonText: '',
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
        primarySecondButtonText,
        cancelButtonText,
        formType,
        initialData,
        readOnly,
      } = action.payload;
      state.isOpen = true;
      state.title = title || '';
      state.submitButtonText = submitButtonText || 'Submit';
      state.secondaryButtonText = secondaryButtonText || '';
      state.primarySecondButtonText = primarySecondButtonText || '';
      state.cancelButtonText = cancelButtonText || 'Cancel';
      state.formState.formType = formType || '';
      state.formState.initialData = initialData || {};
      state.readOnly = readOnly || false;
    },
    closeDialog: state => {
      state.isOpen = false;
      state.title = '';
      state.submitButtonText = '';
      state.secondaryButtonText = '';
      state.primarySecondButtonText = '';
      state.cancelButtonText = '';
      state.formState.formType = '';
      state.formState.initialData = {};
    },
    updateDialogData: (state, action) => {
      const {
        title,
        submitButtonText,
        secondaryButtonText,
        primarySecondButtonText,
        cancelButtonText,
        formType,
        initialData,
      } = action.payload;

      state.title = title ?? state.title;
      state.submitButtonText = submitButtonText ?? state.submitButtonText;
      state.secondaryButtonText =
        secondaryButtonText ?? state.secondaryButtonText;
      state.primarySecondButtonText =
        primarySecondButtonText ?? state.primarySecondButtonText;
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
