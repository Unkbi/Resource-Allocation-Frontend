'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material';

const MainBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  '& .leftSection': {
    width: '45%',
    backgroundImage: 'linear-gradient(180deg, #FFFDF9 0%, #FFFAEF 100%)',
    textAlign: 'left',
    padding: '25px 90px',
    '& img': {
      maxWidth: '100%',
    },
  },
  '& .rightSection': {
    width: '45%',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    },
    '& .textField': {
      width: '100%',
      marginBottom: '12px',
      '& .MuiOutlinedInput-input': {
        height: '46px',
        lineHeight: '40px',
        background: '#FFFFFF 0% 0% no-repeat padding-box',
        padding: '2px 12px 3px 12px',
        borderRadius: '5px',
        fontFamily: theme.typography.fontFamily,
        fontSize: '14px',
        fontWeight: 'normal',
        color: '#212121',
        boxSizing: 'border-box',
        '&::placeholder': {
          color: '#424242',
          opacity: 1,
          fontFamily: theme.typography.fontFamily,
          fontSize: '14px',
        },
      },
      '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
        border: '1px solid #E0E0E0',
      },
      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: '1px solid #E0E0E0',
        borderRadius: '5px',
      },
    },
}));

const passwordRequirementBoxStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  gap: 4,
  background:' linear-gradient(to bottom, #F6F6F7, #F6F6F700)',
  height: 86,
  borderRadius: '6px',
  px: 2,
};

const passwordRequirementColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 1.5,
};

const passwordRequirementTextStyle = {
  display: 'flex',
  alignItems: 'center',
  fontSize: 13,
  fontWeight: 400,
  gap: 1,
};


function SetInvitePassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');

  return (
    <MainBox>
      {/* Left Section */}
      <Box className="leftSection">
        <img src={'/images/coi-logo.png'} alt="CIO" width={280} />
        <Box mt={12}>
          <img
            src={'/images/login-left-img.png'}
            alt="login-left-img"
            width={'480px'}
          />
        </Box>
      </Box>

      {/* Right Section */}
      <Box className="rightSection">
        <Box width="472px">
          <Typography variant="h4" fontSize={'32px'} fontWeight={800} mb={0.2}>
            Set New Password
          </Typography>
          <Typography mb={1.5} fontSize={14} fontWeight={400}> 
            Create a secure password to access your CIOptimize account.
          </Typography>
          <Typography fontSize={14} fontWeight={600} mb={0.5} ml={0.2}>
            New password
          </Typography>
          <TextField
            className='textField'
            fullWidth
            placeholder="Enter new password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                        >
            {showPassword ? (
                <img src="/images/icons/visibility.svg" alt="show password" />
          ) : (
            <img src="/images/icons/visibilityOff.svg" alt="hide password" />
          )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Password Requirements */}
                  <Box mb={1}>
                      <Box sx={passwordRequirementBoxStyle}>
                          <Box sx={passwordRequirementColumnStyle}>
                              <Typography sx={passwordRequirementTextStyle}>
                                  <img src="/images/icons/tickMark.svg" alt="tickMark" /> At least 8 characters
                              </Typography>
                              <Typography sx={passwordRequirementTextStyle}>
                                  <img src="/images/icons/tickMark.svg" alt="tickMark" /> At least 1 uppercase letter
                              </Typography>
                          </Box>
                          <Box sx={passwordRequirementColumnStyle}>
                              <Typography sx={passwordRequirementTextStyle}>
                                  <img src="/images/icons/tickMark.svg" alt="tickMark" /> Must contain min 1 number
                              </Typography>
                              <Typography sx={passwordRequirementTextStyle}>
                                  <img src="/images/icons/tickMark.svg" alt="tickMark" /> Must contain min 1 symbol
                              </Typography>
                          </Box>
                      </Box>
                  </Box>
          <Typography fontSize={14} fontWeight={600} mb={0.5} ml={0.2}>
            Confirm password
          </Typography>
          <TextField
            className='textField'
            fullWidth
            placeholder="Enter Confirm password"
            type={showConfirmPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    edge="end"
                  >
            {showConfirmPassword  ? (
                <img src="/images/icons/visibility.svg" alt="show password" />
          ) : (
            <img src="/images/icons/visibilityOff.svg" alt="hide password" />
          )}
              </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 1,
              backgroundColor: '#1567CA',
              height: '48px',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#0042a8',
              },
            }}
                  >
                      <Typography
                          sx={{
                          fontSize: '15px',
                          fontFamily: 'Open-Sans',
                          fontWeight: 600,
                          }}>
                          Set Password & Continue
                      </Typography>
                  </Button>
              </Box>
          </Box>
      </MainBox>
  );
}

export default SetInvitePassword;
