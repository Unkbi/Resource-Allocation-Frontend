"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hideToastAction = exports.showToastAction = void 0;
const toastReducer_1 = require("../reducers/toastReducer");
const showToastAction = (open, message, type, position) => dispatch => {
    dispatch((0, toastReducer_1.showToast)({
        open,
        message,
        type,
        position,
    }));
};
exports.showToastAction = showToastAction;
const hideToastAction = () => dispatch => {
    dispatch((0, toastReducer_1.hideToast)());
};
exports.hideToastAction = hideToastAction;
