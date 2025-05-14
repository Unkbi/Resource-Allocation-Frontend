import { createSlice } from '@reduxjs/toolkit';

const highlightedRowSlice = createSlice({
  name: 'highlightedRow',
  initialState: {
    id: null,
  },
  reducers: {
    setHighlightedRowId: (state, action) => {
      state.id = action.payload;
    },
    clearHighlightedRowId: (state) => {
      state.id = null;
    },
  },
});

export const { setHighlightedRowId, clearHighlightedRowId } = highlightedRowSlice.actions;
export default highlightedRowSlice.reducer;
