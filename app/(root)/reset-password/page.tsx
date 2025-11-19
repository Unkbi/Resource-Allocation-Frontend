'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import type { RootState, AppDispatch } from '@/app/redux/store';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  styled,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { performResetPassword } from '@/app/redux/actions/authActions';
import { showToast } from '@/app/redux/reducers/toastReducer';
import { passwordRequirementBoxStyle, passwordRequirementColumnStyle, passwordRequirementTextStyle } from '@/app/components/InvitePage/SetInvitePassword';

const MainBox = styled(Box)(({ theme }) => ({
  '& .loginLeft': {
    width: '45%',
    backgroundImage: 'linear-gradient(180deg, #FFFDF9 0%, #FFFAEF 100%);',
    textAlign: 'left',
    padding: '15px 90px',
    '& img': {
      maxWidth: '100%',
    },
  },
  '& .loginRight': {
    width: '45%',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    '& .formBox': {
      width: '472px',
      margin: '0 auto',
      '& h4': {
        fontFamily: theme.typography.fontFamily,
        color: '#000',
        fontSize: '32px',
        fontWeight: '800',
        // marginBottom: '4px',
      },
      '& .subHeadingText': {
        // color: '#757575',
        fontSize: '14px',
        fontWeight: '400',
        fontFamily: theme.typography.fontFamily,
      },
    },
    '& .forgot': {
      textAlign: 'right',
      fontFamily: theme.typography.fontFamily,
      fontWeight: '600',
      fontSize: '14px',
      lineHeight: '17px',
      '& a': {
        color: '#1567CA',
      },
    },
    '& .signInButton': {
      backgroundColor: '#1567CA',
      borderRadius: '4px',
      height: '48px',
      color: '#FFFFFF',
      fontFamily: theme.typography.fontFamily,
      fontWeight: '700',
      fontSize: '15px',
      lineHeight: '18px',
      textTransform: 'none',
      boxShadow: 'none',
      marginBottom: '20px',
    },
    '& .googleButton': {
      backgroundColor: '#FFFFFF',
      border: '1px solid #E0E0E0',
      borderRadius: '3px',
      boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.04)',
      height: '48px',
      color: '#424242',
      fontFamily: theme.typography.fontFamily,
      fontWeight: '600',
      fontSize: '15px',
      lineHeight: '18px',
      gap: '10px',
      marginBottom: '20px',
      textTransform: 'none',
    },
    '& .signWithSSO': {
      backgroundColor: '#F2F5FA',
      borderRadius: '3px',
      border: 'none',
      color: '#142B51',
      fontFamily: theme.typography.fontFamily,
      fontWeight: '600',
      fontSize: '15px',
      lineHeight: '18px',
      height: '48px',
      marginBottom: '20px',
      textTransform: 'none',
    },
    '& .noAccount': {
      color: '#142B51',
      fontFamily: theme.typography.fontFamily,
      fontWeight: '500',
      fontSize: '14px',
      lineHeight: '17px',
      textAlign: 'center',
      '& a': {
        color: '#1567CA',
        fontWeight: '600',
      },
    },
    '& .orText': {
      fontFamily: theme.typography.fontFamily,
      color: '#757575',
      fontSize: '15px',
      fontWeight: '700',
      marginBottom: '20px',
      textAlign: 'center',
      position: 'relative',
      '& span': {
        position: 'relative',
        zIndex: '1',
        background: '#fff',
      },
      '&::before': {
        background:
          'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(224,224,224,1) 15%, rgba(255,255,255,1) 50%, rgba(224,224,224,1) 85%, rgba(255,255,255,1) 100%)',
        width: '100%',
        height: '1px',
        content: "''",
        position: 'absolute',
        left: '0',
        top: '50%',
        zIndex: '0',
        marginTop: '-1px',
      },
    },
    '& .textField': {
      width: '100%',
      marginBottom: '14px',
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
  },
}));

