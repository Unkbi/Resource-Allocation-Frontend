"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeResourceAllocation = exports.updateResourceAllocation = exports.setResourceAllocation = void 0;
const allocationServices_1 = require("@/app/services/allocationServices");
const setResourceAllocation = allocationData => async (dispatch) => {
    try {
        await dispatch((0, allocationServices_1.postResourceAllocations)(allocationData));
    }
    catch (error) {
        console.error('Error setting resource allocation:', error);
    }
};
exports.setResourceAllocation = setResourceAllocation;
const updateResourceAllocation = allocationData => async (dispatch) => {
    try {
        await dispatch((0, allocationServices_1.putResourceAllocations)(allocationData));
    }
    catch (error) {
        console.error('Error updating resource allocation:', error);
    }
};
exports.updateResourceAllocation = updateResourceAllocation;
const removeResourceAllocation = allocationData => async (dispatch) => {
    try {
        await dispatch((0, allocationServices_1.deleteResourceAllocations)(allocationData));
    }
    catch (error) {
        console.error('Error deleting resource allocation:', error);
    }
};
exports.removeResourceAllocation = removeResourceAllocation;
