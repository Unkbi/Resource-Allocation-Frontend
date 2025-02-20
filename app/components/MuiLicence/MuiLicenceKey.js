'use client';
import { LicenseInfo } from '@mui/x-license';

const licenseKey = process.env.NEXT_PUBLIC_MUI_X_LICENSE_KEY;

LicenseInfo.setLicenseKey(licenseKey);

export default function MuiXLicense() {
    return null;
  }