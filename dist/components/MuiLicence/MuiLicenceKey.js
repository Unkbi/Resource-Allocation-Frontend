"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MuiXLicense;
const x_license_1 = require("@mui/x-license");
const licenseKey = process.env.NEXT_PUBLIC_MUI_X_LICENSE_KEY;
x_license_1.LicenseInfo.setLicenseKey(licenseKey);
function MuiXLicense() {
    return null;
}
