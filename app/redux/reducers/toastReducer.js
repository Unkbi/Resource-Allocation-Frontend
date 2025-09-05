import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  open: false,
  message: '',
  type: 'success',
  position: { vertical: 'bottom', horizontal: 'left' },
  autoHideTimer: 4000,
  toasts: [],
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action) => {
      const exists = state.toasts.some(
        toast => toast.message === action.payload.message
      );
      if (exists) return; // Prevent duplicates

      const id = Date.now() + Math.random();
      const toast = {
        id,
        open: action.payload.open,
        message: action.payload.message,
        type: action.payload.type,
        autoHideTimer: action.payload.autoHideTimer || 4000,
        position: action.payload.position,
      };
      state.toasts.push(toast);
      state.open = true;
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.autoHideTimer = action.payload.autoHideTimer;
      state.position = action.payload.position;
    },
    hideToast: (state, action) => {
      const toastId = action.payload;
      state.toasts = state.toasts.filter(toast => toast.id !== toastId?.id);
      state.message = '';
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
