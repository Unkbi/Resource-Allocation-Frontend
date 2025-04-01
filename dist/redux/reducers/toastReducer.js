"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.hideToast = exports.showToast = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const initialState = {
    open: false,
    message: '',
    type: 'success',
    position: { vertical: 'top', horizontal: 'center' },
};
const toastSlice = (0, toolkit_1.createSlice)({
    name: 'toast',
    initialState,
    reducers: {
        showToast: (state, action) => {
            state.open = true;
            state.message = action.payload.message;
            state.type = action.payload.type || 'success';
            state.position = action.payload.position || {
                vertical: 'top',
                horizontal: 'center',
            };
        },
        hideToast: state => {
            state.open = false;
            state.message = '';
        },
    },
});
_a = toastSlice.actions, exports.showToast = _a.showToast, exports.hideToast = _a.hideToast;
exports.default = toastSlice.reducer;
