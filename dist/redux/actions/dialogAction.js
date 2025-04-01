"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDialog = exports.openDialog = void 0;
const openDialog = payload => ({
    type: 'OPEN_DIALOG',
    payload,
});
exports.openDialog = openDialog;
const closeDialog = () => ({
    type: 'CLOSE_DIALOG',
});
exports.closeDialog = closeDialog;
