"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Button_1 = __importDefault(require("@mui/material/Button"));
const Button = ({ label, variant = 'contained', ...props }) => {
    return (react_1.default.createElement(Button, { variant: variant, ...props }, label));
};
exports.default = Button;
