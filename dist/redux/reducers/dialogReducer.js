"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDialogData = exports.closeDialog = exports.openDialog = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const initialState = {
    isOpen: false,
    title: '',
    submitButtonText: '',
    cancelButtonText: '',
    formState: {
        formType: '',
        initialData: {}
    },
};
const dialogSlice = (0, toolkit_1.createSlice)({
    name: 'dialog',
    initialState,
    reducers: {
        openDialog: (state, action) => {
            const { title, submitButtonText, cancelButtonText, formType, initialData } = action.payload;
            state.isOpen = true;
            state.title = title || '';
            state.submitButtonText = submitButtonText || 'Submit';
            state.cancelButtonText = cancelButtonText || 'Cancel';
            state.formState.formType = formType || '';
            state.formState.initialData = initialData || {};
        },
        closeDialog: (state) => {
            state.isOpen = false;
            state.title = '';
            state.submitButtonText = '';
            state.cancelButtonText = '';
            state.formState.formType = '';
            state.formState.initialData = {};
        },
        updateDialogData: (state, action) => {
            const { title, submitButtonText, cancelButtonText, formType, initialData } = action.payload;
            state.title = title ?? state.title;
            state.submitButtonText = submitButtonText ?? state.submitButtonText;
            state.cancelButtonText = cancelButtonText ?? state.cancelButtonText;
            state.formState.formType = formType ?? state.formState.formType;
            state.formState.initialData = initialData ?? state.formState.initialData;
        },
    }
});
// Export the actions
_a = dialogSlice.actions, exports.openDialog = _a.openDialog, exports.closeDialog = _a.closeDialog, exports.updateDialogData = _a.updateDialogData;
// Export the reducer
exports.default = dialogSlice.reducer;
