'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Typography, Box, SxProps } from '@mui/material';

type ErrorType =
  | 'noActualsAvailable'
  | 'noActualsTracked'

interface ErrorPageProps {
  type?: ErrorType;
  imageSrc?: string;
  text?: string;
  message?: string;
  buttonLabel?: string;
  redirectPath?: string;
  feedbackFunc?: () => void;
}

const defaultConfigs: Record<
  ErrorType,
  { image: string; text: string; button: string }
> = {
  noActualsAvailable: {
    image: '/images/icons/actualsNotfound.svg',
    text: 'No Data Available',
    button: 'Go Back to Current Week',
  },
  noActualsTracked: {
    image: '/images/icons/actualsNotfound.svg',
    text: 'No Data Tracked',
    button: 'Go Back to Current Week',
  },
};

const containerStyles: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  backgroundColor :'#F6F6F6'
};

const imageStyles: SxProps = {
  width: 34,
  height: 34,
  mb: 2,
};

const textBoxStyles: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1,
  width: 683,
  heigh :104
};

const subtitleStyles: SxProps = {
  width: 216,
  height: 36,
  fontFamily: 'Open Sans',
  fontWeight: 700,
  fontSize: '24px',
  lineHeight: '36px',
  textAlign: 'center',
  color: '#152E75',
};

const messageStyles: SxProps = {
  fontFamily: 'Open Sans',
  fontWeight: 400, 
  fontSize: 16,
  lineHeight: '20px',
  textAlign: 'center',
  color: '#303542',
};

const buttonStyles: SxProps = {
  width: 198,
  height: 45,
  mt: 2,
  borderRadius: '10px',
  backgroundColor: '#1C2D5F',
  '&:hover': { backgroundColor: '#152347' },
  fontFamily: 'Open Sans',
  fontWeight: 700,
  fontSize: 12,
  color: '#FFFFFF',
  textTransform: 'none',
};

export default function ActualsErrorPage({
  type = 'noActualsTracked',
  imageSrc,
  text,
  message,
  buttonLabel,
  redirectPath = '',
  feedbackFunc = () => { },
}: ErrorPageProps) {
  const router = useRouter();
  const config = defaultConfigs[type];

  const handleAction = () => {
    if (redirectPath || feedbackFunc) {
      router.replace(redirectPath);
      feedbackFunc();
    }
  };

  const renderMessage = () => {
      if (type === 'noActualsAvailable') {
          return (
              <Typography sx={messageStyles}>
                  There are no data to display for this time period. This could be
                  because this period is <br/>before actuals tracking got enabled, or the
                  selected dates fall outside your start and end <br/> date range.{' '}
                  <Box component="span" sx={{ fontWeight: 700 }}>
                      Click
                  </Box>{' '}
                  on the back arrow of the browser to go back to the previous page or<br/>{' '}
                  <Box component="span" sx={{ fontWeight: 700 }}>
                      click
                  </Box>{' '}
                  on the button below to go back to the current week.
              </Typography>
          );
      }
  return (
    <Typography sx={messageStyles}>
          There is no data available for the selected period.<br/> {' '}
          You are being redirected to your last view.
    </Typography>
      );
  };


  return (
    <Box sx={containerStyles}>
      <Box
        component="img"
        src={imageSrc || config.image}
        alt={text || config.text}
        sx={imageStyles}
      />

      <Box sx={textBoxStyles}>
        <Typography sx={subtitleStyles}>
          {text || config.text}
        </Typography>

        {renderMessage()}
      </Box>

      <Button sx={buttonStyles} onClick={handleAction}>
        {buttonLabel || config.button}
      </Button>
    </Box>
  );
}
