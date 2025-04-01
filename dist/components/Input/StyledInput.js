"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StyledFormHelperText = exports.StyledCommentInput = exports.StyledInput = void 0;
const material_1 = require("@mui/material");
exports.StyledInput = (0, material_1.styled)(material_1.TextField)(({ theme, width, margin, padding, height, error }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '4px',
        height: height || '36px',
        backgroundColor: '#FFF',
        fontSize: '12px',
        "& fieldset": {
            borderColor: "#D6DCE1"
        }
    },
    '& fieldset': {
        borderColor: error ? theme.palette.error.main : '#D6DCE1',
    },
    '&:hover fieldset': {
        borderColor: error ? theme.palette.error.main : '#D6DCE1',
    },
    '&.Mui-focused fieldset': {
        borderColor: error ? theme.palette.error.main : '#D6DCE1',
    },
    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
    },
    '& input[type="number"]': {
        MozAppearance: 'textfield',
    },
    width: width || '100%',
    margin: margin || '0',
    padding: padding || '0',
}));
exports.StyledCommentInput = (0, material_1.styled)(material_1.TextField)(({ theme, width, margin, padding, height }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '4px',
        height: height || '88px',
        fill: '#FDFDFD',
        strokeWidth: " 1px",
        stroke: "#D6DCE1",
        boxshadow: ' 0px 2px 4px 0px #EBEBEB inset',
        backgroundColor: '#FFFFFFF',
        fontSize: '12px',
        "& fieldset": {
            borderColor: "#D6DCE1"
        }
    },
    width: width || '100%',
    margin: margin || '0',
    padding: padding || '0',
}));
exports.StyledFormHelperText = (0, material_1.styled)(material_1.FormHelperText)(({ theme }) => ({
    color: theme.palette.error.main,
    marginLeft: 0,
    fontSize: '0.75rem',
}));
