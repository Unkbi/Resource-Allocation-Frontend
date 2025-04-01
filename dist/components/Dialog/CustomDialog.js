"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const Button_1 = __importDefault(require("@mui/material/Button"));
const Dialog_1 = __importDefault(require("@mui/material/Dialog"));
const DialogActions_1 = __importDefault(require("@mui/material/DialogActions"));
const DialogContent_1 = __importDefault(require("@mui/material/DialogContent"));
const DialogTitle_1 = __importDefault(require("@mui/material/DialogTitle"));
const material_1 = require("@mui/material");
const Close_1 = __importDefault(require("@mui/icons-material/Close"));
const react_redux_1 = require("react-redux");
const dialogReducer_1 = require("@/app/redux/reducers/dialogReducer");
const StyledDialog = (0, material_1.styled)(Dialog_1.default)(({ theme }) => ({
    '& .MuiDialog-container': {
        justifyContent: 'flex-end',
    },
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2.5),
        height: '100vh',
        backgroundColor: '#fff',
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
        height: '56px',
        boxShadow: '-7px -6px 7px rgba(0, 0, 0, 0.06)'
    },
    '& .MuiPaper-root': {
        margin: 0,
        borderRadius: 0,
        position: 'fixed',
        right: 0,
        top: 0,
        width: '380px',
        height: '100vh',
        maxHeight: 'none',
    },
}));
const StyledDialogTitle = (0, material_1.styled)(DialogTitle_1.default)(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(2, 2.5),
    height: '52px',
    fontFamily: 'Open Sans',
    fontWeight: 600,
    fontSize: '15px',
    lineHeight: 'normal',
    letterSpacing: '0px',
    color: '#FFFF',
    display: 'flex',
    alignItems: 'center',
    fontStyle: 'normal',
    background: '#1C2D5F',
}));
const StyledIconButton = (0, material_1.styled)(material_1.IconButton)(({ theme }) => ({
    position: 'absolute',
    right: 16,
    top: 20,
    color: '#FFF',
    width: '14px',
    height: '14px',
}));
const StyledSubmitButton = (0, material_1.styled)(Button_1.default)(({ theme }) => ({
    width: '86px',
    height: '36px',
    borderRadius: '4px',
    fontFamily: 'Open Sans',
    fontWeight: '700',
    fontSize: '12px',
    lineHeight: '100%',
    letterSpacing: '0px',
    textAlign: 'center',
    textTransform: 'none'
}));
const StyledCancelButton = (0, material_1.styled)(Button_1.default)(({ theme }) => ({
    width: '86px',
    height: '36px',
    borderBlockColor: '#1C2D5F',
    borderRadius: '4px',
    borderWidth: '1px',
    fontFamily: 'Open Sans',
    fontWeight: '700',
    fontSize: '12px',
    lineHeight: '100%',
    letterSpacing: '0px',
    textAlign: 'center',
    textTransform: 'none'
}));
const CustomDialog = ({ children, onSubmit }) => {
    const dispatch = (0, react_redux_1.useDispatch)();
    const dialogState = (0, react_redux_1.useSelector)(state => state.globalDialog);
    const { isOpen, title, submitButtonText, cancelButtonText } = dialogState;
    const handleClose = () => {
        dispatch((0, dialogReducer_1.closeDialog)());
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(StyledDialog, { open: isOpen, onClose: handleClose },
            React.createElement(StyledDialogTitle, null, title),
            React.createElement(StyledIconButton, { "aria-label": "close", onClick: handleClose },
                React.createElement(Close_1.default, null)),
            React.createElement(DialogContent_1.default, null, children),
            React.createElement(DialogActions_1.default, null,
                React.createElement(StyledCancelButton, { variant: "outlined", onClick: handleClose }, cancelButtonText),
                React.createElement(StyledSubmitButton, { onClick: onSubmit, variant: "contained" }, submitButtonText)))));
};
exports.default = CustomDialog;
