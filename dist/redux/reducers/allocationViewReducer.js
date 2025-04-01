"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.setExpandRowId = exports.changeView = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const initialState = {
    view: 'Teams',
    loading: false,
    error: null,
    expandRowId: null,
};
const viewSlice = (0, toolkit_1.createSlice)({
    name: 'view',
    initialState,
    reducers: {
        changeView: (state, action) => {
            state.view = action.payload;
        },
        setExpandRowId: (state, action) => {
            state.expandRowId = action.payload;
        },
    },
    extraReducers: (builder) => {
    },
});
_a = viewSlice.actions, exports.changeView = _a.changeView, exports.setExpandRowId = _a.setExpandRowId;
exports.default = viewSlice.reducer;
