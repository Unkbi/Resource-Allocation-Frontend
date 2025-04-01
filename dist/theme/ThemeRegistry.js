"use strict";
"use client";
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
exports.ThemeContext = void 0;
exports.default = ThemeRegistry;
const react_1 = __importStar(require("react"));
const CssBaseline_1 = __importDefault(require("@mui/material/CssBaseline"));
const styles_1 = require("@mui/material/styles");
const EmotionCache_1 = require("./EmotionCache");
const theme_1 = require("./theme");
exports.ThemeContext = (0, react_1.createContext)(null);
function ThemeRegistry({ children }) {
    const [mode, setMode] = (0, react_1.useState)('light');
    const [primaryColor, setPrimaryColor] = (0, react_1.useState)('#1C2D5F');
    const [fontSize, setFontSize] = (0, react_1.useState)('md');
    const theme = (0, theme_1.getTheme)(mode, primaryColor, fontSize);
    const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    const changePrimaryColor = (color) => setPrimaryColor(color);
    const changeFontSize = (adjustment) => {
        setFontSize((prev) => Math.max(10, prev + adjustment));
    };
    return (react_1.default.createElement(EmotionCache_1.NextAppDirEmotionCacheProvider, { options: { key: "mui" } },
        react_1.default.createElement(exports.ThemeContext.Provider, { value: { toggleMode, changePrimaryColor, changeFontSize, mode, primaryColor, fontSize } },
            react_1.default.createElement(styles_1.ThemeProvider, { theme: theme },
                react_1.default.createElement(CssBaseline_1.default, null),
                children))));
}
