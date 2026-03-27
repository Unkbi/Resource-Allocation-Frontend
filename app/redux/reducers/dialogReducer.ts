import { dialogState } from '@/app/types/dialogTypes';
import { createSlice } from '@reduxjs/toolkit';

const initialState: dialogState = {
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
    formValues : {},
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
        formValues
      } = action.payload;
      state.isOpen = true;
      state.title = title || '';
      state.submitButtonText = submitButtonText || 'Submit';
      state.secondaryButtonText = secondaryButtonText || '';
      state.primarySecondButtonText = primarySecondButtonText || '';
      state.cancelButtonText = cancelButtonText || 'Cancel';
      state.formState.formType = formType || '';
      state.formState.initialData = initialData || {};
      state.formState.formValues = formValues || {};
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
      state.formState.formValues = {};
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
        formValues
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
      state.formState.formValues = formValues ?? state.formState.formValues;
    },
    updateFormValues: (state, action) => {
      state.formState.formValues = action.payload;
    },
  }
});

// Export the actions
export const { openDialog, closeDialog, updateDialogData,updateFormValues } =
  dialogSlice.actions;

// Export the reducer
export default dialogSlice.reducer;
