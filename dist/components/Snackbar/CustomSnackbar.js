"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomSnackbar = void 0;
const react_1 = __importDefault(require("react"));
const Snackbar_1 = __importDefault(require("@mui/material/Snackbar"));
const Alert_1 = __importDefault(require("@mui/material/Alert"));
const toastAction_1 = require("@/app/redux/actions/toastAction");
const react_redux_1 = require("react-redux");
const CustomSnackbar = ({ message, type, open, position }) => {
    const dispatch = (0, react_redux_1.useDispatch)();
    const { vertical = 'top', horizontal = 'center' } = position || {};
    const handleClose = () => {
        dispatch((0, toastAction_1.hideToastAction)());
    };
    return (react_1.default.createElement(Snackbar_1.default, { anchorOrigin: { vertical, horizontal }, open: open, autoHideDuration: 4000, onClose: handleClose },
        react_1.default.createElement(Alert_1.default, { onClose: handleClose, severity: type, sx: {
                width: '100%',
                '& .MuiAlert-message': {
                    fontSize: '0.875rem',
                },
            } }, message)));
};
exports.CustomSnackbar = CustomSnackbar;
