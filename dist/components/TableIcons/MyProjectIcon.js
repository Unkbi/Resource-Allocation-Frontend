"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const MyProjectIcon = ({ color = '#344665', fontSize = 'medium', ...props }) => {
    return (react_1.default.createElement(material_1.SvgIcon, { ...props, fontSize: fontSize, viewBox: "0 0 24 24" },
        react_1.default.createElement("g", { stroke: "none", strokeWidth: "1", fill: "none", fillRule: "evenodd" },
            react_1.default.createElement("g", { transform: "translate(5, 3)", stroke: color, strokeLinecap: "round", strokeWidth: "1.4" },
                react_1.default.createElement("g", { strokeLinejoin: "round" },
                    react_1.default.createElement("path", { d: "M7.875,0 C5.54166667,0 3.79166667,0 2.625,0 C2.43055556,0 2.13888889,0 1.75,0 C0,0 0,1.75 0,1.75 L0,15.75 C0,16.7164983 0.783501688,17.5 1.75,17.5 L12.25,17.5 C13.2164983,17.5 14,16.7164983 14,15.75 L14,6.125 L7.875,0 Z" }),
                    react_1.default.createElement("polyline", { points: "7.875 0 7.875 6.125 14 6.125" })),
                react_1.default.createElement("line", { x1: "3", y1: "11", x2: "9", y2: "11", stroke: color, strokeWidth: "1.4" })))));
};
exports.default = MyProjectIcon;