const getIcon = (isValid: any) =>
    isValid ? '/images/icons/tickMark.svg' : '/images/icons/ErrorIcon.svg';
  
export default function ResetPasswordPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RestPasswordPage />
    </Suspense>
  );
}

function RestPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { loading, error, resetPasswordMessage } = useSelector(
    (state: RootState) => state.user
  );
  const searchParams = useSearchParams();
  const username = searchParams.get('username');
  const code = searchParams.get('code');

    const validations = useMemo(
    () => ({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      number: /\d/.test(newPassword),
      symbol: /[^A-Za-z0-9]/.test(newPassword),
    }),
    [newPassword]
  );

  const allValid = Object.values(validations).every(Boolean);
  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;

  const isButtonDisabled = !(allValid && passwordsMatch);


  const handleResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return;
    }
    dispatch(
      performResetPassword({
    email:username,
    confirmationCode: code,
    newPassword:newPassword
      })
    ).then(response => {
      // @ts-ignore
      if (response && response.status === 200) {
        setErrorMessage('');
        dispatch(
          showToast({
            open: true,
            message: 'Password reset successfully',
            type: 'success',
            position: 'bottom-left',
            autoHideTimer: 3000,
          })
        );
        router.push('/login');
      }
    });

    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage('');
  };

  const handleToggleNewPassword = () => setShowNewPassword(prev => !prev);
  const handleToggleConfirmPassword = () =>
    setShowConfirmPassword(prev => !prev);

  if (resetPasswordMessage && !error) {
    router.push('/login');
  }

  return (
    <MainBox sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box display={'flex'} width={'100%'}>
        {/* Left Section */}
        <Box className="loginLeft">
          <img src={'/images/coi-logo.png'} alt="COI" width={280} />
          <Box mt={12}>
            <img
              src={'/images/login-left-img.png'}
              alt="login-left-img"
              width={'480px'}
            />
          </Box>
        </Box>

        {/* Right Section */}
        <Box className="loginRight">
          <Box className="formBox">
            <Typography variant="h4" fontSize={'32px'} fontWeight={800} mb={0.2}>Reset Password</Typography>
            <Typography mb={1.5} className="subHeadingText" whiteSpace={'nowrap'}>
              Your new password must be different from previous one
            </Typography>
            <Box component="form" onSubmit={handleResetPassword}>
              <TextField
                className="textField"
                variant="outlined"
                placeholder="Enter New Password"
                type={showNewPassword ? 'text' : 'password'}
                fullWidth
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleToggleNewPassword} edge="end">
                        {showNewPassword ? (
                          <img src={'/images/icons/eye-on.svg'} alt="eye-on" />
                        ) : (
                          <img
                            src={'/images/icons/eye-off.svg'}
                            alt="eye-off"
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

              <TextField
                className="textField"
                variant="outlined"
                placeholder="Enter Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleToggleConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <img src={'/images/icons/eye-on.svg'} alt="eye-on" />
                        ) : (
                          <img
                            src={'/images/icons/eye-off.svg'}
                            alt="eye-off"
                          />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={passwordRequirementBoxStyle}>
                <Box sx={passwordRequirementColumnStyle}>
                    <Typography sx={passwordRequirementTextStyle}>
                        <img src={getIcon(passwordsMatch)} alt="tickMark" /> Passwords do not match
                          </Typography>
                </Box>
              </Box>
              {errorMessage && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                  {errorMessage}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || isButtonDisabled }
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
                // className="signInButton"  //Commenting this , added new css 
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      {resetPasswordMessage && !error && (
        <Typography
          variant="body2"
          color="success"
          sx={{
            position: 'absolute',
            bottom: '150px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          Password reset successfully! You can now log in with your new
          password.
        </Typography>
      )}
      {error && (
        <Typography
          variant="body2"
          color="error"
          sx={{
            position: 'absolute',
            bottom: '150px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {error}
        </Typography>
      )}
    </MainBox>
  );
}
