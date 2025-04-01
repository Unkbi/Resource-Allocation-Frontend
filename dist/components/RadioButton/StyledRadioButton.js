"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const system_1 = require("@mui/system");
const StyledBox = (0, system_1.styled)(material_1.Box)(({ selected, backgroundColor, borderColor }) => ({
    width: "60px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: selected ? backgroundColor : `${backgroundColor}80`, // 80 is for 50% opacity
    border: selected ? `2px solid ${borderColor}` : `1px solid ${borderColor}`,
    borderRadius: "4px",
    cursor: "pointer",
}));
const StyledRadioButton = ({ value, label, selectedValue, onChange, backgroundColor, borderColor }) => {
    const isSelected = selectedValue === value;
    return (React.createElement(material_1.FormControlLabel, { value: value, control: React.createElement(material_1.Radio, { sx: { display: "none" } }), label: React.createElement(StyledBox, { selected: isSelected, backgroundColor: backgroundColor, borderColor: borderColor }, label), sx: { margin: 0 }, onChange: onChange }));
};
exports.default = StyledRadioButton;
