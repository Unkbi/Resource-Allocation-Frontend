"use client";
import { LicenseInfo } from '@mui/x-license';

const licenseKey = process.env.NEXT_PUBLIC_MUI_X_LICENSE_KEY;

if (licenseKey){
  LicenseInfo.setLicenseKey(licenseKey);
}
else {
  console.warn('MUI X license key is not set in environment variables.')
}

export default function MuiXLicense(): null {
    return null;
  }