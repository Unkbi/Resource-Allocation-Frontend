import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  open: false,
  message: '',
  type: 'success',
  position: { vertical: 'bottom', horizontal: 'left' },
  autoHideTimer: 4000
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action) => {
      state.open = true;
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.autoHideTimer = action.payload.autoHideTimer
      state.position = action.payload.position 
    },
    hideToast: state => {
      state.open = false;
      state.message = '';
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
