"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAllocations = exports.setRowState = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const initialState = {
    rowState: [],
    allocations: {},
};
const dataGridSlice = (0, toolkit_1.createSlice)({
    name: 'dataGrid',
    initialState,
    reducers: {
        setRowState: (state, action) => {
            state.rowState = action.payload;
        },
        setAllocations: (state, action) => {
            state.allocations[action.payload.team_id] = action.payload.value;
        },
    }
});
// Export the actions
_a = dataGridSlice.actions, exports.setRowState = _a.setRowState, exports.setAllocations = _a.setAllocations;
// Export the reducer
exports.default = dataGridSlice.reducer;
