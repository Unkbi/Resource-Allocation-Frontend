'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/redux/store';
import {
  performInviteSetPassword,
  performLogin,
} from '@/app/redux/actions/authActions';
import { showToast } from '@/app/redux/reducers/toastReducer';

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

export const passwordRequirementBoxStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  gap: 4,
  background: ' linear-gradient(to bottom, #F6F6F7, #F6F6F700)',
  height: 86,
  borderRadius: '6px',
  px: 2,
};

export const passwordRequirementColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 1.5,
};

export const passwordRequirementTextStyle = {
  display: 'flex',
  alignItems: 'center',
  fontSize: 13,
  fontWeight: 400,
  gap: 1,
};

interface SetInvitePasswordProps {
  setPageType?: (pageType: 'resend' | 'setPassword' | 'success') => void;
}

function SetInvitePassword({ setPageType }: SetInvitePasswordProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { loading, error } = useSelector((state: RootState) => state.user);

  const dispatch = useDispatch();
  const params = useSearchParams();
  const username = params.get('username');
  const tempPassword = params.get('tempPassword');

  const validations = useMemo(
    () => ({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    }),
    [password]
  );

  const allValid = Object.values(validations).every(Boolean);
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;

  const isButtonDisabled = !(allValid && passwordsMatch);

  const getIcon = (isValid: any) =>
    isValid ? '/images/icons/tickMark.svg' : '/images/icons/ErrorIcon.svg';

  const handleSetPassword = () => {
    if (username && tempPassword && password && allValid && passwordsMatch) {
      const postData = {
        email: username,
        tempPassword: tempPassword,
        newPassword: password,
      };
      dispatch(performInviteSetPassword(postData) as any)
        .then((res: any) => {
          if (
            res &&
            res?.email &&
            res?.message === 'Invitation accepted successfully'
          ) {
            dispatch(
              showToast({
                open: true,
                message: 'Password set successfully. logging you in.',
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
            dispatch(
              performLogin({
                email: res.email.trim(),
                password: password.trimEnd(),
              }) as any
            );
          }
        })
        .catch((err: any) => {
          console.error('Set password error:', err);
        });
    }
  };

  useEffect(() => {
    if (!loading && error && setPageType) {
      dispatch(
        showToast({
          open: true,
          message:
            error === 'Error: Invalid password. Please try again.'
              ? 'Invite Expired. Please request a new invite.'
              : error || 'An error occurred.',
          type: 'error',
          position: 'bottom-left',
          autoHideTimer: 4000,
        })
      );
      if (error === 'Error: Invalid password. Please try again.') {
        setPageType('resend');
      }
    }
  }, [loading, error, setPageType]);

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
            Create a Secure Password To Access Your CIOptimize Account.
          </Typography>
          <Typography fontSize={14} fontWeight={600} mb={0.5} ml={0.2}>
            New password
          </Typography>
          <TextField
            className="textField"
            fullWidth
            placeholder="Enter New Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? (
                      <img
                        src="/images/icons/visibility.svg"
                        alt="show password"
                      />
                    ) : (
                      <img
                        src="/images/icons/visibilityOff.svg"
                        alt="hide password"
                      />
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
                  <img src={getIcon(validations.length)} alt="tickMark" /> At
                  least 8 characters
                </Typography>
                <Typography sx={passwordRequirementTextStyle}>
                  <img src={getIcon(validations.uppercase)} alt="tickMark" /> At
                  least 1 uppercase letter
                </Typography>
              </Box>
              <Box sx={passwordRequirementColumnStyle}>
                <Typography sx={passwordRequirementTextStyle}>
                  <img src={getIcon(validations.number)} alt="tickMark" /> Must
                  contain min 1 number
                </Typography>
                <Typography sx={passwordRequirementTextStyle}>
                  <img src={getIcon(validations.symbol)} alt="tickMark" /> Must
                  contain min 1 symbol
                </Typography>
              </Box>
            </Box>
          </Box>
          <Typography fontSize={14} fontWeight={600} mb={0.5} ml={0.2}>
            Confirm password
          </Typography>
          <TextField
            className="textField"
            fullWidth
            placeholder="Enter Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            error={confirmPassword.length > 0 && !passwordsMatch}
            helperText={
              confirmPassword.length > 0 && !passwordsMatch
                ? 'Passwords do not match'
                : ''
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? (
                      <img
                        src="/images/icons/visibility.svg"
                        alt="show password"
                      />
                    ) : (
                      <img
                        src="/images/icons/visibilityOff.svg"
                        alt="hide password"
                      />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            fullWidth
            variant="contained"
            disabled={isButtonDisabled}
            sx={{
              mt: 1,
              backgroundColor: isButtonDisabled ? '#C5CAE9' : '#1567CA',
              height: '48px',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: isButtonDisabled ? '#C5CAE9' : '#0042a8',
              },
            }}
            onClick={handleSetPassword}
          >
            <Typography
              sx={{
                fontSize: '15px',
                fontFamily: 'Open-Sans',
                fontWeight: 600,
              }}
            >
              Set Password & Continue
            </Typography>
          </Button>
        </Box>
      </Box>
    </MainBox>
  );
}

export default SetInvitePassword;
