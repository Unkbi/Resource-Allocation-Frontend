'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '@/app/redux/store';
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
import { signUp } from '@/app/redux/actions/authActions';
import { passwordRequirementBoxStyle, passwordRequirementColumnStyle, passwordRequirementTextStyle } from '@/app/components/InvitePage/SetInvitePassword';

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

const commonHelperText = {
  marginTop: '4px',
  marginLeft: '4px',
  lineHeight: '16px',
};

 const getIcon = (isValid: any) =>
  isValid ? '/images/icons/tickMark.svg' : '/images/icons/ErrorIcon.svg';
 
export default function SingupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // const [mobile, setMobile] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { loading, user, signupData, error } = useSelector(
    (state: RootState) => state.user
  );
  const router = useRouter();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [showPassword, setShowPassword] = React.useState(false);

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
  
  const isButtonDisabled =  !firstName.trim() ||!lastName.trim() ||!email.trim() ||Object.values(errors).some(err => err) || !(allValid);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    dispatch(
      signUp(
        {
           firstName,
           lastName, 
           email, 
           password
        },
      )
    );
  };

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  useEffect(() => {
    if (signupData && !error) {
      router.push('/signup-otp');
    }
  }, [signupData, error, router]);

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
            <Typography variant="h4">Create an Account</Typography>
            <Typography className="subHeadingText">
              Please enter your details
            </Typography>
            <Box component="form" onSubmit={handleSignup}>
              <TextField
                className="textField"
                id="outlined-basic"
                placeholder="First Name"
                variant="outlined"
                value={firstName}
                onChange={e => {
                  setFirstName(e.target.value);
                  if (errors.firstName && e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, firstName: '' }));
                  }
                }}
                error={!!errors.firstName}
                helperText={errors.firstName}
                FormHelperTextProps={{ sx: commonHelperText }}
              />
              <TextField
                className="textField"
                id="outlined-basic"
                placeholder="Last Name"
                variant="outlined"
                value={lastName}
                onChange={e => {
                  setLastName(e.target.value);
                  if (errors.lastName && e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, lastName: '' }));
                  }
                }}
                error={!!errors.lastName}
                helperText={errors.lastName}
                FormHelperTextProps={{ sx: commonHelperText }}
              />
              {/* <TextField
                                className='textField'
                                id="outlined-basic"
                                placeholder="Mobile Number"
                                variant="outlined"
                                type='tel'
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                            /> */}
              <TextField
                className="textField"
                id="outlined-basic"
                placeholder="Email Id"
                InputLabelProps={{
                  shrink: false,
                }}
                variant="outlined"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (errors.email && e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                error={!!errors.email}
                helperText={errors.email}
                FormHelperTextProps={{ sx: commonHelperText }}
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
                onChange={e => {
                  setPassword(e.target.value);
                  if (errors.password && e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                error={!!errors.password}
                helperText={errors.password}
                FormHelperTextProps={{ sx: commonHelperText }}
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
              {error && (
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
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
              >
                {loading ? <CircularProgress size={24} /> : 'Sign up'}
              </Button>
            </Box>
            <Typography className="noAccount">
              Already have an account?{' '}
              <Link href="/login" underline="hover" color="primary">
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </MainBox>
  );
}
