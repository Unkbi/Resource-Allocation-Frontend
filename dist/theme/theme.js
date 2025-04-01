"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTheme = void 0;
const styles_1 = require("@mui/material/styles");
const constants_1 = require("../constants/constants");
const getTheme = (mode, primaryColor, fontSize) => {
    const selectedColor = primaryColor && constants_1.themeColors[primaryColor] ? primaryColor : constants_1.DEFAULT_COLOR;
    const customSettings = constants_1.themeColors[selectedColor]?.[mode];
    return (0, styles_1.createTheme)({
        palette: {
            mode,
            primary: {
                main: primaryColor,
            },
        },
        typography: {
            fontFamily: "Open Sans",
            fontSize: constants_1.BASE_FONT_SIZE + constants_1.fontSizeMap[fontSize],
            h1: { fontSize: constants_1.BASE_FONT_SIZE + 16 + constants_1.fontSizeMap[fontSize] },
            h2: { fontSize: constants_1.BASE_FONT_SIZE + 12 + constants_1.fontSizeMap[fontSize] },
            h3: { fontSize: constants_1.BASE_FONT_SIZE + 8 + constants_1.fontSizeMap[fontSize] },
            body1: { fontSize: constants_1.BASE_FONT_SIZE + constants_1.fontSizeMap[fontSize] },
            caption: { fontSize: constants_1.BASE_FONT_SIZE - 2 + constants_1.fontSizeMap[fontSize] },
            button: { fontSize: constants_1.BASE_FONT_SIZE - 1 + constants_1.fontSizeMap[fontSize] },
        },
        custom: {
            ...customSettings
        },
    });
};
exports.getTheme = getTheme;
