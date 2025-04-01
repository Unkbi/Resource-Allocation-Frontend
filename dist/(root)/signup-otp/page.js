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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SignUpOtpPage;
const react_1 = __importStar(require("react"));
const react_redux_1 = require("react-redux");
const navigation_1 = require("next/navigation");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const image_1 = __importDefault(require("next/image"));
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
function SignUpOtpPage() {
    const [otp, setOtp] = (0, react_1.useState)(["", "", "", "", "", ""]);
    const dispatch = (0, react_redux_1.useDispatch)();
    const { loading, error, user, signupData } = (0, react_redux_1.useSelector)((state) => state.user);
    const inputRefs = (0, react_1.useRef)([]);
    const router = (0, navigation_1.useRouter)();
    const handleVerifyOtp = (e) => {
        e.preventDefault();
        dispatch((0, authActions_1.confirmSignUpUser)({
            'Agentlang.Kernel.Identity/ConfirmSignUp': {
                Username: signupData,
                ConfirmationCode: otp.join(""),
            }
        }));
    };
    const handleChange = (index, event) => {
        const value = event.target.value.replace(/\D/g, "").slice(0, 1);
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };
    const handleKeyDown = (index, event) => {
        if (event.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };
    const handleResendOtp = (e) => {
        e.preventDefault();
        dispatch((0, authActions_1.performForgotPassword)({
            'Agentlang.Kernel.Identity/ForgotPassword': {
                Username: signupData
            }
        }));
    };
    return (react_1.default.createElement(MainBox, { sx: { display: 'flex', minHeight: '100vh' } },
        react_1.default.createElement(material_1.Box, { display: "flex", width: '100%' },
            react_1.default.createElement(material_1.Box, { className: 'loginLeft' },
                react_1.default.createElement("img", { src: "/images/coi-logo.png", alt: 'COI', width: 280 }),
                react_1.default.createElement(material_1.Box, { mt: 12 },
                    react_1.default.createElement("img", { src: "/images/login-left-img.png", alt: 'login-left-img', width: '480px' }))),
            react_1.default.createElement(material_1.Box, { className: 'loginRight' },
                react_1.default.createElement(material_1.Box, { className: 'formBox' },
                    react_1.default.createElement(material_1.Typography, { variant: "h4" }, "Verify with OTP"),
                    react_1.default.createElement(material_1.Typography, { className: 'subHeadingText' },
                        "We've sent a verification code to ",
                        signupData),
                    react_1.default.createElement(material_1.Box, { component: "form", onSubmit: handleVerifyOtp },
                        otp.map((digit, index) => (react_1.default.createElement(material_1.TextField, { key: index, variant: "outlined", value: digit, onChange: (e) => handleChange(index, e), onKeyDown: (e) => handleKeyDown(index, e), inputProps: {
                                maxLength: 1,
                                pattern: "[0-9]*",
                                inputMode: "numeric",
                                style: { textAlign: "center", width: "40px" },
                            }, inputRef: (el) => (inputRefs.current[index] = el) }))),
                        react_1.default.createElement(material_1.Button, { type: "submit", variant: "contained", color: "primary", fullWidth: true, disabled: loading, sx: { mt: 2 }, className: 'signInButton' }, loading ? react_1.default.createElement(material_1.CircularProgress, { size: 24 }) : 'Verify')),
                    react_1.default.createElement(material_1.Typography, { className: 'noAccount', onClick: handleResendOtp }, "Resend OTP")))),
        error && (react_1.default.createElement(material_1.Typography, { variant: "body2", color: "error", sx: { position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' } }, error))));
}
