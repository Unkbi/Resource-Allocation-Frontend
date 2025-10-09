'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Typography, Box, SxProps } from '@mui/material';

type ErrorType = 'accessDenied' | 'notFound' | 'serverError' | 'generic';

interface ErrorPageProps {
  type?: ErrorType;
  imageSrc?: string;
  text?: string;
  message?: string;
  buttonLabel?: string;
  redirectPath?: string;
}

const defaultConfigs: Record<
  ErrorType,
  { image: string; text: string; message: string; button: string }
> = {
  accessDenied: {
    image: '/images/icons/notAuthorized.svg',
    text: 'Sorry, you are not authorized to access this page.',
    message: 'To access, please contact your Administrator.',
    button: 'Go to Dashboard',
  },
  notFound: {
    image: '/images/not-found.svg',
    text: 'Page Not Found',
    message: 'The page you’re looking for doesn’t exist or was moved.',
    button: 'Back to Home',
  },
  serverError: {
    image: '/images/server-error.svg',
    text: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    button: 'Reload',
  },
  generic: {
    image: '/images/error-generic.svg',
    text: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    button: 'Go Back',
  },
};

// Common Styles
const containerStyles: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: 'calc(100vh - 31px)',
  gap: 0,
};

const imageStyles: SxProps = {
  width: 400,
  height: 280,
  opacity: 1,
};

const textBoxStyles: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1,
};

const subtitleStyles: SxProps = {
  width: 312,
  height: 24,
  opacity: 1,
  fontFamily: 'Open Sans',
  fontWeight: 400,
  fontStyle: 'normal',
  fontSize: 14,
  lineHeight: '24px',
  textAlign: 'center',
  color: '#333333',
};

const messageStyles: SxProps = {
  width: 312,
  minHeight: 24,
  opacity: 1,
  fontFamily: 'Open Sans',
  fontWeight: 400,
  fontStyle: 'normal',
  fontSize: 14,
  lineHeight: '20px',
  textAlign: 'center',
  color: '#B91C1C',
};

const buttonStyles: SxProps = {
    width: '131px',
    height: 36,
    borderRadius: 1,
    mt: 2,
    backgroundColor: '#1C2D5F',
    '&:hover': {
    backgroundColor: '#152347',
    },
    fontFamily: 'Open Sans',
    color : '#FFFFFF' ,
    fontWeight: 700,
    fontSize: 12,
    lineHeight: '100%',
    letterSpacing: 0,
    textAlign: 'center',
    textTransform: 'none', 
};

export default function ErrorPage({
  type = 'generic',
  imageSrc,
  text,
  message,
  buttonLabel,
  redirectPath = '/dashboard',
}: ErrorPageProps) {
  const router = useRouter();
  const config = defaultConfigs[type];

  const handleAction = () => {
    if (type === 'serverError') {
      window.location.reload();
    } else {
      router.replace(redirectPath);
    }
  };

  return (
    <Box sx={containerStyles}>
      {/* Image */}
      <Box
        component="img"
        src={imageSrc || config.image}
        alt={text || config.text}
        sx={imageStyles}
      />

      {/* Text and Message */}
      <Box sx={textBoxStyles}>
        <Typography sx={subtitleStyles}>{text || config.text}</Typography>
        <Typography sx={messageStyles}>{message || config.message}</Typography>
      </Box>

      {/* Button */}
      <Button sx={buttonStyles} onClick={handleAction}>
        {buttonLabel || config.button}
      </Button>
    </Box>
  );
}
