'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { performLogin } from '@/app/redux/actions/authActions';
import type { RootState, AppDispatch } from '@/app/redux/store';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  styled,
} from '@mui/material';
import { getToken } from '@/app/utils/authUtils';

const MainBox = styled(Box)(({ theme }) => ({
  '& .loginLeft': {
    width: '45%',
    backgroundImage: 'linear-gradient(180deg, #FFFDF9 0%, #FFFAEF 100%);',
    textAlign: 'left',
    padding: '30px 90px',
    '& img': {
      maxWidth: '100%',
    },
  },
  '& .loginRight': {
    width: '55%',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    '& .formBox': {
      width: '360px',
      margin: '0 auto',
      '& h4': {
        fontFamily: theme.typography.fontFamily,
        color: '#000',
        fontSize: '32px',
        fontWeight: '800',
        marginBottom: '4px',
      },
      '& .subHeadingText': {
        color: '#757575',
        fontSize: '15px',
        fontWeight: '400',
        marginBottom: '20px',
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
      color: '#757575',
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
      fontWeight: '700',
      color: '#757575',
      fontSize: '15px',
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
      marginBottom: '22px',
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector(
    (state: RootState) => state.user
  );
  const isLoggedIn = getToken();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const googleAuthUrl = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL;
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(
      performLogin({
        email: email.trim(),
        password: password.trimEnd(),
      }) as any
    );
  };

  useEffect(() => {
    localStorage.removeItem('signupEmail');
    if (isLoggedIn) {
      // Use redirect path if present, otherwise go to dashboard
      router.replace(redirectPath || '/dashboard');
    }
  }, [isLoggedIn, router, redirectPath]);

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleGoogleSignin = () => {
    if (googleAuthUrl) {
      window.location.href = googleAuthUrl;
    } else {
      console.error('Google Auth URL is not defined');
    }
  };

  const handleSSOSignin = () => {
    const ssoAuthUrl = process.env.NEXT_PUBLIC_SSO_AUTH_URL;
    if (ssoAuthUrl) {
      window.location.href = ssoAuthUrl;
    } else {
      console.error('SSO Auth URL is not defined');
    }
  };

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
            <Typography variant="h4">Welcome</Typography>
            <Typography className="subHeadingText">
              Please enter your details
            </Typography>
            <Box component="form" onSubmit={handleLogin}>
              <TextField
                className="textField"
                id="outlined-basic"
                placeholder="Email Id"
                InputLabelProps={{
                  shrink: false,
                }}
                variant="outlined"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <TextField
                className="textField"
                variant="outlined"
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                InputLabelProps={{
                  shrink: false,
                }}
                fullWidth
                value={password}
                onChange={e => setPassword(e.target.value.trim())}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? (
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
              <Box className="forgot">
                <Link href="/forgot-password" underline="hover">
                  Forgot Password?
                </Link>
              </Box>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
                className="signInButton"
              >
                {loading ? <CircularProgress size={24} /> : 'Sign in'}
              </Button>
              <Typography className="orText">
                <span>OR</span>
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                className="googleButton"
                onClick={handleGoogleSignin}
              >
                <img src={'/images/icons/google.svg'} alt="Google" /> Sign in
                with Google
              </Button>
              <Button
                variant="outlined"
                fullWidth
                className="googleButton"
                onClick={handleSSOSignin}
              >
                Sign in with SSO
              </Button>
            </Box>
            <Typography className="noAccount">
              Don't have an account?{' '}
              <Link href="/signup" underline="hover" color="primary">
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
      {error && (
        <Typography
          variant="body2"
          color="error"
          sx={{
            position: 'absolute',
            bottom: 16,
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
