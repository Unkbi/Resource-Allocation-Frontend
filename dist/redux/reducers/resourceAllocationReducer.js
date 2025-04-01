"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allocationServices_1 = require("@/app/services/allocationServices");
const toolkit_1 = require("@reduxjs/toolkit");
const initialState = {
    allocation: null,
    loading: false,
    error: null,
};
const resourceAllocationsSlice = (0, toolkit_1.createSlice)({
    name: 'resourceAllocations',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder;
        // Handle post resource allocation
        builder
            .addCase(allocationServices_1.postResourceAllocations.pending, state => {
            state.loading = true;
            state.error = null;
        })
            .addCase(allocationServices_1.postResourceAllocations.fulfilled, (state, action) => {
            state.loading = false;
            state.allocation = action.payload;
        })
            .addCase(allocationServices_1.postResourceAllocations.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Handle put resource allocation
        builder
            .addCase(allocationServices_1.putResourceAllocations.pending, state => {
            state.loading = true;
            state.error = null;
        })
            .addCase(allocationServices_1.putResourceAllocations.fulfilled, (state, action) => {
            state.loading = false;
            state.allocation = action.payload;
        })
            .addCase(allocationServices_1.putResourceAllocations.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Handle delete resource allocation
        builder
            .addCase(allocationServices_1.deleteResourceAllocations.pending, state => {
            state.loading = true;
            state.error = null;
        })
            .addCase(allocationServices_1.deleteResourceAllocations.fulfilled, (state, action) => {
            state.loading = false;
            state.allocation = action.payload;
        })
            .addCase(allocationServices_1.deleteResourceAllocations.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
exports.default = resourceAllocationsSlice.reducer;
