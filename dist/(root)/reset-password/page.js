"use strict";
'use client';
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ResetPasswordPageWrapper;
const react_1 = __importStar(require("react"));
const react_redux_1 = require("react-redux");
const navigation_1 = require("next/navigation");
const material_1 = require("@mui/material");
const authActions_1 = require("@/app/redux/actions/authActions");
const MainBox = (0, material_1.styled)(material_1.Box)(({ theme }) => ({
    "& .loginLeft": {
        width: "45%",
        backgroundImage: "linear-gradient(180deg, #FFFDF9 0%, #FFFAEF 100%);",
        textAlign: "left",
        padding: "30px 90px",
        "& img": {
            maxWidth: "100%"
        }
    },
    "& .loginRight": {
        width: "55%",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#fff",
        "& .formBox": {
            width: "360px",
            margin: "0 auto",
            "& h4": {
                fontFamily: "'Manrope', serif",
                color: "#000",
                fontSize: "32px",
                fontWeight: "800",
                marginBottom: "4px"
            },
            "& .subHeadingText": {
                color: "#757575",
                fontSize: "15px",
                fontWeight: "400",
                marginBottom: "20px",
                fontFamily: "'Manrope', serif",
            }
        },
        "& .forgot": {
            textAlign: "right",
            fontFamily: "'Manrope', serif",
            fontWeight: "600",
            fontSize: "14px",
            lineHeight: "17px",
            "& a": {
                color: "#1567CA",
            }
        },
        "& .signInButton": {
            backgroundColor: "#1567CA",
            borderRadius: "4px",
            height: "48px",
            color: "#FFFFFF",
            fontFamily: "'Manrope', serif",
            fontWeight: "700",
            fontSize: "15px",
            lineHeight: "18px",
            textTransform: "none",
            boxShadow: "none",
            marginBottom: "20px"
        },
        "& .googleButton": {
            backgroundColor: "#FFFFFF",
            border: "1px solid #E0E0E0",
            borderRadius: "3px",
            boxShadow: "0 6px 20px 0 rgba(0, 0, 0, 0.04)",
            height: "48px",
            color: "#424242",
            fontFamily: "'Manrope', serif",
            fontWeight: "600",
            fontSize: "15px",
            lineHeight: "18px",
            gap: "10px",
            marginBottom: "20px",
            textTransform: "none"
        },
        "& .signWithSSO": {
            backgroundColor: "#F2F5FA",
            borderRadius: "3px",
            border: "none",
            color: "#142B51",
            fontFamily: "'Manrope', serif",
            fontWeight: "600",
            fontSize: "15px",
            lineHeight: "18px",
            height: "48px",
            marginBottom: "20px",
            textTransform: "none"
        },
        "& .noAccount": {
            color: "#142B51",
            fontFamily: "'Manrope', serif",
            fontWeight: "500",
            fontSize: "14px",
            lineHeight: "17px",
            textAlign: "center",
            "& a": {
                color: "#1567CA",
                fontWeight: "600"
            }
        },
        "& .orText": {
            fontFamily: "'Manrope', serif",
            fontWeight: "700",
            color: "#757575",
            fontSize: "15px",
            fontWeight: "700",
            marginBottom: "20px",
            textAlign: "center",
            position: "relative",
            "& span": {
                position: "relative",
                zIndex: "1",
                background: "#fff"
            },
            "&::before": {
                background: "rgb(255,255,255)",
                background: "linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(224,224,224,1) 15%, rgba(255,255,255,1) 50%, rgba(224,224,224,1) 85%, rgba(255,255,255,1) 100%)",
                width: "100%",
                height: "1px",
                content: "''",
                position: "absolute",
                left: "0",
                top: "50%",
                zIndex: "0",
                marginTop: "-1px"
            }
        },
        "& .textField": {
            width: "100%",
            marginBottom: "22px",
            "& .MuiOutlinedInput-input": {
                height: "46px",
                lineHeight: "40px",
                background: "#FFFFFF 0% 0% no-repeat padding-box",
                padding: "2px 12px 3px 12px",
                borderRadius: "5px",
                fontFamily: "'Manrope', serif",
                fontSize: "14px",
                fontWeight: "normal",
                color: "#212121",
                boxSizing: "border-box",
                "&::placeholder": {
                    color: "#424242",
                    opacity: 1,
                    fontFamily: "'Manrope', serif",
                    fontSize: "14px"
                },
            },
            "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                border: "1px solid #E0E0E0",
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                border: "1px solid #E0E0E0",
                borderRadius: "5px"
            }
        }
    }
}));
function ResetPasswordPageWrapper() {
    return (react_1.default.createElement(react_1.Suspense, { fallback: react_1.default.createElement("div", null, "Loading...") },
        react_1.default.createElement(RestPasswordPage, null)));
}
function RestPasswordPage() {
    const [newPassword, setNewPassword] = (0, react_1.useState)('');
    const [confirmPassword, setConfirmPassword] = (0, react_1.useState)('');
    const [errorMessage, setErrorMessage] = (0, react_1.useState)('');
    const [showNewPassword, setShowNewPassword] = (0, react_1.useState)(false);
    const [showConfirmPassword, setShowConfirmPassword] = (0, react_1.useState)(false);
    const router = (0, navigation_1.useRouter)();
    const dispatch = (0, react_redux_1.useDispatch)();
    const { loading, error, resetPasswordMessage } = (0, react_redux_1.useSelector)((state) => state.user);
    const searchParams = (0, navigation_1.useSearchParams)();
    const username = searchParams.get('username');
    const code = searchParams.get('code');
    const handleResetPassword = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }
        dispatch((0, authActions_1.performResetPassword)({
            'Agentlang.Kernel.Identity/ConfirmForgotPassword': {
                Password: newPassword,
                Username: username,
                ConfirmationCode: code
            }
        })).then((response) => {
            console.log('Password reset successful:', response);
        });
        setNewPassword('');
        setConfirmPassword('');
        setErrorMessage('');
    };
    const handleToggleNewPassword = () => setShowNewPassword((prev) => !prev);
    const handleToggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);
    if (resetPasswordMessage && !error) {
        router.push('/login');
    }
    return (react_1.default.createElement(MainBox, { sx: { display: 'flex', minHeight: '100vh' } },
        react_1.default.createElement(material_1.Box, { display: "flex", width: '100%' },
            react_1.default.createElement(material_1.Box, { className: 'loginLeft' },
                react_1.default.createElement("img", { src: "/images/coi-logo.png", alt: 'COI', width: 280 }),
                react_1.default.createElement(material_1.Box, { mt: 12 },
                    react_1.default.createElement("img", { src: "/images/login-left-img.png", alt: 'login-left-img', width: '480px' }))),
            react_1.default.createElement(material_1.Box, { className: 'loginRight' },
                react_1.default.createElement(material_1.Box, { className: 'formBox' },
                    react_1.default.createElement(material_1.Typography, { variant: "h4" }, "Reset Password"),
                    react_1.default.createElement(material_1.Typography, { className: 'subHeadingText', whiteSpace: 'nowrap' }, "Your new password must be different from previous one"),
                    react_1.default.createElement(material_1.Box, { component: "form", onSubmit: handleResetPassword },
                        react_1.default.createElement(material_1.TextField, { className: 'textField', variant: "outlined", placeholder: "New Password", type: showNewPassword ? "text" : "password", fullWidth: true, value: newPassword, onChange: (e) => setNewPassword(e.target.value), InputProps: {
                                endAdornment: (react_1.default.createElement(material_1.InputAdornment, { position: "end" },
                                    react_1.default.createElement(material_1.IconButton, { onClick: handleToggleNewPassword, edge: "end" }, showNewPassword ? (react_1.default.createElement("img", { src: "/images/icons/eye-on.svg", alt: 'eye-on' })) : (react_1.default.createElement("img", { src: "/images/icons/eye-off.svg", alt: 'eye-off' }))))),
                            } }),
                        react_1.default.createElement(material_1.TextField, { className: 'textField', variant: "outlined", placeholder: "Confirm Password", type: showConfirmPassword ? "text" : "password", fullWidth: true, value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), InputProps: {
                                endAdornment: (react_1.default.createElement(material_1.InputAdornment, { position: "end" },
                                    react_1.default.createElement(material_1.IconButton, { onClick: handleToggleConfirmPassword, edge: "end" }, showConfirmPassword ? (react_1.default.createElement("img", { src: "/images/icons/eye-on.svg", alt: 'eye-on' })) : (react_1.default.createElement("img", { src: "/images/icons/eye-off.svg", alt: 'eye-off' }))))),
                            } }),
                        errorMessage && (react_1.default.createElement(material_1.Typography, { variant: "body2", color: "error", sx: { mb: 2 } }, errorMessage)),
                        react_1.default.createElement(material_1.Button, { type: "submit", variant: "contained", color: "primary", fullWidth: true, disabled: loading, sx: { mt: 2 }, className: 'signInButton' }, loading ? react_1.default.createElement(material_1.CircularProgress, { size: 24 }) : 'Reset Password'))))),
        resetPasswordMessage && !error && (react_1.default.createElement(material_1.Typography, { variant: "body2", color: "success", sx: { position: 'absolute', bottom: '150px', left: '50%', transform: 'translateX(-50%)' } }, "Password reset successfully! You can now log in with your new password.")),
        error && (react_1.default.createElement(material_1.Typography, { variant: "body2", color: "error", sx: { position: 'absolute', bottom: '150px', left: '50%', transform: 'translateX(-50%)' } }, error))));
}
