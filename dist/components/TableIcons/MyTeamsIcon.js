"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const MyTeamsIcon = ({ color = '#344665', fontSize = 'medium', ...props }) => {
    return (react_1.default.createElement(material_1.SvgIcon, { ...props, fontSize: fontSize, viewBox: "0 0 14 16", xmlns: "http://www.w3.org/2000/svg" },
        react_1.default.createElement("path", { d: "M13 14.5V13C13 11.3431 11.6569 10 10 10H4C2.34315 10 1 11.3431 1 13V14.5", stroke: color, strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round", fill: "none" }),
        react_1.default.createElement("circle", { cx: "7", cy: "4", r: "3", stroke: color, strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round", fill: "none" })));
};
exports.default = MyTeamsIcon;
