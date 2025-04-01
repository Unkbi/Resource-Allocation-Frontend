"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const StyledTooltip = (0, material_1.styled)(({ className, ...props }) => (react_1.default.createElement(material_1.Tooltip, { ...props, classes: { popper: className } })))(({ theme }) => ({
    [`& .${material_1.tooltipClasses.tooltip}`]: {
        backgroundColor: '#142B51',
    },
    [`& .${material_1.tooltipClasses.arrow}`]: {
        color: '#142B51',
    },
}));
const TooltipButton = ({ msg, className, onClick, children, ...rest }) => {
    return (react_1.default.createElement(StyledTooltip, { title: msg, placement: "top", arrow: true },
        react_1.default.createElement(material_1.Button, { className: className, ...rest, onClick: onClick }, children)));
};
exports.default = TooltipButton;
