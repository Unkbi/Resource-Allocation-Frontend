"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performChangeView = void 0;
const allocationViewReducer_1 = require("../reducers/allocationViewReducer");
const performChangeView = (newView) => async (dispatch) => {
    try {
        dispatch((0, allocationViewReducer_1.changeView)(newView));
        console.log(`View changed to ${newView}!`);
    }
    catch (error) {
        console.error('Failed to change view:', error);
    }
};
exports.performChangeView = performChangeView;
