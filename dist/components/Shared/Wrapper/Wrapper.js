"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const react_1 = __importDefault(require("react"));
const Wrapper = ({ children }) => {
    return (react_1.default.createElement(material_1.Container, { sx: { marginLeft: "250px", width: "calc(100vw - 250px)" } }, children));
};
exports.default = Wrapper;
