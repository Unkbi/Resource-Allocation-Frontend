import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  open: false,
  message: '',
  type: 'success',
  position: { vertical: 'top', horizontal: 'center' },
};

const toastSlice = createSlice({
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

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
