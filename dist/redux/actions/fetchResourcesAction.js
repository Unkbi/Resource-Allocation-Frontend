"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllResources = void 0;
const resourceServices_1 = require("@/app/services/resourceServices");
const fetchAllResources = () => async (dispatch) => {
    try {
        await dispatch((0, resourceServices_1.getAllResources)());
    }
    catch (error) {
        console.error('Error fetching resources data:', error);
    }
};
exports.fetchAllResources = fetchAllResources;
