"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const toolkit_1 = require("@reduxjs/toolkit");
const resourceServices_1 = require("@/app/services/resourceServices");
const initialState = {
    resources: null,
    loading: false,
    error: null,
};
const resourcesSlice = (0, toolkit_1.createSlice)({
    name: 'resources',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(resourceServices_1.getAllResources.pending, state => {
            state.loading = true;
            state.error = null;
        })
            .addCase(resourceServices_1.getAllResources.fulfilled, (state, action) => {
            state.loading = false;
            state.resources = action.payload;
        })
            .addCase(resourceServices_1.getAllResources.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
exports.default = resourcesSlice.reducer;
