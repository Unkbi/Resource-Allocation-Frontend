"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const styles_1 = require("@mui/material/styles");
const material_1 = require("@mui/material");
const StyledLabel = (0, styles_1.styled)(material_1.Typography)(({ theme }) => ({
    color: '#1C2D5F',
    fontWeight: 600,
    fontSize: '12px',
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    lineHeight: '16px',
    paddingBottom: '5px',
}));
exports.default = StyledLabel;
