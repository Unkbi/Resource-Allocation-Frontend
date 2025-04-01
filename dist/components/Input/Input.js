"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const TextField_1 = __importDefault(require("@mui/material/TextField"));
const CustomInput = ({ label, variant = 'outlined', ...props }) => {
    return react_1.default.createElement(TextField_1.default, { label: label, variant: variant, ...props });
};
exports.default = CustomInput;
