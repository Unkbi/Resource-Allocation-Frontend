"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
// global delete dialog with placeholders, pass title as prop and content as children prop
const DeleteDialog = ({ open, onCancel, onConfirm, title, children }) => {
    return (react_1.default.createElement(material_1.Dialog, { open: open, onCancel: onCancel },
        react_1.default.createElement(material_1.Box, { sx: { textAlign: "center", fontFamily: "Manrope" } },
            react_1.default.createElement(material_1.DialogTitle, { sx: { fontWeight: "bold", fontSize: "1.25rem", pt: 4, pl: 3.5, pl: 3.5 } }, title || "Are you sure you want to delete?"),
            react_1.default.createElement(material_1.DialogContent, null, children ? (react_1.default.createElement(material_1.Typography, { sx: { color: "#666", fontSize: "1rem" } }, children)) : (react_1.default.createElement(material_1.Typography, { sx: { color: "#666", fontSize: "1rem" } }, "This will be deleted from your sheet."))),
            react_1.default.createElement(material_1.DialogActions, { sx: { justifyContent: "center", pb: 4 } },
                react_1.default.createElement(material_1.Button, { onClick: onCancel, variant: "outlined", sx: {
                        fontWeight: 400,
                        borderRadius: "6px",
                        textTransform: "none",
                        minWidth: "90px",
                        borderColor: "#1C2D5F",
                        color: "#1C2D5F",
                        marginLeft: "12px",
                        marginRight: "12px",
                        "&:hover": { backgroundColor: "#F5F5F5", borderColor: "#1C2D5F" },
                    } }, "No"),
                react_1.default.createElement(material_1.Button, { onClick: onConfirm, variant: "contained", sx: {
                        fontWeight: 400,
                        borderRadius: "6px",
                        textTransform: "none",
                        minWidth: "90px",
                        backgroundColor: "#1C2D5F",
                        marginLeft: "12px",
                        marginRight: "12px",
                        "&:hover": { backgroundColor: "#152347" },
                    } }, "Yes")))));
};
exports.default = DeleteDialog;
