"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomAddIcon = void 0;
const Add_1 = __importDefault(require("@mui/icons-material/Add"));
const material_1 = require("@mui/material");
const CustomAddIcon = ({ value, count = null, onClick = () => { } }) => {
    return (React.createElement(material_1.Box, { sx: {
            display: 'flex',
            width: '100%',
            minWidth: 0,
            alignItems: 'center',
            '&:hover .add-icon': {
                opacity: 1,
                visibility: 'visible'
            }
        } },
        value && React.createElement(material_1.Box, { sx: {
                flex: '1 1 auto',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            } }, value),
        React.createElement(material_1.Box, { sx: {
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
            } },
            count !== null && count !== "" && (React.createElement(material_1.Box, { component: "span" },
                "(",
                count,
                ")")),
            React.createElement(Add_1.default, { className: "add-icon", sx: {
                    fontSize: 20,
                    opacity: 0,
                    visibility: 'hidden',
                    transition: 'opacity 0.2s, visibility 0.2s',
                    backgroundColor: '#1C2D5F',
                    color: '#fff',
                    cursor: 'pointer',
                    ml: count === null ? 1 : 0,
                    '&:hover': {
                        backgroundColor: '#1C2D5F',
                    },
                    borderRadius: '2px',
                }, onClick: onClick }))));
};
exports.CustomAddIcon = CustomAddIcon;
