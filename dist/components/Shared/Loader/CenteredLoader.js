"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const LinearProgress_1 = __importDefault(require("@mui/material/LinearProgress"));
const CenteredLoader = () => {
    return (react_1.default.createElement("div", { style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
        } },
        react_1.default.createElement("div", { style: { width: '50%' } },
            react_1.default.createElement(LinearProgress_1.default, null))));
};
exports.default = CenteredLoader;
